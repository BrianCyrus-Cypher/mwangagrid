import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookie } from "cookie";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, sql, gte, desc } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./auth";
import crypto from "node:crypto";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductById,
  getAllServices,
  getFeaturedServices,
  getServiceById,
  getServicePackagesByServiceId,
  getOrdersByUserId,
  getOrderById,
  getOrderByNumber,
  getAllOrders,
  getAllOrdersWithClients,
  getOrderItemsByOrderId,
  generateOrderNumber,
  determineOrderCategory,
  getQuotationsByUserId,
  getAllQuotations,
  getSubscriptionsByUserId,
  getSupportTicketsByUserId,
  getAllSupportTickets,
  deleteSessionByToken,
  deleteSessionByIdForUser,
  deleteAllSessionsForUser,
  listSessionsByUserId,
  getAllSessions,
  deleteSessionById,
  deleteAllSessions,
  hashSessionToken,
  SESSION_INACTIVITY_LIMIT_MS,
  updateUser,
  getUserByVerificationToken,
  getUserByResetToken,
  getAllContacts,
  getContactById,
  createContact,
  updateContactStatus,
  getFollowUpsByContactId,
  createFollowUp,
  getDashboardStats,
  getAllFollowUps,
  getFollowUpsByStatus,
  updateFollowUp,
  exportOrdersCSV,
  exportContactsCSV,
  exportFullReportCSV,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  toggleProductFeatured,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
  toggleServiceFeatured,
  adminCreateServicePackage,
  adminUpdateServicePackage,
  adminDeleteServicePackage,
  getAnalytics,
  getProfitLoss,
  seedProductsIfEmpty,
  seedServicesIfEmpty,
} from "./db";
import { getDb, getUserByEmail, getUserById, createSessionRecord } from "./db";
import {
  orders,
  orderItems,
  quotations,
  supportTickets,
  users,
  servicePackages,
} from "../drizzle/schema";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendEmail,
} from "./services/email";
import { MPesaPaymentService, isMpesaConfigured } from "./services/mpesa";

