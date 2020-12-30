import {ApiError} from '../common';

export interface Event {
  uuid: string;
  timestamp: Date;
  source: 'Card Store' | 'Card Generator' | 'Card Scheduler' | 'Api Gateway';
  error?: ApiError;
}
