import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z
    .string()
    .min(1)
    .default(process.env.JWT_EXPIRATION || "1d"),
  JWT_ISSUER: z.string().min(1).default("cares-api"),
  JWT_AUDIENCE: z.string().min(1).default("cares-client"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required").default("http://localhost:5173"),
  REDIS_URL: z.string().url().optional().or(z.literal("")),
  NOTIFICATION_QUEUE_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  NOTIFICATION_QUEUE_REQUIRED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  DIRECTORY_CACHE_TTL_SECONDS: z.coerce.number().int().min(0).default(300),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  METRICS_TOKEN: z.string().min(16).optional().or(z.literal("")),
  SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_BUCKET: z.string().optional().or(z.literal(""))
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.flatten().fieldErrors;
  throw new Error(`Invalid environment configuration: ${JSON.stringify(details)}`);
}

export const env = parsedEnv.data;

if (env.NOTIFICATION_QUEUE_ENABLED && !env.REDIS_URL) {
  throw new Error("REDIS_URL is required when NOTIFICATION_QUEUE_ENABLED=true");
}

export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
