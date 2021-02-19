import { Test } from "@nestjs/testing";
import { DatabaseService } from "./database.service";
import { FixturesService, NUM_CARD_FIXTURES } from "./fixtures.service";
import { RepositoryService } from "./repository.service";

describe("FixturesService", () => {
  let fixturesService: FixturesService;

  let repositoryServiceMock: {
    saveCard: jest.FunctionLike;
  };
  let databaseServiceMock: {
    dropDatabase: jest.FunctionLike;
  };

  beforeEach(async () => {
    databaseServiceMock = {
      dropDatabase: jest.fn(),
    };
    repositoryServiceMock = {
      saveCard: jest.fn(),
    };

    process.env.NODE_ENV = "development";

    const moduleRef = await Test.createTestingModule({
      providers: [FixturesService, DatabaseService, RepositoryService],
    })
      .overrideProvider(DatabaseService)
      .useValue(databaseServiceMock)
      .overrideProvider(RepositoryService)
      .useValue(repositoryServiceMock)
      .compile();

    fixturesService = moduleRef.get<FixturesService>(FixturesService);
  });

  describe("add()", () => {
    it("drops the current database", async (done) => {
      await fixturesService.add();

      expect(databaseServiceMock.dropDatabase).toHaveBeenCalled();

      done();
    });

    it("drops the current database", async (done) => {
      await fixturesService.add();

      expect(repositoryServiceMock.saveCard).toHaveBeenCalledTimes(
        NUM_CARD_FIXTURES
      );

      done();
    });
  });
});
