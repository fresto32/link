import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {CardStoreController} from './controllers/card-store.controller';
import {KAFKA_BROKER} from './main';
import {DatabaseService} from './services/database.service';
import {FixturesService} from './services/fixtures.service';
import {RepositoryService} from './services/repository.service';

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
  ],
  controllers: [CardStoreController],
  providers: [DatabaseService, FixturesService, RepositoryService],
})
export class CardStoreModule {}
