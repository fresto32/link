import {ApiError} from './ApiError';

export interface ApiResult {
  data?: any;
  message?: string;
  error?: ApiError;
}
