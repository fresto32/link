import {Test} from '@nestjs/testing';
import {DatabaseService} from './database.service';
import {RepositoryService} from './repository.service';

type mongooseMock = {
  populate: jest.Mock;
  find: jest.Mock;
  exec: jest.Mock;
  lean: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  deleteOne: jest.Mock;
  sort: jest.Mock;
  findOne: jest.Mock;
};

describe('RepositoryService', () => {
  let repositoryService: RepositoryService;

  let databaseService: DatabaseService;
  let databaseServiceMock: {
    userCardModel: mongooseMock;
    cardSettingsModel: mongooseMock;
  };

  let mongooseMock: mongooseMock;

  beforeEach(async () => {
    mongooseMock = {
      populate: jest.fn(() => mongooseMock),
      find: jest.fn(() => mongooseMock),
      exec: jest.fn(() => mongooseMock),
      lean: jest.fn(() => mongooseMock),
      create: jest.fn(() => mongooseMock),
      save: jest.fn(() => mongooseMock),
      deleteOne: jest.fn(() => mongooseMock),
      sort: jest.fn(() => mongooseMock),
      findOne: jest.fn(() => mongooseMock),
    };

    databaseServiceMock = {
      userCardModel: mongooseMock,
      cardSettingsModel: mongooseMock,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RepositoryService,
        {provide: DatabaseService, useValue: databaseServiceMock},
      ],
    }).compile();

    repositoryService = moduleRef.get<RepositoryService>(RepositoryService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('userCards', () => {
    it('should call all the mongoose functions', async done => {
      await repositoryService.userCards();
      expect((mongooseMock.find as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMock.populate as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMock.exec as jest.Mock).mock.calls).toHaveLength(1);

      done();
    });

    it('should return all the userCard models', async done => {
      const expectedResult = 'Expected result';
      mongooseMock.exec = jest.fn(() => expectedResult);

      const result = await repositoryService.userCards();

      expect(result.data).toEqual(expectedResult);

      done();
    });

    it('should return the error message', async done => {
      // @ts-expect-error: Overwriting function for testing purposes.
      databaseService.userCardModel.exec = () => {
        throw new Error();
      };

      const result = await repositoryService.userCards();

      expect(result.error).toBeDefined();

      done();
    });
  });

  describe('nextCard', () => {
    it('should call all the mongoose functions', async done => {
      await repositoryService.nextCard();
      expect((mongooseMock.findOne as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMock.sort as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMock.populate as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMock.lean as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMock.exec as jest.Mock).mock.calls).toHaveLength(1);

      done();
    });

    it('should return all the next card', async done => {
      const expectedResult = 'Next card';
      mongooseMock.exec = jest.fn(() => expectedResult);

      const result = await repositoryService.nextCard();

      expect(result.data).toEqual(expectedResult);

      done();
    });

    it('should return the error message', async done => {
      // @ts-expect-error: Overwriting function for testing purposes.
      databaseService.userCardModel.exec = () => {
        throw new Error();
      };

      const result = await repositoryService.nextCard();

      expect(result.error).toBeDefined();

      done();
    });
  });

  describe('saveCard', () => {
    it('should call all the mongoose functions', async done => {
      // @ts-expect-error: The argument is not required for this unit test.
      await repositoryService.saveCard();
      expect((mongooseMock.create as jest.Mock).mock.calls).toHaveLength(2);
      expect((mongooseMock.save as jest.Mock).mock.calls).toHaveLength(2);

      done();
    });

    it('should not return data', async done => {
      // @ts-expect-error: The argument is not required for this unit test.
      const result = await repositoryService.saveCard();

      expect(result.data).toBeUndefined();

      done();
    });

    it('should return the error message', async done => {
      databaseService.userCardModel.create = () => {
        throw new Error();
      };

      // @ts-expect-error: The argument is not required for this unit test.
      const result = await repositoryService.saveCard();

      expect(result.error).toBeDefined();

      done();
    });
  });

  describe('deleteCard', () => {
    it('should call all the mongoose functions', async done => {
      // @ts-expect-error: The argument is not required for this unit test.
      repositoryService.deleteCard();
      expect((mongooseMock.deleteOne as jest.Mock).mock.calls).toHaveLength(1);

      done();
    });

    it('should not return data', async done => {
      // @ts-expect-error: The argument is not required for this unit test.
      const result = await repositoryService.deleteCard();

      expect(result.data).toBeUndefined();

      done();
    });

    it('should return the error message', async done => {
      databaseService.userCardModel.deleteOne = () => {
        throw new Error();
      };

      // @ts-expect-error: The argument is not required for this unit test.
      const result = await repositoryService.deleteCard();

      expect(result.error).toBeDefined();

      done();
    });
  });
});
