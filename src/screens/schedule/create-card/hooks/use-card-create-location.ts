import { useCallback } from 'react';

import type { CardCreateSheetState } from './card-create-sheet-state';
import type { CardFormValues } from '@/domains/schedule/model';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

interface UseCardCreateLocationParams {
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  addLocationRecentSearch: (query: string) => void;
  setSheet: Dispatch<SetStateAction<CardCreateSheetState>>;
}

export function useCardCreateLocation({
  setValue,
  updateDraftValues,
  addLocationRecentSearch,
  setSheet,
}: UseCardCreateLocationParams) {
  const openLocationSheet = useCallback(() => setSheet({ kind: 'location' }), [setSheet]);

  const selectLocation = useCallback(
    (nextLocation: string) => {
      setValue('location', nextLocation, { shouldDirty: true });
      setValue('locationDetail', '', { shouldDirty: true });
      updateDraftValues({ location: nextLocation, locationDetail: '' });
      addLocationRecentSearch(nextLocation);
      setSheet({ kind: 'none' });
    },
    [addLocationRecentSearch, setSheet, setValue, updateDraftValues],
  );

  return {
    openLocationSheet,
    selectLocation,
  };
}
