import { INestMicroservice } from "@nestjs/common";
import { DatabaseService } from "./../src/services/database.service";
import { RepositoryService } from "./../src/services/repository.service";
import { environmentConfig } from "./../src/configuration/config";
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
  EventPatterns,
} from "@link/schema/src/events/card";
import { CardSettingsGenerator } from "@link/schema/build/src/generator";
import { bootstrap } from "./../src/bootstrap";
import { Consumer, Kafka, Producer } from "kafkajs";
import { ClientProxy } from "@nestjs/microservices";

describe("Card Store Microservice (e2e)", () => {
  let kafkaMessagesLog = new Map<string, any>();
  let kafka: Kafka;
  let producer: Producer;
  let consumer: Consumer;

  // Build Kafka messaging consumer and producer for E2E testing.
  beforeAll(async () => {
    const KAFKA_BROKER = environmentConfig().kafka.broker.url;

    kafkaMessagesLog = new Map<string, any>();

    kafka = new Kafka({
      clientId: "Card Store",
      brokers: [KAFKA_BROKER],
    });

    producer = kafka.producer();

    consumer = kafka.consumer({ groupId: "E2E Testing Consumer" });

    await consumer.connect().then(() => {
      consumer.subscribe({ topic: "card", fromBeginning: false }).then(() => {
        consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            kafkaMessagesLog.set(
              message.key?.toString(),
              message.value?.toString()
            );
          },
        });
      });
    });

    await producer.connect();
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
    client = app.get<ClientProxy>("KAFKA");

    // It takes time for Kafka to register (and possibly rebalance for) the new
    // NestJS connection.
    await waitFor(5000);

    // Reset database on start
    await databaseService.dropDatabase();
  });

  afterEach(async (done) => {
    await client.close();
    await app.close();

    done();
  });

  afterAll(async (done) => {
    await Promise.all([producer.disconnect(), consumer.disconnect()]);
    await client.close();
    await app.close();

    done();
  });

  describe("Next Card", () => {
    const nextCardRequestedUuid = "Uuid for next card requested event";

    beforeEach(async () => {
      // Reset database on start
      await databaseService.dropDatabase();

      // Start with a clean kafkaMessagesLog.
      kafkaMessagesLog.clear();

      await sendCardCreatedEvent(producer);

      await waitFor(4000);

      const nextCard: NextCardRequested = {
        uuid: nextCardRequestedUuid,
        timestamp: new Date(),
        source: "Api Gateway",
      };

      const nextCardEvent: CardEvent = {
        pattern: EventPatterns.nextCardRequested,
        payload: nextCard,
      };

      await producer.send({
        topic: "card",
        messages: [
          { key: nextCardRequestedUuid, value: JSON.stringify(nextCardEvent) },
        ],
      });
    });

    it("emits the next card", async (done) => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(10000);

      console.log("kafkaMessagesLog", kafkaMessagesLog.entries());
      const gotNextCardEvent = JSON.parse(
        kafkaMessagesLog.get(nextCardRequestedUuid)
      );
      expect(gotNextCardEvent).toBeTruthy();

      console.log(gotNextCardEvent.payload.userCard);
      expect(gotNextCardEvent.pattern).toEqual(EventPatterns.gotNextCard);
      expect(gotNextCardEvent.payload.uuid).toEqual(nextCardRequestedUuid);
      expect(gotNextCardEvent.payload.userCard).toBeTruthy();

      done();
    });
  });

  describe("Card storage", () => {
    const cardUuid = "Uuid for card created event";

    beforeEach(async () => {
      const cardCreated: CardCreated = {
        uuid: cardUuid,
        timestamp: new Date(),
        source: "Api Gateway",
        card: new CardSettingsGenerator(),
      };

      const cardEvent: CardEvent = {
        pattern: EventPatterns.cardCreated,
        payload: cardCreated,
      };

      // Reset database on start
      await databaseService.dropDatabase();

      // Start with a clean kafkaMessagesLog.
      kafkaMessagesLog.clear();

      await producer.send({
        topic: "card",
        messages: [{ key: cardUuid, value: JSON.stringify(cardEvent) }],
      });
    });

    it("stores the card within a CardCreated event in mongo", async (done) => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(5000);

      const userCards = (await repositoryService.userCards()).data;
      expect(userCards).toHaveLength(1);

      done();
    });

    it("emits a card stored event to Kafka", async (done) => {
      // It takes time for Kafka to send the message and for the Card Store to
      // register its arrival and perform relevant computation.
      await waitFor(5000);

      const cardStoredEvent = JSON.parse(kafkaMessagesLog.get(cardUuid));
      expect(cardStoredEvent).toBeTruthy();

      expect(cardStoredEvent.pattern).toEqual(EventPatterns.cardStored);
      expect(cardStoredEvent.payload.source).toEqual("Card Store");
      expect(cardStoredEvent.payload.uuid).toEqual(cardUuid);

      done();
    });
  });
});

/**
 * Pauses on the current line for `milliseconds`.
 */
async function waitFor(milliseconds: number) {
  await new Promise<void>((r) => setTimeout(() => r(), milliseconds));
}

let cardCreatedEventCount = 0;

/**
 * Sends a card created event to Kafka. This event should trigger the card
 * store to save a card to its database.
 *
 * @returns the UUID of the event.
 */
async function sendCardCreatedEvent(producer: Producer): Promise<string> {
  const cardCreatedUuid = `Card created event ${cardCreatedEventCount++}`;

  const cardCreated: CardCreated = {
    uuid: cardCreatedUuid,
    timestamp: new Date(),
    source: "Api Gateway",
    card: new CardSettingsGenerator(),
  };

  const cardEvent: CardEvent = {
    pattern: EventPatterns.cardCreated,
    payload: cardCreated,
  };

  await producer.send({
    topic: "card",
    messages: [{ key: cardCreatedUuid, value: JSON.stringify(cardEvent) }],
  });

  return cardCreatedUuid;
}
