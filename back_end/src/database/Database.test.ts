import {mongoose} from '@typegoose/typegoose';
import * as chai from 'chai';
import {Database} from './Database';
import {Fixtures, NUM_CARD_FIXTURES} from './Fixtures';
import {Repository} from './Repository';

const expect = chai.expect;

describe('Database', () => {
  describe('connection()', () => {
    it('should return a mongoose.Connection', () => {
      const dbConnection = Database.connection();

      expect(dbConnection instanceof mongoose.Connection).to.be.true;
    });
  });
  describe('drop()', () => {
    it('should drop the database', async () => {
      await Fixtures.add();

      const preDropCards = await Repository.userCards();
      expect(preDropCards.length).to.equal(NUM_CARD_FIXTURES);

      await Database.drop();

      const postDropCards = await Repository.userCards();
      expect(postDropCards).to.be.empty;
    });
  });
});
