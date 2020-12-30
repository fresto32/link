import {Injectable} from '@nestjs/common';
import {CardSettings} from '@link/schema/src/card';
import {CardSettingsGenerator} from '@link/schema/src/generator';
import {DatabaseService} from './database.service';
import {RepositoryService} from './repository.service';

export const NUM_CARD_FIXTURES = 20;

@Injectable()
export class FixturesService {
  constructor(
    private repositoryService: RepositoryService,
    private databaseService: DatabaseService
  ) {}

  public async add() {
    await this.databaseService.dropDatabase();
    await this.addCardFixtures();
  }

  private async addCardFixtures(NumCards: number = NUM_CARD_FIXTURES) {
    for (let i = 0; i < NumCards; i++) {
      const card: CardSettings = new CardSettingsGenerator();
      await this.repositoryService.saveCard(card);
    }
  }
}
