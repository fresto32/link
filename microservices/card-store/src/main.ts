import {NestFactory} from '@nestjs/core';
import {Transport, KafkaOptions} from '@nestjs/microservices';
import {CardStoreModule} from './card-store.module';

export const KAFKA_BROKER = 'localhost:9093' as const;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<KafkaOptions>(
    CardStoreModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        subscribe: {
          // @ts-expect-error: NestJs bug.
          topic: 'card',
        },
      },
    }
  );
  app.listen(() =>
    console.log(`Microservice is listening to Kafka on ${KAFKA_BROKER}`)
  );
}

// bootstrap();

const {Kafka} = require('kafkajs');

// Create the client with the broker list
const kafka = new Kafka({
  clientId: 'Card Store',
  brokers: ['0.0.0.0:9093'],
});

const producer = kafka.producer();

producer.connect().then(() => {
  producer
    .send({
      topic: 'card',
      messages: [
        {key: 'key1', value: 'hello world'},
        {key: 'key2', value: 'hey hey!'},
      ],
    })
    .then(() => {
      console.log('sent message');
    });
});
