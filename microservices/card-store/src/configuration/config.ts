import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";

const CONFIG_PROD_FILENAME = "./assets/config.prod.yml";
const CONFIG_DEV_FILENAME = "./assets/config.dev.yml";
const CONFIG_BASE_FILENAME = "./assets/config.base.yml";

export function environmentConfig(): any {
  let environmentConfigFilename: string;

  switch (process.env.NODE_ENV) {
    case "development":
      environmentConfigFilename = CONFIG_DEV_FILENAME;
      break;
    case "test":
      environmentConfigFilename = CONFIG_DEV_FILENAME;
      break;
    case "production":
      environmentConfigFilename = CONFIG_PROD_FILENAME;
      break;
    default:
      environmentConfigFilename = CONFIG_DEV_FILENAME;
      console.warn("No NODE_ENV set");
  }

  return yaml.load(
    readFileSync(join(__dirname, environmentConfigFilename), "utf8")
  );
}

export function baseConfig(): any {
  return yaml.load(readFileSync(join(__dirname, CONFIG_BASE_FILENAME), "utf8"));
}
