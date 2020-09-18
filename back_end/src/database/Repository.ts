import {UserCardModel} from '../models/UserCard';

export class Repository {
  static async userCards() {
    return await UserCardModel.find().populate('cards').exec();
  }

  static async nextCard() {
    return await UserCardModel.findOne()
      .sort({dueData: 'ascending'})
      .populate('cards')
      .exec();
  }
}
