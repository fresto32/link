import {ConfigService} from '@link/config';
import {CryptoService} from '@link/crypto';
import {Logger} from '@link/logger';
import {RedisService} from '@link/redis';
import {ClientUser, PersistedUser} from '@link/schema';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';

@Injectable()
export class UsersService {
  private logger = Logger.create('UsersService');

  constructor(
    private configService: ConfigService,
    private cryptoService: CryptoService,
    private redisClient: RedisService
  ) {
    const host = this.configService.get<string>('user-repository.redis.host');
    const port = this.configService.get<number>('user-repository.redis.port');

    this.redisClient.install(host, port);
  }

  async findOne(username: string): Promise<PersistedUser | null> {
    this.logger.debug('Finding user', {username});
    const user = this.redisClient.get<PersistedUser>(username);

    this.logger.debug('Found user', {user});
    return user;
  }

  async createUser(user: ClientUser): Promise<boolean> {
    this.logger.debug('Trying to create User', user);

    if (!user.username) {
      throw new HttpException('Invalid body', HttpStatus.BAD_REQUEST);
    }

    const duplicateUser = await this.redisClient.get<PersistedUser>(
      user.username
    );

    if (duplicateUser) {
      this.logger.info('Duplicate user found', {user, duplicateUser});
      return false;
    }

    const hashedPassword = await this.cryptoService.hashOf(user.password);

    const persistedUser: PersistedUser = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      hashedPassword,
    };

    this.redisClient.set(user.username, persistedUser);

    this.logger.info('Added new user', {persistedUser});

    return true;
  }
}
