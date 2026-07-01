import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage/mmkv-storage';

import { addLocationRecentSearch, removeLocationRecentSearch } from './location';
import {
  clonePinCardFormValues,
  canCreatePersonalTag,
  createPinCardDraft,
  createPinCardEditDraft,
  createPinCardItem,
  createPersonalTag,
  type CardTab,
  type PinCardDraft,
  type PinCardFormValues,
  type PinCardItem,
  type PersonalTagOption,
  sortPersonalTags,
  updatePinCardItem,
} from './model';

interface PinCardStoreState {
  cards: PinCardItem[];
  draft: PinCardDraft | null;
  personalTags: PersonalTagOption[];
  locationRecentSearches: string[];
  createCard: (cardType: CardTab, values: PinCardFormValues) => PinCardItem;
  createPersonalTag: (label: string) => PersonalTagOption | null;
  addLocationRecentSearch: (label: string) => void;
  deleteLocationRecentSearch: (label: string) => void;
  deleteAllLocationRecentSearches: () => void;
  beginCreate: (values: PinCardFormValues, cardType?: CardTab) => PinCardDraft;
  beginEdit: (cardId: string) => PinCardDraft | null;
  updateDraftValues: (values: Partial<PinCardFormValues>) => void;
  changeDraftCardType: (cardType: CardTab) => void;
  saveDraft: (values?: PinCardFormValues) => PinCardItem | null;
  patchCard: (cardId: string, patch: Partial<PinCardFormValues>) => void;
  deleteCard: (cardId: string) => void;
  discardDraft: () => void;
}

const pinCardStorage = createJSONStorage(() => ({
  getItem: (name: string) => mmkvStorage.get(name) ?? null,
  setItem: (name: string, value: string) => mmkvStorage.set(name, value),
  removeItem: (name: string) => mmkvStorage.remove(name),
}));

export const usePinCardStore = create<PinCardStoreState>()(
  persist(
    (set, get) => ({
      cards: [],
      draft: null,
      personalTags: [],
      locationRecentSearches: [],
      createCard: (cardType, values) => {
        const card = createPinCardItem(cardType, values);

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
        const draft = createPinCardDraft(cardType, values);

        set({ draft });

        return draft;
      },
      beginEdit: (cardId) => {
        const card = get().cards.find((item) => item.id === cardId);

        if (card == null) {
          set({ draft: null });
          return null;
        }

        const draft = createPinCardEditDraft({
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

        const nextValues = values == null ? draft.values : clonePinCardFormValues(values);

        if (draft.mode === 'edit' && draft.editingCardId != null) {
          const currentCard = get().cards.find((card) => card.id === draft.editingCardId);

          if (currentCard == null) {
            return null;
          }

          const updatedCard = updatePinCardItem(currentCard, draft.cardType, nextValues);

          set((state) => ({
            cards: state.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
            draft: null,
          }));

          return updatedCard;
        }

        const createdCard = createPinCardItem(draft.cardType, nextValues);

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

            return updatePinCardItem(card, card.cardType, {
              ...clonePinCardFormValues(card),
              ...patch,
            });
          }),
        }));
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
      name: 'pin-card-store',
      storage: pinCardStorage,
      partialize: (state) => ({
        cards: state.cards,
        personalTags: state.personalTags,
        locationRecentSearches: state.locationRecentSearches,
      }),
    },
  ),
);
