import {NestFactory} from '@nestjs/core';
import {Transport, MicroserviceOptions} from '@nestjs/microservices';
import {CardStoreModule} from './card-store.module';

const KAFKA_BROKER = 'localhost:9092' as const;

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CardStoreModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [KAFKA_BROKER],
        },
      },
    }
  );
  app.listen(() =>
    console.log(`Microservice is listening to Kafka on ${KAFKA_BROKER}`)
  );
}

bootstrap();