export const FALLBACK_PRODUCTS = [
  {
    id: 101,
    name: "ALPHA 1 — 1KW + 800Wh All-in-One Solar Generator",
    category: "solar-equipment",
    price: 45000,
    discountPrice: null,
    description:
      "Compact and portable 1KW solar generator with 800Wh battery capacity. Perfect for home backup power, camping, and emergency situations. Features built-in inverter and multiple output ports.",
    imageUrl:
      "https://claire.solar/public/uploads/all/Kf0jeSOPcikjRgLQJU6Y1qph2sDekfSP2TmAdWHF.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Power: "1KW",
      Battery: "800Wh",
      Warranty: "2 years",
      Type: "All-in-One Generator",
    }),
  },
  {
    id: 102,
    name: "DELTA 5 — 6KW + 5kWh Solar Home System",
    category: "solar-equipment",
    price: 125000,
    discountPrice: null,
    description:
      "Complete 6KW solar home system with 5kWh battery storage. Ideal for small to medium homes. Includes solar panels, inverter, battery, and installation support.",
    imageUrl:
      "https://claire.solar/public/uploads/all/NtuJLuQuhODQpi5G6UuQN8EC9xMaPiEyreyqLHgM.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Power: "6KW",
      Battery: "5kWh",
      Warranty: "5 years",
      Type: "Home System",
    }),
  },
  {
    id: 103,
    name: "DELTA 10 — 6KW + 10kWh Solar Home System",
    category: "solar-equipment",
    price: 185000,
    discountPrice: null,
    description:
      "Premium 6KW solar home system with 10kWh battery storage. Extended battery capacity for continuous power supply. Supports whole-home energy needs.",
    imageUrl:
      "https://claire.solar/public/uploads/all/Ue2JOqJWAhrvsjqKEJnLuNV4ZRuvadtwL3sDTrAD.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Power: "6KW",
      Battery: "10kWh",
      Warranty: "5 years",
      Type: "Home System",
    }),
  },
  {
    id: 104,
    name: "CLAIRE 480W Solar Streetlight with Motion Sensor",
    category: "solar-equipment",
    price: 18000,
    discountPrice: null,
    description:
      "Energy-efficient 480W solar streetlight with integrated motion sensor. Perfect for outdoor lighting, parking areas, and street illumination.",
    imageUrl:
      "https://claire.solar/public/uploads/all/Cvct8M3GkZ931mHAZHTMfII1uNe6P2vOIbd7l8C2.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Power: "480W",
      Type: "Solar Streetlight",
      Features: "Motion Sensor, Daylight Sensor",
      Warranty: "2 years",
    }),
  },
  {
    id: 105,
    name: "CLAIRE 600W Solar Streetlight with Motion Sensor",
    category: "solar-equipment",
    price: 22000,
    discountPrice: null,
    description:
      "High-power 600W solar streetlight with advanced motion detection. Ideal for highways and commercial areas. Weather-resistant ABS housing.",
    imageUrl:
      "https://claire.solar/public/uploads/all/P2Lifr47ys8IzbMZQhDG2MEU6OPscwupb9D2kiNo.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Power: "600W",
      Type: "Solar Streetlight",
      Features: "Motion Sensor, Weather-Resistant",
      Warranty: "2 years",
    }),
  },
  {
    id: 106,
    name: "DELTA 20 — 10KW + 20kWh Solar Home System",
    category: "solar-equipment",
    price: 285000,
    discountPrice: null,
    description:
      "Large-scale 10KW solar system with 20kWh battery storage. Designed for large homes and small commercial applications. Maximum energy independence.",
    imageUrl:
      "https://claire.solar/public/uploads/all/fXmXqOFwHD8cxJeiXLffNPvn0OaJjxKOtzYryNvc.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Power: "10KW",
      Battery: "20kWh",
      Warranty: "5 years",
      Type: "Home System",
    }),
  },
  {
    id: 201,
    name: "Reolink Argus 3 Pro 5MP Dual-Band Wi-Fi Battery Camera",
    category: "cctv-cameras",
    price: 9000,
    discountPrice: null,
    description:
      "Advanced 5MP wireless security camera with dual-band Wi-Fi and long battery life. 2K resolution, colour night vision, and AI smart motion detection.",
    imageUrl: "",
    inStock: true,
    specifications: JSON.stringify({
      Resolution: "5MP (2K)",
      Type: "Wireless Battery",
      "Night Vision": "Colour",
      Warranty: "1 year",
    }),
  },
  {
    id: 202,
    name: "Reolink E1 4MP Pan-Tilt Indoor Wi-Fi Camera",
    category: "cctv-cameras",
    price: 3000,
    discountPrice: null,
    description:
      "Indoor pan-tilt 4MP Wi-Fi camera with 360° coverage. Features smart motion tracking and night vision. Ideal for home and office surveillance.",
    imageUrl: "",
    inStock: true,
    specifications: JSON.stringify({
      Resolution: "4MP",
      Type: "Pan-Tilt Indoor",
      Coverage: "360°",
      Warranty: "1 year",
    }),
  },
  {
    id: 203,
    name: "Uniview 4MP+4MP 25X ColorHunter PTZ Camera",
    category: "cctv-cameras",
    price: 52800,
    discountPrice: null,
    description:
      "Professional dual 4MP PTZ camera with 25X zoom and ColorHunter technology. Advanced dual-light system for superior night imaging. Enterprise-grade.",
    imageUrl:
      "https://www.uniview.com/uploadfile/2023/1220/20231220081504_28.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Resolution: "4MP+4MP",
      Type: "PTZ",
      Zoom: "25X",
      "Night Vision": "Dual-light",
      Warranty: "2 years",
    }),
  },
  {
    id: 204,
    name: "Uniview 4MP Fixed Dual-light Turret Network Camera",
    category: "cctv-cameras",
    price: 4500,
    discountPrice: null,
    description:
      "Professional 4MP turret camera with dual-light for 24/7 colour imaging. Fixed lens for reliable retail and commercial surveillance.",
    imageUrl:
      "https://www.uniview.com/uploadfile/2023/0810/20230810095527_79.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Resolution: "4MP",
      Type: "Turret",
      "Night Vision": "Dual-light",
      Warranty: "2 years",
    }),
  },
  {
    id: 205,
    name: "Uniview 4MP Fixed Dual-light Bullet Camera",
    category: "cctv-cameras",
    price: 4650,
    discountPrice: null,
    description:
      "Compact 4MP bullet camera with dual-light technology. Weather-resistant (IP67) design for outdoor installation.",
    imageUrl:
      "https://www.uniview.com/uploadfile/2023/0810/20230810095442_21.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Resolution: "4MP",
      Type: "Bullet",
      "Weather Resistant": "IP67",
      Warranty: "2 years",
    }),
  },
  {
    id: 206,
    name: "Uniview 4MP Fixed IR Dome Network Camera",
    category: "cctv-cameras",
    price: 4000,
    discountPrice: null,
    description:
      "Discreet 4MP dome camera with IR night vision. Ideal for indoor surveillance in banks, offices, and retail stores.",
    imageUrl:
      "https://www.uniview.com/uploadfile/2023/0104/20230104064319_97.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Resolution: "4MP",
      Type: "Dome",
      "Night Vision": "IR",
      Warranty: "2 years",
    }),
  },
  {
    id: 207,
    name: "Uniview 2MP Fixed IR Dome Network Camera",
    category: "cctv-cameras",
    price: 2700,
    discountPrice: null,
    description:
      "Budget-friendly 2MP dome camera with IR night vision. Perfect for basic surveillance needs in small businesses.",
    imageUrl:
      "https://www.uniview.com/uploadfile/2023/0104/20230104064409_46.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Resolution: "2MP",
      Type: "Dome",
      "Night Vision": "IR",
      Warranty: "1 year",
    }),
  },
  {
    id: 301,
    name: "TP-Link Archer AX6000 Wi-Fi 6 Router",
    category: "routers",
    price: 12500,
    discountPrice: null,
    description:
      "High-speed AX6000 Wi-Fi 6 router with MU-MIMO technology. Supports multiple devices simultaneously. Ideal for homes and small offices with high bandwidth needs.",
    imageUrl:
      "https://static.tp-link.com/upload/product-overview/2022/202207/20220712_165005_636351264506884413.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Speed: "AX6000",
      Standard: "Wi-Fi 6",
      Ports: "4x Gigabit",
      Warranty: "2 years",
    }),
  },
  {
    id: 302,
    name: "Cisco Meraki MX64 Cloud-Managed Firewall",
    category: "network-switches",
    price: 45000,
    discountPrice: null,
    description:
      "Enterprise-grade cloud-managed security appliance with advanced threat protection and centralised dashboard management. Perfect for medium to large organisations.",
    imageUrl:
      "https://meraki.cisco.com/wp-content/uploads/2023/06/MX64-front.png",
    inStock: true,
    specifications: JSON.stringify({
      Type: "Firewall / SD-WAN",
      Management: "Cloud (Meraki Dashboard)",
      Throughput: "1 Gbps",
      Warranty: "1 year subscription",
    }),
  },
  {
    id: 303,
    name: "Cat6 Ethernet Cable — 100m Roll",
    category: "cables",
    price: 3500,
    discountPrice: null,
    description:
      "High-quality Cat6 UTP ethernet cable for reliable network connectivity. 100-metre roll for large installations. Supports up to 10 Gbps speeds.",
    imageUrl: "https://m.media-amazon.com/images/I/61vVHtGIwgL._AC_SL1000_.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Type: "Cat6 UTP",
      Length: "100m",
      Speed: "10 Gbps",
      Warranty: "1 year",
    }),
  },
  {
    id: 304,
    name: "Ubiquiti UniFi Dream Machine",
    category: "routers",
    price: 35000,
    discountPrice: null,
    description:
      "All-in-one network appliance combining router, switch, and security gateway. Unified management platform for enterprise networks.",
    imageUrl: "https://store.ui.com/cdn/shop/products/UDM_Front_1_1.png",
    inStock: true,
    specifications: JSON.stringify({
      Type: "All-in-One Router/Gateway",
      Management: "UniFi Controller",
      Ports: "8x Gigabit",
      Warranty: "2 years",
    }),
  },
  {
    id: 305,
    name: "Netgear GS110MX Managed Switch",
    category: "network-switches",
    price: 18000,
    discountPrice: null,
    description:
      "10-port managed gigabit switch with VLAN support. Professional-grade networking for businesses. Compact design for easy installation.",
    imageUrl:
      "https://www.netgear.com/images/Products/Switches/ManagedSwitches/GS110MX_hero_side.png",
    inStock: true,
    specifications: JSON.stringify({
      Ports: "10x Gigabit",
      Type: "Managed",
      Features: "VLAN, QoS, 10G uplink",
      Warranty: "Lifetime",
    }),
  },
  {
    id: 306,
    name: "Fiber Optic Cable — 1km Single-Mode Spool",
    category: "cables",
    price: 25000,
    discountPrice: null,
    description:
      "Premium single-mode fiber optic cable for long-distance high-speed connectivity. 1km spool for large network installations. Supports up to 100 Gbps.",
    imageUrl: "https://m.media-amazon.com/images/I/71vu1MLCEkL._AC_SL1500_.jpg",
    inStock: true,
    specifications: JSON.stringify({
      Type: "Single-Mode OS2",
      Length: "1km",
      Speed: "100 Gbps",
      Warranty: "2 years",
    }),
  },
  {
    id: 999,
    name: "Test Product — 1 KES",
    category: "solar-equipment",
    price: 1,
    discountPrice: null,
    description:
      "Testing product priced at 1 KES. Use this to verify M-Pesa STK push and checkout flow end-to-end.",
    imageUrl:
      "https://claire.solar/public/uploads/all/Kf0jeSOPcikjRgLQJU6Y1qph2sDekfSP2TmAdWHF.jpg",
    inStock: true,
    specifications: JSON.stringify({ Purpose: "Testing", Price: "KES 1" }),
  },
];

