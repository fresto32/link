import {Test} from '@nestjs/testing';
import {DatabaseService} from './database.service';
import {FixturesService, NUM_CARD_FIXTURES} from './fixtures.service';
import {RepositoryService} from './repository.service';
import {mocked} from 'ts-jest/utils';

describe('FixturesService', () => {
  let fixturesService: FixturesService;
  let repositoryService: RepositoryService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    process.env.NODE_ENV = 'development';

    const moduleRef = await Test.createTestingModule({
      providers: [FixturesService, DatabaseService, RepositoryService],
    }).compile();

    fixturesService = moduleRef.get<FixturesService>(FixturesService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
    repositoryService = moduleRef.get<RepositoryService>(RepositoryService);

    await databaseService.dropDatabase();
    expect((await repositoryService.userCards()).data.length).toEqual(0);
  });

  describe('add()', () => {
    let userCardModelMock: {
      create: jest.Mock;
    };
    let userCardDocumentMock: {
      save: jest.Mock;
    };
    let cardSettingsModelMock: {
      create: jest.Mock;
    };
    let cardSettingsDocumentMock: {
      save: jest.Mock;
    };

    beforeEach(() => {
      userCardDocumentMock = {
        save: jest.fn(() => 0),
      };
      userCardModelMock = {
        create: jest.fn(() => userCardDocumentMock),
      };

      cardSettingsDocumentMock = {
        save: jest.fn(() => 0),
      };
      cardSettingsModelMock = {
        create: jest.fn(() => cardSettingsDocumentMock),
      };

      mocked(databaseService.userCardModel, true);
      mocked(databaseService.cardSettingsModel, true);

      databaseService.userCardModel.create = userCardModelMock.create;
      databaseService.cardSettingsModel.create = cardSettingsModelMock.create;
    });

    it('should add fixtures', async done => {
      await fixturesService.add();

      expect(cardSettingsModelMock.create.mock.calls.length).toEqual(
        NUM_CARD_FIXTURES
      );
      expect(cardSettingsDocumentMock.save.mock.calls.length).toEqual(
        NUM_CARD_FIXTURES
      );

      expect(userCardModelMock.create.mock.calls.length).toEqual(
        NUM_CARD_FIXTURES
      );
      expect(userCardDocumentMock.save.mock.calls.length).toEqual(
        NUM_CARD_FIXTURES
      );

      done();
    });
  });
});
