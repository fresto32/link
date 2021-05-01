import {Event} from '../Event';
import {UserCard} from '../../card';

export interface GetAllUserCardsRequested extends Event {}

export interface GotAllUserCards extends Event {
  cards: UserCard[];
}