export const FALLBACK_SERVICES = [
  {
    id: 1,
    name: "CCTV Installation",
    description:
      "Professional CCTV camera installation for homes and businesses. We handle everything from site survey to commissioning.",
    category: "security",
    startingPrice: "15000",
    isActive: true,
    packages: [
      {
        tier: "Basic",
        price: "15000",
        features: "2 cameras\nDVR\ncables\ninstallation",
        duration: "One-time",
      },
      {
        tier: "Standard",
        price: "35000",
        features: "4 cameras\nDVR\ncables\ninstallation\n1-month cloud backup",
        duration: "One-time",
      },
      {
        tier: "Premium",
        price: "65000",
        features:
          "8 cameras\nNVR\ncables\ninstallation\n6-month cloud backup\nremote viewing app",
        duration: "One-time",
      },
    ],
  },
  {
    id: 2,
    name: "Internet & Network Setup",
    description:
      "End-to-end network infrastructure setup including routing, switching, and Wi-Fi for homes and offices of all sizes.",
    category: "networking",
    startingPrice: "20000",
    isActive: true,
    packages: [
      {
        tier: "Home",
        price: "20000",
        features: "1 router\n2 access points\ncabling\nconfiguration",
        duration: "One-time",
      },
      {
        tier: "Business",
        price: "50000",
        features: "1 firewall\n3 APs\n16-port switch\ncabling\nconfig",
        duration: "One-time",
      },
      {
        tier: "Enterprise",
        price: "120000",
        features:
          "Dual firewall\n6 APs\n48-port switch\nstructured cabling\nSLA support",
        duration: "One-time",
      },
    ],
  },
  {
    id: 3,
    name: "Solar System Installation",
    description:
      "Turn-key solar power solutions — from site assessment through installation, commissioning, and after-sales support.",
    category: "solar",
    startingPrice: "50000",
    isActive: true,
    packages: [
      {
        tier: "Lite",
        price: "50000",
        features: "200W panel\nbattery\ncontroller\n2 lights",
        duration: "One-time",
      },
      {
        tier: "Standard",
        price: "150000",
        features: "500W panels\n2 batteries\ninverter\n4 lights\nTV point",
        duration: "One-time",
      },
      {
        tier: "Pro",
        price: "350000",
        features:
          "1.5kW panels\n4 batteries\nhybrid inverter\n6 lights\nTV + WiFi\ninstallation",
        duration: "One-time",
      },
    ],
  },
  {
    id: 4,
    name: "IT Support & Maintenance",
    description:
      "Ongoing managed IT support for SMEs. Hardware, software, and network troubleshooting handled by our expert team.",
    category: "support",
    startingPrice: "8000",
    isActive: true,
    packages: [
      {
        tier: "Starter",
        price: "8000",
        features: "Remote support\nemail support\nmonthly checkup",
        duration: "Monthly",
      },
      {
        tier: "Standard",
        price: "20000",
        features:
          "Remote + onsite\nequity backups\nanti-virus\nquarterly audit",
        duration: "Monthly",
      },
      {
        tier: "Premium",
        price: "45000",
        features:
          "Dedicated engineer\n24/7 support\nfull infrastructure mgmt\nmonthly reports",
        duration: "Monthly",
      },
    ],
  },
];

