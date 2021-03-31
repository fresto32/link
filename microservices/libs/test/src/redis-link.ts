import {Logger} from '@link/logger';
import * as Redis from 'ioredis';
import ono from 'ono';

/**
 * Class for assisting in E2E testing of a microservice using
 * redis.
 */
export class RedisLink {
  private logger = Logger.create('RedisLink');

  public client: Redis.Redis;

  constructor(port: number, host: string) {
    this.client = new Redis(port, host);

    this.client.on('connect', () => this.logger.info('Redis is connected'));
    this.client.on('ready', () => this.logger.info('Redis is ready'));
    this.client.on('end', () => this.logger.info('Redis has closed'));
    this.client.on('error', error => {
      this.logger.error('Redis received error: ', error);
      throw ono(error);
    });
  }

  /**
   * Removes all keys from the cache.
   */
  async reset() {
    await this.client.keys('*').then(keys => {
      const pipeline = this.client.pipeline();
      keys.forEach(key => {
        pipeline.del(key);
      });

      return pipeline.exec();
    });
  }
}
