import { join } from "path";
import { config, baseConfig } from "./config";

describe("config", () => {
  beforeEach(() => {
    process.env.CONFIG_PATH = join(
      __dirname,
      "..",
      "test",
      "config_files",
      "config.dev.yml"
    );
    process.env.BASE_CONFIG_PATH = join(
      __dirname,
      "..",
      "test",
      "config_files",
      "config.base.yml"
    );
  });

  describe("config", () => {
    it("returns expected database URL from config", () => {
      expect(config().db.url).toEqual("mongodb://localhost:27017/development");
    });

    it("returns expected Kafka broker url from config", () => {
      expect(config().kafka.broker.url).toEqual("localhost:9092");
    });

    it("throws if there is no CONFIG_PATH in env", () => {
      delete process.env.CONFIG_PATH;

      expect(config).toThrowError("No CONFIG_PATH set in env.");
    });
  });

  describe("baseConfig", () => {
    it("returns expected log level from base config", () => {
      const config = baseConfig();
      expect(config.log.level).toEqual("DEBUG");
    });

    it("returns expected NODE_ENV from base config", () => {
      const config = baseConfig();
      expect(config.NODE_ENV).toEqual("development");
    });

    it("throws if there is no BASE_CONFIG_PATH in env", () => {
      delete process.env.BASE_CONFIG_PATH;

      expect(baseConfig).toThrowError("No BASE_CONFIG_PATH set in env.");
    });
  });
});
