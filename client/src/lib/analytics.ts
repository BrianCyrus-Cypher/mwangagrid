const GA_ID: string | undefined =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || "";

type GtagEvent = {
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isAnalyticsEnabled(): boolean {
  return Boolean(GA_ID && GA_ID !== "VITE_GA_MEASUREMENT_ID");
}

function gtag(...args: unknown[]): void {
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackPageView(path: string): void {
  if (!isAnalyticsEnabled()) return;
  gtag("event", "page_view", { page_path: path, page_location: window.location.href });
}

export function trackEvent(name: string, params: GtagEvent = {}): void {
  if (!isAnalyticsEnabled()) return;
  gtag("event", name, params);
}

export function trackProductView(productName: string, price?: number): void {
  trackEvent("view_item", { items: [{ item_name: productName, price }] });
}

export function trackAddToCart(productName: string, price?: number, quantity = 1): void {
  trackEvent("add_to_cart", {
    currency: "KES",
    value: price,
    items: [{ item_name: productName, price, quantity }],
  });
}

export function trackBeginCheckout(value?: number): void {
  trackEvent("begin_checkout", { currency: "KES", value });
}

export function trackPurchase(transactionId: string, value?: number): void {
  trackEvent("purchase", {
    transaction_id: transactionId,
    currency: "KES",
    value,
  });
}
