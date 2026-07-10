import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().default("mwangagrid_secret_key_development"),
  VITE_APP_ID: z.string().optional(),
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  OAUTH_SERVER_URL: z.string().optional(),
  OWNER_OPEN_ID: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().optional(),
  BUILT_IN_FORGE_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  MPESA_PASSKEY: z.string().optional(),
  MPESA_SHORTCODE: z.string().default("174379"),
  MPESA_ENV: z.enum(["sandbox", "production"]).default("production"),
  MPESA_CALLBACK_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

const envVars = parsedEnv.data;

const smtpPort = envVars.SMTP_PORT ? parseInt(envVars.SMTP_PORT, 10) : 587;

export const ENV = {
  appId: envVars.VITE_APP_ID ?? "",
  cookieSecret: envVars.JWT_SECRET,
  databaseUrl: envVars.DATABASE_URL,
  supabaseUrl: envVars.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: envVars.VITE_SUPABASE_ANON_KEY ?? "",
  oAuthServerUrl: envVars.OAUTH_SERVER_URL ?? "",
  ownerOpenId: envVars.OWNER_OPEN_ID ?? "",
  isProduction: envVars.NODE_ENV === "production",
  forgeApiUrl: envVars.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: envVars.BUILT_IN_FORGE_API_KEY ?? "",
  smtp: {
    host: envVars.SMTP_HOST ?? "smtp.gmail.com",
    port: smtpPort,
    user: envVars.SMTP_USER ?? "",
    pass: envVars.SMTP_PASS ?? "",
    from: envVars.FROM_EMAIL ?? "Mwanga Grid <noreply@mwangagrid.co.ke>",
  },
  mpesa: {
    consumerKey: envVars.MPESA_CONSUMER_KEY ?? "",
    consumerSecret: envVars.MPESA_CONSUMER_SECRET ?? "",
    passkey: envVars.MPESA_PASSKEY ?? "",
    shortcode: envVars.MPESA_SHORTCODE,
    environment: envVars.MPESA_ENV,
    callbackUrl: envVars.MPESA_CALLBACK_URL ?? "https://www.mwangagrid.co.ke/api/mpesa/callback",
  },
};
