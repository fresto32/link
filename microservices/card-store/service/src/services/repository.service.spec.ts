import {Test} from '@nestjs/testing';
import {DatabaseService} from './database.service';
import {RepositoryService} from './repository.service';

describe('RepositoryService', () => {
  let repositoryService: RepositoryService;
  let databaseService: DatabaseService;

  let mongooseMocks: any;
  let databaseServiceMock: any;

  beforeEach(async () => {
    mongooseMocks = {
      populate: jest.fn(() => mongooseMocks),
      find: jest.fn(() => mongooseMocks),
      exec: jest.fn(() => mongooseMocks),
      lean: jest.fn(() => mongooseMocks),
      create: jest.fn(() => mongooseMocks),
      save: jest.fn(() => mongooseMocks),
      deleteOne: jest.fn(() => mongooseMocks),
      sort: jest.fn(() => mongooseMocks),
      findOne: jest.fn(() => mongooseMocks),
    };

    databaseServiceMock = {
      userCardModel: mongooseMocks,
      cardSettingsModel: mongooseMocks,
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
      expect((mongooseMocks.find as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMocks.populate as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMocks.exec as jest.Mock).mock.calls).toHaveLength(1);

      done();
    });

    it('should return all the userCard models', async done => {
      const expectedResult = 'Expected result';
      mongooseMocks.exec = jest.fn(() => expectedResult);

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
      expect((mongooseMocks.findOne as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMocks.sort as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMocks.populate as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMocks.lean as jest.Mock).mock.calls).toHaveLength(1);
      expect((mongooseMocks.exec as jest.Mock).mock.calls).toHaveLength(1);

      done();
    });

    it('should return all the next card', async done => {
      const expectedResult = 'Next card';
      mongooseMocks.exec = jest.fn(() => expectedResult);

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
      expect((mongooseMocks.create as jest.Mock).mock.calls).toHaveLength(2);
      expect((mongooseMocks.save as jest.Mock).mock.calls).toHaveLength(2);

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
      expect((mongooseMocks.deleteOne as jest.Mock).mock.calls).toHaveLength(1);

      done();
    });

    it('should not return data', async done => {
      // @ts-expect-error: The argument is not required for this unit test.
      const result = repositoryService.deleteCard();

      expect(result.data).toBeUndefined();

      done();
    });

    it('should return the error message', () => {
      databaseService.userCardModel.deleteOne = () => {
        throw new Error();
      };

      // @ts-expect-error: The argument is not required for this unit test.
      const result = repositoryService.deleteCard();

      expect(result.error).toBeDefined();
    });
  });
});
