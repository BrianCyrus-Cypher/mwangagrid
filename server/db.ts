import { eq, desc, and, gte, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { createHash } from "node:crypto";
import dns from "node:dns";
import {
  InsertUser,
  users,
  products,
  services,
  servicePackages,
  orders,
  orderItems,
  quotations,
  subscriptions,
  supportTickets,
  sessions,
  contacts,
  adminFollowUps,
  paymentTransactions,
  rateLimits,
  Contact,
  InsertContact,
  InsertAdminFollowUp,
  InsertPaymentTransaction,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

// Ensure DNS resolution works for Neon database
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: any = null;
export const SESSION_INACTIVITY_LIMIT_MS = 1000 * 60 * 60 * 24 * 30;

// ── Session Cache ──
const sessionCache = new Map<string, { user: any; expiresAt: number }>();
const SESSION_CACHE_TTL = 5 * 60 * 1000;
function getCachedSession(token: string) {
  const cached = sessionCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.user;
  sessionCache.delete(token);
  return null;
}
function setCachedSession(token: string, user: any) {
  if (sessionCache.size > 500) sessionCache.clear();
  sessionCache.set(token, { user, expiresAt: Date.now() + SESSION_CACHE_TTL });
}
function clearCachedSession(token: string) {
  sessionCache.delete(token);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getDb() {
  if (_db) return _db;
  if (!process.env.DATABASE_URL) return null;
  const { Pool } = await import("pg");
  _pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 120000,
    connectionTimeoutMillis: 60000,
  });
  _pool.on("error", (err: Error) => {
    console.error("[Database] Pool error:", err);
    _db = null;
    _pool = null;
  });
  _db = drizzle(_pool);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await _db.execute(sql`SELECT 1`);
      console.log("[Database] Connection established");
      return _db;
    } catch (error) {
      console.warn(
        `[Database] Warm-up attempt ${attempt + 1}/5 failed:`,
        (error as any)?.message || error
      );
      if (attempt < 4)
        await new Promise(r => setTimeout(r, attempt * 3000 + 2000));
    }
  }
  console.error("[Database] All warm-up attempts exhausted");
  _db = null;
  _pool = null;
  return null;
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
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.openId, user.openId))
      .limit(1);
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
      if (user.lastSignedIn !== undefined)
        updateSet.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) updateSet.role = user.role;
      else if (user.openId === ENV.ownerOpenId) updateSet.role = "admin";

      await db
        .update(users)
        .set(updateSet)
        .where(eq(users.openId, user.openId));
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
      else if (user.openId === ENV.ownerOpenId) values.role = "admin";

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
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
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
  const result = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.resetToken, token))
    .limit(1);
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
  const cached = getCachedSession(token);
  if (cached) return cached;
  const db = await getDb();
  if (!db) return null;
  const tokenHash = hashSessionToken(token);
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);
  const session = result.length > 0 ? result[0] : null;
  if (session) setCachedSession(token, session);
  return session;
}

export async function listSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.lastActivity));
}

export async function getAllSessions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sessions).orderBy(desc(sessions.lastActivity));
}

export async function deleteSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  sessionCache.clear();
  return true;
}

export async function deleteAllSessions() {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions);
  sessionCache.clear();
}

export async function updateSessionActivity(
  token: string,
  activityAt: Date = new Date()
) {
  const db = await getDb();
  if (!db) return;
  const tokenHash = hashSessionToken(token);
  await db
    .update(sessions)
    .set({ lastActivity: activityAt })
    .where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteSessionByToken(token: string) {
  clearCachedSession(token);
  const db = await getDb();
  if (!db) return;
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function deleteSessionByIdForUser(
  userId: number,
  sessionId: number
) {
  const db = await getDb();
  if (!db) return false;
  const session = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .limit(1);
  if (session.length === 0) return false;
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  sessionCache.clear();
  return true;
}

export async function deleteAllSessionsForUser(
  userId: number,
  options: { exceptToken?: string } = {}
) {
  const db = await getDb();
  if (!db) return;
  const exceptTokenHash = options.exceptToken
    ? hashSessionToken(options.exceptToken)
    : null;
  if (exceptTokenHash) {
    const rows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId));
    for (const session of rows) {
      if (session.tokenHash !== exceptTokenHash) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
      }
    }
  } else {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
  sessionCache.clear();
}

