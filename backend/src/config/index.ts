import dotenv from 'dotenv';

dotenv.config();

const rawWooUrl = process.env.WOO_URL || '';
const normalizedWooUrl = rawWooUrl.replace(/\/+$|\s+$/g, '');
const wooApiPath = '/wp-json/wc/v3';
const wooUrl = normalizedWooUrl.includes(wooApiPath) ? normalizedWooUrl : `${normalizedWooUrl}${wooApiPath}`;

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 7000),
  printAutomatic: process.env.PRINT_AUTOMATIC === 'true',
  cacheTtlSeconds: Number(process.env.API_CACHE_TTL_SECONDS || 10),
  woo: {
    url: wooUrl,
    consumerKey: process.env.WOO_CONSUMER_KEY || '',
    consumerSecret: process.env.WOO_CONSUMER_SECRET || ''
  }
};
