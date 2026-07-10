import { Camera, Headphones, Network, Sun, Wifi } from "lucide-react";

export type ServiceCategory = "internet" | "cctv" | "solar" | "network" | "support";

export type ServicePackage = {
  id: number;
  serviceId: ServiceCategory;
  serviceName: string;
  tier: string;
  name: string;
  price: number;
  billing: "one-off" | "monthly";
  leadTime: string;
  popular?: boolean;
  coverageNote?: string;
  features: string[];
};

export type CountyTown = {
  county: string;
  towns: string[];
};

export type TransportZone = {
  id: string;
  label: string;
  county: string;
  towns: string[];
  fee: number;
  note: string;
};

export const SERVICE_CATEGORIES = [
  {
    id: "internet" as const,
    name: "Home & Business Internet",
    icon: Wifi,
    description:
      "Wireless and fibre-style last-mile internet around Nairobi CBD, Thika Road, Roysambu, Kahawa and Githurai.",
  },
  {
    id: "cctv" as const,
    name: "CCTV Installation",
    icon: Camera,
    description:
      "Camera kits, cabling, DVR/NVR setup, mobile viewing and commissioning for homes, shops and offices.",
  },
  {
    id: "solar" as const,
    name: "Solar Power Systems",
    icon: Sun,
    description:
      "Backup, hybrid and whole-home solar packages with site survey, installation and commissioning.",
  },
  {
    id: "network" as const,
    name: "Structured Networking",
    icon: Network,
    description:
      "Routers, access points, switches, cabling, Wi-Fi optimisation and small-office network builds.",
  },
  {
    id: "support" as const,
    name: "Managed Support",
    icon: Headphones,
    description:
      "Maintenance retainers for CCTV, network, internet and solar health checks after installation.",
  },
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 1001,
    serviceId: "internet",
    serviceName: "Home & Business Internet",
    tier: "Starter",
    name: "8 Mbps Home Internet",
    price: 1500,
    billing: "monthly",
    leadTime: "24-72 hours after coverage confirmation",
    coverageNote: "Best for Roysambu, Zimmerman, Githurai, Kahawa West and Kasarani homes.",
    features: ["Unlimited home browsing", "Standard router setup", "Basic streaming and video calls", "WhatsApp support"],
  },
  {
    id: 1002,
    serviceId: "internet",
    serviceName: "Home & Business Internet",
    tier: "Family",
    name: "15 Mbps Family Internet",
    price: 2500,
    billing: "monthly",
    leadTime: "24-72 hours after coverage confirmation",
    popular: true,
    coverageNote: "Recommended for apartments along Thika Road from Nairobi town to Githurai.",
    features: ["Unlimited home internet", "Dual-band router configuration", "Streaming and online classes", "Installation survey included"],
  },
  {
    id: 1003,
    serviceId: "internet",
    serviceName: "Home & Business Internet",
    tier: "Business",
    name: "30 Mbps SME Internet",
    price: 4500,
    billing: "monthly",
    leadTime: "2-4 business days after coverage confirmation",
    coverageNote: "For shops, salons, clinics and offices around Nairobi CBD, Kasarani, Roysambu and Githurai.",
    features: ["Priority support", "Router and access-point optimisation", "POS and CCTV remote-viewing ready", "Static LAN planning"],
  },
  {
    id: 1004,
    serviceId: "internet",
    serviceName: "Home & Business Internet",
    tier: "Pro",
    name: "50 Mbps Office Internet",
    price: 6500,
    billing: "monthly",
    leadTime: "2-5 business days after coverage confirmation",
    features: ["High-throughput office connectivity", "Mesh or access-point planning", "Usage and uptime guidance", "Monthly support check-in"],
  },
  {
    id: 2001,
    serviceId: "cctv",
    serviceName: "CCTV Installation",
    tier: "Home",
    name: "4-Camera CCTV Kit",
    price: 24900,
    billing: "one-off",
    leadTime: "Same day to 2 days",
    features: ["4 HD cameras", "4-channel DVR", "500GB-1TB surveillance storage", "Mobile phone viewing setup", "Basic cabling and commissioning"],
  },
  {
    id: 2002,
    serviceId: "cctv",
    serviceName: "CCTV Installation",
    tier: "Business",
    name: "8-Camera CCTV Kit",
    price: 43700,
    billing: "one-off",
    leadTime: "1-3 business days",
    popular: true,
    features: ["8 HD cameras", "8-channel DVR/NVR", "1TB surveillance storage", "Remote viewing and user training", "Shop or office coverage plan"],
  },
  {
    id: 2003,
    serviceId: "cctv",
    serviceName: "CCTV Installation",
    tier: "Enterprise",
    name: "16-Camera CCTV Kit",
    price: 80650,
    billing: "one-off",
    leadTime: "2-5 business days",
    features: ["16-camera multi-zone coverage", "16-channel recorder", "2TB+ storage planning", "Remote viewing for managers", "Structured cabling estimate"],
  },
  {
    id: 3001,
    serviceId: "solar",
    serviceName: "Solar Power Systems",
    tier: "Backup",
    name: "1kVA Essential Backup",
    price: 85000,
    billing: "one-off",
    leadTime: "2-4 business days",
    features: ["Lights, TV, router and phone charging", "Inverter and battery kit", "Basic roof or wall assessment", "Installation and commissioning"],
  },
  {
    id: 3002,
    serviceId: "solar",
    serviceName: "Solar Power Systems",
    tier: "Hybrid",
    name: "3kW Hybrid Home System",
    price: 300000,
    billing: "one-off",
    leadTime: "3-7 business days",
    popular: true,
    features: ["Hybrid inverter", "Lithium battery-ready design", "Solar array and protection gear", "Professional installation included"],
  },
  {
    id: 3003,
    serviceId: "solar",
    serviceName: "Solar Power Systems",
    tier: "Whole Home",
    name: "5kVA Lithium Solar System",
    price: 355000,
    billing: "one-off",
    leadTime: "4-10 business days",
    features: ["5kVA hybrid inverter", "5kWh lithium storage", "Solar mounting and cabling", "Supports fridge, TV, lights, Wi-Fi and small appliances"],
  },
  {
    id: 3004,
    serviceId: "solar",
    serviceName: "Solar Power Systems",
    tier: "Premium",
    name: "5kW / 10kWh Premium Solar Pack",
    price: 570000,
    billing: "one-off",
    leadTime: "5-12 business days",
    features: ["10kWh lithium storage", "High-efficiency solar panels", "Surge protection and commissioning", "Designed for larger homes and offices"],
  },
  {
    id: 4001,
    serviceId: "network",
    serviceName: "Structured Networking",
    tier: "Setup",
    name: "Home Wi-Fi Optimisation",
    price: 18000,
    billing: "one-off",
    leadTime: "Same day to 2 days",
    features: ["Router placement", "Coverage testing", "Password and guest network setup", "Device connection checks"],
  },
  {
    id: 4002,
    serviceId: "network",
    serviceName: "Structured Networking",
    tier: "Office",
    name: "SME Network Build",
    price: 45000,
    billing: "one-off",
    leadTime: "2-5 business days",
    features: ["Router, switch and access point planning", "Cat6 cabling estimate", "Printer/POS/CCTV LAN setup", "Documentation handover"],
  },
  {
    id: 5001,
    serviceId: "support",
    serviceName: "Managed Support",
    tier: "Care",
    name: "Monthly Maintenance Retainer",
    price: 12000,
    billing: "monthly",
    leadTime: "Starts after onboarding visit",
    features: ["One preventive visit per month", "Remote support", "CCTV/network health checks", "Priority technician scheduling"],
  },
];

