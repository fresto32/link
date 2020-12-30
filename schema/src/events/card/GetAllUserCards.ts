import {UserCard} from '../../card';
import {Event} from '../Event';

export interface GetAllUserCardsRequested extends Event {}

export interface GotAllUserCards extends Event {
  cards: UserCard[];
}
