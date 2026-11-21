export type SearchProvider = "youtube" | "instagram" | "spotify";

export interface PlatformSearchFilters {
  query: string;
  community: string;
  niche: string;
  area: string;
  dateFrom: string;
  dateTo: string;
}

export function buildPlatformSearchUrl(provider: SearchProvider, filters: PlatformSearchFilters): string {
  const keywords = [
    filters.query,
    filters.community,
    filters.niche,
    filters.area,
    "India",
    "artist",
    "new song",
    "upcoming release",
    "single OR album OR EP OR music video",
  ].filter(Boolean);

  if (provider === "youtube") {
    const url = new URL("https://www.youtube.com/results");
    url.searchParams.set("search_query", keywords.join(" "));
    return url.href;
  }

  if (provider === "spotify") {
    return `https://open.spotify.com/search/${encodeURIComponent([
      filters.query,
      filters.community,
      filters.niche,
      filters.area,
      "India",
    ].filter(Boolean).join(" "))}`;
  }

  const googleQuery = [
    "site:instagram.com",
    ...keywords,
    filters.dateFrom && `after:${filters.dateFrom}`,
    filters.dateTo && `before:${filters.dateTo}`,
  ].filter(Boolean).join(" ");
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", googleQuery);
  return url.href;
}
