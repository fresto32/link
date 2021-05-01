import {AuthService} from '@link/auth';
import {ClientUser} from '@link/schema';
import {Test, TestingModule} from '@nestjs/testing';
import {Request} from 'express';
import {SinonStub, stub} from 'sinon';
import {mock} from 'ts-mockito';
import {AccountController} from './account.controller';

describe('AccountController', () => {
  let accountController: AccountController;
  let authServiceMock: {
    login: SinonStub;
    getCookieForLogOut: SinonStub;
    signUp: SinonStub;
  };

  beforeEach(async () => {
    // Building mocks...
    authServiceMock = {
      login: stub(),
      getCookieForLogOut: stub(),
      signUp: stub(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    accountController = app.get<AccountController>(AccountController);
  });

  it('should be instantiated', () => {
    expect(accountController).toBeTruthy();
  });

  describe('login()', () => {
    it('calls authService.login()', () => {
      const req: Request = mock<Request>();
      accountController.login(req);
      expect(authServiceMock.login.called);
    });
  });

  describe('logout()', () => {
    it('calls authService.getCookieForLogOut()', () => {
      const req: Request = mock<Request>();
      accountController.logout(req);
      expect(authServiceMock.getCookieForLogOut.called);
    });
  });

  describe('signUp()', () => {
    it('calls authService.signUp()', () => {
      const clientUser: ClientUser = mock<ClientUser>();
      accountController.signUp(clientUser);
      expect(authServiceMock.signUp.called);
    });
  });
});