export const KENYA_COUNTIES: CountyTown[] = [
  { county: "Baringo", towns: ["Kabarnet", "Eldama Ravine", "Marigat"] },
  { county: "Bomet", towns: ["Bomet", "Sotik", "Longisa"] },
  { county: "Bungoma", towns: ["Bungoma", "Webuye", "Kimilili"] },
  { county: "Busia", towns: ["Busia", "Malaba", "Nambale"] },
  { county: "Elgeyo-Marakwet", towns: ["Iten", "Tambach", "Kapsowar"] },
  { county: "Embu", towns: ["Embu", "Runyenjes", "Siakago"] },
  { county: "Garissa", towns: ["Garissa", "Dadaab", "Hulugho"] },
  { county: "Homa Bay", towns: ["Homa Bay", "Oyugis", "Mbita"] },
  { county: "Isiolo", towns: ["Isiolo", "Merti", "Garbatulla"] },
  { county: "Kajiado", towns: ["Kajiado", "Kitengela", "Ngong", "Ongata Rongai"] },
  { county: "Kakamega", towns: ["Kakamega", "Mumias", "Butere"] },
  { county: "Kericho", towns: ["Kericho", "Litein", "Londiani"] },
  { county: "Kiambu", towns: ["Kiambu", "Ruiru", "Thika", "Juja", "Kikuyu", "Limuru"] },
  { county: "Kilifi", towns: ["Kilifi", "Malindi", "Watamu", "Mariakani"] },
  { county: "Kirinyaga", towns: ["Kerugoya", "Kutus", "Sagana"] },
  { county: "Kisii", towns: ["Kisii", "Ogembo", "Suneka"] },
  { county: "Kisumu", towns: ["Kisumu", "Ahero", "Muhoroni"] },
  { county: "Kitui", towns: ["Kitui", "Mwingi", "Mutomo"] },
  { county: "Kwale", towns: ["Kwale", "Ukunda", "Msambweni"] },
  { county: "Laikipia", towns: ["Nanyuki", "Nyahururu", "Rumuruti"] },
  { county: "Lamu", towns: ["Lamu", "Mpeketoni", "Hindi"] },
  { county: "Machakos", towns: ["Machakos", "Athi River", "Mlolongo", "Kangundo"] },
  { county: "Makueni", towns: ["Wote", "Makindu", "Sultan Hamud"] },
  { county: "Mandera", towns: ["Mandera", "Elwak", "Takaba"] },
  { county: "Marsabit", towns: ["Marsabit", "Moyale", "Laisamis"] },
  { county: "Meru", towns: ["Meru", "Maua", "Nkubu"] },
  { county: "Migori", towns: ["Migori", "Rongo", "Awendo"] },
  { county: "Mombasa", towns: ["Mombasa", "Nyali", "Likoni", "Changamwe"] },
  { county: "Murang'a", towns: ["Murang'a", "Kenol", "Kangema"] },
  { county: "Nairobi", towns: ["CBD", "Westlands", "Kilimani", "Upper Hill", "Kasarani", "Roysambu", "Zimmerman", "Githurai", "Kahawa West", "Garden Estate", "Roasters"] },
  { county: "Nakuru", towns: ["Nakuru", "Naivasha", "Gilgil", "Molo"] },
  { county: "Nandi", towns: ["Kapsabet", "Nandi Hills", "Mosoriot"] },
  { county: "Narok", towns: ["Narok", "Kilgoris", "Suswa"] },
  { county: "Nyamira", towns: ["Nyamira", "Keroka", "Ekerenyo"] },
  { county: "Nyandarua", towns: ["Ol Kalou", "Engineer", "Njabini"] },
  { county: "Nyeri", towns: ["Nyeri", "Karatina", "Othaya"] },
  { county: "Samburu", towns: ["Maralal", "Baragoi", "Wamba"] },
  { county: "Siaya", towns: ["Siaya", "Bondo", "Ugunja"] },
  { county: "Taita-Taveta", towns: ["Voi", "Wundanyi", "Taveta"] },
  { county: "Tana River", towns: ["Hola", "Bura", "Garsen"] },
  { county: "Tharaka-Nithi", towns: ["Chuka", "Chogoria", "Marimanti"] },
  { county: "Trans Nzoia", towns: ["Kitale", "Kiminini", "Endebess"] },
  { county: "Turkana", towns: ["Lodwar", "Lokichogio", "Kakuma"] },
  { county: "Uasin Gishu", towns: ["Eldoret", "Turbo", "Burnt Forest"] },
  { county: "Vihiga", towns: ["Vihiga", "Mbale", "Luanda"] },
  { county: "Wajir", towns: ["Wajir", "Habaswein", "Griftu"] },
  { county: "West Pokot", towns: ["Kapenguria", "Makutano", "Sigor"] },
];

