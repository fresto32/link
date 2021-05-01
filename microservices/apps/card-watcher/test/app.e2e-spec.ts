import {config} from '@link/config';
import {
  CardEvent,
  CardStored,
  CardToWatch,
  CardToWatchEvent,
  EventPatterns,
  Topics,
} from '@link/schema';
import {KafkaLink, waitFor} from '@link/test';
import {RedisLink} from '@link/test/redis-link';
import {INestMicroservice} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {bootstrap} from './../src/bootstrap';

describe('Card Watcher Microservice (e2e)', () => {
  let kafkaCards: KafkaLink;
  let kafkaCardsToWatch: KafkaLink;
  let kafkaCardsSeen: KafkaLink;

  beforeAll(async () => {
    const kafkaBroker = config().kafka.broker.url;

    kafkaCards = new KafkaLink(
      'Card Watcher E2E - Cards',
      Topics.card,
      kafkaBroker
    );
    kafkaCardsToWatch = new KafkaLink(
      'Card Watcher E2E - Cards to Watch',
      Topics.cardToWatch,
      kafkaBroker
    );
    kafkaCardsSeen = new KafkaLink(
      'Card Watcher E2E - Cards Seen',
      Topics.cardSeen,
      kafkaBroker
    );

    await Promise.all([
      kafkaCards.setup(),
      kafkaCardsToWatch.setup(),
      kafkaCardsSeen.setup(),
    ]);
  });

  let app: INestMicroservice;
  let client: ClientProxy;

  const redisLink = new RedisLink(config().redis.port, config().redis.host); // Set up App testing infrastructure.
  beforeEach(async () => {
    // Increase timeout to allow for Kafka rebalancing not causing failed tests.
    jest.setTimeout(40000);

    app = await bootstrap();
    client = app.get<ClientProxy>('KAFKA');

    await waitFor(5000);

    kafkaCards.log.clear();
    kafkaCardsToWatch.log.clear();
    kafkaCardsSeen.log.clear();

    redisLink.reset();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await Promise.all([
      kafkaCards.destroy(),
      kafkaCardsToWatch.destroy(),
      kafkaCardsSeen.destroy(),
      client.close(),
      redisLink.client.disconnect(),
    ]);

    await waitFor(5000);
  });

  describe('Registration Controller', () => {
    let cardToWatchUuid: string;
    let cardToWatch: CardToWatch;

    beforeEach(async () => {
      ({cardToWatchUuid, cardToWatch} = await sendCardToWatchEvent(
        kafkaCardsToWatch
      ));
    });

    it('stores the card to watch in Redis', async () => {
      const storedPattern = await redisLink.client.get(cardToWatchUuid);

      expect(storedPattern).toEqual(cardToWatch.pattern);
    });
  });

  describe('Listener Controller', () => {
    const expectedUuid = 'uuid to watch';
    const expectedPattern = EventPatterns.cardStored;
    let cardStored: CardStored;

    const uuidNotWatched = 'uuid not watched';

    beforeEach(async () => {
      await sendCardToWatchEvent(
        kafkaCardsToWatch,
        expectedUuid,
        expectedPattern
      );

      cardStored = {
        uuid: expectedUuid,
        timestamp: new Date(),
        source: 'Card Store',
        cardId: 'Some card id',
      };

      const watchedEvent: CardEvent = {
        pattern: expectedPattern,
        payload: cardStored,
      };

      await kafkaCards.send({
        topic: Topics.card,
        messages: [{key: expectedUuid, value: JSON.stringify(watchedEvent)}],
      });

      const anotherCardStored: CardStored = {
        uuid: uuidNotWatched,
        timestamp: new Date(),
        source: 'Card Store',
        cardId: 'Some other card id',
      };

      const notWatchedEvent: CardEvent = {
        pattern: expectedPattern,
        payload: anotherCardStored,
      };

      await kafkaCards.send({
        topic: Topics.card,
        messages: [
          {key: uuidNotWatched, value: JSON.stringify(notWatchedEvent)},
        ],
      });

      await waitFor(5000);
    });

    it('emits a watched event to the "card seen" topic', async () => {
      await waitFor(5000);

      const seenEvent = kafkaCardsSeen.log.tryGetMessageOf(expectedUuid);
      expect(seenEvent).toBeTruthy();
      expect(seenEvent.pattern).toEqual(expectedPattern);
      expect(seenEvent.payload.source).toEqual(cardStored.source);
      expect(seenEvent.payload.uuid).toEqual(expectedUuid);
    });

    it('stops watching for the card event', async () => {
      expect(await redisLink.client.get(expectedUuid)).toBeNull();
    });

    it('does not emit the event if it is not watched', async () => {
      expect(await redisLink.client.get(uuidNotWatched)).toBeNull();
      expect(
        kafkaCardsSeen.log.tryGetMessageOf(uuidNotWatched)
      ).toBeUndefined();
    });
  });
});

/**
 * Emits a CardToWatchEvent onto Topics.cardsToWatch.
 */
async function sendCardToWatchEvent(
  kafka: KafkaLink,
  cardToWatchUuid?: string,
  cardToWatchPattern?: EventPatterns
) {
  const uuid = cardToWatchUuid ?? 'some uuid';
  const pattern = cardToWatchPattern ?? EventPatterns.cardCreated;
  const cardToWatch: CardToWatch = {uuid, pattern};

  const cardToWatchEvent: CardToWatchEvent = {
    uuid,
    cardToWatch,
    source: 'Api Gateway',
    timestamp: new Date(),
  };

  await kafka.send({
    topic: Topics.cardToWatch,
    messages: [{key: uuid, value: JSON.stringify(cardToWatchEvent)}],
  });

  await waitFor(5000);

  return {cardToWatchUuid: uuid, cardToWatch};
}
