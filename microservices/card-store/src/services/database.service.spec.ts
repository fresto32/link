import { ConfigService } from "@link/config";
import { Test, TestingModule } from "@nestjs/testing";
import { mongoose } from "@typegoose/typegoose";
import { DatabaseService } from "./database.service";
import { FixturesService, NUM_CARD_FIXTURES } from "./fixtures.service";
import { RepositoryService } from "./repository.service";
import Sinon, { stub } from "sinon";

describe("DatabaseService", () => {
  let service: DatabaseService;
  let fixturesService: FixturesService;
  let repositoryService: RepositoryService;
  let configServiceMock: { get: Sinon.SinonStub };

  beforeEach(async () => {
    configServiceMock = {
      get: stub(),
    };

    configServiceMock.get
      .withArgs("NODE_ENV")
      .returns("development")
      .withArgs("db.url")
      .returns("mongodb://localhost:27017/development");

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        RepositoryService,
        FixturesService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

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
      configServiceMock.get.withArgs("NODE_ENV").returns("production");

      const dropSpy = spyOn(service.connection(), "dropDatabase");

      await expect(service.dropDatabase()).rejects.toThrow(Error);
      expect(dropSpy.wasCalled).toBeFalsy();
      done();
    });
  });
});
