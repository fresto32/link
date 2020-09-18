import {Logger} from '@overnightjs/logger';
import {DocumentType} from '@typegoose/typegoose';
import {fail} from 'assert';
import * as chai from 'chai';
import {BAD_REQUEST, OK} from 'http-status-codes';
import * as sinon from 'sinon';
import TestServer from '../../../tests/TestServer.test';
import {Fixtures} from '../../database/Fixtures';
import {Repository} from '../../database/Repository';
import {UserCard} from '../../models/UserCard';
import SchedulerController from './SchedulerController';

const expect = chai.expect;

import chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('SchedulerController Unit Tests', () => {
  const schedulerController = new SchedulerController();
  let server: TestServer;

  beforeEach(async () => {
    server = new TestServer();
    server.setController(schedulerController);
    await Fixtures.add();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('API: "/api/next-card"', () => {
    it('should return a JSON object of a card', async () => {
      const expectedCard = await Repository.nextCard();
      expect(expectedCard).to.not.be.null;

      chai
        .request(server.getExpressInstance())
        .get('/api/next-card/')
        .end((err, res) => {
          if (err) {
            Logger.Err(err, true);
            fail();
          }

          expect(res.status).to.equal(OK);
          expect(res.body).to.not.be.empty;

          const actualNextCard = res.body as DocumentType<UserCard>;

          expect(actualNextCard._id).to.equal(expectedCard!.id);
          expect(actualNextCard.card).to.not.be.undefined;
        });
    });

    it(`should return an ${OK} status code if the message was successful`, () => {
      chai
        .request(server.getExpressInstance())
        .get('/api/next-card/')
        .end((err, res) => {
          if (err) {
            Logger.Err(err, true);
            fail();
          }

          expect(res.status).to.equal(OK);
        });
    });

    it('should return a JSON object with the "error" param', () => {
      const nextCardFake = sinon.fake.throws(new Error());
      sinon.replace(Repository, 'nextCard', nextCardFake);

      chai
        .request(server.getExpressInstance())
        .get('/api/next-card/')
        .end((err, res) => {
          if (err) {
            Logger.Err(err, true);
          }

          expect(res.error.message).not.to.be.empty;
        });
    });

    it(`should return a status code of "${BAD_REQUEST}" if message was unsuccessful`, () => {
      const nextCardFake = sinon.fake.throws(new Error());
      sinon.replace(Repository, 'nextCard', nextCardFake);

      chai
        .request(server.getExpressInstance())
        .get('/api/next-card/')
        .end((err, res) => {
          if (err) {
            Logger.Err(err, true);
          }

          expect(res.status).to.equal(BAD_REQUEST);
        });
    });
  });
});
