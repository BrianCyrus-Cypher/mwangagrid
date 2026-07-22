// Safaricom M-Pesa callback IP ranges (production)
// Source: https://developer.safaricom.co.ke/docs#callback-url
const SAFARICOM_CIDRS = [
  "196.201.214.200/29",
  "196.201.214.208/29",
  "196.201.213.44/30",
  "196.201.213.48/30",
  "196.201.213.52/30",
  "196.201.213.56/30",
  "196.201.213.60/30",
  "196.201.214.32/28",
  "196.201.214.48/28",
  "196.201.214.64/28",
  "196.201.214.80/28",
  "196.201.214.96/28",
  "196.201.214.112/28",
  "196.201.214.128/28",
  "196.201.214.144/28",
  "196.201.214.160/28",
  "196.201.214.176/28",
  "195.135.55.0/30",
  "195.135.55.4/30",
  "195.135.55.8/30",
  "195.135.55.12/30",
];

function ipToLong(ip: string): number {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  );
}

function cidrToRange(cidr: string): [number, number] {
  const [ip, bits] = cidr.split("/");
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  const ipLong = ipToLong(ip);
  return [ipLong & mask, ipLong | ~mask];
}

const SAFARICOM_RANGES = SAFARICOM_CIDRS.map(cidrToRange);

export function isSafaricomCallback(ip: string): boolean {
  if (!ip) return false;
  const clientIp = ipToLong(ip.replace(/^::ffff:/, ""));
  return SAFARICOM_RANGES.some(
    ([start, end]) => clientIp >= start && clientIp <= end
  );
}

// Sanitize input: strip HTML tags and trim
export function sanitize(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 5000);
}

// Check that an object's string fields are sanitized (no HTML)
export function hasHtml(value: unknown): boolean {
  if (typeof value === "string") return /<[^>]*>/g.test(value);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(hasHtml);
  }
  return false;
}

// Idempotency: validate that a callback hasn't been processed yet
export function validateMpesaCallback(
  resultCode: unknown,
  checkoutRequestId: unknown,
  amount: unknown,
  receipt: unknown
) {
  if (resultCode !== 0 && resultCode !== "0") {
    return { valid: false, reason: "Non-zero result code" } as const;
  }
  if (!checkoutRequestId || typeof checkoutRequestId !== "string") {
    return { valid: false, reason: "Missing CheckoutRequestID" } as const;
  }
  if (receipt && typeof receipt !== "string") {
    return { valid: false, reason: "Invalid receipt number" } as const;
  }
  return { valid: true } as const;
}
