import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Seed Products
const products = [
  {
    name: "TP-Link AC1200 Wireless Router",
    description:
      "High-speed dual-band router with 1200 Mbps combined speed, perfect for homes and small offices.",
    category: "routers",
    price: 4500,
    discountPrice: 3999,
    stock: 25,
    sku: "ROUTER-001",
    warranty: "2 years",
  },
  {
    name: "Cisco Catalyst 2960X Switch",
    description:
      "48-port managed network switch with advanced security features for enterprise networks.",
    category: "network_switches",
    price: 28000,
    discountPrice: null,
    stock: 8,
    sku: "SWITCH-001",
    warranty: "3 years",
  },
  {
    name: "4MP CCTV Dome Camera",
    description:
      "High-resolution dome camera with night vision, IP67 weatherproof rating, and motion detection.",
    category: "cctv_cameras",
    price: 8500,
    discountPrice: 7499,
    stock: 15,
    sku: "CCTV-001",
    warranty: "2 years",
  },
  {
    name: "Cat6 Ethernet Cable (100m)",
    description:
      "Professional-grade Cat6 cable for high-speed data transmission up to 10 Gbps.",
    category: "cables",
    price: 2200,
    discountPrice: null,
    stock: 50,
    sku: "CABLE-001",
    warranty: "1 year",
  },
  {
    name: "Ubiquiti UniFi 6 Pro Access Point",
    description:
      "Enterprise-grade WiFi 6 access point with 2.4/5 GHz bands and mesh capability.",
    category: "routers",
    price: 12000,
    discountPrice: 10500,
    stock: 12,
    sku: "ROUTER-002",
    warranty: "2 years",
  },
  {
    name: "8MP CCTV Turret Camera",
    description:
      "Ultra HD turret camera with advanced AI detection, perfect for commercial surveillance.",
    category: "cctv_cameras",
    price: 15000,
    discountPrice: 13500,
    stock: 10,
    sku: "CCTV-002",
    warranty: "3 years",
  },
  {
    name: "Netgear Managed Switch 24-Port",
    description:
      "Reliable 24-port managed switch with VLAN support for medium-sized networks.",
    category: "network_switches",
    price: 16000,
    discountPrice: null,
    stock: 6,
    sku: "SWITCH-002",
    warranty: "2 years",
  },
  {
    name: "Fiber Optic Cable (500m)",
    description:
      "Single-mode fiber optic cable for long-distance, high-speed data transmission.",
    category: "cables",
    price: 8000,
    discountPrice: null,
    stock: 20,
    sku: "CABLE-002",
    warranty: "1 year",
  },
];

for (const product of products) {
  await connection.execute(
    "INSERT INTO products (name, description, category, price, discountPrice, stock, sku, warranty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      product.name,
      product.description,
      product.category,
      product.price,
      product.discountPrice,
      product.stock,
      product.sku,
      product.warranty,
    ]
  );
}

// Seed Services
const services = [
  {
    name: "CCTV Installation Service",
    description:
      "Professional CCTV system installation with camera placement, wiring, and configuration.",
    serviceType: "cctv_installation",
  },
  {
    name: "Internet Installation Service",
    description:
      "High-speed internet connection setup with router configuration and network optimization.",
    serviceType: "internet_installation",
  },
];

const serviceIds = [];
for (const service of services) {
  const [result] = await connection.execute(
    "INSERT INTO services (name, description, serviceType) VALUES (?, ?, ?)",
    [service.name, service.description, service.serviceType]
  );
  serviceIds.push(result.insertId);
}

// Seed Service Packages
const servicePackages = [
  // CCTV Installation packages
  {
    serviceId: serviceIds[0],
    tier: "Basic",
    price: 15000,
    features: JSON.stringify([
      "2 cameras",
      "Basic DVR",
      "Installation",
      "6 months warranty",
    ]),
    duration: "1 month",
  },
  {
    serviceId: serviceIds[0],
    tier: "Standard",
    price: 35000,
    features: JSON.stringify([
      "4 cameras",
      "Advanced DVR",
      "Cloud backup",
      "Mobile app",
      "1 year warranty",
    ]),
    duration: "1 month",
  },
  {
    serviceId: serviceIds[0],
    tier: "Premium",
    price: 65000,
    features: JSON.stringify([
      "8 cameras",
      "Enterprise DVR",
      "Cloud backup",
      "Mobile app",
      "24/7 monitoring",
      "2 years warranty",
    ]),
    duration: "1 month",
  },
  // Internet Installation packages
  {
    serviceId: serviceIds[1],
    tier: "Basic",
    price: 5000,
    features: JSON.stringify(["10 Mbps speed", "Router setup", "Installation"]),
    duration: "1 month",
  },
  {
    serviceId: serviceIds[1],
    tier: "Standard",
    price: 12000,
    features: JSON.stringify([
      "50 Mbps speed",
      "Managed router",
      "WiFi optimization",
      "Support",
    ]),
    duration: "1 month",
  },
  {
    serviceId: serviceIds[1],
    tier: "Premium",
    price: 25000,
    features: JSON.stringify([
      "100 Mbps speed",
      "Enterprise router",
      "WiFi optimization",
      "24/7 support",
      "Backup connection",
    ]),
    duration: "1 month",
  },
];

