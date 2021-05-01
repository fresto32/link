import {ConfigService} from '@link/config';
import {Logger} from '@link/logger';
import {RedisService} from '@link/redis';
import {CardToWatch} from '@link/schema';
import {Injectable} from '@nestjs/common';

@Injectable()
export class WatchedCardsService {
  private logger = Logger.create('RedisService');

  constructor(
    private configService: ConfigService,
    private redisClient: RedisService
  ) {
    const host = this.configService.get<string>('card-watch-list.redis.host');
    const port = this.configService.get<number>('card-watch-list.redis.port');

    this.redisClient.install(host, port);
  }

  /**
   * Adds the UUID of `cardToWatch` as key and `pattern` as value to
   * the redis cache.
   */
  async addToWatchList(cardToWatch: CardToWatch) {
    this.logger.info('Adding to watch list: ', cardToWatch);
    await this.redisClient.set(cardToWatch.uuid, cardToWatch.pattern);
  }

  /**
   * Determines if `cardToWatch` is in the watch list.
   */
  async isInWatchList(cardToWatch: CardToWatch): Promise<boolean> {
    const pattern = await this.redisClient.get(cardToWatch.uuid);

    if (!cardToWatch.pattern || !pattern) return false;

    this.logger.debug(`For ${cardToWatch.uuid}, found ${pattern}`);

    return pattern === cardToWatch.pattern;
  }

  /**
   * Deletes from the watch list the key of `uuid`.
   */
  async deleteFromWatchList(uuid: string) {
    this.logger.info('Deleting from watch list: ', uuid);

    await this.redisClient.del(uuid);
  }
}
