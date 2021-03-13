import {config} from '@link/config';
import {CardSettingsGenerator} from '@link/schema/build/src/generator';
import {Topics} from '@link/schema/build/src/topics';
import {
  CardCreated,
  CardEvent,
  DeleteCardRequested,
  EventPatterns,
  GetAllUserCardsRequested,
  NextCardRequested,
} from '@link/schema/src/events/card';
import {KafkaLink, waitFor} from '@link/test';
import {INestMicroservice} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {bootstrap} from './../src/bootstrap';
import {DatabaseService} from './../src/services/database.service';
import {RepositoryService} from './../src/services/repository.service';

describe('Card Store Microservice (e2e)', () => {
  let kafkaLink: KafkaLink;

  beforeAll(async () => {
    const kafkaBroker = config().kafka.broker.url;
    kafkaLink = new KafkaLink('Card Store', Topics.card, kafkaBroker);
    await kafkaLink.setup();
  });

  let app: INestMicroservice;
  let repositoryService: RepositoryService;
  let databaseService: DatabaseService;
  let client: ClientProxy;

  // Set up App testing infrastructure.
  beforeEach(async () => {
    // Increase timeout to allow for Kafka rebalancing not causing failed tests.
    jest.setTimeout(40000);

    app = await bootstrap();

    repositoryService = app.get<RepositoryService>(RepositoryService);
    databaseService = app.get<DatabaseService>(DatabaseService);
    client = app.get<ClientProxy>('KAFKA');

    // It takes time for Kafka to register (and possibly rebalance for) the new
    // NestJS connection.
    await waitFor(5000);

    // Reset database on start
    await databaseService.dropDatabase();
  });

  afterEach(async done => {
    await client.close();
    await app.close();

    done();
  });

  afterAll(async done => {
    await kafkaLink.destroy();
    await client.close();
    await app.close();

    done();
  });

  describe('Next Card', () => {
    const nextCardRequestedUuid = 'Uuid for next card requested event';

    beforeEach(async () => {
      // Reset database on start
      await databaseService.dropDatabase();

      kafkaLink.log.clear();

      await kafkaLink.sendCardCreatedEvent();

      await waitFor(4000);

      const nextCard: NextCardRequested = {
        uuid: nextCardRequestedUuid,
        timestamp: new Date(),
        source: 'Api Gateway',
      };

      const nextCardEvent: CardEvent = {
        pattern: EventPatterns.nextCardRequested,
        payload: nextCard,
      };

      await kafkaLink.send({
        topic: 'card',
        messages: [
          {key: nextCardRequestedUuid, value: JSON.stringify(nextCardEvent)},
        ],
      });
    });

    it('emits the next card', async done => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(10000);

      const gotNextCardEvent = kafkaLink.log.tryGetMessageOf(
        nextCardRequestedUuid
      );
      expect(gotNextCardEvent).toBeTruthy();

      expect(gotNextCardEvent.pattern).toEqual(EventPatterns.gotNextCard);
      expect(gotNextCardEvent.payload.uuid).toEqual(nextCardRequestedUuid);
      expect(gotNextCardEvent.payload.userCard).toBeTruthy();

      done();
    });
  });

  describe('Get All User Cards', () => {
    const getAllUserCardsUuid = 'Uuid for next card requested event';
    const cardsInDatabase = 3;

    beforeEach(async () => {
      // Reset database on start
      await databaseService.dropDatabase();

      kafkaLink.log.clear();

      for (let i = 0; i < cardsInDatabase; i++) {
        await kafkaLink.sendCardCreatedEvent();
      }

      await waitFor(4000);

      const getAllUserCards: GetAllUserCardsRequested = {
        uuid: getAllUserCardsUuid,
        timestamp: new Date(),
        source: 'Api Gateway',
      };

      const getAllUserCardsEvent: CardEvent = {
        pattern: EventPatterns.getAllUserCardsRequested,
        payload: getAllUserCards,
      };

      await kafkaLink.send({
        topic: 'card',
        messages: [
          {
            key: getAllUserCardsUuid,
            value: JSON.stringify(getAllUserCardsEvent),
          },
        ],
      });
    });

    it('emits all the user cards', async done => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(10000);

      const gotUserCardsEvent = kafkaLink.log.tryGetMessageOf(
        getAllUserCardsUuid
      );
      expect(gotUserCardsEvent).toBeTruthy();

      expect(gotUserCardsEvent.pattern).toEqual(EventPatterns.gotNextCard);
      expect(gotUserCardsEvent.payload.uuid).toEqual(getAllUserCardsUuid);
      expect(gotUserCardsEvent.payload.cards).toBeTruthy();
      expect(gotUserCardsEvent.payload.cards).toHaveLength(cardsInDatabase);

      done();
    });
  });

  describe('Card Deletion', () => {
    const cardDeletionUuid = 'Uuid for card deleted event';
    let createdCardId = '';

    beforeEach(async () => {
      // Reset database on start
      await databaseService.dropDatabase();

      kafkaLink.log.clear();

      const cardCreatedUuid = await kafkaLink.sendCardCreatedEvent();

      await waitFor(4000);

      const createdCardEvent = kafkaLink.log.tryGetMessageOf(cardCreatedUuid);

      createdCardId = createdCardEvent.payload.cardId;

      const deleteCardRequested: DeleteCardRequested = {
        uuid: cardDeletionUuid,
        timestamp: new Date(),
        source: 'Api Gateway',
        cardId: createdCardId,
      };

      const deleteCardEvent: CardEvent = {
        pattern: EventPatterns.deleteCardRequested,
        payload: deleteCardRequested,
      };

      await kafkaLink.send({
        topic: 'card',
        messages: [
          {key: cardDeletionUuid, value: JSON.stringify(deleteCardEvent)},
        ],
      });

      await waitFor(10000);
    });

    it('deletes the card from the database', async done => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(5000);

      const userCards = (await repositoryService.userCards()).data;
      expect(userCards).toHaveLength(0);

      done();
    });

    it('emits a card deleted event to Kafka', async done => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(5000);

      const cardDeletedEvent = kafkaLink.log.tryGetMessageOf(cardDeletionUuid);

      expect(cardDeletedEvent).toBeTruthy();
      expect(cardDeletedEvent.pattern).toEqual(EventPatterns.deletedCard);
      expect(cardDeletedEvent.payload.source).toEqual('Card Store');
      expect(cardDeletedEvent.payload.cardId).toEqual(createdCardId);

      done();
    });
  });

  describe('Card Storage', () => {
    const cardUuid = 'Uuid for card created event';

    beforeEach(async () => {
      const cardCreated: CardCreated = {
        uuid: cardUuid,
        timestamp: new Date(),
        source: 'Api Gateway',
        card: new CardSettingsGenerator(),
      };

      const cardEvent: CardEvent = {
        pattern: EventPatterns.cardCreated,
        payload: cardCreated,
      };

      // Reset database on start
      await databaseService.dropDatabase();

      kafkaLink.log.clear();

      await kafkaLink.send({
        topic: 'card',
        messages: [{key: cardUuid, value: JSON.stringify(cardEvent)}],
      });

      await waitFor(5000);
    });

    it('stores the card within a CardCreated event in mongo', async done => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(5000);

      const userCards = (await repositoryService.userCards()).data;
      expect(userCards).toHaveLength(1);

      done();
    });

    it('emits a card stored event to Kafka', async done => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(5000);

      const cardStoredEvent = kafkaLink.log.tryGetMessageOf(cardUuid);

      expect(cardStoredEvent).toBeTruthy();
      expect(cardStoredEvent.pattern).toEqual(EventPatterns.cardStored);
      expect(cardStoredEvent.payload.source).toEqual('Card Store');
      expect(cardStoredEvent.payload.uuid).toEqual(cardUuid);

      done();
    });
  });
});
