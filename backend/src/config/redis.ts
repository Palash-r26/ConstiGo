import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.REDIS_URL) {
  console.warn('REDIS_URL not found in environment. Caching may fail.');
}

export const redis = new Redis(process.env.REDIS_URL || '', {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err: any) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Upstash Redis');
});
