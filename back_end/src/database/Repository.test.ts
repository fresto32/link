import {fail} from 'assert';
import * as chai from 'chai';
import {ObjectID} from 'mongodb';
import {Fixtures, NUM_CARD_FIXTURES} from './Fixtures';
import {Repository} from './Repository';

const expect = chai.expect;

describe('Repository', () => {
  beforeEach(async () => {
    await Fixtures.add();
  });

  describe('userCards()', () => {
    it('should return all the fixtures', async () => {
      const userCards = await Repository.userCards();
      expect(userCards.length).to.equal(NUM_CARD_FIXTURES);
    });
  });

  describe('nextCard()', () => {
    it('should return a single card', async () => {
      const userCard = await Repository.nextCard();
      expect(userCard).to.not.be.null;
    });

    it('should should populate the card member', async () => {
      const userCard = await Repository.nextCard();

      if (userCard?.card instanceof ObjectID) {
        fail('userCard has not been populated');
      }

      expect(userCard?.card?.resources).to.not.be.null;
      expect(userCard?.card?.world).to.not.be.null;
    });
  });
});
