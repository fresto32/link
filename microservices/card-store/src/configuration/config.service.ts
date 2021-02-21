import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

/**
 * Service that handles the card store's configuration
 * variables.
 */
@Injectable()
export class AppConfigService {
  constructor(public nestConfigService: NestConfigService) {}

  get databaseUrl(): string {
    const dbUrl = this.nestConfigService.get<string>("db.url");

    if (!dbUrl) {
      throw new Error("Database URL is not set in environment");
    }

    return dbUrl;
  }

  get nodeEnvironment(): string {
    const nodeEnv = this.nestConfigService.get<string>("NODE_ENV");

    if (!nodeEnv) {
      throw new Error("NODE_ENV is not set in environment");
    }

    return nodeEnv;
  }
}
