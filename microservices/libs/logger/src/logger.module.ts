import {ConfigService} from '@link/config';
import {Module} from '@nestjs/common';
import {LoggerService} from './logger.service';

@Module({
  imports: [ConfigService],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
