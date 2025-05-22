import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis',
  port: Number(process.env.REDIS_PORT) ?? 6379,
  password: process.env.REDIS_PASSWORD ?? 'redis123456',
});
