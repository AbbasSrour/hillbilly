import { z } from 'zod';

const baseSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Application
  DOMAIN: z.url(),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  FALLBACK_LANGUAGE: z.string().default('en_US'),
  ACCESS_CONTROL_MODEL: z.string().optional(),
  API_VERSION: z.string(),

  // Database
  DB_CONNECTION_TYPE: z.enum(['tcp', 'socket']).default('tcp'),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().int().min(0).max(65535).optional(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  DB_SOCKET: z.string().optional(),

  // Throttler
  THROTTLER_TTL: z.string().default('1 minute'),
  THROTTLER_LIMIT: z.coerce.number().int().positive().default(10),

  // AWS S3
  AWS_S3_ENABLED: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .default(false),
  AWS_S3_BUCKET_REGION: z.string().optional(),
  AWS_S3_API_VERSION: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),

  // Documentation
  ENABLE_DOCUMENTATION: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .default(false),

  // NATS
  NATS_ENABLED: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .default(false),
  NATS_HOST: z.string().optional(),
  NATS_PORT: z.coerce.number().int().min(0).max(65535).optional(),

  // JWT & Auth
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  ENCRYPTION_KEY: z.string(),
  ACCESS_TOKEN_EXPIRATION_TIME: z.coerce.number().positive(),
  REFRESH_TOKEN_EXPIRATION_TIME: z.coerce.number().positive(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),

  // Security
  TRUSTED_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((origin) => origin.trim()))
    .pipe(z.array(z.string())),

  // SMTP
  SMTP_ENABLED: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .default(false),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(0).max(65535).optional(),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_DEFAULT_FROM: z.string().optional(),

  // Twilio
  TWILIO_ENABLED: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean())
    .default(false),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_VERIFY_SERVICE_SID: z.string().optional(),
});

export const envValidationSchema = baseSchema
  .refine(
    (data) => {
      if (data.AWS_S3_ENABLED) {
        return (
          data.AWS_S3_BUCKET_REGION &&
          data.AWS_S3_API_VERSION &&
          data.AWS_S3_BUCKET_NAME
        );
      }
      return true;
    },
    {
      error: (issue) => {
        const data = issue.input as z.infer<typeof baseSchema>;
        if (!data.AWS_S3_BUCKET_REGION)
          return 'AWS_S3_BUCKET_REGION is required when AWS_S3_ENABLED is true';
        if (!data.AWS_S3_API_VERSION)
          return 'AWS_S3_API_VERSION is required when AWS_S3_ENABLED is true';
        if (!data.AWS_S3_BUCKET_NAME)
          return 'AWS_S3_BUCKET_NAME is required when AWS_S3_ENABLED is true';
        return 'AWS S3 configuration is invalid';
      },
    },
  )
  .refine(
    (data) => {
      if (data.NATS_ENABLED) {
        return data.NATS_HOST && data.NATS_PORT !== undefined;
      }
      return true;
    },
    {
      error: (issue) => {
        const data = issue.input as z.infer<typeof baseSchema>;
        if (!data.NATS_HOST)
          return 'NATS_HOST is required when NATS_ENABLED is true';
        if (data.NATS_PORT === undefined)
          return 'NATS_PORT is required when NATS_ENABLED is true';
        return 'NATS configuration is invalid';
      },
    },
  )
  .refine(
    (data) => {
      if (data.SMTP_ENABLED) {
        return (
          data.SMTP_HOST &&
          data.SMTP_PORT !== undefined &&
          data.SMTP_SECURE !== undefined &&
          data.SMTP_USER &&
          data.SMTP_PASSWORD &&
          data.SMTP_DEFAULT_FROM
        );
      }
      return true;
    },
    {
      error: (issue) => {
        const data = issue.input as z.infer<typeof baseSchema>;
        if (!data.SMTP_HOST)
          return 'SMTP_HOST is required when SMTP_ENABLED is true';
        if (data.SMTP_PORT === undefined)
          return 'SMTP_PORT is required when SMTP_ENABLED is true';
        if (data.SMTP_SECURE === undefined)
          return 'SMTP_SECURE is required when SMTP_ENABLED is true';
        if (!data.SMTP_USER)
          return 'SMTP_USER is required when SMTP_ENABLED is true';
        if (!data.SMTP_PASSWORD)
          return 'SMTP_PASSWORD is required when SMTP_ENABLED is true';
        if (!data.SMTP_DEFAULT_FROM)
          return 'SMTP_DEFAULT_FROM is required when SMTP_ENABLED is true';
        return 'SMTP configuration is invalid';
      },
    },
  )
  .refine(
    (data) => {
      if (data.TWILIO_ENABLED) {
        return (
          data.TWILIO_ACCOUNT_SID &&
          data.TWILIO_AUTH_TOKEN &&
          data.TWILIO_VERIFY_SERVICE_SID
        );
      }
      return true;
    },
    {
      error: (issue) => {
        const data = issue.input as z.infer<typeof baseSchema>;
        if (!data.TWILIO_ACCOUNT_SID)
          return 'TWILIO_ACCOUNT_SID is required when TWILIO_ENABLED is true';
        if (!data.TWILIO_AUTH_TOKEN)
          return 'TWILIO_AUTH_TOKEN is required when TWILIO_ENABLED is true';
        if (!data.TWILIO_VERIFY_SERVICE_SID)
          return 'TWILIO_VERIFY_SERVICE_SID is required when TWILIO_ENABLED is true';
        return 'Twilio configuration is invalid';
      },
    },
  );

export type EnvironmentVariables = z.infer<typeof envValidationSchema>;
