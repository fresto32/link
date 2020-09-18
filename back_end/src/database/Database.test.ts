import {mongoose} from '@typegoose/typegoose';
import * as chai from 'chai';
import {spy} from 'sinon';
import {Database} from './Database';
import {Fixtures, NUM_CARD_FIXTURES} from './Fixtures';
import {Repository} from './Repository';
import chaiAsUsed = require('chai-as-promised');

chai.use(chaiAsUsed);

const expect = chai.expect;

describe('Database', () => {
  describe('connection()', () => {
    it('should return a mongoose.Connection', () => {
      const dbConnection = Database.connection();

      expect(dbConnection instanceof mongoose.Connection).to.be.true;
    });
  });

  describe('drop()', () => {
    afterEach(() => (process.env.NODE_ENV = 'development'));

    it('should drop the database', async () => {
      await Fixtures.add();

      const preDropCards = await Repository.userCards();
      expect(preDropCards.length).to.equal(NUM_CARD_FIXTURES);

      await Database.drop();

      const postDropCards = await Repository.userCards();
      expect(postDropCards).to.be.empty;
    });

    it('should not drop the production database', async () => {
      process.env.NODE_ENV = 'production';

      const dropSpy = spy(Database.connection(), 'dropDatabase');

      await expect(Database.drop()).to.be.rejectedWith(Error);
      expect(dropSpy.notCalled).to.be.true;
    });
  });
});
