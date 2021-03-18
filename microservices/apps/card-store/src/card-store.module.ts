import {config, ConfigModule} from '@link/config';
import {Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {CardStoreController} from './controllers/card-store.controller';
import {DatabaseService} from './services/database.service';
import {FixturesService} from './services/fixtures.service';
import {RepositoryService} from './services/repository.service';

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
  controllers: [CardStoreController],
  providers: [DatabaseService, FixturesService, RepositoryService],
})
export class CardStoreModule {}
