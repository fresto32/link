import { AppConfigService } from "./config.service";

describe("ConfigService", () => {
  let service: AppConfigService;

  const nestConfigServiceMock = {
    get: jest.fn().mockReturnValue("hello"),
  };

  beforeEach(async () => {
    // @ts-expect-error: Mocking next config service.
    service = new AppConfigService(nestConfigServiceMock);
  });

  describe("databaseUrl", () => {
    it("returns the URL as specified by the nest config service", () => {
      const expectedUrl = "expectedUrl";
      nestConfigServiceMock.get.mockReturnValue(expectedUrl);

      expect(service.databaseUrl).toEqual(expectedUrl);
    });

    it("throws an error when the nest config service has no db.url", () => {
      nestConfigServiceMock.get.mockReturnValue(undefined);

      const fn = () => service.databaseUrl;
      expect(fn).toThrow(Error);
    });
  });
});
