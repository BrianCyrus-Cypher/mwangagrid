import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  getAllServices,
  getServiceById,
  getServicePackagesByServiceId,
  getOrdersByUserId,
  getOrderById,
  getAllOrders,
  getOrderItemsByOrderId,
  getQuotationsByUserId,
  getAllQuotations,
  getSubscriptionsByUserId,
  getSupportTicketsByUserId,
  getAllSupportTickets,
} from "./db";
import { getDb } from "./db";
import { orders, orderItems, quotations, supportTickets } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products
  products: router({
    list: publicProcedure.query(async () => {
      return await getAllProducts();
    }),
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await getProductsByCategory(input.category);
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProductById(input.id);
      }),
  }),

  // Services
  services: router({
    list: publicProcedure.query(async () => {
      return await getAllServices();
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getServiceById(input.id);
      }),
    packages: publicProcedure
      .input(z.object({ serviceId: z.number() }))
      .query(async ({ input }) => {
        return await getServicePackagesByServiceId(input.serviceId);
      }),
  }),

  // Orders
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getOrdersByUserId(ctx.user.id);
    }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getOrderById(input.id);
      }),
    items: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
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
              price: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const orderNumber = `ORD-${Date.now()}`;
        const [result] = await db.insert(orders).values({
          userId: ctx.user.id,
          orderNumber,
          status: "pending",
          totalAmount: input.totalAmount.toString(),
          deliveryLocation: input.deliveryLocation,
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
        });

        const orderId = (result as any).insertId;

        for (const item of input.items) {
          await db.insert(orderItems).values({
            orderId,
            productId: item.productId,
            servicePackageId: item.servicePackageId,
            quantity: item.quantity,
            price: item.price.toString(),
          });
        }

        return { orderId, orderNumber };
      }),
    allOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return await getAllOrders();
    }),
  }),

  // Quotations
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
        const [result] = await db.insert(quotations).values({
          userId: ctx.user.id,
          quotationNumber,
          description: input.description,
          items: JSON.stringify(input.items),
          totalAmount: input.totalAmount.toString(),
          status: "pending",
        });

        return { quotationId: (result as any).insertId, quotationNumber };
      }),
    allQuotations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return await getAllQuotations();
    }),
  }),

  // Subscriptions
  subscriptions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getSubscriptionsByUserId(ctx.user.id);
    }),
  }),

  // Support Tickets
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
        const [result] = await db.insert(supportTickets).values({
          userId: ctx.user.id,
          ticketNumber,
          subject: input.subject,
          description: input.description,
          status: "open",
          priority: input.priority,
        });

        return { ticketId: (result as any).insertId, ticketNumber };
      }),
    allTickets: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      return await getAllSupportTickets();
    }),
  }),

  // Admin Dashboard
  admin: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Unauthorized");
      
      const allOrders = await getAllOrders();
      const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const totalOrders = allOrders.length;
      const recentOrders = allOrders.slice(-5).reverse();

      return {
        totalRevenue,
        totalOrders,
        recentOrders,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
