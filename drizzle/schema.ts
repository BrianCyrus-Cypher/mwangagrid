import {
  pgTable,
  serial,
  integer,
  decimal,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const paymentMethodEnum = pgEnum("paymentMethod", ["mpesa", "card"]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "pending",
  "completed",
  "failed",
]);
export const orderStatusEnum = pgEnum("orderStatus", [
  "pending",
  "confirmed",
  "en-route",
  "shipped",
  "delivered",
  "cancelled",
]);
export const quotationStatusEnum = pgEnum("quotationStatus", [
  "pending",
  "approved",
  "rejected",
  "converted",
]);
export const subscriptionStatusEnum = pgEnum("subscriptionStatus", [
  "active",
  "paused",
  "cancelled",
]);
export const ticketStatusEnum = pgEnum("ticketStatus", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);
export const ticketPriorityEnum = pgEnum("ticketPriority", [
  "low",
  "medium",
  "high",
]);
export const contactStatusEnum = pgEnum("contactStatus", [
  "new",
  "read",
  "replied",
  "closed",
]);
export const inquiryTypeEnum = pgEnum("inquiryType", [
  "product",
  "service",
  "installation",
  "support",
  "other",
]);
export const followUpStatusEnum = pgEnum("followUpStatus", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const followUpPriorityEnum = pgEnum("followUpPriority", [
  "low",
  "medium",
  "high",
]);
export const followUpTypeEnum = pgEnum("followUpType", [
  "new_order",
  "new_quotation",
  "new_inquiry",
  "support_ticket",
  "status_update",
  "payment_issue",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),

  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  verificationToken: varchar("verificationToken", { length: 255 }),
  verificationExpires: timestamp("verificationExpires"),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpires: timestamp("resetTokenExpires"),

  twoFactorSecret: varchar("twoFactorSecret", { length: 255 }),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  twoFactorBackupCodes: text("twoFactorBackupCodes"),

  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  dateOfBirth: varchar("dateOfBirth", { length: 100 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 255 }).notNull().unique(),
  device: varchar("device", { length: 255 }),
  browser: varchar("browser", { length: 255 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  lastActivity: timestamp("lastActivity").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discountPrice", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  image: text("image"),
  sku: varchar("sku", { length: 100 }).unique(),
  warranty: varchar("warranty", { length: 100 }),
  specifications: text("specifications"),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  startingPrice: decimal("startingPrice", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

export const servicePackages = pgTable("servicePackages", {
  id: serial("id").primaryKey(),
  serviceId: integer("serviceId").notNull(),
  tier: varchar("tier", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features"),
  duration: varchar("duration", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = typeof servicePackages.$inferInsert;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).unique().notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  deliveryLocation: text("deliveryLocation"),
  paymentMethod: paymentMethodEnum("paymentMethod"),
  paymentStatus: paymentStatusEnum("paymentStatus")
    .default("pending")
    .notNull(),
  paymentReference: varchar("paymentReference", { length: 100 }),
  paymentDetails: text("paymentDetails"),
  estimatedDelivery: timestamp("estimatedDelivery"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId"),
  servicePackageId: integer("servicePackageId"),
  quantity: integer("quantity").default(1).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  quotationNumber: varchar("quotationNumber", { length: 50 })
    .unique()
    .notNull(),
  description: text("description"),
  items: text("items"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: quotationStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  servicePackageId: integer("servicePackageId").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  renewalDate: timestamp("renewalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const supportTickets = pgTable("supportTickets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).unique().notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default("open").notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  inquiryType: inquiryTypeEnum("inquiryType"),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: contactStatusEnum("status").default("new").notNull(),
  adminResponse: text("adminResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

export const adminFollowUps = pgTable("adminFollowUps", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId"),
  quotationId: integer("quotationId"),
  contactId: integer("contactId"),
  ticketId: integer("ticketId"),
  adminId: integer("adminId").notNull(),
  type: followUpTypeEnum("type").notNull(),
  status: followUpStatusEnum("status").default("pending").notNull(),
  priority: followUpPriorityEnum("priority").default("medium").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdminFollowUp = typeof adminFollowUps.$inferSelect;
export type InsertAdminFollowUp = typeof adminFollowUps.$inferInsert;

export const paymentTransactions = pgTable("paymentTransactions", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId"),
  userId: integer("userId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  reference: varchar("reference", { length: 100 }),
  mpesaReceiptNumber: varchar("mpesaReceiptNumber", { length: 100 }),
  mpesaPhoneNumber: varchar("mpesaPhoneNumber", { length: 20 }),
  mpesaTransactionDate: timestamp("mpesaTransactionDate"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

export const rateLimits = pgTable("rateLimits", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull(),
  count: integer("count").default(1).notNull(),
  windowStart: timestamp("windowStart").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;
