import {DeleteCardRequested, DeletedCard} from './DeleteCard';
import {GetAllUserCardsRequested, GotAllUserCards} from './GetAllUserCards';
import {GotNextCard, NextCardRequested} from './NextCard';
import {CardCreated} from './CardCreated';
import {CardStored} from './CardStored';
import {EventPatterns} from '../EventPatterns';

export type CardEvent = {
  pattern: EventPatterns;
  payload:
    | CardCreated
    | CardStored
    | DeletedCard
    | DeleteCardRequested
    | GetAllUserCardsRequested
    | GotAllUserCards
    | NextCardRequested
    | GotNextCard;
};
