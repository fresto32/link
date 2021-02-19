import { environmentConfig, baseConfig } from "./config";

describe("config", () => {
  describe("environmentConfig", () => {
    it("returns production config", () => {
      process.env.NODE_ENV = "production";
      const config = environmentConfig();
      expect(config.db.url).toEqual("mongodb://localhost:27017/production");
    });

    it("returns development config", () => {
      process.env.NODE_ENV = "development";
      const config = environmentConfig();
      expect(config.db.url).toEqual("mongodb://localhost:27017/development");
    });

    it("returns test config", () => {
      process.env.NODE_ENV = "development";
      const config = environmentConfig();
      expect(config.db.url).toEqual("mongodb://localhost:27017/development");
    });

    it("defaults config to development config", () => {
      process.env.NODE_ENV = "";
      const config = environmentConfig();
      expect(config.db.url).toEqual("mongodb://localhost:27017/development");
    });
  });

  describe("baseConfig", () => {
    it("returns base config", () => {
      const config = baseConfig();
      expect(config).toBeTruthy();
    });
  });
});
