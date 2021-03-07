import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";
import { ono } from "ono";

/**
 * Service that handles the card store's configuration
 * variables.
 */
@Injectable()
export class ConfigService {
  constructor(public nestConfigService: NestConfigService) {}

  /**
   * Try to get the value of `key` from configuration. Throw an error
   * if it is not found.
   */
  get<T>(key: string): T {
    const value = this.nestConfigService.get<T>(key);

    if (!value) {
      throw ono(`Key of ${key} is not set in environment.`);
    }

    return value;
  }
}
