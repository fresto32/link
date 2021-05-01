import {Module} from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import {baseConfig, config} from './config';
import {ConfigService} from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [config, baseConfig],
    }),
  ],
  providers: [ConfigService, NestConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
