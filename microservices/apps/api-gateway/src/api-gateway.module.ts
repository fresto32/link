import {AuthModule} from '@link/auth';
import {config, ConfigModule} from '@link/config';
import {Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {AccountController} from './controllers/account.controller';

const KAFKA_BROKER = config().kafka.broker.url;

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [KAFKA_BROKER],
          },
        },
      },
    ]),
    EventEmitterModule.forRoot(),
    AuthModule,
    ConfigModule,
  ],
  controllers: [AccountController],
  providers: [],
})
export class ApiGatewayModule {}
