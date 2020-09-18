import {getModelForClass, prop, Ref} from '@typegoose/typegoose';
import {Card} from '../database/generator/Generator';
import {Database} from '../database/Database';

/**
 * A Card that is associated with a User account.
 */
export class UserCard {
  /**
   * The card for this UserCard.
   */
  @prop({ref: 'Card'})
  public card!: Ref<Card>;

  /**
   * When this card is due to be revised.
   */
  @prop()
  public dueDate!: Date;

  /**
   * The couplets of [Date, success] that represent the dates this card was
   * played and its result.
   */
  @prop()
  public history!: [Date, boolean][];

  constructor() {
    this.dueDate = new Date();
    this.history = [];
  }
}

export const UserCardModel = getModelForClass(UserCard, {
  existingConnection: Database.connection(),
});
