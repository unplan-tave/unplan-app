export const LOCATION_SEARCH_MIN_LENGTH = 1;
export const LOCATION_SEARCH_MAX_LENGTH = 25;
export const LOCATION_RECENT_VISIBLE_COUNT = 5;

const MOCK_LOCATION_SUGGESTIONS = [
  '공덕역 5호선',
  '올림픽공원',
  '공안과병원',
  '이화여자대학교 학관',
  '테런데이',
  '중성마녀',
  '예술과사상기말고사',
  '일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오',
] as const;

export function normalizeLocationSearchLabel(label: string) {
  return label.trim().slice(0, LOCATION_SEARCH_MAX_LENGTH);
}

export function isValidLocationSearchLabel(label: string) {
  const normalized = normalizeLocationSearchLabel(label);

  return (
    normalized.length >= LOCATION_SEARCH_MIN_LENGTH &&
    normalized.length <= LOCATION_SEARCH_MAX_LENGTH
  );
}

export function getLocationSuggestions(query: string) {
  const normalized = query.trim();

  if (normalized.length === 0) {
    return [];
  }

  const lowerQuery = normalized.toLowerCase();

  return MOCK_LOCATION_SUGGESTIONS.map((item, index) => ({
    item,
    index,
    lowerItem: item.toLowerCase(),
  }))
    .filter(({ lowerItem }) => lowerItem.includes(lowerQuery))
    .sort((left, right) => {
      const leftStarts = left.lowerItem.startsWith(lowerQuery);
      const rightStarts = right.lowerItem.startsWith(lowerQuery);

      if (leftStarts !== rightStarts) {
        return leftStarts ? -1 : 1;
      }

      const leftMatchIndex = left.lowerItem.indexOf(lowerQuery);
      const rightMatchIndex = right.lowerItem.indexOf(lowerQuery);

      if (leftMatchIndex !== rightMatchIndex) {
        return leftMatchIndex - rightMatchIndex;
      }

      return left.index - right.index;
    })
    .map(({ item }) => item)
    .slice(0, LOCATION_RECENT_VISIBLE_COUNT);
}

export function getVisibleLocationRecentSearches(recentSearches: readonly string[]) {
  return recentSearches.slice(0, LOCATION_RECENT_VISIBLE_COUNT);
}

export function addLocationRecentSearch(recentSearches: readonly string[], label: string) {
  const normalized = normalizeLocationSearchLabel(label);

  if (!isValidLocationSearchLabel(normalized)) {
    return [...recentSearches];
  }

  const nextSearches = recentSearches.filter((item) => item !== normalized);

  return [normalized, ...nextSearches];
}

export function removeLocationRecentSearch(recentSearches: readonly string[], label: string) {
  return recentSearches.filter((item) => item !== label);
}