export async function pruneInactiveSessions(
  cutoff: Date = new Date(Date.now() - SESSION_INACTIVITY_LIMIT_MS)
) {
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

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.featured, true));
}

export async function toggleProductFeatured(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select({ featured: products.featured })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (existing.length === 0) throw new Error("Product not found");
  const [result] = await db
    .update(products)
    .set({ featured: !existing[0].featured, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return result;
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(products)
    .where(eq(products.category, category));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function adminCreateProduct(data: {
  name: string;
  description?: string | null;
  price: string;
  category?: string | null;
  image?: string | null;
  images?: string[] | null;
  stock?: number;
  discountPrice?: string | null;
  sku?: string | null;
  warranty?: string | null;
  specifications?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const values: any = {
    name: data.name,
    price: data.price,
    description: data.description ?? null,
    category: data.category ?? "uncategorized",
    image: data.images?.[0] ?? data.image ?? null,
    stock: data.stock ?? 0,
    discountPrice: data.discountPrice ?? null,
    sku: data.sku ?? null,
    warranty: data.warranty ?? null,
    specifications: data.specifications ?? null,
  };
  if (data.images) {
    values.image = JSON.stringify(data.images);
  }
  const [result] = await db.insert(products).values(values).returning();
  return result;
}

export async function adminUpdateProduct(
  id: number,
  data: {
    name?: string;
    description?: string;
    price?: string;
    category?: string;
    image?: string;
    images?: string[];
    stock?: number;
    discountPrice?: string | null;
    sku?: string | null;
    warranty?: string | null;
    specifications?: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { ...data, updatedAt: new Date() };
  delete updateData.images;
  if (data.images) {
    updateData.image = JSON.stringify(data.images);
  } else if (data.image) {
    updateData.image = data.image;
  }
  const [result] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, id))
    .returning();
  return result;
}

export async function seedProductsIfEmpty(fallback: any[]) {
  const db = await getDb();
  if (!db) return [];
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) return [];
  for (const p of fallback) {
    const images = p.imageUrl ? [p.imageUrl] : [];
    await db.insert(products).values({
      name: p.name,
      description: p.description || null,
      category: p.category || "uncategorized",
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : null,
      image: images.length > 0 ? JSON.stringify(images) : null,
      stock: p.inStock !== false ? 10 : 0,
      sku: p.sku || null,
      warranty: p.warranty || null,
      specifications: p.specifications || null,
    });
  }
  return await db.select().from(products);
}

export async function seedServicesIfEmpty(fallback: any[]) {
  const db = await getDb();
  if (!db) return [];
  const existing = await db.select({ id: services.id }).from(services).limit(1);
  if (existing.length > 0) return [];
  for (const s of fallback) {
    const [svc] = await db
      .insert(services)
      .values({
        name: s.name,
        description: s.description || null,
        serviceType: s.category || "general",
        startingPrice: s.startingPrice ? String(s.startingPrice) : null,
        isActive: s.isActive !== false,
      })
      .returning();
    if (s.packages) {
      for (const pkg of s.packages) {
        await db.insert(servicePackages).values({ serviceId: svc.id, ...pkg });
      }
    }
  }
  return await db.select().from(services);
}

export async function ensureServicePackages(fallback: any[]) {
  const db = await getDb();
  if (!db) return;
  const allServices = await db.select().from(services);
  const allPkgs = await db.select().from(servicePackages);
  for (const svc of allServices) {
    const hasPackages = allPkgs.some(p => p.serviceId === svc.id);
    if (hasPackages) continue;
    const fb = fallback.find(
      (f: any) =>
        f.name === svc.name ||
        (f.category || "").toLowerCase() === (svc.serviceType || "").toLowerCase()
    );
    if (fb?.packages) {
      for (const pkg of fb.packages) {
        await db.insert(servicePackages).values({
          serviceId: svc.id,
          ...pkg,
        });
      }
      console.log(`[Seed] Added ${fb.packages.length} packages for "${svc.name}"`);
    }
  }
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
  const svcs = await db.select().from(services);
  const pkgs = await db.select().from(servicePackages);
  return svcs.map(s => ({
    ...s,
    packages: pkgs.filter(p => p.serviceId === s.id),
  }));
}

export async function getFeaturedServices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services).where(eq(services.featured, true));
}

