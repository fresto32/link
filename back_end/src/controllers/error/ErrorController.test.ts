import * as chai from 'chai';
import {Response} from 'express';
import {INTERNAL_SERVER_ERROR} from 'http-status-codes';
import * as sinon from 'sinon';
import {stubInterface} from 'ts-sinon';
import TestServer from '../../../test/TestServer.test';
import {Fixtures} from '../../database/Fixtures';
import {ApiError} from '../../models/ApiError';
import ErrorController from './ErrorController';

const expect = chai.expect;

import chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('ErrorController Unit Tests', () => {
  const errorController = new ErrorController();
  let server: TestServer;

  beforeEach(async () => {
    server = new TestServer();
    server.setController(errorController);
    await Fixtures.add();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('handle(...)', () => {
    it(`should return a ${INTERNAL_SERVER_ERROR} code`, () => {
      const err = new Error();
      const res = stubInterface<Response>();

      res.status.returns(res);
      res.json.returns(res);

      ErrorController.handle(res, err);

      expect(res.status.calledOnce);
      expect(res.status.args[0][0]).to.equal(INTERNAL_SERVER_ERROR);
    });

    it('should return the message of an Error instance', () => {
      const expectedPayload: ApiError = {
        isError: true,
        message: 'Error occurred.',
      };

      const err = new Error();
      const res = stubInterface<Response>();

      res.status.returns(res);
      res.json.returns(res);

      ErrorController.handle(res, err);

      expect(res.json.calledOnce);
      expect(res.json.args[0][0].isError).to.equal(expectedPayload.isError);
      expect(res.json.args[0][0].message).to.equal(expectedPayload.message);
    });
  });
});
