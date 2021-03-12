import {Injectable, Logger as NestLogger} from '@nestjs/common';
import {Logger as WinstonLogger} from 'winston';
import {Logger} from './logger';

/**
 * LoggerService is constructed to be used by NestJS bootstrapping
 * code.
 *
 * This is to ensure a consistent formatting and library use between
 * NestJS internal and our logging. This will also allow for a common
 * transport to be used for NestJS bootstrapping and in-code logging.
 */
@Injectable()
export class LoggerService extends NestLogger {
  private logger: WinstonLogger;

  public context = 'NestJS';

  constructor() {
    super();

    this.logger = Logger.create(this.context);
  }

  public setContext(context: string) {
    this.context = context;
  }

  public log(message: any, context?: string): any {
    context = context || this.context;

    if (typeof message === 'object') {
      const {message: msg, ...meta} = message;

      return this.logger.info(msg as string, {context, ...meta});
    }

    return this.logger.info(message, {context});
  }

  public error(message: any, trace?: string, context?: string): any {
    context = context || this.context;

    if (message instanceof Error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {message: msg, name, stack, ...meta} = message;

      return this.logger.error(msg, {
        context,
        stack: [trace || message.stack],
        ...meta,
      });
    }

    if ('object' === typeof message) {
      const {message: msg, ...meta} = message;

      return this.logger.error(msg as string, {
        context,
        stack: [trace],
        ...meta,
      });
    }

    return this.logger.error(message, {context, stack: [trace]});
  }

  public warn(message: any, context?: string): any {
    context = context || this.context;

    if (typeof message === 'object') {
      const {message: msg, ...meta} = message;

      return this.logger.warn(msg as string, {context, ...meta});
    }

    return this.logger.warn(message, {context});
  }

  public debug(message: any, context?: string): any {
    context = context || this.context;

    if (typeof message === 'object') {
      const {message: msg, ...meta} = message;

      return this.logger.debug(msg as string, {context, ...meta});
    }

    return this.logger.debug(message, {context});
  }

  public verbose(message: any, context?: string): any {
    context = context || this.context;

    if (typeof message === 'object') {
      const {message: msg, ...meta} = message;

      return this.logger.verbose(msg as string, {context, ...meta});
    }

    return this.logger.verbose(message, {context});
  }
}
