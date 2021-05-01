import {config, ConfigModule} from '@link/config';
import {Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {ListenerController} from './controllers/listener.controller';
import {RegisterController} from './controllers/register.controller';
import {WatchedCardsService} from './services/watched-cards.service';

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
    ConfigModule,
  ],
  controllers: [ListenerController, RegisterController],
  providers: [WatchedCardsService],
})
export class CardWatcherModule {}
