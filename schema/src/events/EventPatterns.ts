export enum EventPatterns {
  cardCreated = 'card.card_created',
  cardStored = 'card.card_stored',
  deleteCardRequested = 'card.delete_card_requested',
  deletedCard = 'card.deleted_card',
  getAllUserCardsRequested = 'card.get_all_user_cards_requested',
  gotAllUserCards = 'card.got_all_user_cards',
  nextCardRequested = 'card.next_card_requested',
  gotNextCard = 'card.got_next_card',
  error = 'error',
}