export async function toggleServiceFeatured(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select({ featured: services.featured })
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  if (existing.length === 0) throw new Error("Service not found");
  const [result] = await db
    .update(services)
    .set({ featured: !existing[0].featured, updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();
  return result;
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getServicePackagesByServiceId(serviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(servicePackages)
    .where(eq(servicePackages.serviceId, serviceId));
}

// Order queries
export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
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
  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}

// ── Stock Deduction ──
export async function deductStockForOrder(
  orderId: number
): Promise<{ productId: number; name: string | null; qty: number }[]> {
  const db = await getDb();
  if (!db) return [];
  const existing = await db
    .select({ id: adminFollowUps.id })
    .from(adminFollowUps)
    .where(
      and(
        eq(adminFollowUps.orderId, orderId),
        sql`${adminFollowUps.note} LIKE ${`Stock deducted for order #${orderId}:%`}`
      )
    )
    .limit(1);
  if (existing.length > 0) {
    console.log(`[Stock] Already deducted for order #${orderId}, skipping`);
    return [];
  }
  const items = await getOrderItemsByOrderId(orderId);
  const validItems = items.filter(i => i.productId && i.quantity);
  if (validItems.length === 0) return [];
  const productIds = validItems.map(i => i.productId!);
  const products_map = new Map(
    (
      await db
        .select({ id: products.id, name: products.name, stock: products.stock })
        .from(products)
        .where(sql`${products.id} IN (${productIds.join(",")})`)
    ).map((p: any) => [p.id, p])
  );
  const deductions: { productId: number; name: string | null; qty: number }[] =
    [];
  for (const item of validItems) {
    const product = products_map.get(item.productId!);
    if (!product) continue;
    deductions.push({
      productId: product.id,
      name: product.name,
      qty: item.quantity!,
    });
  }
  if (deductions.length > 0) {
    await Promise.all(
      deductions.map(d =>
        db
          .update(products)
          .set({
            stock: sql`GREATEST(0, ${products.stock} - ${d.qty})`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, d.productId))
      )
    );
    const productNames = deductions
      .map(d => `${d.name || `Product #${d.productId}`} ×${d.qty}`)
      .join(", ");
    await db.insert(adminFollowUps).values({
      orderId,
      adminId: 1,
      type: "status_update",
      priority: "low",
      status: "pending",
      note: `Stock deducted for order #${orderId}: ${productNames}`,
    });
    console.log(`[Stock] Deducted for order #${orderId}: ${productNames}`);
  }
  return deductions;
}

// Quotation queries
export async function getQuotationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(quotations)
    .where(eq(quotations.userId, userId))
    .orderBy(desc(quotations.createdAt));
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
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
}

// Support ticket queries
export async function getSupportTicketsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
}

export async function getAllSupportTickets() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt));
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
  const result = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);
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
  await db
    .update(contacts)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(contacts.id, id));
}

// Admin follow-up queries
export async function getFollowUpsByContactId(contactId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(adminFollowUps)
    .where(eq(adminFollowUps.contactId, contactId))
    .orderBy(desc(adminFollowUps.createdAt));
}

export async function createFollowUp(data: {
  contactId?: number;
  orderId?: number;
  quotationId?: number;
  ticketId?: number;
  adminId: number;
  type: string;
  note?: string;
  status?: string;
  priority?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(adminFollowUps)
    .values({
      contactId: data.contactId ?? null,
      orderId: data.orderId ?? null,
      quotationId: data.quotationId ?? null,
      ticketId: data.ticketId ?? null,
      adminId: data.adminId,
      type: data.type as any,
      note: data.note ?? null,
      status: (data.status as any) ?? "pending",
      priority: (data.priority as any) ?? "medium",
    })
    .returning();
  return result;
}

// Payment transaction queries
export async function createPaymentTransaction(data: InsertPaymentTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db
    .insert(paymentTransactions)
    .values(data)
    .returning();
  return result;
}

export async function getPaymentTransactionsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.orderId, orderId));
}

