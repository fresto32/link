import {Logger} from '@link/logger';
import {CardSettings, CardSettingsGenerator} from '@link/schema';
import {Injectable} from '@nestjs/common';
import {DatabaseService} from './database.service';
import {RepositoryService} from './repository.service';

export const NUM_CARD_FIXTURES = 20;

@Injectable()
export class FixturesService {
  private logger = Logger.create('FixturesService');

  constructor(
    private repositoryService: RepositoryService,
    private databaseService: DatabaseService
  ) {}

  /**
   * Adds card fixtures.
   */
  public async add() {
    await this.databaseService.dropDatabase();
    await this.addCardFixtures();

    this.logger.info('Added database fixtures');
  }

  private async addCardFixtures(NumCards: number = NUM_CARD_FIXTURES) {
    for (let i = 0; i < NumCards; i++) {
      const card: CardSettings = new CardSettingsGenerator();
      await this.repositoryService.saveCard(card);
    }
  }
}
