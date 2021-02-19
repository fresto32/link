import { NestFactory } from "@nestjs/core";
import { Transport, KafkaOptions } from "@nestjs/microservices";
import { CardStoreModule } from "./card-store.module";
import { environmentConfig } from "./configuration/config";

const KAFKA_BROKER = environmentConfig().kafka.broker.url;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<KafkaOptions>(
    CardStoreModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [KAFKA_BROKER],
        },
        subscribe: {
          // @ts-expect-error: NestJs bug.
          topic: "card",
        },
      },
    }
  );
  app.listen(() =>
    console.log(`Microservice is listening to Kafka on ${KAFKA_BROKER}`)
  );
}

// bootstrap();

const { Kafka } = require("kafkajs");

// Create the client with the broker list
const kafka = new Kafka({
  clientId: "Card Store",
  brokers: ["0.0.0.0:9092"],
});

const producer = kafka.producer();

producer.connect().then(() => {
  producer
    .send({
      topic: "card",
      messages: [
        { key: "key1", value: "hello world" },
        { key: "key2", value: "hey hey!" },
      ],
    })
    .then(() => {
      console.log("sent message");
    });
});
