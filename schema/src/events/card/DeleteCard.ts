import {Event} from '../Event';

export interface DeleteCardRequested extends Event {
  cardId: string;
}

export interface DeletedCard extends Event {
  cardId: string;
}
