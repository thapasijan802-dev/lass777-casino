import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private inMemoryStore = new Map<string, { value: string; expiresAt: number | null }>();
  private isRedisConnected = false;

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;

    try {
      this.client = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't loop endlessly if redis is not running locally
      });

      this.client.on('error', (err) => {
        if (!this.isRedisConnected) {
          this.logger.warn(`Redis not available (${err.message}). Using high-performance in-memory cache fallback.`);
        }
      });

      await this.client.connect();
      this.isRedisConnected = true;
      this.logger.log('✅ Connected to Redis cache cluster');
    } catch (err) {
      this.isRedisConnected = false;
      this.logger.warn(`Redis connection skipped (${err.message}). In-memory caching active.`);
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.setex(key, ttlSeconds, value);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        this.logger.warn(`Redis set failed, falling back to memory: ${err.message}`);
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.inMemoryStore.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        this.logger.warn(`Redis get failed, falling back to memory: ${err.message}`);
      }
    }

    const item = this.inMemoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.inMemoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        // ignore
      }
    }
    this.inMemoryStore.delete(key);
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (e) {
        // ignore
      }
    }
  }
}
