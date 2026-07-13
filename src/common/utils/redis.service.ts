import { createClient, type RedisClientType } from "redis";
import expressSession from "express-session";
import connectRedis from "connect-redis";
import type { ICacheProvider } from "../cache/cache.interface.js";

class InMemoryCacheProvider implements ICacheProvider {
  private readonly store = new Map<string, { value: string; expiresAt: number | undefined }>();

  async set(key: string, value: string, expire?: number): Promise<void> {
    const expiresAt = expire ? Date.now() + expire * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class RedisCacheProvider implements ICacheProvider {
  private readonly client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async set(key: string, value: string, expire?: number): Promise<void> {
    if (expire) {
      await this.client.setEx(key, expire, value);
      return;
    }
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

const inMemoryCacheProvider = new InMemoryCacheProvider();
let activeCacheProvider: ICacheProvider = inMemoryCacheProvider;
let redisClient: RedisClientType | null = null;
let redisAvailable = false;

export const initRedisClient = async (): Promise<void> => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("REDIS_URL is not configured; using in-memory cache fallback.");
    activeCacheProvider = inMemoryCacheProvider;
    return;
  }

  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 1500,
      reconnectStrategy: false,
    },
  });

  client.on("error", () => {
    // suppress noisy reconnect spam; we fall back below
  });

  try {
    await client.connect();
    redisClient = client;
    redisAvailable = true;
    activeCacheProvider = new RedisCacheProvider(client);
    console.log("✅ Redis connected successfully");
  } catch {
    console.warn("Unable to connect to Redis; falling back to in-memory cache.");
    try {
      await client.disconnect();
    } catch {
      // ignore
    }
    redisClient = null;
    redisAvailable = false;
    activeCacheProvider = inMemoryCacheProvider;
  }
};

export const createSessionStore = () => {
  if (!redisClient || !redisAvailable) {
    return undefined;
  }

  const RedisStore: any = (connectRedis as any)(expressSession);
  return new RedisStore({ client: redisClient, prefix: "sess:" });
};

export const cacheProvider: ICacheProvider = {
  async set(key: string, value: string, expire?: number) {
    return activeCacheProvider.set(key, value, expire);
  },
  async get(key: string) {
    return activeCacheProvider.get(key);
  },
  async del(key: string) {
    return activeCacheProvider.del(key);
  },
};

export default cacheProvider;
