import {Logger} from '@link/logger';
import {Injectable, Scope} from '@nestjs/common';
import * as Redis from 'ioredis';
import ono from 'ono';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class RedisService {
  private logger = Logger.create('RedisService');

  private client?: Redis.Redis;

  constructor() {}

  /**
   * Creates a redis client.
   */
  install(host: string, port: number): void {
    const client = new Redis(port, host);

    client.on('connect', () => this.logger.info('Redis is connected'));
    client.on('ready', () => this.logger.info('Redis is ready'));
    client.on('end', () => this.logger.info('Redis has closed'));
    client.on('error', error => {
      this.logger.error('Redis received error: ', error);
      throw ono(error);
    });

    this.client = client;
  }

  async set(key: Redis.KeyType, value: unknown) {
    this.logger.debug(`Setting ${key} to ${value}`);
    this.checkForClient();
    await this.client!.set(key, JSON.stringify(value));
  }

  async del(key: Redis.KeyType) {
    this.logger.debug(`Deleting ${key}`);
    this.checkForClient();
    await this.client!.del(key);
  }

  async get<T>(key: Redis.KeyType): Promise<T | null> {
    this.logger.debug(`Getting ${key}`);
    this.checkForClient();
    const result = await this.client!.get(key);

    if (!result) return null;
    else return JSON.parse(result);
  }

  private checkForClient() {
    if (!this.client) {
      throw ono('Need to install RedisService before use');
    }
  }
}
