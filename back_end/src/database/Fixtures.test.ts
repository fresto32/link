import * as chai from 'chai';
import {Database} from './Database';
import {Fixtures, NUM_CARD_FIXTURES} from './Fixtures';
import {Repository} from './Repository';

const expect = chai.expect;

describe('Fixtures', () => {
  describe('add()', () => {
    it('should add fixtures', async () => {
      Database.drop();
      expect(await Repository.userCards()).to.be.empty;

      await Fixtures.add();
      const cards = await Repository.userCards();
      expect(cards.length).to.equal(NUM_CARD_FIXTURES);
    });

    it('should not add more fixtures than NUM_CARD_FIXTURES', async () => {
      Database.drop();
      expect(await Repository.userCards()).to.be.empty;

      for (let i = 0; i < 3; i++) {
        await Fixtures.add();
        const cards = await Repository.userCards();
        expect(cards.length).to.equal(NUM_CARD_FIXTURES);
      }
    });
  });
});
