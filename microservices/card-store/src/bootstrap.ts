import { NestFactory } from "@nestjs/core";
import { Transport, KafkaOptions } from "@nestjs/microservices";

import { CardStoreModule } from "./card-store.module";
import { environmentConfig } from "./configuration/config";

const KAFKA_BROKER = environmentConfig().kafka.broker.url;

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<KafkaOptions>(
    CardStoreModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [KAFKA_BROKER],
          clientId: "Card Store",
        },
        subscribe: {},
      },
    }
  );
  app.listen(() =>
    console.log(`Microservice is listening to Kafka on ${KAFKA_BROKER}`)
  );

  return app;
}