// Rate limiting
export async function checkAndIncrementRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const existing = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.key, key))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(rateLimits).values({ key, count: 1, windowStart: now });
    return true;
  }

  const record = existing[0];
  if (new Date(record.windowStart) < windowStart) {
    await db
      .update(rateLimits)
      .set({ count: 1, windowStart: now, updatedAt: now })
      .where(eq(rateLimits.id, record.id));
    return true;
  }

  if (record.count >= maxRequests) return false;

  await db
    .update(rateLimits)
    .set({ count: record.count + 1, updatedAt: now })
    .where(eq(rateLimits.id, record.id));
  return true;
}

// Dashboard queries
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const allOrders = await getAllOrders();
  const totalRevenue = allOrders.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount),
    0
  );
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter(o => o.status === "pending").length;
  const completedOrders = allOrders.filter(
    o => o.status === "delivered"
  ).length;
  const cancelledOrders = allOrders.filter(
    o => o.status === "cancelled"
  ).length;

  const allContacts = await getAllContacts();
  const newContacts = allContacts.filter(c => c.status === "new").length;

  const recentOrders = allOrders.slice(0, 5);
  const recentContacts = allContacts.slice(0, 5);

  const allUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const allServices = await db
    .select({ count: sql<number>`count(*)` })
    .from(services);

  const allPackages = await db
    .select({ count: sql<number>`count(*)` })
    .from(servicePackages);

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
    totalServices: Number(allServices[0]?.count ?? 0),
    totalPackages: Number(allPackages[0]?.count ?? 0),
  };
}

// Follow-up queries
export async function getAllFollowUps() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: adminFollowUps.id,
      orderId: adminFollowUps.orderId,
      quotationId: adminFollowUps.quotationId,
      contactId: adminFollowUps.contactId,
      ticketId: adminFollowUps.ticketId,
      adminId: adminFollowUps.adminId,
      type: adminFollowUps.type,
      status: adminFollowUps.status,
      priority: adminFollowUps.priority,
      note: adminFollowUps.note,
      createdAt: adminFollowUps.createdAt,
      updatedAt: adminFollowUps.updatedAt,
      contactName: contacts.name,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
      contactMessage: contacts.message,
      contactSubject: contacts.subject,
      contactInquiryType: contacts.inquiryType,
    })
    .from(adminFollowUps)
    .leftJoin(contacts, eq(adminFollowUps.contactId, contacts.id))
    .orderBy(desc(adminFollowUps.createdAt));
  return rows;
}

export async function getFollowUpsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(adminFollowUps)
    .where(eq(adminFollowUps.status, status as any))
    .orderBy(desc(adminFollowUps.createdAt));
}

export async function updateFollowUp(
  id: number,
  data: { status?: string; note?: string }
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(adminFollowUps)
    .set({
      status: data.status as any,
      note: data.note ?? (undefined as any),
      updatedAt: new Date(),
    })
    .where(eq(adminFollowUps.id, id));
}

