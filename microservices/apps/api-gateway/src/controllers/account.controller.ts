import {AuthService, JwtAuthGuard, LocalAuthGuard} from '@link/auth';
import {Logger} from '@link/logger';
import {ClientUser, UserProfile} from '@link/schema';
import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {Request} from 'express';

@Controller()
export class AccountController {
  private logger = Logger.create('AccountController');
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req: Request) {
    this.logger.debug('Login endpoint hit', req.user);
    return this.authService.login(req.user as UserProfile);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  async logout(@Req() request: Request) {
    request.res!.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
  }

  @Post('auth/signup')
  signUp(@Body() user: ClientUser) {
    this.logger.debug('Sign up endpoint hit', {user});
    return this.authService.signUp(user);
  }
}
