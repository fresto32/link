import {Event} from '../Event';

export interface CardStored extends Event {
  cardId: string;
}
