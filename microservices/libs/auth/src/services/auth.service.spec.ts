import {CryptoService} from '@link/crypto';
import {ClientUser, PersistedUser, UserProfile} from '@link/schema';
import {UsersService} from '@link/users';
import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';
import {SinonStub, stub} from 'sinon';
import {AuthService} from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: {
    findOne: SinonStub;
    createUser: SinonStub;
  };
  let cryptoServiceMock: {
    verifyAgainstHash: SinonStub;
  };
  let jwtServiceMock: {
    sign: SinonStub;
  };

  beforeEach(async () => {
    // Build mocks...
    usersServiceMock = {
      findOne: stub(),
      createUser: stub(),
    };
    cryptoServiceMock = {
      verifyAgainstHash: stub(),
    };
    jwtServiceMock = {
      sign: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: CryptoService,
          useValue: cryptoServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser()', () => {
    it('validates a valid user', async () => {
      const username = 'username';
      const password = 'password';
      const persistedUser: PersistedUser = {
        userId: 1,
        username,
        email: 'email',
        hashedPassword: 'hashedPassword',
      };
      const expectedUserProfile: UserProfile = {
        userId: 1,
        username,
        email: 'email',
      };

      usersServiceMock.findOne.returns(persistedUser);

      const actualUserProfile = await service.validateUser(username, password);

      expect(actualUserProfile).toEqual(expectedUserProfile);
    });

    it('throws when the user does not exist', async () => {
      const username = 'username';
      const password = 'password';

      await expect(service.validateUser(username, password)).rejects.toThrow();
    });

    it('throws when the wrong password is supplied', async () => {
      const username = 'username';
      const password = 'password';
      const persistedUser: PersistedUser = {
        userId: 1,
        username,
        email: 'email',
        hashedPassword: 'hashedPassword',
      };

      usersServiceMock.findOne.returns(persistedUser);
      cryptoServiceMock.verifyAgainstHash.throws();

      await expect(service.validateUser(username, password)).rejects.toThrow();
    });
  });

  describe('login()', () => {
    it('signs the access_token', async () => {
      const signature = 'signature';
      jwtServiceMock.sign.returns(signature);

      const expectedToken = {
        access_token: signature,
      };

      const user: UserProfile = {
        userId: 1,
        username: 'username',
        email: 'email',
      };

      expect(await service.login(user)).toEqual(expectedToken);
    });
  });

  describe('getCookieForLogOut()', () => {
    it('returns empty cookie', () => {
      expect(service.getCookieForLogOut()).toEqual(
        'Authentication=; HttpOnly; Path=/; Max-Age=0'
      );
    });
  });

  describe('signUp()', () => {
    it('throws for a duplicate username or email', async () => {
      const clientUser: ClientUser = {
        userId: 1,
        username: 'username',
        email: 'email',
        password: 'password',
      };

      usersServiceMock.createUser.returns(false);

      await expect(service.signUp(clientUser)).rejects.toThrow();
    });

    it('creates a new user', async () => {
      const expectedUser: ClientUser = {
        userId: 1,
        username: 'username',
        email: 'email',
        password: 'password',
      };

      usersServiceMock.createUser.returns(true);

      const actualUser = await service.signUp(expectedUser);

      expect(actualUser).toEqual(expectedUser);
    });
  });
});
