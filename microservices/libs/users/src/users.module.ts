import {CryptoModule} from '@link/crypto';
import {RedisModule} from '@link/redis';
import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {UsersService} from './services/users.service';

@Module({
  imports: [CryptoModule, ConfigModule, RedisModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
