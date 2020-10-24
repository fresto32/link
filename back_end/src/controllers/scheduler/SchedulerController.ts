import {Controller, Get} from '@overnightjs/core';
import {Request, Response} from 'express';
import {OK} from 'http-status-codes';
import {Repository} from '../../database/Repository';
import ErrorController from '../error/ErrorController';

@Controller('api/next-card')
class SchedulerController {
  @Get()
  private async nextCard(req: Request, res: Response) {
    try {
      const nextCard = await Repository.nextCard();
      return res.status(OK).json(nextCard);
    } catch (err) {
      return ErrorController.handle(res, err);
    }
  }
}

export default SchedulerController;
