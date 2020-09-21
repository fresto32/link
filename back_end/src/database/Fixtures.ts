import {DocumentType} from '@typegoose/typegoose';
import {CardSettings, CardSettingsModel} from '../models/CardSettings';
import {UserCard, UserCardModel} from '../models/UserCard';
import {Database} from './Database';
import {CardSettingsGenerator} from './generator/Generator';

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
  const card: CardSettings = new CardSettingsGenerator();
  const cardDocument = await CardSettingsModel.create(card as CardSettings);
  await cardDocument.save();
  return cardDocument;
}

async function createUserCardFor(cardDocument: DocumentType<CardSettings>) {
  const userCard = new UserCard();
  userCard.card = cardDocument._id;

  // Typegoose needs to use any for Ref types, see:
  // https://typegoose.github.io/typegoose/docs/guides/known-issues#typesmongoose5722-and-higher

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userCardModel = await UserCardModel.create<any>(userCard as UserCard);

  await userCardModel.save();
}
