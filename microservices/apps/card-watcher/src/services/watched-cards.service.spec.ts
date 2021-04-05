import {ConfigService} from '@link/config';
import {RedisService} from '@link/redis';
import {EventPatterns} from '@link/schema';
import {Test} from '@nestjs/testing';
import {SinonStub, stub} from 'sinon';
import {WatchedCardsService} from './watched-cards.service';

describe('RedisService', () => {
  let watchedCardsService: WatchedCardsService;
  let redisClientMock: {
    install: SinonStub;
    get: SinonStub;
    set: SinonStub;
    del: SinonStub;
  };
  let configServiceMock: {get: SinonStub};

  beforeEach(async () => {
    // Build mocks...
    redisClientMock = {
      install: stub(),
      get: stub(),
      set: stub(),
      del: stub(),
    };
    configServiceMock = {
      get: stub(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        WatchedCardsService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: RedisService,
          useValue: redisClientMock,
        },
      ],
    }).compile();

    watchedCardsService = moduleRef.get<WatchedCardsService>(
      WatchedCardsService
    );

    // @ts-expect-error: For testing purposes...
    watchedCardsService['client'] = redisClientMock;
  });

  it('should be instantiated', () => {
    expect(watchedCardsService).toBeTruthy();
  });

  describe('addToWatchList', () => {
    it('calls client.set with the correct arguments', async () => {
      const expectedUuid = 'some uuid';
      const expectedPattern = EventPatterns.gotNextCard;

      await watchedCardsService.addToWatchList({
        uuid: expectedUuid,
        pattern: expectedPattern,
      });

      expect(redisClientMock.set.calledWith(expectedUuid, expectedPattern));
    });
  });

  describe('isInWatchList', () => {
    it('returns true if the pattern exists in the watch list', () => {
      const uuid = 'some uuid';
      const pattern = EventPatterns.gotNextCard;
      redisClientMock.get.withArgs(uuid).returns(EventPatterns.gotNextCard);

      const result = watchedCardsService.isInWatchList({uuid, pattern});

      expect(result).toBeTruthy();
    });

    it('returns false if the pattern does not exists in the watch list', async () => {
      const uuid = 'some uuid';
      const pattern = EventPatterns.gotNextCard;
      redisClientMock.get.withArgs(uuid).returns(EventPatterns.cardStored);

      const result = await watchedCardsService.isInWatchList({uuid, pattern});

      expect(result).toBeFalsy();
    });
  });

  describe('deleteFromWatchList', () => {
    it('deletes the uuid from the watch list', () => {
      const expectedUuid = 'some uuid';

      watchedCardsService.deleteFromWatchList(expectedUuid);

      expect(redisClientMock.del.calledWith(expectedUuid));
    });
  });
});
