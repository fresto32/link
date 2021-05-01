import {Logger} from '@link/logger';
import {CardToWatchEvent, Topics} from '@link/schema';
import {Controller} from '@nestjs/common';
import {EventPattern, Transport} from '@nestjs/microservices';
import {KafkaMessage} from 'kafkajs';
import {WatchedCardsService} from '../services/watched-cards.service';

@Controller()
export class RegisterController {
  private logger = Logger.create('RegisterController');

  constructor(private watchedCardsService: WatchedCardsService) {}

  /**
   * Only listen to the cardToWatch topic and emit the events for
   * our controller methods to listen to.
   */
  @EventPattern(Topics.cardToWatch, Transport.KAFKA)
  async handleCardToWatchEvent(event: KafkaMessage) {
    const cardToWatchEvent = (event.value as unknown) as CardToWatchEvent;

    this.logger.info('Received card to watch event from Kafka', event);

    await this.watchedCardsService.addToWatchList(cardToWatchEvent.cardToWatch);
  }
}