export const TRANSPORT_ZONES: TransportZone[] = [
  {
    id: "nairobi-core",
    label: "Nairobi core",
    county: "Nairobi",
    towns: ["CBD", "Westlands", "Kilimani", "Upper Hill", "Pangani"],
    fee: 1000,
    note: "Technician transport within central Nairobi.",
  },
  {
    id: "thika-road-primary",
    label: "Mwanga Grid primary internet corridor",
    county: "Nairobi",
    towns: ["Roasters", "Garden Estate", "Kasarani", "Roysambu", "Zimmerman"],
    fee: 0,
    note: "No transport charge for standard internet survey/install appointments.",
  },
  {
    id: "githurai-kahawa",
    label: "Githurai and Kahawa belt",
    county: "Nairobi",
    towns: ["Githurai", "Kahawa West", "Kahawa Wendani", "Kahawa Sukari"],
    fee: 1200,
    note: "Applies to CCTV, solar and network site visits; internet coverage is subject to signal check.",
  },
  {
    id: "kiambu-thika",
    label: "Kiambu, Ruiru, Juja and Thika",
    county: "Kiambu",
    towns: ["Kiambu", "Ruiru", "Juja", "Thika", "Kikuyu", "Limuru"],
    fee: 2500,
    note: "Same-day visits when technician routing is available.",
  },
  {
    id: "metro-south",
    label: "Athi River, Kitengela, Ngong and Rongai",
    county: "Kajiado",
    towns: ["Athi River", "Kitengela", "Ngong", "Ongata Rongai", "Kajiado"],
    fee: 3500,
    note: "Metro transport charge for installation teams.",
  },
  {
    id: "regional-near",
    label: "Naivasha, Nakuru and Machakos",
    county: "Nakuru",
    towns: ["Naivasha", "Nakuru", "Machakos"],
    fee: 7500,
    note: "Regional day-trip allowance; large solar jobs may need a custom logistics quote.",
  },
  {
    id: "major-town",
    label: "Major town dispatch",
    county: "Other",
    towns: ["Mombasa", "Kisumu", "Eldoret", "Nyeri", "Meru", "Kisii"],
    fee: 12000,
    note: "Remote dispatch estimate. Final transport is confirmed during quotation.",
  },
];

