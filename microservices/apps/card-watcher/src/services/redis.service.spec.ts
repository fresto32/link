import {ConfigService} from '@link/config';
import {EventPatterns} from '@link/schema';
import {Test} from '@nestjs/testing';
import {SinonStub, stub} from 'sinon';
import {RedisService} from './redis.service';

describe('RedisService', () => {
  let redisService: RedisService;
  let clientMock: {
    get: SinonStub;
    set: SinonStub;
    del: SinonStub;
  };
  let configServiceMock: {get: SinonStub};

  beforeEach(async () => {
    // Build mocks...
    clientMock = {
      get: stub(),
      set: stub(),
      del: stub(),
    };
    configServiceMock = {
      get: stub(),
    };

    configServiceMock.get
      .withArgs('NODE_ENV')
      .returns('development')
      .withArgs('redis.port')
      .returns(6379)
      .withArgs('redis.host')
      .returns('localhost');

    const moduleRef = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);

    // @ts-expect-error: For testing purposes...
    redisService['client'] = clientMock;
  });

  it('should be instantiated', () => {
    expect(redisService).toBeTruthy();
  });

  describe('addToWatchList', () => {
    it('calls client.set with the correct arguments', async () => {
      const expectedUuid = 'some uuid';
      const expectedPattern = EventPatterns.gotNextCard;

      await redisService.addToWatchList({
        uuid: expectedUuid,
        pattern: expectedPattern,
      });

      expect(clientMock.set.calledWith(expectedUuid, expectedPattern));
    });
  });

  describe('isInWatchList', () => {
    it('returns true if the pattern exists in the watch list', () => {
      const uuid = 'some uuid';
      const pattern = EventPatterns.gotNextCard;
      clientMock.get.withArgs(uuid).returns(EventPatterns.gotNextCard);

      const result = redisService.isInWatchList({uuid, pattern});

      expect(result).toBeTruthy();
    });

    it('returns false if the pattern does not exists in the watch list', async () => {
      const uuid = 'some uuid';
      const pattern = EventPatterns.gotNextCard;
      clientMock.get.withArgs(uuid).returns(EventPatterns.cardStored);

      const result = await redisService.isInWatchList({uuid, pattern});

      expect(result).toBeFalsy();
    });
  });

  describe('deleteFromWatchList', () => {
    it('deletes the uuid from the watch list', () => {
      const expectedUuid = 'some uuid';

      redisService.deleteFromWatchList(expectedUuid);

      expect(clientMock.del.calledWith(expectedUuid));
    });
  });
});
