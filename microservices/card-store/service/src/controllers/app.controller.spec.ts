import {ApiResult} from '@link/schema/src/common';
import {
  CardCreated,
  CardStored,
  DeleteCardRequested,
  DeletedCard,
  GetAllUserCardsRequested,
  GotAllUserCards,
  GotNextCard,
  NextCardRequested,
} from '@link/schema/src/events/card';
import {Test, TestingModule} from '@nestjs/testing';
import {DatabaseService} from './../services/database.service';
import {RepositoryService} from './../services/repository.service';
import {AppController} from './app.controller';

describe('AppController', () => {
  let appController: AppController;
  let repositoryService: RepositoryService;
  let clientProxyMock: {
    emit: jest.SpyInstance;
  };

  beforeEach(async () => {
    clientProxyMock = {
      emit: jest.fn(() => {}),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        RepositoryService,
        DatabaseService,
        {
          provide: 'KAFKA',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    repositoryService = app.get<RepositoryService>(RepositoryService);
  });

  describe('handleNextCardRequested', () => {
    it('should emit the result of repositoryService.nextCard()', async done => {
      const event: NextCardRequested = {
        uuid: '12345',
        timestamp: new Date(),
        source: 'Api Gateway',
      };

      jest.spyOn(repositoryService, 'nextCard').mockImplementation(async () => {
        const result: ApiResult = {
          data: 'Some next card',
          error: {message: 'Some error'},
        };

        return result;
      });

      await appController.handleNextCardRequested(event);

      const result: GotNextCard = clientProxyMock.emit.mock.calls[0][1];
      expect(result.uuid).toEqual(event.uuid);
      expect(result.source).toEqual('Card Store');
      expect(result.userCard).toEqual('Some next card');
      expect(result.error?.message).toEqual('Some error');

      done();
    });
  });

  describe('handleGetAllUserCardsRequested', () => {
    it('should emit the result of repositoryService.userCards()', async done => {
      const event: GetAllUserCardsRequested = {
        uuid: '12345',
        timestamp: new Date(),
        source: 'Api Gateway',
      };

      jest
        .spyOn(repositoryService, 'userCards')
        .mockImplementation(async () => {
          const result: ApiResult = {
            data: 'Some cards',
            error: {message: 'Some error'},
          };

          return result;
        });

      await appController.handleGetAllUserCardsRequested(event);

      const result: GotAllUserCards = clientProxyMock.emit.mock.calls[0][1];
      expect(result.uuid).toEqual(event.uuid);
      expect(result.source).toEqual('Card Store');
      expect(result.cards).toEqual('Some cards');
      expect(result.error?.message).toEqual('Some error');

      done();
    });
  });

  describe('handleDeleteCardRequested', () => {
    it('should emit the result of repositoryService.deleteCard()', async done => {
      const event: DeleteCardRequested = {
        uuid: '12345',
        timestamp: new Date(),
        source: 'Api Gateway',
        cardId: 'Some cardId',
      };

      jest.spyOn(repositoryService, 'deleteCard').mockImplementation(() => {
        const result: ApiResult = {
          error: {message: 'Some error'},
        };

        return result;
      });

      appController.handleDeleteCardRequested(event);

      const result: DeletedCard = clientProxyMock.emit.mock.calls[0][1];
      expect(result.uuid).toEqual(event.uuid);
      expect(result.source).toEqual('Card Store');
      expect(result.error?.message).toEqual('Some error');

      done();
    });
  });

  describe('handleCardCreated', () => {
    it('should emit the result of repositoryService.save()', async done => {
      const event: CardCreated = {
        uuid: '12345',
        timestamp: new Date(),
        source: 'Api Gateway',
        // @ts-expect-error: For testing purposes.
        card: 'Some card',
      };

      jest.spyOn(repositoryService, 'saveCard').mockImplementation(async () => {
        const result: ApiResult = {
          data: 'Some cardId',
          error: {message: 'Some error'},
        };

        return result;
      });

      await appController.handleCardCreated(event);

      const result: CardStored = clientProxyMock.emit.mock.calls[0][1];
      expect(result.uuid).toEqual(event.uuid);
      expect(result.source).toEqual('Card Store');
      expect(result.cardId).toEqual('Some cardId');
      expect(result.error?.message).toEqual('Some error');

      done();
    });
  });
});
