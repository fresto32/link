import {Controller, Inject} from '@nestjs/common';
import {
  CardCreated,
  CardStored,
  DeleteCardRequested,
  DeletedCard,
  CardEvent,
  GetAllUserCardsRequested,
  GotAllUserCards,
  GotNextCard,
  NextCardRequested,
} from '@link/schema/src/events/card';
import {Topics} from '@link/schema/build/src/topics';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';
import {ClientProxy, EventPattern} from '@nestjs/microservices';
import {EventPatterns} from '@link/schema/build/src/events';
import {RepositoryService} from './../services/repository.service';

@Controller()
export class CardStoreController {
  constructor(
    @Inject('KAFKA') private client: ClientProxy,
    private repositoryService: RepositoryService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Only listen to the `Card` topic and emit the events for
   * our controller methods to listen to.
   */
  @EventPattern(Topics.card)
  async handleCard(event: CardEvent) {
    this.eventEmitter.emit(event.pattern, event.payload);
  }

  /**
   * Emits the next card.
   */
  @OnEvent(EventPatterns.nextCardRequested)
  async handleNextCardRequested(event: NextCardRequested) {
    const result = await this.repositoryService.nextCard();

    const eventToEmit: GotNextCard = {
      uuid: event.uuid,
      timestamp: new Date(),
      source: 'Card Store',
      userCard: result.data,
      error: result.error,
    };

    this.client.emit(EventPatterns.GotNextCard, eventToEmit);
  }

  /**
   * Get all the user cards and emit an event with all `userCards`.
   */
  @OnEvent(EventPatterns.getAllUserCardsRequested)
  async handleGetAllUserCardsRequested(event: GetAllUserCardsRequested) {
    const result = await this.repositoryService.userCards();

    const eventToEmit: GotAllUserCards = {
      uuid: event.uuid,
      timestamp: new Date(),
      source: 'Card Store',
      cards: result.data,
      error: result.error,
    };

    this.client.emit(EventPatterns.GotAllUserCards, eventToEmit);
  }

  /**
   * Delete the card and emit a `DeletedCard` event.
   */
  @OnEvent(EventPatterns.deleteCardRequested)
  handleDeleteCardRequested(event: DeleteCardRequested) {
    const result = this.repositoryService.deleteCard(event.cardId);

    const eventToEmit: DeletedCard = {
      uuid: event.uuid,
      timestamp: new Date(),
      source: 'Card Store',
      cardId: event.cardId,
      error: result.error,
    };

    this.client.emit(EventPatterns.DeletedCard, eventToEmit);
  }

  /**
   * Store the card and emit a `CardStored` event.
   */
  @OnEvent(EventPatterns.cardCreated)
  async handleCardCreated(event: CardCreated) {
    const result = await this.repositoryService.saveCard(event.card);

    const eventToEmit: CardStored = {
      uuid: event.uuid,
      timestamp: new Date(),
      source: 'Card Store',
      cardId: result.data,
      error: result.error,
    };

    this.client.emit(EventPatterns.CardStored, eventToEmit);
  }
}
