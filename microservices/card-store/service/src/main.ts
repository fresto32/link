import {NestFactory} from '@nestjs/core';
import {Transport, KafkaOptions} from '@nestjs/microservices';
import {CardStoreModule} from './card-store.module';

export const KAFKA_BROKER = 'localhost:9092' as const;

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
          topic: 'card',
        },
      },
    }
  );
  app.listen(() =>
    console.log(`Microservice is listening to Kafka on ${KAFKA_BROKER}`)
  );
}

bootstrap();
