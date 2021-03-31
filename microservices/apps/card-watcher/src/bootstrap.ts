import {config} from '@link/config';
import {LoggerService, Logger} from '@link/logger';
import {NestFactory} from '@nestjs/core';
import {KafkaOptions, Transport} from '@nestjs/microservices';
import {CardWatcherModule} from './card-watcher.module';

const KAFKA_BROKER = config().kafka.broker.url;

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<KafkaOptions>(
    CardWatcherModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [KAFKA_BROKER],
          clientId: 'Card Watcher',
        },
        subscribe: {},
      },
      logger: new LoggerService(),
    }
  );

  app.listen(() => {
    const logger = Logger.create('NestMicroservice');
    logger.info(`Microservice is listening to Kafka on ${KAFKA_BROKER}`);
  });

  return app;
}
