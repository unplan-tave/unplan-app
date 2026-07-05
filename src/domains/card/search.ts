export const CARD_RECENT_SEARCH_MAX_COUNT = 10;

export function normalizeCardSearchQuery(query: string) {
  return query.trim();
}

export function canSubmitCardSearch(query: string) {
  return normalizeCardSearchQuery(query).length > 0;
}

export function addCardRecentSearch(recentSearches: readonly string[], query: string) {
  const normalized = normalizeCardSearchQuery(query);

  if (normalized.length === 0) {
    return [...recentSearches];
  }

  const nextSearches = recentSearches.filter((item) => item !== normalized);

  return [normalized, ...nextSearches].slice(0, CARD_RECENT_SEARCH_MAX_COUNT);
}

export function removeCardRecentSearch(recentSearches: readonly string[], query: string) {
  return recentSearches.filter((item) => item !== query);
}