// ── Analytics ──
export async function getAnalytics(
  period: "daily" | "weekly" | "monthly" | "yearly",
  dateFrom?: string,
  dateTo?: string
) {
  const db = await getDb();
  if (!db) return null;

  const allOrders =
    dateFrom || dateTo
      ? await getAllOrdersWithClients()
      : await getAllOrdersWithClients();
  const now = new Date();
  const fromDate = dateFrom
    ? new Date(dateFrom)
    : new Date(now.getFullYear(), 0, 1);
  const toDate = dateTo ? new Date(dateTo) : now;

  const filtered = allOrders.filter(o => {
    const d = new Date(o.createdAt).getTime();
    return d >= fromDate.getTime() && d <= toDate.getTime();
  });

  const getInterval = (d: Date) => {
    if (period === "daily") return d.toISOString().slice(0, 10);
    if (period === "weekly") {
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay());
      return start.toISOString().slice(0, 10);
    }
    if (period === "monthly") return d.toISOString().slice(0, 7);
    return String(d.getFullYear());
  };

  const buckets: Record<
    string,
    { revenue: number; orders: number; delivered: number; cancelled: number }
  > = {};
  for (const o of filtered) {
    const key = getInterval(new Date(o.createdAt));
    if (!buckets[key])
      buckets[key] = { revenue: 0, orders: 0, delivered: 0, cancelled: 0 };
    buckets[key].revenue += parseFloat(o.totalAmount);
    buckets[key].orders += 1;
    if (o.status === "delivered") buckets[key].delivered += 1;
    if (o.status === "cancelled") buckets[key].cancelled += 1;
  }

  const sorted = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
  const series = sorted.map(([label, data]) => ({ label, ...data }));

  const totalRevenue = filtered.reduce(
    (s, o) => s + parseFloat(o.totalAmount),
    0
  );
  const totalOrders = filtered.length;
  const deliveredOrders = filtered.filter(o => o.status === "delivered").length;
  const cancelledOrders = filtered.filter(o => o.status === "cancelled").length;
  const pendingOrders = filtered.filter(
    o => o.status === "pending" || o.status === "confirmed"
  ).length;
  const deliveredRevenue = filtered
    .filter(o => o.status === "delivered")
    .reduce((s, o) => s + parseFloat(o.totalAmount), 0);

  // Totals for calculations
  let totalCOGS = 0;
  try {
    const allProds = await getAllProducts();
    for (const order of filtered) {
      if (order.status === "delivered" || order.status === "confirmed") {
        totalCOGS += parseFloat(order.totalAmount) * 0.6;
      }
    }
  } catch {}

  return {
    series,
    summary: {
      totalRevenue,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      pendingOrders,
      deliveredRevenue,
      profit: deliveredRevenue - totalCOGS,
      cogs: totalCOGS,
    },
    period,
    dateFrom: fromDate.toISOString().slice(0, 10),
    dateTo: toDate.toISOString().slice(0, 10),
  };
}

export async function getProfitLoss(dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  if (!db) return null;
  const allOrders = await getAllOrdersWithClients();
  const fromDate = dateFrom
    ? new Date(dateFrom)
    : new Date(new Date().getFullYear(), 0, 1);
  const toDate = dateTo ? new Date(dateTo) : new Date();
  const filtered = allOrders.filter(o => {
    const d = new Date(o.createdAt).getTime();
    return d >= fromDate.getTime() && d <= toDate.getTime();
  });
  const delivered = filtered.filter(o => o.status === "delivered");
  const totalRevenue = delivered.reduce(
    (s, o) => s + parseFloat(o.totalAmount),
    0
  );
  const cogs = totalRevenue * 0.6;
  const grossProfit = totalRevenue - cogs;
  const operationalCosts = totalRevenue * 0.25;
  const netProfit = grossProfit - operationalCosts;
  return {
    period: {
      from: fromDate.toISOString().slice(0, 10),
      to: toDate.toISOString().slice(0, 10),
    },
    totalRevenue,
    totalDelivered: delivered.length,
    cogs,
    grossProfit,
    grossMargin:
      totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0",
    operationalCosts,
    netProfit,
    netMargin:
      totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0",
  };
}

// ── Admin Service CRUD ──
export async function adminCreateService(data: {
  name: string;
  description?: string | null;
  serviceType: string;
  startingPrice?: string | null;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(services).values(data).returning();
  return result;
}

export async function adminUpdateService(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    serviceType?: string;
    startingPrice?: string | null;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { ...data, updatedAt: new Date() };
  Object.keys(updateData).forEach(
    k => updateData[k] === undefined && delete updateData[k]
  );
  const [result] = await db
    .update(services)
    .set(updateData)
    .where(eq(services.id, id))
    .returning();
  return result;
}

export async function adminDeleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(servicePackages).where(eq(servicePackages.serviceId, id));
  await db.delete(services).where(eq(services.id, id));
}

