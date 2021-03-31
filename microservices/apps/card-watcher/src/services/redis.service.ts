import {ConfigService} from '@link/config';
import {Logger} from '@link/logger';
import {CardToWatch} from '@link/schema';
import {Injectable} from '@nestjs/common';
import ono from 'ono';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  private logger = Logger.create('RedisService');

  private client: Redis.Redis;

  constructor(private configService: ConfigService) {
    this.client = this.createClient();
  }

  /**
   * Creates a redis client.
   */
  private createClient(): Redis.Redis {
    const port = this.configService.get<number>('redis.port');
    const host = this.configService.get<string>('redis.host');

    const client = new Redis(port, host);

    client.on('connect', () => this.logger.info('Redis is connected'));
    client.on('ready', () => this.logger.info('Redis is ready'));
    client.on('end', () => this.logger.info('Redis has closed'));
    client.on('error', error => {
      this.logger.error('Redis received error: ', error);
      throw ono(error);
    });

    return client;
  }

  /**
   * Adds the UUID of `cardToWatch` as key and `pattern` as value to
   * the redis cache.
   */
  async addToWatchList(cardToWatch: CardToWatch) {
    this.logger.info('Storing to redis: ', cardToWatch);
    await this.client.set(cardToWatch.uuid, cardToWatch.pattern);
  }

  /**
   * Determines if `cardToWatch` is in the watch list.
   */
  async isInWatchList(cardToWatch: CardToWatch): Promise<boolean> {
    const pattern = await this.client.get(cardToWatch.uuid);

    if (!cardToWatch.pattern || !pattern) return false;

    this.logger.debug(`For ${cardToWatch.uuid}, found ${pattern}`);

    return pattern === cardToWatch.pattern;
  }

  /**
   * Deletes from the watch list the key of `uuid`.
   */
  async deleteFromWatchList(uuid: string) {
    this.logger.info('Deleting from redis: ', uuid);

    await this.client.del(uuid);
  }
}
