import "dotenv/config";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerUploadRoutes } from "../services/upload";

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
  const server = createServer(app);

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    noSniff: true,
    xssFilter: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api", limiter);

  // M-Pesa callback endpoint
  app.post("/api/mpesa/callback", express.json(), async (req, res) => {
    try {
      const { getDb, createPaymentTransaction, getOrderById } = await import("../db");
      const { orders } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const body = req.body;
      const resultCode = body?.Body?.stkCallback?.ResultCode;
      const resultDesc = body?.Body?.stkCallback?.ResultDesc;
      const checkoutRequestId = body?.Body?.stkCallback?.CheckoutRequestID;
      const metadata = body?.Body?.stkCallback?.CallbackMetadata?.Item || [];

      const getMeta = (name: string) => {
        const item = Array.isArray(metadata) ? metadata.find((m: any) => m.Name === name) : null;
        return item?.Value;
      };

      if (resultCode === 0) {
        const amount = getMeta("Amount");
        const mpesaReceiptNumber = getMeta("MpesaReceiptNumber");
        const phoneNumber = getMeta("PhoneNumber");

        const db = await getDb();
        if (db) {
          const orderNumber = body?.Body?.stkCallback?.AccountReference;
          if (orderNumber) {
            await db
              .update(orders)
              .set({ paymentStatus: "completed", status: "confirmed", paymentReference: mpesaReceiptNumber, paymentDetails: JSON.stringify(body) })
              .where(eq(orders.orderNumber, orderNumber));

            const orderResult = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
            if (orderResult.length > 0) {
              await createPaymentTransaction({
                orderId: orderResult[0].id,
                userId: orderResult[0].userId,
                amount: String(amount ?? orderResult[0].totalAmount),
                method: "mpesa",
                status: "completed",
                reference: mpesaReceiptNumber,
                mpesaReceiptNumber: String(mpesaReceiptNumber ?? ""),
                mpesaPhoneNumber: String(phoneNumber ?? ""),
                mpesaTransactionDate: new Date(),
              });
            }
          }
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
}

startServer().catch(console.error);
