import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, INestMicroservice } from "@nestjs/common";
import * as request from "supertest";
import { KAFKA_BROKER } from "./../src/main";
import { CardStoreModule } from "./../src/card-store.module";
import { DatabaseService } from "./../src/services/database.service";
import { RepositoryService } from "./../src/services/repository.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ClientProxy, ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigService } from "./../src/configuration/config.service";
import { ConfigService as NestConfigService } from "@nestjs/config";

describe("AppController (e2e)", () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CardStoreModule,
        ClientsModule.register([
          {
            name: "KAFKA",
            transport: Transport.KAFKA,
            options: {
              client: {
                ssl: false,
                brokers: [KAFKA_BROKER],
              },
            },
          },
        ]),
      ],
      providers: [
        RepositoryService,
        DatabaseService,
        EventEmitter2,
        ConfigService,
        NestConfigService,
      ],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      client: {
        ssl: false,
        brokers: [KAFKA_BROKER],
      },
    });

    await app.init();

    client = app.get("KAFKA");
    await client.connect();
  });

  it("stores cards into the database", () => {});
  it("deletes cards from the database", () => {});
  it("gets all user cards", () => {});
  it("retrieves the next card", () => {});
});
