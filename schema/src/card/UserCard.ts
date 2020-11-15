import {Ref, getModelForClass, prop} from '@typegoose/typegoose';
import {CardSettings} from './CardSettings';
import {Connection} from 'mongoose';

/**
 * A Card that is associated with a User account.
 */
export class UserCard {
  /**
   * The card for this UserCard.
   */
  @prop({ref: () => CardSettings})
  public card!: Ref<CardSettings>;

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

export function userCardModel(connection: Connection) {
  getModelForClass(UserCard, {
    existingConnection: connection,
  });
}
