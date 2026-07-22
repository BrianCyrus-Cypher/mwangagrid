import mysql from "mysql2/promise";

const pool = mysql.createPool({
  connectionString: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const products = [
  {
    id: 101,
    name: "ALPHA 1 - 1KW + 800Wh Solar Generator",
    description:
      "Compact and portable 1KW solar generator with 800Wh battery capacity.",
    price: 45000,
    category: "solar-equipment",
    image:
      "https://claire.solar/public/uploads/all/Kf0jeSOPcikjRgLQJU6Y1qph2sDekfSP2TmAdWHF.jpg",
  },
  {
    id: 102,
    name: "DELTA 5 - 6KW + 5kWh Solar Home System",
    description: "Complete 6KW solar home system with 5kWh battery storage.",
    price: 125000,
    category: "solar-equipment",
    image:
      "https://claire.solar/public/uploads/all/NtuJLuQuhODQpi5G6UuQN8EC9xMaPiEyreyqLHgM.jpg",
  },
  {
    id: 103,
    name: "DELTA 10 - 6KW + 10kWh Solar Home System",
    description: "Premium 6KW solar home system with 10kWh battery storage.",
    price: 185000,
    category: "solar-equipment",
    image:
      "https://claire.solar/public/uploads/all/Ue2JOqJWAhrvsjqKEJnLuNV4ZRuvadtwL3sDTrAD.jpg",
  },
  {
    id: 104,
    name: "CLAIRE 480W Solar Streetlight",
    description: "Energy-efficient 480W solar streetlight with motion sensor.",
    price: 18000,
    category: "solar-equipment",
    image:
      "https://claire.solar/public/uploads/all/Cvct8M3GkZ931mHAZHTMfII1uNe6P2vOIbd7l8C2.jpg",
  },
  {
    id: 105,
    name: "CLAIRE 600W Solar Streetlight",
    description: "High-power 600W solar streetlight with motion detection.",
    price: 22000,
    category: "solar-equipment",
    image:
      "https://claire.solar/public/uploads/all/P2Lifr47ys8IzbMZQhDG2MEU6OPscwupb9D2kiNo.jpg",
  },
  {
    id: 106,
    name: "DELTA 20 - 10KW + 20kWh Solar System",
    description: "Large-scale 10KW solar system with 20kWh battery storage.",
    price: 285000,
    category: "solar-equipment",
    image:
      "https://claire.solar/public/uploads/all/fXmXqOFwHD8cxJeiXLffNPvn0OaJjxKOtzYryNvc.jpg",
  },
  {
    id: 201,
    name: "Reolink Argus 3 Pro 5MP Camera",
    description: "Advanced 5MP wireless security camera with dual-band Wi-Fi.",
    price: 28000,
    category: "cctv-cameras",
    image: "https://via.placeholder.com/400x400?text=Reolink",
  },
  {
    id: 202,
    name: "Reolink E1 4MP PT Camera",
    description: "Indoor pan-tilt 4MP Wi-Fi camera with 360-degree coverage.",
    price: 15000,
    category: "cctv-cameras",
    image: "https://via.placeholder.com/400x400?text=Reolink+E1",
  },
  {
    id: 203,
    name: "Uniview PTZ Camera 4MP+4MP 25X",
    description: "Professional dual 4MP PTZ camera with 25X zoom.",
    price: 95000,
    category: "cctv-cameras",
    image: "https://via.placeholder.com/400x400?text=Uniview+PTZ",
  },
  {
    id: 204,
    name: "Uniview 4MP Turret Camera",
    description: "Professional 4MP turret camera with dual-light technology.",
    price: 32000,
    category: "cctv-cameras",
    image: "https://via.placeholder.com/400x400?text=Uniview",
  },
  {
    id: 205,
    name: "Uniview 4MP Bullet Camera",
    description: "Compact 4MP bullet camera with dual-light technology.",
    price: 28000,
    category: "cctv-cameras",
    image: "https://via.placeholder.com/400x400?text=Uniview+Bullet",
  },
  {
    id: 206,
    name: "Uniview 4MP Dome Camera",
    description: "Discreet 4MP dome camera with IR night vision.",
    price: 25000,
    category: "cctv-cameras",
    image: "https://via.placeholder.com/400x400?text=Uniview+Dome",
  },
  {
    id: 207,
    name: "Uniview 2MP Dome Camera",
    description: "Budget-friendly 2MP dome camera with IR night vision.",
    price: 18000,
    category: "cctv-cameras",
    image: "https://via.placeholder.com/400x400?text=Uniview+2MP",
  },
  {
    id: 301,
    name: "TP-Link AX6000 Router",
    description: "High-speed AX6000 Wi-Fi 6 router with MU-MIMO.",
    price: 12500,
    category: "routers",
    image: "https://via.placeholder.com/400x400?text=TP-Link",
  },
  {
    id: 302,
    name: "Cisco Meraki Firewall",
    description:
      "Enterprise-grade cloud-managed firewall for business networks.",
    price: 45000,
    category: "network-switches",
    image: "https://via.placeholder.com/400x400?text=Cisco",
  },
  {
    id: 303,
    name: "Cat6 Ethernet Cable 100m",
    description: "High-quality Cat6 ethernet cable for reliable connectivity.",
    price: 3500,
    category: "cables",
    image: "https://via.placeholder.com/400x400?text=Cat6",
  },
  {
    id: 304,
    name: "Ubiquiti Dream Machine",
    description: "All-in-one network appliance combining router and gateway.",
    price: 35000,
    category: "routers",
    image: "https://via.placeholder.com/400x400?text=Ubiquiti",
  },
  {
    id: 305,
    name: "Netgear Switch GS110MX",
    description: "10-port managed gigabit switch with VLAN support.",
    price: 18000,
    category: "network-switches",
    image: "https://via.placeholder.com/400x400?text=Netgear",
  },
  {
    id: 306,
    name: "Fiber Optic Cable 1km",
    description: "Premium single-mode fiber optic cable for long-distance.",
    price: 25000,
    category: "cables",
    image: "https://via.placeholder.com/400x400?text=Fiber",
  },
];

async function seed() {
  const conn = await pool.getConnection();
  try {
    for (const p of products) {
      await conn.execute(
        "INSERT INTO products (id, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price), category=VALUES(category), image=VALUES(image)",
        [p.id, p.name, p.description, p.price, p.category, p.image]
      );
    }
    console.log("✅ Seeded", products.length, "real products");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await conn.release();
    await pool.end();
  }
}

seed();
