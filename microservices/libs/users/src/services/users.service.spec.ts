import {CryptoService} from '@link/crypto';
import {RedisService} from '@link/redis';
import {ClientUser} from '@link/schema';
import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {SinonStub, stub} from 'sinon';
import {UsersService} from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let cryptoServiceMock: {
    hashOf: SinonStub;
  };
  let configServiceMock: {
    get: SinonStub;
  };
  let redisClientMock: {
    install: SinonStub;
    get: SinonStub;
    set: SinonStub;
    del: SinonStub;
  };

  beforeEach(async () => {
    // Build mocks...
    cryptoServiceMock = {
      hashOf: stub(),
    };
    configServiceMock = {
      get: stub(),
    };
    redisClientMock = {
      install: stub(),
      get: stub(),
      set: stub(),
      del: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CryptoService,
          useValue: cryptoServiceMock,
        },
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

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne()', () => {
    it('finds the given user', async () => {
      redisClientMock.get.returns('john');
      expect(await service.findOne('john')).toBeTruthy();
    });

    it('returns undefined if the given user does not exist', async () => {
      expect(await service.findOne('not exist')).toBeUndefined();
    });
  });

  describe('createUser()', () => {
    it('returns false if the user would duplicate a username or email', async () => {
      const clientUser: ClientUser = {
        userId: 1,
        username: 'john',
        email: 'email',
        password: 'password',
      };

      redisClientMock.get.returns(clientUser);

      expect(await service.createUser(clientUser)).toBeFalsy();
    });

    it('persists the user', async () => {
      const clientUser: ClientUser = {
        userId: 1,
        username: 'another john',
        email: 'email',
        password: 'password',
      };

      expect(await service.createUser(clientUser)).toBeTruthy();
    });
  });
});
