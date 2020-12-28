import {Injectable} from '@nestjs/common';
import {DocumentType} from '@typegoose/typegoose';
import {CardSettings, UserCard} from '@link/schema/src/card';
import {CardSettingsGenerator} from '@link/schema/src/generator';
import {DatabaseService} from './database.service';

export const NUM_CARD_FIXTURES = 20;

@Injectable()
export class FixturesService {
  constructor(private databaseService: DatabaseService) {}

  public async add() {
    await this.databaseService.dropDatabase();
    await this.addCardFixtures();
  }

  private async addCardFixtures(NumCards: number = NUM_CARD_FIXTURES) {
    for (let i = 0; i < NumCards; i++) {
      const cardDocument = await this.createCard();
      await this.createUserCardFor(cardDocument);
    }
  }

  private async createCard() {
    const card: CardSettings = new CardSettingsGenerator();
    const cardDocument = await this.databaseService.cardSettingsModel.create(
      card as CardSettings
    );

    await cardDocument.save();
    return cardDocument;
  }

  private async createUserCardFor(cardDocument: DocumentType<CardSettings>) {
    const userCard = new UserCard();
    userCard.card = cardDocument._id;

    // Typegoose needs to use any for Ref types, see:
    // https://typegoose.github.io/typegoose/docs/guides/known-issues#typesmongoose5722-and-higher

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userCardDocument = await this.databaseService.userCardModel.create<any>(
      userCard as UserCard
    );

    await userCardDocument.save();
  }
}
