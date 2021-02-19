import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { CardStoreController } from "./controllers/card-store.controller";
import { DatabaseService } from "./services/database.service";
import { FixturesService } from "./services/fixtures.service";
import { RepositoryService } from "./services/repository.service";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { baseConfig, environmentConfig } from "./configuration/config";
import { AppConfigService } from "./configuration/config.service";

const KAFKA_BROKER = environmentConfig().kafka.broker.url;

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "KAFKA",
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [KAFKA_BROKER],
          },
        },
      },
    ]),
    ConfigModule.forRoot({
      load: [environmentConfig, baseConfig],
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [CardStoreController],
  providers: [
    DatabaseService,
    FixturesService,
    RepositoryService,
    AppConfigService,
  ],
})
export class CardStoreModule {}
