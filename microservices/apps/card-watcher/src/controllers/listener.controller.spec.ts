import {Topics} from '@link/schema';
import {Test, TestingModule} from '@nestjs/testing';
import {SinonStub, stub} from 'sinon';
import {RedisService} from '../services/redis.service';
import {ListenerController} from './listener.controller';

describe('ListenerController', () => {
  let listenerController: ListenerController;
  let clientProxyMock: {
    emit: SinonStub;
  };
  let redisServiceMock: {
    isInWatchList: SinonStub;
  };

  beforeEach(async () => {
    // Build mocks...
    clientProxyMock = {
      emit: stub(),
    };
    redisServiceMock = {
      isInWatchList: stub(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ListenerController],
      providers: [
        {
          provide: 'KAFKA',
          useValue: clientProxyMock,
        },
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();

    listenerController = app.get<ListenerController>(ListenerController);
  });

  it('should be instantiated', () => {
    expect(listenerController).toBeTruthy();
  });

  describe('handleCard()', () => {
    const event = {
      value: {
        payload: {
          uuid: 'some uuid',
        },
        pattern: 'some pattern',
      },
    };

    it('should not emit a card event not found in the watch list', () => {
      redisServiceMock.isInWatchList.returns(false);

      // @ts-expect-error: For testing purposes...
      listenerController.handleCard(event);

      expect(clientProxyMock.emit.callCount).toEqual(0);
    });

    it('emits a card event that is in the watch list', () => {
      redisServiceMock.isInWatchList.returns(true);

      // @ts-expect-error: For testing purposes...
      listenerController.handleCard(event);

      expect(clientProxyMock.emit.calledWith(Topics.cardSeen, event.value));
    });
  });
});
