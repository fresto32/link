import {CardToWatch} from './CardToWatch';
import {Event} from '../Event';

export interface CardToWatchEvent extends Event {
  cardToWatch: CardToWatch;
}
