import {baseConfig} from '@link/config';
import {createLogger, format, transports} from 'winston';
import {nestLikeConsoleFormat} from './nest-like-console-format';
const {combine, padLevels, timestamp} = format;

const logger = createLogger({
  level: baseConfig().log.level,
  defaultMeta: {
    context: 'Context',
  },
  format: combine(padLevels(), timestamp(), nestLikeConsoleFormat()),
  transports: [new transports.Console()],
});

export abstract class Logger {
  public static create(context: string) {
    return logger.child({context: context});
  }
}
