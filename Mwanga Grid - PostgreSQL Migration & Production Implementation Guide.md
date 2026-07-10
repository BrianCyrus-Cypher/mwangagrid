# Mwanga Grid - PostgreSQL Migration & Production Implementation Guide

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Ready for Implementation

---

## Executive Summary

This guide provides a complete roadmap for migrating the Mwanga Grid e-commerce platform from MySQL to PostgreSQL and implementing all production-ready features for payment processing, authentication, checkout flow, and admin management.

**Why PostgreSQL?**
- ✅ Better support for complex transactions (payment processing)
- ✅ ACID compliance for financial data
- ✅ JSON/JSONB support for flexible data storage
- ✅ Better performance for concurrent operations
- ✅ Superior security features (row-level security, encryption)
- ✅ Excellent support for payment gateway integrations

---

## 1. PostgreSQL Migration Strategy

### 1.1 Pre-Migration Checklist

- [ ] Backup current MySQL database
- [ ] Test PostgreSQL locally
- [ ] Prepare migration scripts
- [ ] Plan downtime window (2-4 hours)
- [ ] Notify stakeholders
- [ ] Prepare rollback plan

### 1.2 Database Connection Configuration

**Update `drizzle.config.ts`:**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg", // Changed from "mysql2"
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/mwanga_grid",
  },
  verbose: true,
  strict: true,
});
```

**Environment Variables:**

```bash
# .env.local
DATABASE_URL=postgresql://mwanga_user:secure_password@localhost:5432/mwanga_grid

# Production
DATABASE_URL=postgresql://prod_user:prod_password@prod-db.manus.space:5432/mwanga_grid_prod
```

### 1.3 Update Dependencies

```bash
# Remove MySQL driver
pnpm remove mysql2

# Add PostgreSQL driver
pnpm add pg
pnpm add -D @types/pg

# Update Drizzle ORM for PostgreSQL
pnpm add drizzle-orm@latest
pnpm add -D drizzle-kit@latest
```

### 1.4 Update Database Connection Code

**File: `server/db.ts`**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";

const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(queryClient, { schema });

export async function getDb() {
  return db;
}
```

### 1.5 PostgreSQL Schema Migration

**Update `drizzle/schema.ts` for PostgreSQL:**

```typescript
import { 
  integer, 
  text, 
  varchar, 
  timestamp, 
  decimal,
  pgEnum,
  pgTable,
  serial,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Define enums as PostgreSQL types
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", ["routers", "cctv_cameras", "network_switches", "cables"]);
export const paymentMethodEnum = pgEnum("payment_method", ["mpesa", "card"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]);
export const inquiryTypeEnum = pgEnum("inquiry_type", ["product", "service", "installation", "support", "other"]);
export const contactStatusEnum = pgEnum("contact_status", ["new", "responded", "closed"]);
export const followUpTypeEnum = pgEnum("follow_up_type", ["new_order", "new_quotation", "new_inquiry", "support_ticket", "status_update", "payment_issue"]);
export const followUpStatusEnum = pgEnum("follow_up_status", ["pending", "in_progress", "completed"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discountPrice", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  image: varchar("image", { length: 500 }),
  sku: varchar("sku", { length: 100 }).unique(),
  warranty: varchar("warranty", { length: 100 }),
  specifications: jsonb("specifications"), // PostgreSQL JSONB for flexible data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  deliveryLocation: text("deliveryLocation"),
  paymentMethod: paymentMethodEnum("paymentMethod"),
  paymentStatus: paymentStatusEnum("paymentStatus").default("pending").notNull(),
  paymentReference: varchar("paymentReference", { length: 100 }), // For tracking payments
  paymentDetails: jsonb("paymentDetails"), // Store payment gateway responses
  estimatedDelivery: timestamp("estimatedDelivery"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex("idx_orders_user_id").on(table.userId),
  orderNumberIdx: uniqueIndex("idx_orders_order_number").on(table.orderNumber),
}));

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  inquiryType: inquiryTypeEnum("inquiryType").notNull(),
  status: contactStatusEnum("status").default("new").notNull(),
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Admin follow-ups table
export const adminFollowUps = pgTable("adminFollowUps", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId"),
  quotationId: integer("quotationId"),
  contactId: integer("contactId"),
  ticketId: integer("ticketId"),
  type: followUpTypeEnum("type").notNull(),
  status: followUpStatusEnum("status").default("pending").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Payment transactions table (PostgreSQL specific)
export const paymentTransactions = pgTable("paymentTransactions", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  userId: integer("userId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
  paymentGateway: varchar("paymentGateway", { length: 50 }), // "mpesa", "stripe", "pesapal"
  transactionId: varchar("transactionId", { length: 100 }).unique(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  gatewayResponse: jsonb("gatewayResponse"), // Store full gateway response
  errorMessage: text("errorMessage"),
  retryCount: integer("retryCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  orderIdIdx: uniqueIndex("idx_payment_transactions_order_id").on(table.orderId),
  transactionIdIdx: uniqueIndex("idx_payment_transactions_id").on(table.transactionId),
}));

// Rate limiting table (PostgreSQL specific)
export const rateLimits = pgTable("rateLimits", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv6 support
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requestCount: integer("requestCount").default(1),
  windowStart: timestamp("windowStart").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

---

## 2. Production-Ready Features Implementation

### 2.1 Enhanced Authentication Flow

```typescript
// server/routers/auth.ts
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  // Get current user
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user || null;
  }),

  // Admin access verification
  adminAccess: publicProcedure
    .input(z.object({ adminKey: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.user?.role === "admin" || 
                     input.adminKey === process.env.ADMIN_ACCESS_KEY;
      
      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access denied",
        });
      }

      return {
        isAdmin: true,
        adminDetails: {
          companyName: "Mwanga Grid",
          email: "cheidaniells@gmail.com",
          phone: "+254 111 321 211",
          address: "P.O Box 8117, Nairobi 00100",
          physicalAddress: "Roasters next to Naivasha Mountain Mall",
        },
      };
    }),

  // Logout
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie("session");
    return { success: true };
  }),
});
```

### 2.2 Payment Processing with M-Pesa

```typescript
// server/services/payment-mpesa.ts
import axios from "axios";