function normalizeProduct(p: any) {
  if (!p) return p;
  let images: string[] = [];
  if (p.image) {
    try {
      const parsed = JSON.parse(p.image);
      if (Array.isArray(parsed)) images = parsed;
    } catch {
      images = [p.image];
    }
  }
  return { ...p, imageUrl: images[0] || p.imageUrl || null, images };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    signup: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });

        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }

        const hashedPassword = await hashPassword(input.password);
        const openId = crypto.randomUUID();

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const [result] = await db
          .insert(users)
          .values({
            openId,
            name: input.name,
            email: input.email,
            loginMethod: "local",
            passwordHash: hashedPassword,
            verificationToken,
            verificationExpires,
          })
          .returning();

        const newUserId = result.id;

        const sessionToken = crypto.randomBytes(32).toString("hex");
        await createSessionRecord({
          userId: newUserId,
          token: sessionToken,
          device: ctx.req.headers["user-agent"]?.substring(0, 255),
          ipAddress: ctx.req.ip?.substring(0, 45),
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        // Send verification email (non-blocking)
        sendVerificationEmail(input.email, input.name, verificationToken).catch(
          (e: unknown) =>
            console.warn("[Signup] Failed to send verification email:", e)
        );

        return { success: true, userId: newUserId, emailVerified: false };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        const isValid = await verifyPassword(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Rotate session on login: limit to max 5 concurrent sessions per user
        const db = await getDb();
        if (db) {
          const existingSessions = await listSessionsByUserId(user.id);
          if (existingSessions.length >= 5) {
            const oldest = existingSessions.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )[0];
            await deleteSessionByIdForUser(oldest.id, user.id);
          }
        }

        const sessionToken = crypto.randomBytes(32).toString("hex");
        await createSessionRecord({
          userId: user.id,
          token: sessionToken,
          device: ctx.req.headers["user-agent"]?.substring(0, 255),
          ipAddress: ctx.req.ip?.substring(0, 45),
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { success: true, userId: user.id };
      }),

    requestEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await updateUser(ctx.user.id, {
        verificationToken: token,
        verificationExpires: expires,
      });

      await sendVerificationEmail(
        ctx.user.email!,
        ctx.user.name || "User",
        token
      );

      return { success: true };
    }),

    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const user = await getUserByVerificationToken(input.token);

        if (
          !user ||
          !user.verificationExpires ||
          new Date() > user.verificationExpires
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired token",
          });
        }

        await updateUser(user.id, {
          emailVerified: true,
          verificationToken: null,
          verificationExpires: null,
        });

        return { success: true };
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const user = await getUserByEmail(input.email);

        if (!user) return { success: true };

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);

        await updateUser(user.id, {
          resetToken: token,
          resetTokenExpires: expires,
        });

        await sendPasswordResetEmail(user.email!, token);

        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string(),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        const user = await getUserByResetToken(input.token);

        if (
          !user ||
          !user.resetTokenExpires ||
          new Date() > user.resetTokenExpires
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token",
          });
        }

        const hashedPassword = await hashPassword(input.newPassword);

        await updateUser(user.id, {
          passwordHash: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        });

        await deleteAllSessionsForUser(user.id);

        return { success: true };
      }),

    me: publicProcedure.query(async opts => {
      const user = opts.ctx.user;
      if (!user) return null;
      const db = await getDb();
      let emailVerified = false;
      if (db && user.email) {
        try {
          const result = await db
            .select({ verified: users.emailVerified })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);
          if (result.length > 0) emailVerified = !!result[0].verified;
        } catch {}
      }
      return { ...user, emailVerified };
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const sessionToken =
        parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";

      if (sessionToken) {
        await deleteSessionByToken(sessionToken);
      }

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);

      return { success: true };
    }),

    sessions: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const sessionToken =
          parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        const currentSessionHash = sessionToken
          ? hashSessionToken(sessionToken)
          : null;
        const cutoff = Date.now() - SESSION_INACTIVITY_LIMIT_MS;
        const rows = await listSessionsByUserId(ctx.user.id);

        return rows
          .filter(
            session =>
              new Date(session.lastActivity ?? session.createdAt).getTime() >=
              cutoff
          )
          .map(session => ({
            id: session.id,
            userId: session.userId,
            device: session.device,
            browser: session.browser,
            ipAddress: session.ipAddress,
            lastActivity: session.lastActivity,
            createdAt: session.createdAt,
            isCurrent: currentSessionHash
              ? session.tokenHash === currentSessionHash
              : false,
          }));
      }),
      logout: protectedProcedure
        .input(z.object({ sessionId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const sessionToken =
            parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
          const sessions = await listSessionsByUserId(ctx.user.id);
          const target = sessions.find(
            session => session.id === input.sessionId
          );

          if (target) {
            await deleteSessionByIdForUser(ctx.user.id, input.sessionId);

            if (
              sessionToken &&
              target.tokenHash === hashSessionToken(sessionToken)
            ) {
              const cookieOptions = getSessionCookieOptions(ctx.req);
              ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
            }
          }

          return { success: true };
        }),
      logoutOthers: protectedProcedure.mutation(async ({ ctx }) => {
        const sessionToken =
          parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        await deleteAllSessionsForUser(ctx.user.id, {
          exceptToken: sessionToken || undefined,
        });
        return { success: true };
      }),
      logoutAll: protectedProcedure.mutation(async ({ ctx }) => {
        await deleteAllSessionsForUser(ctx.user.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
        return { success: true };
      }),
    }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      const dbProducts = await getAllProducts();
      return dbProducts.length > 0
        ? dbProducts.map(normalizeProduct)
        : FALLBACK_PRODUCTS;
    }),
    featured: publicProcedure.query(async () => {
      const dbProducts = await getFeaturedProducts();
      if (dbProducts.length > 0) return dbProducts.map(normalizeProduct);
      const allDb = await getAllProducts();
      if (allDb.length > 0) return allDb.slice(0, 4).map(normalizeProduct);
      return FALLBACK_PRODUCTS.slice(0, 4);
    }),
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        const dbProducts = await getProductsByCategory(input.category);
        if (dbProducts.length > 0) return dbProducts.map(normalizeProduct);
        return FALLBACK_PRODUCTS.filter(p => p.category === input.category);
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const dbProduct = await getProductById(input.id);
        if (dbProduct) return normalizeProduct(dbProduct);
        return FALLBACK_PRODUCTS.find(p => p.id === input.id) ?? null;
      }),
  }),

  services: router({
    list: publicProcedure.query(async () => {
      const dbServices = await getAllServices();
      return dbServices.length > 0 ? dbServices : FALLBACK_SERVICES;
    }),
    featured: publicProcedure.query(async () => {
      const dbServices = await getFeaturedServices();
      if (dbServices.length > 0) return dbServices;
      const allDb = await getAllServices();
      if (allDb.length > 0) return allDb.slice(0, 3);
      return FALLBACK_SERVICES.slice(0, 3);
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const dbService = await getServiceById(input.id);
        if (dbService) return dbService;
        return FALLBACK_SERVICES.find(s => s.id === input.id) ?? null;
      }),
    packages: publicProcedure
      .input(z.object({ serviceId: z.number() }))
      .query(async ({ input }) => {
        return await getServicePackagesByServiceId(input.serviceId);
      }),
    withPackages: publicProcedure.query(async () => {
      const dbServices = await getAllServices();
      const servicesList = dbServices.length > 0 ? dbServices : [];
      const result = [];
      for (const svc of servicesList) {
        const pkgs = await getServicePackagesByServiceId(svc.id);
        if (pkgs.length === 0) {
          const fb = FALLBACK_SERVICES.find(
            (f: any) =>
              f.name === svc.name ||
              (f.category || "").toLowerCase() === (svc.serviceType || "").toLowerCase()
          );
          if (fb?.packages) {
            result.push({ ...svc, packages: fb.packages.map((p: any, i: number) => ({ id: -(i + 1), serviceId: svc.id, ...p })) });
            continue;
          }
        }
        result.push({ ...svc, packages: pkgs });
      }
      if (result.length === 0) {
        for (const fb of FALLBACK_SERVICES) {
          result.push({
            id: fb.id,
            name: fb.name,
            description: fb.description,
            serviceType: fb.category,
            startingPrice: fb.startingPrice,
            isActive: fb.isActive,
            featured: false,
            packages: fb.packages || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      return result;
    }),
  }),

  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getOrdersByUserId(ctx.user.id);
    }),
    byOrderNumber: protectedProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        const { orders } = await import("../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");
        const [order] = await db
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.orderNumber, input.orderNumber),
              eq(orders.userId, ctx.user.id)
            )
          )
          .limit(1);
        return order ?? null;
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await getOrderById(input.id);
        if (!order || order.userId !== ctx.user.id) return null;
        return order;
      }),
    items: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await getOrderById(input.orderId);
        if (!order || order.userId !== ctx.user.id) return [];
        return await getOrderItemsByOrderId(input.orderId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          totalAmount: z.number(),
          deliveryLocation: z.string(),
          paymentMethod: z.enum(["mpesa", "card"]),
          items: z.array(
            z.object({
              productId: z.number().optional(),
              servicePackageId: z.number().optional(),
              quantity: z.number(),
              price: z.coerce.number(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Validate prices server-side
        for (const item of input.items) {
          if (item.productId) {
            const product = await getProductById(item.productId);
            if (!product)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Product ${item.productId} not found`,
              });
            const dbPrice = product.discountPrice
              ? parseFloat(product.discountPrice)
              : parseFloat(product.price);
            if (Math.abs(dbPrice - item.price) > 0.01) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Price mismatch for product ${item.productId}`,
              });
            }
          } else if (item.servicePackageId) {
            const { servicePackages } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const [pkg] = await db
              .select()
              .from(servicePackages)
              .where(eq(servicePackages.id, item.servicePackageId))
              .limit(1);
            if (!pkg)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Service package ${item.servicePackageId} not found`,
              });
            if (Math.abs(parseFloat(pkg.price) - item.price) > 0.01) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Price mismatch for service package ${item.servicePackageId}`,
              });
            }
          }
        }
        const calculatedTotal = input.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        if (Math.abs(calculatedTotal - input.totalAmount) > 0.01) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Total amount does not match item prices",
          });
        }

        const strip = (s: string) =>
          s
            .replace(/<[^>]*>/g, "")
            .trim()
            .slice(0, 5000);
        const orderCategory = determineOrderCategory(input.items);
        const orderNumber = await generateOrderNumber(orderCategory);
        const [result] = await db
          .insert(orders)
          .values({
            userId: ctx.user.id,
            orderNumber,
            status: "pending",
            totalAmount: input.totalAmount.toString(),
            deliveryLocation: strip(input.deliveryLocation),
            paymentMethod: input.paymentMethod,
            paymentStatus: "pending",
          })
          .returning();

        const orderId = result.id;
        const emailItems: { name: string; qty: number; price: string }[] = [];

        for (const item of input.items) {
          await db.insert(orderItems).values({
            orderId,
            productId: item.productId,
            servicePackageId: item.servicePackageId,
            quantity: item.quantity,
            price: item.price.toString(),
          });
          let name = "Item";
          if (item.productId) {
            const prod = await getProductById(item.productId);
            if (prod) name = prod.name;
          } else if (item.servicePackageId) {
            const [pkg] = await db
              .select({ tier: servicePackages.tier })
              .from(servicePackages)
              .where(eq(servicePackages.id, item.servicePackageId))
              .limit(1);
            if (pkg) name = pkg.tier;
          }
          emailItems.push({
            name,
            qty: item.quantity,
            price: item.price.toString(),
          });
        }

        if (ctx.user.email && ctx.user.name) {
          sendOrderConfirmationEmail(
            ctx.user.email,
            ctx.user.name,
            orderNumber,
            emailItems,
            input.totalAmount.toString(),
            strip(input.deliveryLocation)
          );
        }

        return { orderId, orderNumber };
      }),
    allOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return await getAllOrdersWithClients();
    }),
  }),

  quotations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getQuotationsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          description: z.string(),
          items: z.array(z.any()),
          totalAmount: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const quotationNumber = `QUOTE-${Date.now()}`;
        const [result] = await db
          .insert(quotations)
          .values({
            userId: ctx.user.id,
            quotationNumber,
            description: input.description,
            items: JSON.stringify(input.items),
            totalAmount: input.totalAmount.toString(),
            status: "pending",
          })
          .returning();

        try {
          const { adminFollowUps } = await import("../drizzle/schema");
          const itemNames = input.items
            .map((it: any) => it.name || it.productName || "Item")
            .join(", ");
          await db.insert(adminFollowUps).values({
            quotationId: result.id,
            adminId: 1,
            type: "new_quotation",
            priority: "medium",
            status: "pending",
            note: `New quotation ${quotationNumber} from ${ctx.user.name || ctx.user.email || "user"}: ${input.description || itemNames} — KES ${input.totalAmount.toLocaleString()}`,
          });
        } catch {
          /* non-blocking */
        }

        return { quotationId: result.id, quotationNumber };
      }),
    allQuotations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return await getAllQuotations();
    }),
  }),

  subscriptions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getSubscriptionsByUserId(ctx.user.id);
    }),
  }),

  supportTickets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getSupportTicketsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          subject: z.string(),
          description: z.string(),
          priority: z.enum(["low", "medium", "high"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const ticketNumber = `TICKET-${Date.now()}`;
        const [result] = await db
          .insert(supportTickets)
          .values({
            userId: ctx.user.id,
            ticketNumber,
            subject: input.subject,
            description: input.description,
            status: "open",
            priority: input.priority,
          })
          .returning();

        return { ticketId: result.id, ticketNumber };
      }),
    allTickets: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return await getAllSupportTickets();
    }),
  }),

  // Contact form — public
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
          inquiryType: z
            .enum(["product", "service", "installation", "support", "other"])
            .optional(),
          subject: z.string().min(3),
          message: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        const strip = (s: string) =>
          s
            .replace(/<[^>]*>/g, "")
            .trim()
            .slice(0, 5000);
        const sanitized = {
          name: strip(input.name),
          email: input.email,
          phone: input.phone ? strip(input.phone) : null,
          inquiryType: input.inquiryType ?? "other",
          subject: strip(input.subject),
          message: strip(input.message),
        };
        const result = await createContact({
          name: sanitized.name,
          email: sanitized.email,
          phone: sanitized.phone,
          inquiryType: sanitized.inquiryType,
          subject: sanitized.subject,
          message: sanitized.message,
          status: "new",
        });
        // Auto-create admin follow-up
        try {
          const { getDb } = await import("./db");
          const db = await getDb();
          if (db) {
            const { adminFollowUps } = await import("../drizzle/schema");
            await db.insert(adminFollowUps).values({
              contactId: result.id,
              adminId: 1,
              type: "new_inquiry",
              priority:
                input.inquiryType === "support"
                  ? "high"
                  : input.inquiryType === "installation"
                    ? "high"
                    : "medium",
              status: "pending",
              note: `New ${input.inquiryType || "other"} inquiry from ${input.name}`,
            });
          }
        } catch (e) {
          /* non-blocking */
        }
        return { success: true, contactId: result.id };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      return await getAllContacts();
    }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        return await getContactById(input.id);
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "read", "replied", "closed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        await updateContactStatus(input.id, input.status);
        return { success: true };
      }),
    followUps: router({
      list: protectedProcedure
        .input(z.object({ contactId: z.number() }))
        .query(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
          return await getFollowUpsByContactId(input.contactId);
        }),
      create: protectedProcedure
        .input(z.object({ contactId: z.number(), note: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
          const result = await createFollowUp({
            contactId: input.contactId,
            adminId: ctx.user.id,
            type: "new_inquiry",
            note: input.note,
            status: "pending",
          });
          return { success: true, followUpId: result.id };
        }),
    }),
  }),

  admin: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      const stats = await getDashboardStats();
      if (stats) return stats;

      const allOrders = await getAllOrdersWithClients();
      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + parseFloat(order.totalAmount),
        0
      );
      const totalOrders = allOrders.length;
      const recentOrders = allOrders.slice(-5).reverse();

      return {
        totalRevenue,
        totalOrders,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalUsers: 0,
        newContacts: 0,
        recentOrders,
        recentContacts: [],
        totalServices: 0,
        totalPackages: 0,
      };
    }),
    sessions: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        const rows = await getAllSessions();
        const cutoff = Date.now() - SESSION_INACTIVITY_LIMIT_MS;
        return rows.filter(
          s => new Date(s.lastActivity ?? s.createdAt).getTime() >= cutoff
        );
      }),
      count: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        const rows = await getAllSessions();
        const cutoff = Date.now() - SESSION_INACTIVITY_LIMIT_MS;
        return rows.filter(
          s => new Date(s.lastActivity ?? s.createdAt).getTime() >= cutoff
        ).length;
      }),
      logout: protectedProcedure
        .input(z.object({ sessionId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
          await deleteSessionById(input.sessionId);
          return { success: true };
        }),
      logoutAll: protectedProcedure.mutation(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        await deleteAllSessions();
        return { success: true };
      }),
    }),
    allOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      return await getAllOrdersWithClients();
    }),
    newOrdersCount: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      const db = await getDb();
      if (!db) return 0;
      const thirtySecAgo = new Date(Date.now() - 30_000);
      const [result] = await db
        .select({ count: sql`COUNT(*)` })
        .from(orders)
        .where(gte(orders.createdAt, thirtySecAgo));
      return Number(result?.count ?? 0);
    }),
    lastOrderTime: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      const db = await getDb();
      if (!db) return null;
      const [row] = await db
        .select({ createdAt: orders.createdAt })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(1);
      return row?.createdAt ?? null;
    }),
    updateOrderStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum([
            "pending",
            "confirmed",
            "en-route",
            "shipped",
            "delivered",
            "cancelled",
          ]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(orders)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(orders.id, input.orderId));
        const [order] = await db
          .select({
            orderNumber: orders.orderNumber,
            userId: orders.userId,
          })
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);
        if (order) {
          const user = await getUserById(order.userId);
          if (user?.email && user?.name) {
            sendOrderStatusEmail(
              user.email,
              user.name,
              order.orderNumber,
              input.status
            );
          }
        }
        if (input.status === "confirmed") {
          try {
            const { deductStockForOrder } = await import("./db");
            await deductStockForOrder(input.orderId);
          } catch {
            /* non-blocking */
          }
        }
        return { success: true };
      }),
    updateOrderPaymentStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          paymentStatus: z.enum(["pending", "completed", "failed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db
          .update(orders)
          .set({ paymentStatus: input.paymentStatus, updatedAt: new Date() })
          .where(eq(orders.id, input.orderId));
        if (input.paymentStatus === "completed") {
          const [order] = await db
            .select({
              orderNumber: orders.orderNumber,
              userId: orders.userId,
            })
            .from(orders)
            .where(eq(orders.id, input.orderId))
            .limit(1);
          if (order) {
            const user = await getUserById(order.userId);
            if (user?.email && user?.name) {
              sendOrderStatusEmail(
                user.email,
                user.name,
                order.orderNumber,
                "confirmed"
              );
            }
          }
          try {
            const { deductStockForOrder } = await import("./db");
            await deductStockForOrder(input.orderId);
          } catch {
            /* non-blocking */
          }
        }
        return { success: true };
      }),
    followUps: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        return await getAllFollowUps();
      }),
      byStatus: protectedProcedure
        .input(
          z.object({
            status: z.enum([
              "pending",
              "in_progress",
              "completed",
              "cancelled",
            ]),
          })
        )
        .query(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
          return await getFollowUpsByStatus(input.status);
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            status: z
              .enum(["pending", "in_progress", "completed", "cancelled"])
              .optional(),
            note: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
          await updateFollowUp(input.id, {
            status: input.status,
            note: input.note,
          });
          return { success: true };
        }),
      reply: protectedProcedure
        .input(z.object({ followUpId: z.number(), message: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const { adminFollowUps } = await import("../drizzle/schema");
          const [fup] = await db
            .select()
            .from(adminFollowUps)
            .where(eq(adminFollowUps.id, input.followUpId))
            .limit(1);
          if (!fup)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Follow-up not found",
            });
          let userEmail = "";
          let userName = "";
          if (fup.contactId) {
            const contact = await getContactById(fup.contactId);
            if (contact) {
              userEmail = contact.email;
              userName = contact.name;
            }
          } else if (fup.orderId) {
            const order = await getOrderById(fup.orderId);
            if (order) {
              const user = await getUserById(order.userId);
              if (user) {
                userEmail = user.email || "";
                userName = user.name || "";
              }
            }
          }
          if (!userEmail)
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No user associated with this follow-up",
            });
          const replyNote = `[Admin replied: ${input.message}]`;
          await db
            .update(adminFollowUps)
            .set({
              note: fup.note ? `${fup.note} | ${replyNote}` : replyNote,
              status: "in_progress",
              updatedAt: new Date(),
            })
            .where(eq(adminFollowUps.id, input.followUpId));
          if (fup.contactId) {
            const { contacts } = await import("../drizzle/schema");
            await db
              .update(contacts)
              .set({
                adminResponse: input.message,
                status: "replied",
                updatedAt: new Date(),
              })
              .where(eq(contacts.id, fup.contactId));
          }
          await sendEmail(
            userEmail,
            `Response from Mwanga Grid — Re: Follow-up #${input.followUpId}`,
            `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#E07856;padding:20px;text-align:center;"><h2 style="color:white;margin:0;">Mwanga Grid</h2></div><div style="padding:24px;"><p>Dear ${userName || "Customer"},</p><p>We have responded to your inquiry:</p><blockquote style="border-left:3px solid #E07856;padding:8px 16px;margin:16px 0;background:#f9f9f9;color:#333;">${input.message}</blockquote><p>If you have further questions, please reply to this email or contact us at +254 750 110 836.</p><p style="color:#888;font-size:12px;margin-top:24px;">Mwanga Grid — Powering Your Digital Future</p></div></div>`
          );
          return { success: true };
        }),
    }),
    products: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        let items = await getAllProducts();
        if (items.length === 0)
          items = await seedProductsIfEmpty(FALLBACK_PRODUCTS);
        return items;
      }),
      create: protectedProcedure
        .input(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            price: z.string(),
            category: z.string().optional(),
            image: z.string().optional(),
            images: z.array(z.string()).optional(),
            stock: z.number().optional(),
            discountPrice: z.string().optional(),
            sku: z.string().optional(),
            warranty: z.string().optional(),
            specifications: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          const result = await adminCreateProduct(input);
          return result;
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            category: z.string().optional(),
            image: z.string().optional(),
            images: z.array(z.string()).optional(),
            stock: z.number().optional(),
            discountPrice: z.string().optional(),
            sku: z.string().optional(),
            warranty: z.string().optional(),
            specifications: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          const { id, ...data } = input;
          const result = await adminUpdateProduct(id, data);
          return result;
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          await adminDeleteProduct(input.id);
          return { success: true };
        }),
      toggleFeatured: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          return await toggleProductFeatured(input.id);
        }),
    }),
    analytics: protectedProcedure
      .input(
        z.object({
          period: z.enum(["daily", "weekly", "monthly", "yearly"]),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        return await getAnalytics(input.period, input.dateFrom, input.dateTo);
      }),
    profitLoss: protectedProcedure
      .input(
        z
          .object({
            dateFrom: z.string().optional(),
            dateTo: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        return await getProfitLoss(input?.dateFrom, input?.dateTo);
      }),
    services: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        let items: any = await getAllServices();
        if (items.length === 0)
          items = await seedServicesIfEmpty(FALLBACK_SERVICES);
        return items;
      }),
      create: protectedProcedure
        .input(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            serviceType: z.string(),
            startingPrice: z.string().optional(),
            isActive: z.boolean().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          const result = await adminCreateService(input);
          return result;
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().optional(),
            description: z.string().optional(),
            serviceType: z.string().optional(),
            startingPrice: z.string().optional(),
            isActive: z.boolean().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          const { id, ...data } = input;
          const result = await adminUpdateService(id, data);
          return result;
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          await adminDeleteService(input.id);
          return { success: true };
        }),
      toggleFeatured: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          return await toggleServiceFeatured(input.id);
        }),
      packages: router({
        list: protectedProcedure
          .input(z.object({ serviceId: z.number() }))
          .query(async ({ ctx, input }) => {
            if (ctx.user?.role !== "admin")
              throw new TRPCError({ code: "FORBIDDEN" });
            return await getServicePackagesByServiceId(input.serviceId);
          }),
        create: protectedProcedure
          .input(
            z.object({
              serviceId: z.number(),
              tier: z.string(),
              price: z.string(),
              features: z.string().optional(),
              duration: z.string().optional(),
            })
          )
          .mutation(async ({ ctx, input }) => {
            if (ctx.user?.role !== "admin")
              throw new TRPCError({ code: "FORBIDDEN" });
            const result = await adminCreateServicePackage(input);
            return result;
          }),
        update: protectedProcedure
          .input(
            z.object({
              id: z.number(),
              tier: z.string().optional(),
              price: z.string().optional(),
              features: z.string().optional(),
              duration: z.string().optional(),
            })
          )
          .mutation(async ({ ctx, input }) => {
            if (ctx.user?.role !== "admin")
              throw new TRPCError({ code: "FORBIDDEN" });
            const { id, ...data } = input;
            const result = await adminUpdateServicePackage(id, data);
            return result;
          }),
        delete: protectedProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ ctx, input }) => {
            if (ctx.user?.role !== "admin")
              throw new TRPCError({ code: "FORBIDDEN" });
            await adminDeleteServicePackage(input.id);
            return { success: true };
          }),
      }),
    }),
    export: router({
      ordersCSV: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        return await exportOrdersCSV();
      }),
      contactsCSV: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        return await exportContactsCSV();
      }),
      fullReport: protectedProcedure
        .input(
          z
            .object({
              dateFrom: z.string().optional(),
              dateTo: z.string().optional(),
            })
            .optional()
        )
        .query(async ({ ctx, input }) => {
          if (ctx.user?.role !== "admin")
            throw new TRPCError({ code: "FORBIDDEN" });
          return await exportFullReportCSV(input?.dateFrom, input?.dateTo);
        }),
    }),
  }),

  payments: router({
    mpesaInitiate: protectedProcedure
      .input(
        z.object({
          phoneNumber: z.string(),
          amountKes: z.number().positive(),
          orderNumber: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!isMpesaConfigured())
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "M-Pesa not configured",
          });
        const order = await getOrderByNumber(input.orderNumber);
        if (!order)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        if (order.userId !== ctx.user.id)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not own this order",
          });
        if (Math.abs(parseFloat(order.totalAmount) - input.amountKes) > 0.01) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Payment amount does not match order total",
          });
        }
        const mpesa = new MPesaPaymentService();
        const result = await mpesa.initiateStkPush(
          input.phoneNumber,
          input.amountKes,
          input.orderNumber
        );
        return {
          success: true,
          checkoutRequestId: result.checkoutRequestId,
          customerMessage: result.customerMessage,
        };
      }),
    mpesaStatus: protectedProcedure
      .input(z.object({ checkoutRequestId: z.string() }))
      .query(async ({ input }) => {
        if (!isMpesaConfigured())
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "M-Pesa not configured",
          });
        const mpesa = new MPesaPaymentService();
        const result = await mpesa.queryPaymentStatus(input.checkoutRequestId);
        return { success: true, ...result };
      }),
  }),
});

export type AppRouter = typeof appRouter;
