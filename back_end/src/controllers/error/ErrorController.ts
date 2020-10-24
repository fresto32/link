import {Logger} from '@overnightjs/logger';
import {Response} from 'express';
import {INTERNAL_SERVER_ERROR} from 'http-status-codes';
import {MongoError} from 'mongodb';
import {ApiError} from '../../models/ApiError';

class ErrorController {
  public static handle(res: Response, err: unknown) {
    Logger.Err(err, true);

    let payload: ApiError;

    if (err instanceof Error) {
      payload = {
        isError: true,
        message: err.message || 'Error occurred.',
      };
      Logger.Err(err.message);
    } else if (err instanceof MongoError) {
      payload = {
        isError: true,
        message: err.errmsg || err.message,
      };
    } else {
      payload = {
        isError: true,
        message: 'Unknown error occurred',
      };
    }
    return res.status(INTERNAL_SERVER_ERROR).json(payload);
  }
}

export default ErrorController;
