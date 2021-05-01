import {Test, TestingModule} from '@nestjs/testing';
import {RedisService} from './redis.service';
import * as Redis from 'ioredis';
import {SinonStub, stub} from 'sinon';

jest.mock('ioredis');

describe('RedisService', () => {
  let service: RedisService;
  let redisConstructorMock: jest.Mock;

  beforeEach(async () => {
    redisConstructorMock = (Redis as unknown) as jest.Mock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = await module.resolve<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('install()', () => {
    it('creates a new Redis instance', () => {
      const mockedReturn = {
        on: stub(),
      };
      redisConstructorMock.mockReturnValue(mockedReturn);

      service.install('host', 0);

      expect(service['client']).toEqual(mockedReturn);
    });
  });

  describe('public API', () => {
    let client: {
      set: SinonStub;
      get: SinonStub;
      del: SinonStub;
    };
    beforeEach(() => {
      // Build mocks
      client = {
        set: stub(),
        get: stub(),
        del: stub(),
      };

      // @ts-expect-error: Mocking client.
      service['client'] = client;
    });

    describe('set()', () => {
      it('calls client.set', () => {
        const key = 'key';
        const value = 'value';

        service.set(key, value);

        expect(client.set.getCalls()[0].args).toEqual([
          key,
          JSON.stringify(value),
        ]);
      });
    });

    describe('del()', () => {
      it('calls client.del', () => {
        const key = 'key';

        service.del(key);

        expect(client.del.getCalls()[0].args).toEqual([key]);
      });
    });

    describe('get()', () => {
      it('calls client.get', () => {
        const key = 'key';

        service.get(key);

        expect(client.get.getCalls()[0].args).toEqual([key]);
      });
    });
  });
});