for (const pkg of servicePackages) {
  await connection.execute(
    "INSERT INTO servicePackages (serviceId, tier, price, features, duration) VALUES (?, ?, ?, ?, ?)",
    [pkg.serviceId, pkg.tier, pkg.price, pkg.features, pkg.duration]
  );
}

// Seed Orders (mock data)
const orders = [
  {
    userId: 1,
    orderNumber: "ORD-2026-001",
    status: "delivered",
    totalAmount: 12499,
    deliveryLocation: "Nairobi, Kenya",
    paymentMethod: "mpesa",
    paymentStatus: "completed",
  },
  {
    userId: 1,
    orderNumber: "ORD-2026-002",
    status: "confirmed",
    totalAmount: 28000,
    deliveryLocation: "Westlands, Nairobi",
    paymentMethod: "card",
    paymentStatus: "completed",
  },
  {
    userId: 1,
    orderNumber: "ORD-2026-003",
    status: "pending",
    totalAmount: 35000,
    deliveryLocation: "CBD, Nairobi",
    paymentMethod: "mpesa",
    paymentStatus: "pending",
  },
];

const orderIds = [];
for (const order of orders) {
  const [result] = await connection.execute(
    "INSERT INTO orders (userId, orderNumber, status, totalAmount, deliveryLocation, paymentMethod, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      order.userId,
      order.orderNumber,
      order.status,
      order.totalAmount,
      order.deliveryLocation,
      order.paymentMethod,
      order.paymentStatus,
    ]
  );
  orderIds.push(result.insertId);
}

// Seed Order Items
const orderItems = [
  { orderId: orderIds[0], productId: 1, quantity: 1, price: 3999 },
  { orderId: orderIds[0], productId: 4, quantity: 2, price: 2200 },
  { orderId: orderIds[1], productId: 2, quantity: 1, price: 28000 },
  { orderId: orderIds[2], productId: 3, quantity: 1, price: 7499 },
];

for (const item of orderItems) {
  await connection.execute(
    "INSERT INTO orderItems (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)",
    [item.orderId, item.productId, item.quantity, item.price]
  );
}

// Seed Quotations (mock data)
const quotations = [
  {
    userId: 1,
    quotationNumber: "QUOTE-2026-001",
    description: "CCTV system for office building",
    items: JSON.stringify([
      { name: "4MP CCTV Dome Camera", quantity: 4, price: 7499 },
    ]),
    totalAmount: 29996,
    status: "pending",
  },
  {
    userId: 1,
    quotationNumber: "QUOTE-2026-002",
    description: "Network upgrade for retail store",
    items: JSON.stringify([
      { name: "Cisco Catalyst 2960X Switch", quantity: 1, price: 28000 },
    ]),
    totalAmount: 28000,
    status: "approved",
  },
];

for (const quote of quotations) {
  await connection.execute(
    "INSERT INTO quotations (userId, quotationNumber, description, items, totalAmount, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      quote.userId,
      quote.quotationNumber,
      quote.description,
      quote.items,
      quote.totalAmount,
      quote.status,
    ]
  );
}

// Seed Subscriptions (mock data)
const subscriptions = [
  {
    userId: 1,
    servicePackageId: 4,
    status: "active",
    startDate: new Date("2026-01-01"),
    renewalDate: new Date("2026-07-01"),
  },
  {
    userId: 1,
    servicePackageId: 2,
    status: "active",
    startDate: new Date("2025-12-01"),
    renewalDate: new Date("2026-06-01"),
  },
];

for (const sub of subscriptions) {
  await connection.execute(
    "INSERT INTO subscriptions (userId, servicePackageId, status, startDate, renewalDate) VALUES (?, ?, ?, ?, ?)",
    [
      sub.userId,
      sub.servicePackageId,
      sub.status,
      sub.startDate,
      sub.renewalDate,
    ]
  );
}

// Seed Support Tickets (mock data)
const tickets = [
  {
    userId: 1,
    ticketNumber: "TICKET-2026-001",
    subject: "CCTV camera not recording",
    description: "The CCTV camera in the main office is not recording video.",
    status: "in_progress",
    priority: "high",
  },
  {
    userId: 1,
    ticketNumber: "TICKET-2026-002",
    subject: "Internet speed issues",
    description: "Internet speed is slower than expected.",
    status: "open",
    priority: "medium",
  },
];

for (const ticket of tickets) {
  await connection.execute(
    "INSERT INTO supportTickets (userId, ticketNumber, subject, description, status, priority) VALUES (?, ?, ?, ?, ?, ?)",
    [
      ticket.userId,
      ticket.ticketNumber,
      ticket.subject,
      ticket.description,
      ticket.status,
      ticket.priority,
    ]
  );
}

console.log("✅ Database seeded successfully!");
await connection.end();
