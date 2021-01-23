import {ApiResult} from '@link/schema/src/common';
import {
  CardCreated,
  CardStored,
  DeleteCardRequested,
  DeletedCard,
  EventPatterns,
  GetAllUserCardsRequested,
  GotAllUserCards,
  GotNextCard,
  NextCardRequested,
} from '@link/schema/src/events/card';
import {Test, TestingModule} from '@nestjs/testing';
import {CardStoreController} from './card-store.controller';
import {DatabaseService} from './../services/database.service';
import {RepositoryService} from './../services/repository.service';
import {EventEmitter2} from '@nestjs/event-emitter';

describe('CardStoreController', () => {
  let controller: CardStoreController;
  let repositoryService: RepositoryService;
  let clientProxyMock: {
    emit: jest.SpyInstance;
  };
  let eventEmitterMock: {
    emit: jest.SpyInstance;
  };

  beforeEach(async () => {
    clientProxyMock = {
      emit: jest.fn(() => {}),
    };
    eventEmitterMock = {
      emit: jest.fn(() => {}),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [CardStoreController],
      providers: [
        RepositoryService,
        DatabaseService,
        {
          provide: 'KAFKA',
          useValue: clientProxyMock,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitterMock,
        },
      ],
    }).compile();

    controller = app.get<CardStoreController>(CardStoreController);
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

      await controller.handleNextCardRequested(event);

      const result: {pattern: EventPatterns; payload: GotNextCard} =
        clientProxyMock.emit.mock.calls[0][1];
      expect(result.pattern).toEqual(EventPatterns.gotNextCard);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual('Card Store');
      expect(result.payload.userCard).toEqual('Some next card');
      expect(result.payload.error?.message).toEqual('Some error');

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

      await controller.handleGetAllUserCardsRequested(event);

      const result: {pattern: EventPatterns; payload: GotAllUserCards} =
        clientProxyMock.emit.mock.calls[0][1];
      expect(result.pattern).toEqual(EventPatterns.gotNextCard);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual('Card Store');
      expect(result.payload.cards).toEqual('Some cards');
      expect(result.payload.error?.message).toEqual('Some error');

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

      controller.handleDeleteCardRequested(event);

      const result: {pattern: EventPatterns; payload: DeletedCard} =
        clientProxyMock.emit.mock.calls[0][1];
      expect(result.pattern).toEqual(EventPatterns.deletedCard);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual('Card Store');
      expect(result.payload.error?.message).toEqual('Some error');

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

      await controller.handleCardCreated(event);

      const result: {pattern: EventPatterns; payload: CardStored} =
        clientProxyMock.emit.mock.calls[0][1];
      expect(result.pattern).toEqual(EventPatterns.cardStored);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual('Card Store');
      expect(result.payload.cardId).toEqual('Some cardId');
      expect(result.payload.error?.message).toEqual('Some error');

      done();
    });
  });
});
