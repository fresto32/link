import {CardToWatch, EventPatterns} from '@link/schema';
import {Test, TestingModule} from '@nestjs/testing';
import {SinonStub, stub} from 'sinon';
import {RedisService} from '../services/redis.service';
import {RegisterController} from './register.controller';

describe('RegisterController', () => {
  let registerController: RegisterController;
  let redisServiceMock: {addToWatchList: SinonStub};

  beforeEach(async () => {
    // Build mocks...
    redisServiceMock = {
      addToWatchList: stub(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [RegisterController],
      providers: [
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();

    registerController = app.get<RegisterController>(RegisterController);
  });

  it('should be instantiated', () => {
    expect(registerController).toBeTruthy();
  });

  describe('handleCardToWatch()', () => {
    const cardToWatch: {value: CardToWatch} = {
      value: {
        uuid: 'some uuid',
        pattern: EventPatterns.cardStored,
      },
    };

    it('should add the card to watch to the Redis cache', () => {
      // @ts-expect-error: For testing purposes...
      registerController.handleCardToWatchEvent(cardToWatch);

      expect(redisServiceMock.addToWatchList.calledWith(cardToWatch));
    });
  });
});
