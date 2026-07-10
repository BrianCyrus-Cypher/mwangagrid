import { eq, desc, and, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { createHash } from "node:crypto";
import { InsertUser, users, products, services, servicePackages, orders, orderItems, quotations, subscriptions, supportTickets, sessions, contacts, adminFollowUps, paymentTransactions, rateLimits, Contact, InsertContact, InsertAdminFollowUp, InsertPaymentTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
export const SESSION_INACTIVITY_LIMIT_MS = 1000 * 60 * 60 * 24 * 30;

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (existing.length > 0) {
      const updateSet: Record<string, unknown> = {};
      const textFields = ["name", "email", "loginMethod", "phone"] as const;
      type TextField = (typeof textFields)[number];
      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        updateSet[field] = value ?? null;
      };
      textFields.forEach(assignNullable);
      if (user.lastSignedIn !== undefined) updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) updateSet.role = user.role;
      else if (user.openId === ENV.ownerOpenId) updateSet.role = 'admin';

      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      const values: Record<string, unknown> = { openId: user.openId };
      const textFields = ["name", "email", "loginMethod", "phone"] as const;
      type TextField = (typeof textFields)[number];
      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        values[field] = value ?? null;
      };
      textFields.forEach(assignNullable);
      values.lastSignedIn = user.lastSignedIn ?? new Date();
      if (user.role !== undefined) values.role = user.role;
      else if (user.openId === ENV.ownerOpenId) values.role = 'admin';

      await db.insert(users).values(values as any);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSessionRecord(input: {
  userId: number;
  token: string;
  device?: string | null;
  browser?: string | null;
  ipAddress?: string | null;
  lastActivity?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sessions).values({
    userId: input.userId,
    tokenHash: hashSessionToken(input.token),
    device: input.device ?? null,
    browser: input.browser ?? null,
    ipAddress: input.ipAddress ?? null,
    lastActivity: input.lastActivity ?? new Date(),
  });
}

export async function getSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const tokenHash = hashSessionToken(token);
  const result = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sessions).where(eq(sessions.userId, userId)).orderBy(desc(sessions.lastActivity));
}

export async function updateSessionActivity(token: string, activityAt: Date = new Date()) {
  const db = await getDb();
  if (!db) return;
  const tokenHash = hashSessionToken(token);
  await db.update(sessions).set({ lastActivity: activityAt }).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return;
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteSessionByIdForUser(userId: number, sessionId: number) {
  const db = await getDb();
  if (!db) return false;
  const session = await db.select().from(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId))).limit(1);
  if (session.length === 0) return false;
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  return true;
}

export async function deleteAllSessionsForUser(userId: number, options: { exceptToken?: string } = {}) {
  const db = await getDb();
  if (!db) return;
  const exceptTokenHash = options.exceptToken ? hashSessionToken(options.exceptToken) : null;
  if (exceptTokenHash) {
    const rows = await db.select().from(sessions).where(eq(sessions.userId, userId));
    for (const session of rows) {
      if (session.tokenHash !== exceptTokenHash) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
      }
    }
  } else {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

export async function pruneInactiveSessions(cutoff: Date = new Date(Date.now() - SESSION_INACTIVITY_LIMIT_MS)) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(sql`${sessions.lastActivity} < ${cutoff}`);
}

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products);
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.category, category));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function adminCreateProduct(data: { name: string; description?: string | null; price: string; category?: string | null; image?: string | null; stock?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const values: any = {
    name: data.name, price: data.price,
    description: data.description ?? null,
    category: data.category ?? "uncategorized",
    image: data.image ?? null,
    stock: data.stock ?? 0,
  };
  const [result] = await db.insert(products).values(values).returning();
  return result;
}

export async function adminUpdateProduct(id: number, data: { name?: string; description?: string; price?: string; category?: string; image?: string; stock?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
  return result;
}

export async function adminDeleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// Service queries
export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getServicePackagesByServiceId(serviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(servicePackages).where(eq(servicePackages.serviceId, serviceId));
}

// Order queries
export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderItemsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// Quotation queries
export async function getQuotationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotations).where(eq(quotations.userId, userId)).orderBy(desc(quotations.createdAt));
}

export async function getAllQuotations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotations).orderBy(desc(quotations.createdAt));
}

// Subscription queries
export async function getSubscriptionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
}

