import {
  CardCreated,
  CardEvent,
  EventPatterns,
} from '@link/schema/src/events/card';
import {CardSettingsGenerator} from '@link/schema/build/src/generator';
import {Consumer, Kafka, Producer, ProducerRecord} from 'kafkajs';
import {KafkaLog} from './kafka-log';

/**
 * Class for assisting in E2E testing of a microservice.
 */
export class KafkaLink {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private cardCreatedCount = 0;
  public log: KafkaLog;

  constructor(
    private clientId: string,
    private topic: string,
    private broker: string
  ) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: [this.broker],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({groupId: 'E2E Testing Consumer'});

    this.log = new KafkaLog(this.consumer);
  }

  /**
   * Connects the consumer and producer to the Kafka broker and subscribes the
   * consumer to the supplied topic.
   */
  public async setup(): Promise<void> {
    await this.consumer.connect();
    await this.producer.connect();

    await this.consumer.subscribe({topic: this.topic, fromBeginning: false});

    await this.log.setup();
  }

  /**
   * Send a custom message from this producer.
   */
  public async send(record: ProducerRecord): Promise<void> {
    await this.producer.send(record);
  }

  /**
   * Sends a card created event to Kafka. This event should trigger the card
   * store to save a card to its database.
   *
   * @returns the UUID of the event.
   */
  public async sendCardCreatedEvent(): Promise<string> {
    const cardCreatedUuid = `Card created event ${this.cardCreatedCount++}`;

    const cardCreated: CardCreated = {
      uuid: cardCreatedUuid,
      timestamp: new Date(),
      source: 'Api Gateway',
      card: new CardSettingsGenerator(),
    };

    const cardEvent: CardEvent = {
      pattern: EventPatterns.cardCreated,
      payload: cardCreated,
    };

    await this.producer.send({
      topic: this.topic,
      messages: [{key: cardCreatedUuid, value: JSON.stringify(cardEvent)}],
    });

    return cardCreatedUuid;
  }

  /**
   * Disconnects the Kafka producer and consumer.
   */
  public async destroy(): Promise<void> {
    await Promise.all([this.producer.disconnect(), this.consumer.disconnect()]);
  }
}
