/**
 * Stripe Payment Service
 *
 * Handles creation of PaymentIntents and webhook verification.
 * Requires the `stripe` package: pnpm install stripe
 *
 * Environment variables needed:
 *   STRIPE_SECRET_KEY   - Your Stripe secret key (sk_test_... or sk_live_...)
 *   STRIPE_WEBHOOK_SECRET - Your Stripe webhook signing secret (whsec_...)
 */

// Dynamic import to avoid crashing when stripe is not yet installed
let _stripe: any = null;

async function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
    }
    try {
      const Stripe = (await import("stripe")).default;
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    } catch {
      throw new Error("stripe package is not installed. Run: pnpm install stripe");
    }
  }
  return _stripe;
}

export async function createPaymentIntent(
  amountKes: number,
  metadata: Record<string, string> = {}
) {
  const stripe = await getStripe();
  // Stripe amounts are in the smallest currency unit.
  // KES is a zero-decimal currency, so multiply by 100 is NOT needed.
  // We pass the amount in cents equivalent (KES * 100 for sub-unit safety).
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amountKes * 100),
    currency: "kes",
    automatic_payment_methods: { enabled: true },
    metadata,
  });

  return {
    clientSecret: intent.client_secret as string,
    paymentIntentId: intent.id,
  };
}

export async function verifyWebhookSignature(
  payload: Buffer,
  signature: string
): Promise<any> {
  const stripe = await getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set.");
  }
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export async function retrievePaymentIntent(id: string) {
  const stripe = await getStripe();
  return stripe.paymentIntents.retrieve(id);
}
