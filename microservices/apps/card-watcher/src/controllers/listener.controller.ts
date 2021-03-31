import {Logger} from '@link/logger';
import {CardEvent, Topics} from '@link/schema';
import {Controller, Inject} from '@nestjs/common';
import {ClientProxy, EventPattern, Transport} from '@nestjs/microservices';
import {KafkaMessage} from 'kafkajs';
import {RedisService} from './../services/redis.service';

@Controller()
export class ListenerController {
  private logger = Logger.create('ListenerController');

  constructor(
    @Inject('KAFKA') private client: ClientProxy,
    private redisService: RedisService
  ) {}

  /**
   * Only listen to the `Card` topic and emit the events for
   * our controller methods to listen to.
   */
  @EventPattern(Topics.card, Transport.KAFKA)
  async handleCard(event: KafkaMessage) {
    const cardEvent = (event.value as unknown) as CardEvent;
    this.logger.debug('Received card event from Kafka', event);

    const uuid = cardEvent.payload.uuid;
    const cardIsInWatchList = await this.redisService.isInWatchList({
      uuid,
      pattern: cardEvent.pattern,
    });

    if (cardIsInWatchList) {
      this.logger.info('Found card in watch list: ', cardEvent);

      this.client.emit(Topics.cardSeen, {key: uuid, value: cardEvent});

      this.redisService.deleteFromWatchList(uuid);
    }
  }
}
