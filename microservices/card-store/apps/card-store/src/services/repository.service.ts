import {ApiResult, CardSettings, UserCard} from '@link/schema';
import {Injectable} from '@nestjs/common';
import {DatabaseService} from './database.service';

@Injectable()
export class RepositoryService {
  constructor(private databaseService: DatabaseService) {}

  public async userCards() {
    const result: ApiResult = {};

    try {
      result.data = await this.databaseService.userCardModel
        .find()
        .populate('cards')
        .exec();
    } catch (error) {
      result.error = {};
      result.error.message = `Error when retrieving all cards: ${error}`;
    }

    return result;
  }

  public async nextCard(): Promise<ApiResult> {
    const result: ApiResult = {};

    try {
      result.data = await this.databaseService.userCardModel
        .findOne()
        .sort({dueDate: 'ascending'})
        .populate('card')
        .lean()
        .exec();
    } catch (error) {
      result.error = {};
      result.error.message = `Error when retrieving next card: ${error}`;
    }

    return result;
  }

  public async saveCard(card: CardSettings): Promise<ApiResult> {
    const result: ApiResult = {};

    try {
      const cardDocument = await this.databaseService.cardSettingsModel.create(
        card as CardSettings
      );
      await cardDocument.save();

      const userCard = new UserCard();
      userCard.card = cardDocument._id;
      // Typegoose needs to use any for Ref types, see:
      // https://typegoose.github.io/typegoose/docs/guides/known-issues#typesmongoose5722-and-higher

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userCardDocument = await this.databaseService.userCardModel.create<any>(
        userCard as UserCard
      );

      result.data = userCardDocument._id;

      await userCardDocument.save();
    } catch (error) {
      result.error = {
        message: `Error when saving card: ${error.errmsg}`,
      };
    }

    return result;
  }

  public async deleteCard(cardId: string): Promise<ApiResult> {
    const result: ApiResult = {};

    try {
      await this.databaseService.userCardModel.deleteOne({_id: cardId}).exec();
    } catch (error) {
      result.error = {
        message: `Error when deleting card: ${error.errmsg}`,
      };
    }

    return result;
  }
}