// Support ticket queries
export async function getSupportTicketsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
}

export async function getAllSupportTickets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

// Contact queries
export async function getAllContacts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
}

export async function getContactById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createContact(data: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contacts).values(data).returning();
  return result;
}

export async function updateContactStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(contacts).set({ status: status as any, updatedAt: new Date() }).where(eq(contacts.id, id));
}

// Admin follow-up queries
export async function getFollowUpsByContactId(contactId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adminFollowUps).where(eq(adminFollowUps.contactId, contactId)).orderBy(desc(adminFollowUps.createdAt));
}

export async function createFollowUp(data: {
  contactId?: number; orderId?: number; quotationId?: number; ticketId?: number;
  adminId: number; type: string; note?: string; status?: string; priority?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(adminFollowUps).values({
    contactId: data.contactId ?? null,
    orderId: data.orderId ?? null,
    quotationId: data.quotationId ?? null,
    ticketId: data.ticketId ?? null,
    adminId: data.adminId,
    type: data.type as any,
    note: data.note ?? null,
    status: (data.status as any) ?? "pending",
    priority: (data.priority as any) ?? "medium",
  }).returning();
  return result;
}

// Payment transaction queries
export async function createPaymentTransaction(data: InsertPaymentTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(paymentTransactions).values(data).returning();
  return result;
}

export async function getPaymentTransactionsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, orderId));
}

// Rate limiting
export async function checkAndIncrementRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);

  if (existing.length === 0) {
    await db.insert(rateLimits).values({ key, count: 1, windowStart: now });
    return true;
  }

  const record = existing[0];
  if (new Date(record.windowStart) < windowStart) {
    await db.update(rateLimits).set({ count: 1, windowStart: now, updatedAt: now }).where(eq(rateLimits.id, record.id));
    return true;
  }

  if (record.count >= maxRequests) return false;

  await db.update(rateLimits).set({ count: record.count + 1, updatedAt: now }).where(eq(rateLimits.id, record.id));
  return true;
}

// Dashboard queries
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const allOrders = await getAllOrders();
  const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter(o => o.status === "pending").length;
  const completedOrders = allOrders.filter(o => o.status === "delivered").length;
  const cancelledOrders = allOrders.filter(o => o.status === "cancelled").length;

  const allContacts = await getAllContacts();
  const newContacts = allContacts.filter(c => c.status === "new").length;

  const recentOrders = allOrders.slice(0, 5);
  const recentContacts = allContacts.slice(0, 5);

  const allUsers = await db.select({ count: sql<number>`count(*)` }).from(users);

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalUsers: Number(allUsers[0]?.count ?? 0),
    newContacts,
    recentOrders,
    recentContacts,
  };
}

// Follow-up queries
export async function getAllFollowUps() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adminFollowUps).orderBy(desc(adminFollowUps.createdAt));
}

export async function getFollowUpsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adminFollowUps).where(eq(adminFollowUps.status, status as any)).orderBy(desc(adminFollowUps.createdAt));
}

export async function updateFollowUp(id: number, data: { status?: string; note?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminFollowUps).set({
    status: data.status as any,
    note: data.note ?? undefined as any,
    updatedAt: new Date(),
  }).where(eq(adminFollowUps.id, id));
}

// CSV export helpers
export async function exportOrdersCSV(): Promise<string> {
  const db = await getDb();
  if (!db) return "No database";
  const rows = await getAllOrders();
  const header = "OrderNumber,CustomerID,TotalAmount,Status,PaymentMethod,PaymentStatus,CreatedAt";
  const csv = rows.map(r =>
    `${r.orderNumber},${r.userId},${r.totalAmount},${r.status},${r.paymentMethod ?? ""},${r.paymentStatus},${r.createdAt}`
  ).join("\n");
  return `${header}\n${csv}`;
}

export async function exportContactsCSV(): Promise<string> {
  const db = await getDb();
  if (!db) return "No database";
  const rows = await getAllContacts();
  const header = "ID,Name,Email,Phone,InquiryType,Subject,Status,CreatedAt";
  const csv = rows.map(r =>
    `${r.id},"${r.name}","${r.email}","${r.phone ?? ""}",${r.inquiryType ?? ""},"${r.subject}","${r.status}",${r.createdAt}`
  ).join("\n");
  return `${header}\n${csv}`;
}
