import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        const redis = new Redis({
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 10) return null; // Stop retrying after 10 attempts
            return Math.min(times * 200, 5000);
          },
          lazyConnect: false,
        });

        redis.on('error', (err) => {
          console.error('[RedisModule] Connection error:', err.message);
        });

        redis.on('connect', () => {
          console.log('[RedisModule] Connected to Redis');
        });

        return redis;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
