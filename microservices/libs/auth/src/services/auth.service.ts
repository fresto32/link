import {CryptoService} from '@link/crypto';
import {Logger} from '@link/logger';
import {ClientUser, UserProfile, userProfileFrom} from '@link/schema';
import {UsersService} from '@link/users';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import ono from 'ono';

@Injectable()
export class AuthService {
  private logger = Logger.create('AuthService');

  constructor(
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersService: UsersService
  ) {}

  async validateUser(username: string, password: string): Promise<UserProfile> {
    try {
      this.logger.debug('Validating user', {username, password});

      const user = await this.usersService.findOne(username);

      if (!user) {
        this.logger.error('Could not find user', {username, password});
        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }

      await this.cryptoService.verifyAgainstHash(password, user.hashedPassword);

      const userProfile = userProfileFrom(user);

      this.logger.info('Successfully validated user', {userProfile});
      return userProfile;
    } catch (err) {
      this.logger.error('Error validating user', {username});
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
  }

  async login(user: UserProfile) {
    const payload = {username: user.username, sub: user.userId};
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public getCookieForLogOut() {
    return 'Authentication=; HttpOnly; Path=/; Max-Age=0';
  }

  async signUp(user: ClientUser) {
    const result = await this.usersService.createUser(user);
    if (!result) {
      throw new HttpException(
        'Duplicate username or email found.',
        HttpStatus.BAD_REQUEST
      );
    }

    return userProfileFrom(user);
  }
}