export function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function getPackagesForService(serviceId: ServiceCategory) {
  return SERVICE_PACKAGES.filter(pkg => pkg.serviceId === serviceId);
}

export function getPackageById(id: number) {
  return SERVICE_PACKAGES.find(pkg => pkg.id === id);
}

export function getTransportFee(county: string, town: string) {
  const normalizedTown = town.trim().toLowerCase();
  const exactZone = TRANSPORT_ZONES.find(zone =>
    zone.towns.some(zoneTown => zoneTown.toLowerCase() === normalizedTown)
  );

  if (exactZone) return exactZone;

  const countyZone = TRANSPORT_ZONES.find(zone => zone.county === county);
  if (countyZone) return countyZone;

  return {
    id: "custom",
    label: "Custom dispatch",
    county,
    towns: [town],
    fee: 15000,
    note: "Placeholder estimate for quotation. Team confirms exact transport before approval.",
  };
}

export function getTownsForCounty(county: string) {
  return KENYA_COUNTIES.find(item => item.county === county)?.towns ?? [];
}

export function isInternetCoverageTown(town: string) {
  return ["cbd", "pangani", "roasters", "garden estate", "kasarani", "roysambu", "zimmerman", "githurai", "kahawa west", "kahawa wendani", "kahawa sukari"].includes(
    town.toLowerCase()
  );
}
