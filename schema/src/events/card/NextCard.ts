import {UserCard} from '../../card';
import {Event} from '../Event';

export interface NextCardRequested extends Event {}

export interface GotNextCard extends Event {
  userCard: UserCard;
}
