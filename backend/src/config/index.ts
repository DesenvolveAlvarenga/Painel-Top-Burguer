import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value.trim();
}

const rawWooUrl = getRequiredEnv('WOO_URL');
const normalizedWooUrl = rawWooUrl.replace(/\/+$|\s+$/g, '');
const wooApiPath = '/wp-json/wc/v3';
const wooUrl = normalizedWooUrl.includes(wooApiPath) ? normalizedWooUrl : `${normalizedWooUrl}${wooApiPath}`;

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 7000),
  printAutomatic: process.env.PRINT_AUTOMATIC === 'true',
  cacheTtlSeconds: Number(process.env.API_CACHE_TTL_SECONDS || 10),
  woo: {
    url: wooUrl,
    consumerKey: getRequiredEnv('WOO_CONSUMER_KEY'),
    consumerSecret: getRequiredEnv('WOO_CONSUMER_SECRET')
  }
};
