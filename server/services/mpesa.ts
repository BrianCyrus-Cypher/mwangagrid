import axios from "axios";
import { ENV } from "../_core/env";

interface MPesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: "sandbox" | "production";
}

function getBaseUrl(environment: "sandbox" | "production") {
  return environment === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function getConfig(): MPesaConfig {
  return {
    consumerKey: ENV.mpesa.consumerKey,
    consumerSecret: ENV.mpesa.consumerSecret,
    businessShortCode: ENV.mpesa.shortcode,
    passkey: ENV.mpesa.passkey,
    callbackUrl: ENV.mpesa.callbackUrl,
    environment: ENV.mpesa.environment,
  };
}

export function isMpesaConfigured(): boolean {
  return Boolean(
    ENV.mpesa.consumerKey && ENV.mpesa.consumerSecret && ENV.mpesa.passkey
  );
}

export function normalizeKenyanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export class MPesaPaymentService {
  private config: MPesaConfig;
  private accessToken: string | null = null;

  constructor(config?: MPesaConfig) {
    this.config = config ?? getConfig();
  }

  private get baseUrl() {
    return getBaseUrl(this.config.environment);
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString("base64");

    const response = await axios.get(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    this.accessToken = response.data.access_token;
    return this.accessToken!;
  }

  private buildPassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${this.config.businessShortCode}${this.config.passkey}${timestamp}`
    ).toString("base64");
    return { password, timestamp };
  }

  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    orderReference: string
  ): Promise<{ checkoutRequestId: string; customerMessage: string }> {
    const token = await this.getAccessToken();
    const { password, timestamp } = this.buildPassword();
    const phone = normalizeKenyanPhone(phoneNumber);

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: this.config.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phone,
        PartyB: this.config.businessShortCode,
        PhoneNumber: phone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: orderReference.slice(0, 12),
        TransactionDesc: `Mwanga Grid ${orderReference}`.slice(0, 13),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return {
      checkoutRequestId: response.data.CheckoutRequestID,
      customerMessage: response.data.CustomerMessage,
    };
  }

  async queryPaymentStatus(checkoutRequestId: string): Promise<{
    resultCode: string;
    resultDesc: string;
    amount?: number;
  }> {
    const token = await this.getAccessToken();
    const { password, timestamp } = this.buildPassword();

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: this.config.businessShortCode,
        CheckoutRequestID: checkoutRequestId,
        Password: password,
        Timestamp: timestamp,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const metadata = response.data.CallbackMetadata?.Item;
    const amountItem = Array.isArray(metadata)
      ? metadata.find((item: { Name: string }) => item.Name === "Amount")
      : undefined;

    return {
      resultCode: String(response.data.ResultCode),
      resultDesc: response.data.ResultDesc,
      amount: amountItem?.Value,
    };
  }
}
