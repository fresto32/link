import {Controller, Get} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import {Request, Response} from 'express';
import {BAD_REQUEST, OK} from 'http-status-codes';
import {Repository} from '../../database/Repository';

@Controller('api/next-card')
class SchedulerController {
  @Get()
  private async nextCard(req: Request, res: Response) {
    try {
      const nextCard = await Repository.nextCard();
      return res.status(OK).json(nextCard);
    } catch (err) {
      Logger.Err(err, true);
      return res.status(BAD_REQUEST).json({
        error: err.message,
      });
    }
  }
}

export default SchedulerController;
