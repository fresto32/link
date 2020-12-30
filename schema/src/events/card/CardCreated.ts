import {CardSettings} from '../../card';
import {Event} from '../Event';

export interface CardCreated extends Event {
  card: CardSettings;
}