export async function adminCreateServicePackage(data: {
  serviceId: number;
  tier: string;
  price: string;
  features?: string | null;
  duration?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(servicePackages).values(data).returning();
  return result;
}

export async function adminUpdateServicePackage(
  id: number,
  data: {
    tier?: string;
    price?: string;
    features?: string | null;
    duration?: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { ...data, updatedAt: new Date() };
  Object.keys(updateData).forEach(
    k => updateData[k] === undefined && delete updateData[k]
  );
  const [result] = await db
    .update(servicePackages)
    .set(updateData)
    .where(eq(servicePackages.id, id))
    .returning();
  return result;
}

export async function adminDeleteServicePackage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(servicePackages).where(eq(servicePackages.id, id));
}

// ── Order Number Generation ──
export async function generateOrderNumber(category: string): Promise<string> {
  const db = await getDb();
  const prefixMap: Record<string, string> = {
    "solar-equipment": "SOL",
    solar: "SOL",
    "cctv-cameras": "CCTV",
    security: "CCTV",
    routers: "NET",
    "network-switches": "NET",
    cables: "NET",
    networking: "NET",
    internet: "INT",
    internet_installation: "INT",
  };
  const cat = prefixMap[category] || "GEN";
  const dbPrefix = `ORD-${cat}-`;

  if (!db) return `${dbPrefix}${Date.now().toString().slice(-6)}`;

  try {
    const result = await db.execute(
      sql`SELECT "orderNumber" FROM "orders" WHERE "orderNumber" LIKE ${dbPrefix + "%"} ORDER BY "orderNumber" DESC LIMIT 1`
    );
    let nextSeq = 1;
    if (result.rows.length > 0) {
      const lastNum = parseInt(
        (result.rows[0] as any).orderNumber.replace(dbPrefix, ""),
        10
      );
      if (!isNaN(lastNum)) nextSeq = lastNum + 1;
    }
    const padded = String(nextSeq).padStart(
      Math.max(4, String(nextSeq).length),
      "0"
    );
    return `${dbPrefix}${padded}`;
  } catch {
    return `${dbPrefix}${Date.now().toString().slice(-6)}`;
  }
}

export function determineOrderCategory(
  items: Array<{
    productId?: number;
    servicePackageId?: number;
    name?: string;
    category?: string;
  }>
): string {
  for (const item of items) {
    const cat = (item.category || "").toLowerCase();
    if (cat.includes("solar")) return "solar-equipment";
    if (
      cat.includes("cctv") ||
      cat.includes("camera") ||
      cat.includes("security")
    )
      return "cctv-cameras";
    if (
      cat.includes("router") ||
      cat.includes("switch") ||
      cat.includes("cable") ||
      cat.includes("net")
    )
      return "routers";
    if (cat.includes("internet")) return "internet";
    const name = (item.name || "").toLowerCase();
    if (name.includes("solar")) return "solar-equipment";
    if (
      name.includes("cctv") ||
      name.includes("camera") ||
      name.includes("security")
    )
      return "cctv-cameras";
    if (
      name.includes("router") ||
      name.includes("switch") ||
      name.includes("cable") ||
      name.includes("net")
    )
      return "routers";
    if (name.includes("internet")) return "internet";
  }
  return "general";
}

// ── Orders with client names ──
export async function getAllOrdersWithClients() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      deliveryLocation: orders.deliveryLocation,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      paymentReference: orders.paymentReference,
      trackingNumber: orders.trackingNumber,
      estimatedDelivery: orders.estimatedDelivery,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      clientName: users.name,
      clientEmail: users.email,
      clientPhone: users.phone,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));
  return result;
}

