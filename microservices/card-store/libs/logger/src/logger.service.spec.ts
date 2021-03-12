import {ConfigService} from '@link/config';
import {Test, TestingModule} from '@nestjs/testing';
import Sinon, {stub} from 'sinon';
import {LoggerService} from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  let configServiceMock: {get: Sinon.SinonStub};

  const loggingFunctions = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ] as const;

  let loggerMocks: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
    verbose: jest.SpyInstance;
  };

  beforeEach(async () => {
    configServiceMock = {
      get: stub().returns('App Name'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = await module.resolve<LoggerService>(LoggerService);

    loggerMocks = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    for (const loggingFunction of loggingFunctions) {
      loggerMocks[loggingFunction] = jest.spyOn(
        service['logger'],
        loggingFunction
      );
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const messageObject = {some: 'object'};
  const expectedObject = {context: 'NestJS', some: 'object'};
  const message = 'Some message';
  const expectedMessage = {context: 'NestJS'};

  loggingFunctions
    .filter(funcName => funcName !== 'log' && funcName !== 'error')
    .forEach(loggingFunction => {
      it(`logs a ${loggingFunction} message`, () => {
        service[loggingFunction](message);

        expect(loggerMocks[loggingFunction]).toHaveBeenCalledWith(
          message,
          expectedMessage
        );
      });

      it(`logs a ${loggingFunction} object message`, () => {
        service[loggingFunction](messageObject);

        expect(loggerMocks[loggingFunction]).toHaveBeenCalledWith(
          undefined,
          expectedObject
        );
      });
    });

  it('logs a log message', () => {
    service.log(message);

    expect(loggerMocks.log).toHaveBeenCalledWith(
      'info',
      message,
      expectedMessage
    );
  });

  it('logs a log object message', () => {
    service.log(messageObject);

    expect(loggerMocks.log).toHaveBeenCalledWith(
      'info',
      undefined,
      expectedObject
    );
  });

  it('logs an error message', () => {
    service.error(message);

    const expectedErrorObject = {context: 'NestJS', stack: [undefined]};
    expect(loggerMocks.error).toHaveBeenCalledWith(
      message,
      expectedErrorObject
    );
  });

  it('logs an error object message', () => {
    service.error(expectedObject);

    const expectedErrorObject = {
      context: 'NestJS',
      some: 'object',
      stack: [undefined],
    };
    expect(loggerMocks.error).toHaveBeenCalledWith(
      undefined,
      expectedErrorObject
    );
  });
});
