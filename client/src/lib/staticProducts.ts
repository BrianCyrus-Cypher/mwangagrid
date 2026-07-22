// Static product data — used locally when no database is connected.
// All prices in KES.

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
  specifications?: Record<string, string>;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  features: string[];
  startingPrice: number;
  icon: string;
}

export const STATIC_PRODUCTS: Product[] = [
  // Solar Equipment
  {
    id: 101,
    name: "ALPHA 1 — 1KW + 800Wh All-in-One Solar Generator",
    category: "solar-equipment",
    price: 45000,
    description:
      "Compact and portable 1KW solar generator with 800Wh battery capacity. Perfect for home backup power, camping, and emergency situations. Features built-in inverter and multiple output ports.",
    image:
      "https://claire.solar/public/uploads/all/Kf0jeSOPcikjRgLQJU6Y1qph2sDekfSP2TmAdWHF.jpg",
    inStock: true,
    specifications: {
      Power: "1KW",
      Battery: "800Wh",
      Warranty: "2 years",
      Type: "All-in-One Generator",
    },
  },
  {
    id: 102,
    name: "DELTA 5 — 6KW + 5kWh Solar Home System",
    category: "solar-equipment",
    price: 125000,
    description:
      "Complete 6KW solar home system with 5kWh battery storage. Ideal for small to medium homes. Includes solar panels, inverter, battery, and installation support.",
    image:
      "https://claire.solar/public/uploads/all/NtuJLuQuhODQpi5G6UuQN8EC9xMaPiEyreyqLHgM.jpg",
    inStock: true,
    specifications: {
      Power: "6KW",
      Battery: "5kWh",
      Warranty: "5 years",
      Type: "Home System",
    },
  },
  {
    id: 103,
    name: "DELTA 10 — 6KW + 10kWh Solar Home System",
    category: "solar-equipment",
    price: 185000,
    description:
      "Premium 6KW solar home system with 10kWh battery storage. Extended battery capacity for continuous power supply. Supports whole-home energy needs.",
    image:
      "https://claire.solar/public/uploads/all/Ue2JOqJWAhrvsjqKEJnLuNV4ZRuvadtwL3sDTrAD.jpg",
    inStock: true,
    specifications: {
      Power: "6KW",
      Battery: "10kWh",
      Warranty: "5 years",
      Type: "Home System",
    },
  },
  {
    id: 104,
    name: "CLAIRE 480W ABS Solar Streetlight with Motion Sensor",
    category: "solar-equipment",
    price: 18000,
    description:
      "Energy-efficient 480W solar streetlight with integrated motion sensor. Perfect for outdoor lighting, parking areas, and street illumination.",
    image:
      "https://claire.solar/public/uploads/all/Cvct8M3GkZ931mHAZHTMfII1uNe6P2vOIbd7l8C2.jpg",
    inStock: true,
    specifications: {
      Power: "480W",
      Type: "Solar Streetlight",
      Features: "Motion Sensor, Daylight Sensor",
      Warranty: "2 years",
    },
  },
  {
    id: 105,
    name: "CLAIRE 600W ABS Solar Streetlight with Motion Sensor",
    category: "solar-equipment",
    price: 22000,
    description:
      "High-power 600W solar streetlight with advanced motion detection. Ideal for highways and commercial areas. Weather-resistant ABS housing.",
    image:
      "https://claire.solar/public/uploads/all/P2Lifr47ys8IzbMZQhDG2MEU6OPscwupb9D2kiNo.jpg",
    inStock: true,
    specifications: {
      Power: "600W",
      Type: "Solar Streetlight",
      Features: "Motion Sensor, Daylight Sensor, Weather-Resistant",
      Warranty: "2 years",
    },
  },
  {
    id: 106,
    name: "DELTA 20 — 10KW + 20kWh Solar Home System",
    category: "solar-equipment",
    price: 285000,
    description:
      "Large-scale 10KW solar system with 20kWh battery storage. Designed for large homes and small commercial applications.",
    image:
      "https://claire.solar/public/uploads/all/fXmXqOFwHD8cxJeiXLffNPvn0OaJjxKOtzYryNvc.jpg",
    inStock: true,
    specifications: {
      Power: "10KW",
      Battery: "20kWh",
      Warranty: "5 years",
      Type: "Home System",
    },
  },

  // CCTV Cameras
  {
    id: 201,
    name: "Reolink Argus 3 Pro 5MP Dual-Band Wi-Fi Battery Camera",
    category: "cctv-cameras",
    price: 9000,
    description:
      "Advanced 5MP wireless security camera with dual-band Wi-Fi and long battery life. 2K resolution, colour night vision, and smart motion detection.",
    image: "",
    inStock: true,
    specifications: {
      Resolution: "5MP (2K)",
      Type: "Wireless Battery",
      "Night Vision": "Colour",
      "Motion Detection": "AI Smart",
      Warranty: "1 year",
    },
  },
  {
    id: 202,
    name: "Reolink E1 4MP Pan-Tilt Indoor Wi-Fi Camera",
    category: "cctv-cameras",
    price: 3000,
    description:
      "Indoor pan-tilt 4MP Wi-Fi camera with 360° coverage. Features smart motion tracking and colour night vision. Ideal for home and office surveillance.",
    image: "",
    inStock: true,
    specifications: {
      Resolution: "4MP",
      Type: "Pan-Tilt Indoor",
      "Night Vision": "IR",
      Coverage: "360°",
      Warranty: "1 year",
    },
  },
  {
    id: 203,
    name: "Uniview 4MP+4MP 25X ColorHunter PTZ Camera",
    category: "cctv-cameras",
    price: 52800,
    description:
      "Professional dual 4MP PTZ camera with 25X zoom and ColorHunter technology. Advanced dual-light system for superior night imaging.",
    image: "https://www.uniview.com/uploadfile/2023/1220/20231220081504_28.jpg",
    inStock: true,
    specifications: {
      Resolution: "4MP + 4MP",
      Type: "PTZ",
      Zoom: "25X",
      "Night Vision": "Dual-light ColorHunter",
      Warranty: "2 years",
    },
  },
  {
    id: 204,
    name: "Uniview 4MP Fixed Dual-light Turret Camera",
    category: "cctv-cameras",
    price: 4500,
    description:
      "Professional 4MP turret camera with dual-light technology for 24/7 colour imaging. Fixed lens for reliable retail and commercial surveillance.",
    image: "https://www.uniview.com/uploadfile/2023/0810/20230810095527_79.jpg",
    inStock: true,
    specifications: {
      Resolution: "4MP",
      Type: "Turret",
      "Night Vision": "Dual-light",
      Warranty: "2 years",
      Mounting: "Ceiling/Wall",
    },
  },
  {
    id: 205,
    name: "Uniview 4MP Fixed Dual-light Bullet Camera",
    category: "cctv-cameras",
    price: 4650,
    description:
      "Compact 4MP bullet camera with dual-light technology. Weather-resistant design for outdoor installation.",
    image: "https://www.uniview.com/uploadfile/2023/0810/20230810095442_21.jpg",
    inStock: true,
    specifications: {
      Resolution: "4MP",
      Type: "Bullet",
      "Night Vision": "Dual-light",
      "Weather Resistant": "Yes (IP67)",
      Warranty: "2 years",
    },
  },
  {
    id: 206,
    name: "Uniview 4MP Fixed IR Dome Network Camera",
    category: "cctv-cameras",
    price: 4000,
    description:
      "Discreet 4MP dome camera with IR night vision. Ideal for indoor surveillance in banks, offices, and retail stores.",
    image: "https://www.uniview.com/uploadfile/2023/0104/20230104064319_97.jpg",
    inStock: true,
    specifications: {
      Resolution: "4MP",
      Type: "Dome",
      "Night Vision": "IR",
      Warranty: "2 years",
      Mounting: "Ceiling",
    },
  },
  {
    id: 207,
    name: "Uniview 2MP Fixed IR Dome Network Camera",
    category: "cctv-cameras",
    price: 2700,
    description:
      "Budget-friendly 2MP dome camera with IR night vision. Perfect for basic surveillance needs in small businesses.",
    image: "https://www.uniview.com/uploadfile/2023/0104/20230104064409_46.jpg",
    inStock: true,
    specifications: {
      Resolution: "2MP",
      Type: "Dome",
      "Night Vision": "IR",
      Warranty: "1 year",
      Mounting: "Ceiling",
    },
  },

  // Test Product (1 KES)
  {
    id: 999,
    name: "Test Product — 1 KES",
    category: "solar-equipment",
    price: 1,
    description:
      "Testing product priced at 1 KES. Use this to verify M-Pesa STK push and checkout flow end-to-end.",
    image:
      "https://claire.solar/public/uploads/all/Kf0jeSOPcikjRgLQJU6Y1qph2sDekfSP2TmAdWHF.jpg",
    inStock: true,
    specifications: {
      Purpose: "Testing only",
      Price: "KES 1",
    },
  },
  // Internet Equipment
  {
    id: 307,
    name: "FibeHome GPON ONT + Wi-Fi 6 Router",
    category: "routers",
    price: 4500,
    description:
      "Fiber-to-home GPON ONT with built-in Wi-Fi 6 router. Perfect for FTTH installations. Supports speeds up to 1 Gbps.",
    image:
      "https://cdn.shopify.com/s/files/1/0659/6529/7599/files/fiberhome_ont_router.jpg",
    inStock: true,
    specifications: {
      Type: "GPON ONT + Router",
      Standard: "Wi-Fi 6 (802.11ax)",
      Ports: "2x Gigabit LAN, 1x FXS (VoIP)",
      Warranty: "1 year",
    },
  },
  {
    id: 308,
    name: "MikroTik hAP ax3 Wi-Fi 6 Router",
    category: "routers",
    price: 8500,
    description:
      "Dual-band Wi-Fi 6 router powered by RouterOS. Five Gigabit Ethernet ports. Ideal for ISPs and prosumer home networks.",
    image: "https://mikrotik.com/img/products/hap-ax3/overview.png",
    inStock: true,
    specifications: {
      Speed: "AX6000",
      CPU: "IPQ-6010 1.8 GHz",
      Ports: "5x Gigabit LAN",
      OS: "RouterOS L4",
    },
  },
  {
    id: 309,
    name: "Ubiquiti UniFi 6 Pro Access Point",
    category: "routers",
    price: 14500,
    description:
      "Enterprise-grade Wi-Fi 6 access point capable of 300+ simultaneous clients. Ideal for offices, hotels, and large venues.",
    image: "https://store.ui.com/cdn/shop/products/UF-U6-PRO-BK-01_800x.jpg",
    inStock: true,
    specifications: {
      Speed: "AX5400",
      Standard: "Wi-Fi 6 (802.11ax)",
      "Max Clients": "300+",
      PoE: "802.3at (included)",
    },
  },
  // Routers / Internet Equipment
  {
    id: 301,
    name: "TP-Link Archer AX6000 Wi-Fi 6 Router",
    category: "routers",
    price: 12500,
    description:
      "High-speed AX6000 Wi-Fi 6 router with MU-MIMO technology. Supports multiple devices simultaneously. Ideal for homes and small offices.",
    image:
      "https://static.tp-link.com/upload/product-overview/2022/202207/20220712_165005_636351264506884413.jpg",
    inStock: true,
    specifications: {
      Speed: "AX6000",
      Standard: "Wi-Fi 6 (802.11ax)",
      Ports: "4x Gigabit LAN",
      Warranty: "2 years",
    },
  },
  {
    id: 302,
    name: "Cisco Meraki MX64 Cloud-Managed Firewall",
    category: "network-switches",
    price: 45000,
    description:
      "Enterprise-grade cloud-managed security appliance. Advanced threat protection and centralized dashboard management. For medium to large organisations.",
    image: "https://meraki.cisco.com/wp-content/uploads/2023/06/MX64-front.png",
    inStock: true,
    specifications: {
      Type: "Firewall / SD-WAN",
      Management: "Cloud (Meraki Dashboard)",
      Throughput: "1 Gbps",
      Warranty: "1 year subscription",
    },
  },
  {
    id: 303,
    name: "Cat6 Ethernet Cable — 100m Roll",
    category: "cables",
    price: 3500,
    description:
      "High-quality Cat6 UTP ethernet cable for reliable network connectivity. 100-metre roll for large installations. Supports up to 10 Gbps.",
    image: "https://m.media-amazon.com/images/I/61vVHtGIwgL._AC_SL1000_.jpg",
    inStock: true,
    specifications: {
      Type: "Cat6 UTP",
      Length: "100m",
      Speed: "10 Gbps",
      Warranty: "1 year",
    },
  },
  {
    id: 304,
    name: "Ubiquiti UniFi Dream Machine",
    category: "routers",
    price: 35000,
    description:
      "All-in-one network appliance combining router, switch, and security gateway. Unified management platform for enterprise networks.",
    image: "https://store.ui.com/cdn/shop/products/UDM_Front_1_1.png",
    inStock: true,
    specifications: {
      Type: "All-in-One Router/Gateway",
      Management: "UniFi Controller",
      Ports: "8x Gigabit",
      Warranty: "2 years",
    },
  },
  {
    id: 305,
    name: "Netgear GS110MX Managed Switch",
    category: "network-switches",
    price: 18000,
    description:
      "10-port managed gigabit switch with VLAN support. Professional-grade networking for businesses. Compact design for easy installation.",
    image:
      "https://www.netgear.com/images/Products/Switches/ManagedSwitches/GS110MX_hero_side.png",
    inStock: true,
    specifications: {
      Ports: "10x Gigabit",
      Type: "Managed",
      Features: "VLAN, QoS, 10G uplink",
      Warranty: "Lifetime",
    },
  },
  {
    id: 306,
    name: "Fiber Optic Cable — 1km Single-Mode Spool",
    category: "cables",
    price: 25000,
    description:
      "Premium single-mode fiber optic cable for long-distance high-speed connectivity. 1km spool for large network installations. Supports 100 Gbps.",
    image: "https://m.media-amazon.com/images/I/71vu1MLCEkL._AC_SL1500_.jpg",
    inStock: true,
    specifications: {
      Type: "Single-Mode OS2",
      Length: "1km",
      Speed: "100 Gbps",
      Warranty: "2 years",
    },
  },
];

