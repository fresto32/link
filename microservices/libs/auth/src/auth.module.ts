import {CryptoModule} from '@link/crypto';
import {UsersModule} from '@link/users';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {config, ConfigModule} from '@link/config';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {AuthService} from './services/auth.service';
import {JwtStrategy} from './strategies/jwt.strategy';
import {LocalStrategy} from './strategies/local.strategy';

const jsonWebTokenSecret = config()['json-web-token'].secret;

@Module({
  imports: [
    ConfigModule,
    CryptoModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jsonWebTokenSecret,
      signOptions: {expiresIn: '60s'},
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
