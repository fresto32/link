import {Logger} from './logger';

describe('Logger', () => {
  describe('create', () => {
    it('returns a WinstonLogger instance', () => {
      const logger = Logger.create('Some context');
      expect(logger).toBeTruthy();
    });
  });
});
