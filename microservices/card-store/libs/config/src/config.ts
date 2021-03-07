import { readFileSync } from "fs";
import * as yaml from "js-yaml";

/**
 * Returns the configuration settings that are particular to the given service.
 */
export function config(): any {
  const path = process.env.CONFIG_PATH;

  if (!path) {
    throw new Error("No CONFIG_PATH set in env.");
  }

  return yaml.load(readFileSync(path, "utf8"));
}

/**
 * Returns the configuration settings that are service agnostic. (In other words,
 * settings such as LOG level).
 */
export function baseConfig(): any {
  const path = process.env.BASE_CONFIG_PATH;

  if (!path) {
    throw new Error("No BASE_CONFIG_PATH set in env.");
  }

  return yaml.load(readFileSync(path, "utf8"));
}
