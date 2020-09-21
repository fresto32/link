import {getModelForClass, prop, Ref} from '@typegoose/typegoose';
import {Database} from '../database/Database';
import {CardSettingsGenerator} from '../database/generator/Generator';

/**
 * A Card that is associated with a User account.
 */
export class UserCard {
  /**
   * The card for this UserCard.
   */
  @prop({ref: 'Card'})
  public card!: Ref<CardSettingsGenerator>;

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
