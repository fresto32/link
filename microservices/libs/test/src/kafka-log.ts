import {Consumer} from 'kafkajs';

/**
 * Keeps a log of all messages `consumer` consumes.
 *
 * This is handy for testing expected message flows.
 */
export class KafkaLog {
  private messages = new Map<string, string>();

  constructor(private consumer: Consumer) {}

  /**
   * Needs to be called for this class to start logging messages of
   * `consumer`.
   */
  public async setup() {
    await this.consumer.run({
      eachMessage: async ({message}) => {
        if (!message.value) fail(`No value for key: ${message.key}`);

        this.messages.set(message.key.toString(), message.value.toString());
      },
    });
  }

  /**
   * Clears the log.
   */
  public clear() {
    this.messages.clear();
  }

  /**
   * Tries to get the message of key `uuid` from the log.
   */
  public tryGetMessageOf(uuid: string) {
    const message = this.messages.get(uuid);
    if (!message) fail(`No message for UUID: ${uuid}`);

    try {
      return JSON.parse(message);
    } catch (err) {
      fail(`Could not parse message: ${message}`);
    }
  }
}
