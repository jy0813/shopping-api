import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        store: redisStore,
        host: cfg.get<string>('REDIS_HOST'),
        port: cfg.get<number>('REDIS_PORT'),
        ttl: cfg.get('REDIS_TTL'),
      }),
      isGlobal: true,
    }),
  ],
})
export class RedisModule {}