interface MPesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
}

export class MPesaPaymentService {
  private config: MPesaConfig;
  private accessToken: string | null = null;

  constructor(config: MPesaConfig) {
    this.config = config;
  }

  // Get access token from Daraja API
  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    this.accessToken = response.data.access_token;
    return this.accessToken;
  }

  // Initiate STK push
  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    orderId: number
  ): Promise<{
    CheckoutRequestID: string;
    CustomerMessage: string;
  }> {
    const token = await this.getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${this.config.businessShortCode}${this.config.passkey}${timestamp}`
    ).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: this.config.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.config.callbackUrl,
        AccountReference: `ORD${orderId}`,
        TransactionDesc: `Payment for Order ${orderId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      CheckoutRequestID: response.data.CheckoutRequestID,
      CustomerMessage: response.data.CustomerMessage,
    };
  }

  // Query payment status
  async queryPaymentStatus(
    checkoutRequestId: string
  ): Promise<{
    ResultCode: string;
    ResultDesc: string;
    Amount?: number;
  }> {
    const token = await this.getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${this.config.businessShortCode}${this.config.passkey}${timestamp}`
    ).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        BusinessShortCode: this.config.businessShortCode,
        CheckoutRequestID: checkoutRequestId,
        Password: password,
        Timestamp: timestamp,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      ResultCode: response.data.ResultCode,
      ResultDesc: response.data.ResultDesc,
      Amount: response.data.CallbackMetadata?.Item?.[0]?.Value,
    };
  }
}
```

### 2.3 Rate Limiting Middleware

```typescript
// server/middleware/rate-limit.ts
import { Request, Response, NextFunction } from "express";
import { getDb } from "../db";
import { rateLimits } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Per window

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const db = await getDb();
  if (!db) {
    return next();
  }

  const userId = (req as any).user?.id;
  const ipAddress = req.ip || "unknown";
  const endpoint = req.path;

  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);

  // Get current request count
  const existing = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        userId ? eq(rateLimits.userId, userId) : eq(rateLimits.ipAddress, ipAddress),
        eq(rateLimits.endpoint, endpoint),
        gt(rateLimits.windowStart, windowStart)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const record = existing[0];
    if (record.requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((record.windowStart.getTime() + RATE_LIMIT_WINDOW - now.getTime()) / 1000),
      });
    }

    // Increment counter
    await db
      .update(rateLimits)
      .set({ requestCount: record.requestCount + 1 })
      .where(eq(rateLimits.id, record.id));
  } else {
    // Create new record
    await db.insert(rateLimits).values({
      userId,
      ipAddress,
      endpoint,
      requestCount: 1,
      windowStart: now,
    });
  }

  next();
}
```

### 2.4 Checkout Flow with Order Management

```typescript
// server/routers/orders.ts
export const ordersRouter = router({
  // Create order with validation
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number().optional(),
            servicePackageId: z.number().optional(),
            quantity: z.number().positive(),
            price: z.number().positive(),
          })
        ).min(1),
        deliveryLocation: z.string().min(5).max(500),
        paymentMethod: z.enum(["mpesa", "card"]),
        phoneNumber: z.string().regex(/^\+?254\d{9}$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.16; // 16% VAT
      const shipping = subtotal > 10000 ? 0 : 500; // Free shipping over 10K
      const totalAmount = subtotal + tax + shipping;

      // Create order
      const [order] = await db
        .insert(orders)
        .values({
          userId: ctx.user.id,
          orderNumber: `ORD-${Date.now()}`,
          status: "pending",
          totalAmount: totalAmount.toString(),
          deliveryLocation: input.deliveryLocation,
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        })
        .returning();

      // Add order items
      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          servicePackageId: item.servicePackageId,
          quantity: item.quantity,
          price: item.price.toString(),
        });
      }

      // Create admin follow-up
      await db.insert(adminFollowUps).values({
        orderId: order.id,
        type: "new_order",
        status: "pending",
        priority: "high",
        notes: `New order ${order.orderNumber} from ${ctx.user.name}`,
      });

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount,
        subtotal,
        tax,
        shipping,
        estimatedDelivery: order.estimatedDelivery,
      };
    }),

  // Initiate payment
  initiatePayment: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Get order
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (!order.length || order[0].userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Initiate M-Pesa payment
      const mpesaService = new MPesaPaymentService({
        consumerKey: process.env.MPESA_CONSUMER_KEY!,
        consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
        businessShortCode: process.env.MPESA_BUSINESS_CODE!,
        passkey: process.env.MPESA_PASSKEY!,
        callbackUrl: `${process.env.APP_URL}/api/payments/mpesa/callback`,
      });

      const result = await mpesaService.initiateStkPush(
        input.phoneNumber,
        parseFloat(order[0].totalAmount),
        input.orderId
      );

      // Store payment transaction
      await db.insert(paymentTransactions).values({
        orderId: input.orderId,
        userId: ctx.user.id,
        amount: order[0].totalAmount,
        paymentMethod: "mpesa",
        paymentGateway: "mpesa",
        transactionId: result.CheckoutRequestID,
        status: "pending",
        gatewayResponse: JSON.stringify(result),
      });

      return {
        success: true,
        checkoutRequestId: result.CheckoutRequestID,
        customerMessage: result.CustomerMessage,
      };
    }),
});
```

### 2.5 Contact System with Tailored Responses

```typescript
// server/routers/contact.ts
export const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        phone: z.string().regex(/^\+?254\d{9}$/),
        subject: z.string().min(5).max(200),
        message: z.string().min(10).max(2000),
        inquiryType: z.enum(["product", "service", "installation", "support", "other"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      // Store contact inquiry
      const [contact] = await db
        .insert(contacts)
        .values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          subject: input.subject,
          message: input.message,
          inquiryType: input.inquiryType,
          status: "new",
        })
        .returning();

      // Create admin follow-up
      await db.insert(adminFollowUps).values({
        contactId: contact.id,
        type: "new_inquiry",
        status: "pending",
        priority: "high",
        notes: `New inquiry from ${input.name}: ${input.subject}`,
      });

      // Tailored responses based on inquiry type
      const responses: Record<string, string> = {
        product: `Thank you for your interest in our products, ${input.name}! Our team will contact you within 24 hours with detailed information about our solar equipment, CCTV systems, and internet solutions. We're committed to helping you find the perfect solution for your needs.`,
        service: `Thank you for inquiring about our installation services! We'll send you a customized quote within 24 hours. Our experienced technicians are ready to help with CCTV installation, solar setup, or internet configuration.`,
        installation: `Thank you for choosing Mwanga Grid for your installation needs! Our technician will contact you within 4 hours to schedule an appointment at your preferred time.`,
        support: `Thank you for contacting our support team! We prioritize your concerns and will assist you within 2 hours during business hours (8 AM - 6 PM, Monday - Friday).`,
        other: `Thank you for reaching out to Mwanga Grid! We've received your message and will get back to you as soon as possible. We appreciate your interest in our services.`,
      };

      return {
        success: true,
        contactId: contact.id,
        message: responses[input.inquiryType],
        expectedResponse: "Within 24 hours",
      };
    }),
});
```

---

## 3. Migration Steps

### Step 1: Backup Current Database
```bash
mysqldump -u user -p database_name > backup.sql
```

### Step 2: Create PostgreSQL Database
```bash
createdb -U postgres mwanga_grid
psql -U postgres -d mwanga_grid -c "CREATE USER mwanga_user WITH PASSWORD 'secure_password';"
psql -U postgres -d mwanga_grid -c "GRANT ALL PRIVILEGES ON DATABASE mwanga_grid TO mwanga_user;"
```

### Step 3: Update Configuration
```bash
# Update .env files
DATABASE_URL=postgresql://mwanga_user:secure_password@localhost:5432/mwanga_grid
```

### Step 4: Run Migrations
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Step 5: Migrate Data (if needed)
```bash
# Use migration tool or custom script
node scripts/migrate-mysql-to-postgres.mjs
```

### Step 6: Test Thoroughly
```bash
pnpm test
pnpm dev
```

---

## 4. Security Hardening

### 4.1 Environment Variables
```bash
# Payment Processing
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_BUSINESS_CODE=your_code
MPESA_PASSKEY=your_passkey

# Admin Access
ADMIN_ACCESS_KEY=secure_random_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# App
APP_URL=https://yourdomain.com
JWT_SECRET=secure_random_secret
```

### 4.2 Security Headers
```typescript
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
```

---

## 5. Deployment Checklist

- [ ] PostgreSQL database created and tested
- [ ] Environment variables configured
- [ ] Migrations applied successfully
- [ ] Payment gateway credentials set
- [ ] Rate limiting configured
- [ ] Admin access key generated
- [ ] SSL certificate installed
- [ ] Backups automated
- [ ] Monitoring set up
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated

---

**Next Steps:**
1. Review this guide with your team
2. Set up PostgreSQL development environment
3. Run migrations on staging
4. Conduct full testing
5. Deploy to production

---

**Document End**
