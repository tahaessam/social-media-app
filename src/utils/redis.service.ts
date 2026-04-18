import { createClient } from 'redis';

class RedisService {
  private client;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    this.client.connect();
  }

  async set(key: string, value: string, expire?: number) {
    if (expire) {
      await this.client.setEx(key, expire, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async disconnect() {
    await this.client.disconnect();
  }
}

export default new RedisService();