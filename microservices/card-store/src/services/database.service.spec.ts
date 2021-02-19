import { mongoose } from "@typegoose/typegoose";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "./database.service";
import { FixturesService, NUM_CARD_FIXTURES } from "./fixtures.service";
import { RepositoryService } from "./repository.service";
import { ConfigService } from "../configuration/config.service";

describe("DatabaseService", () => {
  let service: DatabaseService;
  let fixturesService: FixturesService;
  let repositoryService: RepositoryService;

  const configServiceMock = {
    databaseUrl: "mongodb://localhost:27017/development",
  };

  beforeEach(async () => {
    process.env.NODE_ENV = "development";

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        RepositoryService,
        FixturesService,
        ConfigService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = app.get<DatabaseService>(DatabaseService);
    fixturesService = app.get<FixturesService>(FixturesService);
    repositoryService = app.get<RepositoryService>(RepositoryService);
  });

  describe("connection()", () => {
    it("should return a mongoose.Connection", () => {
      const dbConnection = service.connection();

      expect(dbConnection instanceof mongoose.Connection).toBeTruthy();
    });
  });

  describe("drop()", () => {
    afterEach(() => (process.env.NODE_ENV = "development"));

    it("should drop the database", async () => {
      await fixturesService.add();

      const preDropCards = await repositoryService.userCards();
      expect(preDropCards.data.length).toEqual(NUM_CARD_FIXTURES);

      await service.dropDatabase();

      const postDropCards = await repositoryService.userCards();
      expect(postDropCards.data.length).toEqual(0);
    });

    it("should not drop the production database", async (done) => {
      process.env.NODE_ENV = "production";

      const dropSpy = spyOn(service.connection(), "dropDatabase");

      await expect(service.dropDatabase()).rejects.toThrow(Error);
      expect(dropSpy.wasCalled).toBeFalsy();
      done();
    });
  });
});