export const STATIC_SERVICES: Service[] = [
  {
    id: 1,
    name: "CCTV Installation",
    description:
      "Professional CCTV camera installation for homes and businesses. We handle everything from site survey to commissioning.",
    features: [
      "Free site survey",
      "Professional mounting and cabling",
      "DVR/NVR configuration",
      "Remote viewing setup",
      "1-year service warranty",
    ],
    startingPrice: 15000,
    icon: "📷",
  },
  {
    id: 2,
    name: "Internet & Network Setup",
    description:
      "End-to-end network infrastructure setup including routing, switching, and Wi-Fi for homes and offices of all sizes.",
    features: [
      "Network design & planning",
      "Structured cabling (Cat6/Fiber)",
      "Router & switch configuration",
      "Wi-Fi coverage optimization",
      "Ongoing support package",
    ],
    startingPrice: 20000,
    icon: "🌐",
  },
  {
    id: 3,
    name: "Solar System Installation",
    description:
      "Turn-key solar power solutions — from site assessment through installation, commissioning, and after-sales support.",
    features: [
      "Free energy audit",
      "System design & sizing",
      "Certified installation team",
      "Grid-tie or off-grid options",
      "5-year panel warranty",
    ],
    startingPrice: 50000,
    icon: "☀️",
  },
  {
    id: 4,
    name: "IT Support & Maintenance",
    description:
      "Ongoing managed IT support for SMEs. Hardware, software, and network troubleshooting handled by our expert team.",
    features: [
      "Remote & on-site support",
      "Hardware servicing",
      "Software updates & patches",
      "Preventive maintenance",
      "Priority response SLA",
    ],
    startingPrice: 8000,
    icon: "🔧",
  },
  {
    id: 5,
    name: "Fiber Optic & TV Installation",
    description:
      "Professional fiber optic termination, splicing, and DSTV/GOTV/Zuku dish mounting. End-to-end signal testing and quality assurance.",
    features: [
      "Fiber termination & splicing",
      "Dish mounting & alignment",
      "Indoor/outdoor cabling",
      "Signal strength testing",
      "1-year workmanship warranty",
    ],
    startingPrice: 5000,
    icon: "📡",
  },
];
