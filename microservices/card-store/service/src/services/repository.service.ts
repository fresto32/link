import {Injectable} from '@nestjs/common';
import {UserCard} from '@link/schema/src/card';
import {DatabaseService} from './database.service';

@Injectable()
export class RepositoryService {
  constructor(private databaseService: DatabaseService) {}

  public async userCards() {
    return await this.databaseService.userCardModel
      .find()
      .populate('cards')
      .exec();
  }

  public async nextCard(): Promise<UserCard | null> {
    return this.databaseService.userCardModel
      .findOne()
      .sort({dueDate: 'ascending'})
      .populate('card')
      .lean()
      .exec();
  }
}
