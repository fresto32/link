import {DocumentType} from '@typegoose/typegoose';
import {UserCard, UserCardModel} from '../models/UserCard';
import {Database} from './Database';
import {Card, CardModel} from './generator/Generator';

export const NUM_CARD_FIXTURES = 20;

export abstract class Fixtures {
  static async add() {
    await Database.drop();
    await AddCardFixtures();
  }
}

async function AddCardFixtures(NumCards: number = NUM_CARD_FIXTURES) {
  for (let i = 0; i < NumCards; i++) {
    const cardDocument = await createCard();
    await createUserCardFor(cardDocument);
  }
}

async function createCard() {
  const card = new Card();
  const cardDocument = await CardModel.create(card as Card);
  await cardDocument.save();
  return cardDocument;
}

async function createUserCardFor(cardDocument: DocumentType<Card>) {
  const userCard = new UserCard();
  userCard.card = cardDocument._id;

  // Typegoose needs to use any for Ref types, see:
  // https://typegoose.github.io/typegoose/docs/guides/known-issues#typesmongoose5722-and-higher

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userCardModel = await UserCardModel.create<any>(userCard as UserCard);

  await userCardModel.save();
}
