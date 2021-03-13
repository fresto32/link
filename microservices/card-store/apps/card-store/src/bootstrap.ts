import {config} from '@link/config';
import {LoggerService} from '@link/logger';
import {NestFactory} from '@nestjs/core';
import {KafkaOptions, Transport} from '@nestjs/microservices';
import {CardStoreModule} from './card-store.module';

const KAFKA_BROKER = config().kafka.broker.url;

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<KafkaOptions>(
    CardStoreModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [KAFKA_BROKER],
          clientId: 'Card Store',
        },
        subscribe: {},
      },
      logger: new LoggerService(),
    }
  );
  app.listen(() =>
    console.log(`Microservice is listening to Kafka on ${KAFKA_BROKER}`)
  );

  return app;
}
