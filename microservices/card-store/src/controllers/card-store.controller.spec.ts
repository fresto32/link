import { Topics } from "@link/schema/build/src/topics";
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
} from "@link/schema/src/events/card";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { RepositoryService } from "./../services/repository.service";
import { CardStoreController } from "./card-store.controller";

describe("CardStoreController", () => {
  let controller: CardStoreController;
  let repositoryServiceMock: {
    nextCard: jest.Mock;
    userCards: jest.Mock;
    saveCard: jest.Mock;
    deleteCard: jest.Mock;
  };
  let clientProxyMock: {
    emit: jest.SpyInstance;
  };
  let eventEmitterMock: {
    emit: jest.SpyInstance;
  };

  beforeEach(async () => {
    // Build mocks...
    repositoryServiceMock = {
      nextCard: jest.fn(),
      userCards: jest.fn(),
      saveCard: jest.fn(),
      deleteCard: jest.fn(),
    };
    clientProxyMock = {
      emit: jest.fn(() => {}),
    };
    eventEmitterMock = {
      emit: jest.fn(() => {}),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [CardStoreController],
      providers: [
        {
          provide: RepositoryService,
          useValue: repositoryServiceMock,
        },
        {
          provide: "KAFKA",
          useValue: clientProxyMock,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitterMock,
        },
      ],
    }).compile();

    controller = app.get<CardStoreController>(CardStoreController);
  });

  describe("handleCard", () => {
    it("emits an event for a card event", async () => {
      const expectedPattern = "Some pattern";
      const expectedPayload = "Some payload";

      const event = {
        value: {
          pattern: expectedPattern,
          payload: expectedPayload,
        },
      };

      // @ts-expect-error: Mocking event argument.
      await controller.handleCard(event);

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        expectedPattern,
        expectedPayload
      );
    });
  });

  describe("handleNextCardRequested", () => {
    it("should emit the result of repositoryService.nextCard()", async (done) => {
      const event: NextCardRequested = {
        uuid: "12345",
        timestamp: new Date(),
        source: "Api Gateway",
      };

      repositoryServiceMock.nextCard.mockReturnValue({
        data: "Some next card",
        error: { message: "Some error" },
      });

      await controller.handleNextCardRequested(event);

      const result: { pattern: EventPatterns; payload: GotNextCard } =
        clientProxyMock.emit.mock.calls[0][1].value;
      expect(result.pattern).toEqual(EventPatterns.gotNextCard);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual("Card Store");
      expect(result.payload.userCard).toEqual("Some next card");
      expect(result.payload.error?.message).toEqual("Some error");

      const topic: string = clientProxyMock.emit.mock.calls[0][0];
      expect(topic).toEqual(Topics.card);

      done();
    });
  });

  describe("handleGetAllUserCardsRequested", () => {
    it("should emit the result of repositoryService.userCards()", async (done) => {
      const event: GetAllUserCardsRequested = {
        uuid: "12345",
        timestamp: new Date(),
        source: "Api Gateway",
      };

      repositoryServiceMock.userCards.mockReturnValue({
        data: "Some cards",
        error: { message: "Some error" },
      });

      await controller.handleGetAllUserCardsRequested(event);

      const result: { pattern: EventPatterns; payload: GotAllUserCards } =
        clientProxyMock.emit.mock.calls[0][1].value;

      expect(result.pattern).toEqual(EventPatterns.gotNextCard);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual("Card Store");
      expect(result.payload.cards).toEqual("Some cards");
      expect(result.payload.error?.message).toEqual("Some error");

      const topic: string = clientProxyMock.emit.mock.calls[0][0];
      expect(topic).toEqual(Topics.card);

      done();
    });
  });

  describe("handleDeleteCardRequested", () => {
    it("should emit the result of repositoryService.deleteCard()", async (done) => {
      const event: DeleteCardRequested = {
        uuid: "12345",
        timestamp: new Date(),
        source: "Api Gateway",
        cardId: "Some cardId",
      };

      repositoryServiceMock.deleteCard.mockReturnValue({
        error: { message: "Some error" },
      });

      await controller.handleDeleteCardRequested(event);

      const result: { pattern: EventPatterns; payload: DeletedCard } =
        clientProxyMock.emit.mock.calls[0][1].value;
      expect(result.pattern).toEqual(EventPatterns.deletedCard);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual("Card Store");
      expect(result.payload.error?.message).toEqual("Some error");

      const topic: string = clientProxyMock.emit.mock.calls[0][0];
      expect(topic).toEqual(Topics.card);

      done();
    });
  });

  describe("handleCardCreated", () => {
    it("should emit the result of repositoryService.save()", async (done) => {
      const event: CardCreated = {
        uuid: "12345",
        timestamp: new Date(),
        source: "Api Gateway",
        // @ts-expect-error: For testing purposes.
        card: "Some card",
      };

      repositoryServiceMock.saveCard.mockReturnValue({
        data: "Some cardId",
        error: { message: "Some error" },
      });

      await controller.handleCardCreated(event);

      const result: { pattern: EventPatterns; payload: CardStored } =
        clientProxyMock.emit.mock.calls[0][1].value;
      expect(result.pattern).toEqual(EventPatterns.cardStored);
      expect(result.payload.uuid).toEqual(event.uuid);
      expect(result.payload.source).toEqual("Card Store");
      expect(result.payload.cardId).toEqual("Some cardId");
      expect(result.payload.error?.message).toEqual("Some error");

      const topic: string = clientProxyMock.emit.mock.calls[0][0];
      expect(topic).toEqual(Topics.card);

      done();
    });
  });
});
