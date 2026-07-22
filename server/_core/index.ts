import "dotenv/config";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerUploadRoutes } from "../services/upload";
import {
  isSafaricomCallback,
  sanitize,
  validateMpesaCallback,
  hasHtml,
} from "./security";
import { ENV } from "./env";

// ── Crash Recovery ──
process.on("uncaughtException", err => {
  console.error("[CRASH] Uncaught exception:", err);
});
process.on("unhandledRejection", reason => {
  console.error("[CRASH] Unhandled rejection:", reason);
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);

  // Request timeout — prevent hanging connections
  app.use((_req, _res, next) => {
    _req.setTimeout(30000, () => {
      if (!_res.headersSent)
        _res.status(503).json({ error: "Request timeout" });
    });
    next();
  });

  // Compression (responses)
  app.use(compression({ level: 9, threshold: 512 }));

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      noSniff: true,
      xssFilter: true,
    })
  );

  // ── Enhanced Rate Limiting ──
  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api", generalLimiter);

  // Auth endpoints: stricter limit
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth attempts. Please try again later." },
  });
  app.use("/api/trpc/auth.*", authLimiter);

  // Contact form: prevent spam
  const contactLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many messages. Please wait before sending another.",
    },
  });
  app.use("/api/trpc/contact.*", contactLimiter);

  // Order creation: prevent abuse
  const orderLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many orders. Please slow down." },
  });
  app.use("/api/trpc/orders.create", orderLimiter);

  // M-Pesa specific rate limiter (per IP, to prevent replay)
  const mpesaLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many payment requests." },
  });
  app.use("/api/mpesa", mpesaLimiter);

  // ── M-Pesa Callback (protected) ──
  app.post("/api/mpesa/callback", express.json(), async (req, res) => {
    try {
      // Validate origin
      const clientIp = req.ip || req.socket.remoteAddress || "";
      if (ENV.isProduction && !isSafaricomCallback(clientIp)) {
        console.warn(
          `[M-Pesa Callback] Blocked request from non-Safaricom IP: ${clientIp}`
        );
        return res.status(403).json({ ResultCode: 1, ResultDesc: "Forbidden" });
      }

      const { getDb, createPaymentTransaction, getOrderByNumber } =
        await import("../db");
      const { orders } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const body = req.body;
      const resultCode = body?.Body?.stkCallback?.ResultCode;
      const resultDesc = body?.Body?.stkCallback?.ResultDesc;
      const checkoutRequestId = body?.Body?.stkCallback?.CheckoutRequestID;
      const orderNumber = body?.Body?.stkCallback?.AccountReference;
      const metadata = body?.Body?.stkCallback?.CallbackMetadata?.Item || [];

      const getMeta = (name: string) => {
        const item = Array.isArray(metadata)
          ? metadata.find((m: any) => m.Name === name)
          : null;
        return item?.Value;
      };

      const amount = getMeta("Amount");
      const mpesaReceiptNumber = getMeta("MpesaReceiptNumber");
      const phoneNumber = getMeta("PhoneNumber");

      // Validate callback payload
      const validation = validateMpesaCallback(
        resultCode,
        checkoutRequestId,
        amount,
        mpesaReceiptNumber
      );
      if (!validation.valid) {
        console.warn(`[M-Pesa Callback] Invalid payload: ${validation.reason}`);
        return res.json({ ResultCode: 0, ResultDesc: "Ignored" });
      }

      if (resultCode === 0 && orderNumber) {
        const db = await getDb();
        if (db) {
          // Check idempotency: has this order already been paid?
          const existingOrder = await getOrderByNumber(orderNumber);
          if (!existingOrder) {
            console.warn(`[M-Pesa Callback] Order not found: ${orderNumber}`);
            return res.json({ ResultCode: 0, ResultDesc: "Order not found" });
          }

          if (existingOrder.paymentStatus === "completed") {
            console.log(
              `[M-Pesa Callback] Duplicate callback for ${orderNumber}, skipping`
            );
            return res.json({ ResultCode: 0, ResultDesc: "Already processed" });
          }

          // Sanitize inputs before storing
          const sanitizedReceipt = sanitize(String(mpesaReceiptNumber ?? ""));
          const sanitizedPhone = sanitize(String(phoneNumber ?? ""));

          await db
            .update(orders)
            .set({
              paymentStatus: "completed",
              status: "confirmed",
              paymentReference: sanitizedReceipt,
              paymentDetails: JSON.stringify(body),
            })
            .where(eq(orders.orderNumber, orderNumber));

          await createPaymentTransaction({
            orderId: existingOrder.id,
            userId: existingOrder.userId,
            amount: String(amount ?? existingOrder.totalAmount),
            method: "mpesa",
            status: "completed",
            reference: sanitizedReceipt,
            mpesaReceiptNumber: sanitizedReceipt,
            mpesaPhoneNumber: sanitizedPhone,
            mpesaTransactionDate: new Date(),
          });

          // Send payment confirmation email
          try {
            const { getUserById, getOrderItemsByOrderId } =
              await import("../db");
            const user = await getUserById(existingOrder.userId);
            if (user?.email && user?.name) {
              const { sendOrderStatusEmail } =
                await import("../services/email");
              sendOrderStatusEmail(
                user.email,
                user.name,
                orderNumber,
                "confirmed"
              );
            }
          } catch {
            /* non-blocking */
          }

          // Deduct stock
          try {
            const { deductStockForOrder } = await import("../db");
            await deductStockForOrder(existingOrder.id);
          } catch {
            /* non-blocking */
          }

          console.log(
            `[M-Pesa Callback] Payment completed for ${orderNumber}, receipt: ${sanitizedReceipt}`
          );
        }
      }

      res.json({ ResultCode: 0, ResultDesc: "Success" });
    } catch (err) {
      console.error("[M-Pesa Callback] Error:", err);
      res.json({ ResultCode: 1, ResultDesc: "Internal error" });
    }
  });

  // SEO routes
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Sitemap: https://www.mwangagrid.co.ke/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = "https://www.mwangagrid.co.ke";
    const now = new Date().toISOString().split("T")[0];
    const urls = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/products", priority: "0.9", changefreq: "daily" },
      { loc: "/services", priority: "0.8", changefreq: "weekly" },
      { loc: "/quotation", priority: "0.7", changefreq: "monthly" },
      { loc: "/contact", priority: "0.7", changefreq: "monthly" },
      { loc: "/cart", priority: "0.5", changefreq: "monthly" },
      { loc: "/auth", priority: "0.3", changefreq: "monthly" },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Input sanitization middleware for TRPC routes
  app.use("/api/trpc", (req, _res, next) => {
    if (req.body && req.method === "POST" && hasHtml(req.body)) {
      console.warn("[Security] Blocked request with HTML content");
      return _res.status(400).json({ error: "HTML content not allowed" });
    }
    next();
  });

  registerUploadRoutes(app);
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // ── Global error handler ──
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("[Express Error]", err?.message || err);
    if (!res.headersSent) {
      res
        .status(err?.status || err?.statusCode || 500)
        .json({ error: err?.message || "Internal server error" });
    }
  });

  // Warn about missing SMTP password
  if (!ENV.smtp.pass) {
    console.warn(
      "[SMTP] SMTP_PASS is empty — email sending will fail. Set a Gmail app password at https://myaccount.google.com/apppasswords"
    );
  }

  // Seed fallback data on startup
  try {
    const { seedProductsIfEmpty, seedServicesIfEmpty } = await import("../db");
    const { FALLBACK_PRODUCTS, FALLBACK_SERVICES } = await import("../routers");
    await seedProductsIfEmpty(FALLBACK_PRODUCTS);
    await seedServicesIfEmpty(FALLBACK_SERVICES);
    console.log("[Seed] Fallback products & services checked");
  } catch (e) {
    console.warn("[Seed] Non-blocking seed error:", e);
  }

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Mwanga Grid server running on http://localhost:${port}/`);
  });

  // ── Graceful Shutdown ──
  const shutdown = (signal: string) => {
    console.log(`[Server] ${signal} received — shutting down gracefully...`);
    server.close(() => {
      console.log("[Server] HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("[Server] Forced shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch(console.error);
