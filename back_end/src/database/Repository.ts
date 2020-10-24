import {UserCard, UserCardModel} from '../models/UserCard';

export class Repository {
  static async userCards() {
    return await UserCardModel.find().populate('cards').exec();
  }

  static async nextCard(): Promise<UserCard | null> {
    return UserCardModel.findOne()
      .sort({dueDate: 'ascending'})
      .populate('card')
      .lean()
      .exec();
  }
}
