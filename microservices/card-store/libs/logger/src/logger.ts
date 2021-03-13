import {baseConfig} from '@link/config';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';
import {nestLikeConsoleFormat} from './nest-like-console-format';
const {combine, padLevels, timestamp} = format;

const DEFAULT_CONTEXT = 'Default';

/** Contexts that are used by NestJS. */
const NEST_CONTEXTS = [
  'NestFactory',
  'InstanceLoader',
  'NestMicroservice',
  'ServerKafka',
];

/** The longest context in NEST_CONTEXTS */
export const LONGEST_NEST_CONTEXT = NEST_CONTEXTS.reduce((prev, curr) =>
  prev.length > curr.length ? prev : curr
);

const logger = createLogger({
  level: baseConfig().log.level,
  defaultMeta: {
    context: DEFAULT_CONTEXT,
  },
  format: combine(padLevels(), timestamp(), nestLikeConsoleFormat()),
  transports: [new transports.Console()],
});

export abstract class Logger {
  /** The length of the longest context */
  private static longestContextLength = LONGEST_NEST_CONTEXT.length;

  /** Map of all loggers and their contexts */
  private static loggers = new Map<WinstonLogger, string>([
    [logger, DEFAULT_CONTEXT],
  ]);

  public static create(context: string): WinstonLogger {
    const childLogger = logger.child({context: context});
    this.loggers.set(childLogger, context);

    this.setContextPaddings();

    return childLogger;
  }

  /**
   * Pads `context` such that `context` has the same length as every
   * other context for prettier printing of logs.
   */
  public static padContext(context: string): string {
    return context.padEnd(this.longestContextLength, ' ');
  }

  /**
   * Adds paddings to each context of `this.loggers` such that
   * each context has the same character length for prettier
   * printing of logs.
   */
  private static setContextPaddings(): void {
    let maxLength = LONGEST_NEST_CONTEXT.length;
    for (const context of this.loggers.values()) {
      if (context.length > maxLength) maxLength = context.length;
    }

    for (const [logger, context] of this.loggers.entries()) {
      const paddedContext = context.padEnd(maxLength, ' ');
      logger.defaultMeta = {context: paddedContext};
    }

    // Save the maxLength for use by `this.padContext`.
    this.longestContextLength = maxLength;
  }
}
