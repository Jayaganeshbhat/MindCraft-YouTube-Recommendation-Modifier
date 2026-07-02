import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'change_me',
  MONGO_URI: process.env.MONGO_URI ?? '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? '',
  APP_BASE_URL: process.env.APP_BASE_URL ?? '',
} as const;

// Basic sanity checks at startup
export function validateEnv() {
  const missing: string[] = [];
  for (const [k, v] of Object.entries(env)) {
    if (!String(v)) missing.push(k);
  }
  if (missing.length > 0) {
    console.warn('[env] Missing keys:', missing.join(', '));
  }
}