// ── Comprehensive CSV Export ──
export async function exportFullReportCSV(
  dateFrom?: string,
  dateTo?: string
): Promise<string> {
  const db = await getDb();
  if (!db) return "No database";

  const ordersWithClients = await getAllOrdersWithClients();
  const allProducts = await getAllProducts();
  const allContacts = await getAllContacts();

  const filtered =
    dateFrom || dateTo
      ? ordersWithClients.filter(o => {
          const d = new Date(o.createdAt).getTime();
          if (dateFrom && d < new Date(dateFrom).getTime()) return false;
          if (dateTo && d > new Date(dateTo).setHours(23, 59, 59, 999))
            return false;
          return true;
        })
      : ordersWithClients;

  const totalRevenue = filtered.reduce(
    (s, o) => s + parseFloat(o.totalAmount),
    0
  );
  const totalOrders = filtered.length;
  const completedOrders = filtered.filter(o => o.status === "delivered").length;
  const cancelledOrders = filtered.filter(o => o.status === "cancelled").length;
  const pendingOrders = filtered.filter(o => o.status === "pending").length;
  const revenueFromCompleted = filtered
    .filter(o => o.status === "delivered")
    .reduce((s, o) => s + parseFloat(o.totalAmount), 0);

  const lines: string[] = [];
  lines.push("MWANGA GRID — FULL REPORT");
  lines.push(
    `Report Date Range,${dateFrom || "All time"},to,${dateTo || "All time"}`
  );
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push("");
  lines.push("--- TOTALS ---");
  lines.push(`Total Orders,${totalOrders}`);
  lines.push(`Total Revenue (KES),${totalRevenue}`);
  lines.push(`Completed Orders,${completedOrders}`);
  lines.push(`Pending Orders,${pendingOrders}`);
  lines.push(`Cancelled Orders,${cancelledOrders}`);
  lines.push(`Revenue from Delivered (KES),${revenueFromCompleted}`);
  lines.push(`Total Products,${allProducts.length}`);
  lines.push(`Total Contacts/Inquiries,${allContacts.length}`);
  lines.push("");
  lines.push("--- PROFIT / LOSS (Estimated) ---");
  lines.push(`Period Revenue (KES),${totalRevenue}`);
  lines.push(`Period Orders,${totalOrders}`);
  lines.push(
    `Avg Order Value (KES),${totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}`
  );
  lines.push("");
  lines.push("--- ORDERS ---");
  lines.push(
    "OrderNumber,ClientName,ClientEmail,ClientPhone,Total(KES),Status,PaymentStatus,PaymentMethod,DeliveryLocation,TrackingNumber,CreatedAt"
  );
  for (const o of filtered) {
    lines.push(
      `"${o.orderNumber}","${o.clientName || ""}","${o.clientEmail || ""}","${o.clientPhone || ""}",${o.totalAmount},"${o.status}","${o.paymentStatus}","${o.paymentMethod || ""}","${(o.deliveryLocation || "").replace(/"/g, '""')}","${o.trackingNumber || ""}",${o.createdAt}`
    );
  }
  lines.push("");
  lines.push("--- TOTALS SUMMARY ---");
  lines.push(
    `Total Orders,${totalOrders},Total Revenue,${totalRevenue},Avg Order,${totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}`
  );
  lines.push("");
  lines.push("--- CONTACTS ---");
  lines.push(
    "ID,Name,Email,Phone,InquiryType,Subject,Message,Status,CreatedAt"
  );
  for (const c of allContacts) {
    lines.push(
      `${c.id},"${c.name}","${c.email}","${c.phone || ""}","${c.inquiryType || ""}","${(c.subject || "").replace(/"/g, '""')}","${(c.message || "").replace(/"/g, '""')}","${c.status}",${c.createdAt}`
    );
  }

  return lines.join("\n");
}

export async function exportOrdersCSV(): Promise<string> {
  const db = await getDb();
  if (!db) return "No database";
  const rows = await getAllOrdersWithClients();
  const header =
    "OrderNumber,ClientName,ClientEmail,ClientPhone,TotalAmount,Status,PaymentMethod,PaymentStatus,DeliveryLocation,CreatedAt";
  const csv = rows
    .map(
      r =>
        `"${r.orderNumber}","${r.clientName || ""}","${r.clientEmail || ""}","${r.clientPhone || ""}",${r.totalAmount},"${r.status}","${r.paymentMethod ?? ""}","${r.paymentStatus}","${(r.deliveryLocation || "").replace(/"/g, '""')}",${r.createdAt}`
    )
    .join("\n");
  return `${header}\n${csv}`;
}

export async function exportContactsCSV(): Promise<string> {
  const db = await getDb();
  if (!db) return "No database";
  const rows = await getAllContacts();
  const header =
    "ID,Name,Email,Phone,InquiryType,Subject,Message,Status,CreatedAt";
  const csv = rows
    .map(
      r =>
        `${r.id},"${r.name}","${r.email}","${r.phone ?? ""}",${r.inquiryType ?? ""},"${r.subject}","${(r.message || "").replace(/"/g, '""')}","${r.status}",${r.createdAt}`
    )
    .join("\n");
  return `${header}\n${csv}`;
}
