import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage/mmkv-storage';

import { addLocationRecentSearch, removeLocationRecentSearch } from './location';
import {
  cloneCardFormValues,
  canCreatePersonalTag,
  createCardDraft,
  createCardEditDraft,
  createCardItem,
  createPersonalTag,
  type CardTab,
  type CardDraft,
  type CardFormValues,
  type CardItem,
  type PersonalTagOption,
  sortPersonalTags,
  updateCardItem,
} from './model';
import { createQueueToPinValues } from './queue';

interface CardStoreState {
  cards: CardItem[];
  draft: CardDraft | null;
  personalTags: PersonalTagOption[];
  locationRecentSearches: string[];
  createCard: (cardType: CardTab, values: CardFormValues) => CardItem;
  createPersonalTag: (label: string) => PersonalTagOption | null;
  addLocationRecentSearch: (label: string) => void;
  deleteLocationRecentSearch: (label: string) => void;
  deleteAllLocationRecentSearches: () => void;
  beginCreate: (values: CardFormValues, cardType?: CardTab) => CardDraft;
  beginEdit: (cardId: string) => CardDraft | null;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  changeDraftCardType: (cardType: CardTab) => void;
  saveDraft: (values?: CardFormValues) => CardItem | null;
  patchCard: (cardId: string, patch: Partial<CardFormValues>) => void;
  convertQueueToPinCard: (cardId: string, values?: CardFormValues) => CardItem | null;
  deleteCard: (cardId: string) => void;
  discardDraft: () => void;
}

const cardStorage = createJSONStorage(() => ({
  getItem: (name: string) => mmkvStorage.get(name) ?? null,
  setItem: (name: string, value: string) => mmkvStorage.set(name, value),
  removeItem: (name: string) => mmkvStorage.remove(name),
}));

export const useCardStore = create<CardStoreState>()(
  persist(
    (set, get) => ({
      cards: [],
      draft: null,
      personalTags: [],
      locationRecentSearches: [],
      createCard: (cardType, values) => {
        const card = createCardItem(cardType, values);

        set((state) => ({
          cards: [card, ...state.cards],
        }));

        return card;
      },
      createPersonalTag: (label) => {
        const personalTags = get().personalTags;

        if (!canCreatePersonalTag(label, personalTags)) {
          return null;
        }

        const tag = createPersonalTag(label);

        set((state) => ({
          personalTags: sortPersonalTags([...state.personalTags, tag]),
        }));

        return tag;
      },
      addLocationRecentSearch: (label) => {
        set((state) => ({
          locationRecentSearches: addLocationRecentSearch(state.locationRecentSearches, label),
        }));
      },
      deleteLocationRecentSearch: (label) => {
        set((state) => ({
          locationRecentSearches: removeLocationRecentSearch(state.locationRecentSearches, label),
        }));
      },
      deleteAllLocationRecentSearches: () => {
        set({ locationRecentSearches: [] });
      },
      beginCreate: (values, cardType = 'pin') => {
        const draft = createCardDraft(cardType, values);

        set({ draft });

        return draft;
      },
      beginEdit: (cardId) => {
        const card = get().cards.find((item) => item.id === cardId);

        if (card == null) {
          set({ draft: null });
          return null;
        }

        const draft = createCardEditDraft({
          ...card,
          recurrence: card.recurrence ?? null,
          locationDetail: card.locationDetail ?? '',
        });

        set({ draft });

        return draft;
      },
      updateDraftValues: (values) => {
        set((state) => {
          if (state.draft == null) {
            return state;
          }

          return {
            draft: {
              ...state.draft,
              values: {
                ...state.draft.values,
                ...values,
              },
            },
          };
        });
      },
      changeDraftCardType: (cardType) => {
        set((state) => {
          if (state.draft == null) {
            return state;
          }

          return {
            draft: {
              ...state.draft,
              cardType,
            },
          };
        });
      },
      saveDraft: (values) => {
        const draft = get().draft;

        if (draft == null) {
          return null;
        }

        const nextValues = values == null ? draft.values : cloneCardFormValues(values);

        if (draft.mode === 'edit' && draft.editingCardId != null) {
          const currentCard = get().cards.find((card) => card.id === draft.editingCardId);

          if (currentCard == null) {
            return null;
          }

          const updatedCard = updateCardItem(currentCard, draft.cardType, nextValues);

          set((state) => ({
            cards: state.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
            draft: null,
          }));

          return updatedCard;
        }

        const createdCard = createCardItem(draft.cardType, nextValues);

        set((state) => ({
          cards: [createdCard, ...state.cards],
          draft: null,
        }));

        return createdCard;
      },
      patchCard: (cardId, patch) => {
        set((state) => ({
          cards: state.cards.map((card) => {
            if (card.id !== cardId) {
              return card;
            }

            return updateCardItem(card, card.cardType, {
              ...cloneCardFormValues(card),
              ...patch,
            });
          }),
        }));
      },
      convertQueueToPinCard: (cardId, values) => {
        const currentCard = get().cards.find((card) => card.id === cardId);

        if (currentCard == null || currentCard.cardType !== 'queue') {
          return null;
        }

        const convertedCard = updateCardItem(
          currentCard,
          'pin',
          values ?? createQueueToPinValues(currentCard),
        );

        set((state) => ({
          cards: state.cards.map((card) => (card.id === cardId ? convertedCard : card)),
          draft: state.draft?.editingCardId === cardId ? null : state.draft,
        }));

        return convertedCard;
      },
      deleteCard: (cardId) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
          draft: state.draft?.editingCardId === cardId ? null : state.draft,
        }));
      },
      discardDraft: () => {
        set({ draft: null });
      },
    }),
    {
      name: 'card-store',
      storage: cardStorage,
      partialize: (state) => ({
        cards: state.cards,
        personalTags: state.personalTags,
        locationRecentSearches: state.locationRecentSearches,
      }),
    },
  ),
);
