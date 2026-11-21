export interface ArtistSearchFilters {
  query: string;
  community: string;
  niche: string;
  area: string;
}

export interface MusicBrainzArtist {
  id: string;
  name: string;
  type: string;
  location: string;
  country: string;
  tags: string[];
  profileUrl: string;
  instagram: string;
  youtube: string;
  spotify: string;
}

interface MusicBrainzRelation {
  type?: string;
  url?: { resource?: string };
}

interface MusicBrainzArtistRecord {
  id?: string;
  name?: string;
  type?: string;
  country?: string;
  area?: { name?: string };
  "begin-area"?: { name?: string };
  tags?: Array<{ name?: string; count?: number }>;
  relations?: MusicBrainzRelation[];
}

interface MusicBrainzResponse {
  count?: number;
  artists?: MusicBrainzArtistRecord[];
}

function escapeLucene(value: string): string {
  return value.replace(/[+\-!(){}[\]^"~*?:\\/]/g, "\\$&");
}

function searchField(field: string, value: string): string {
  return `${field}:"${escapeLucene(value)}"`;
}

function socialProfile(relations: MusicBrainzRelation[] | undefined, domain: string): string {
  const resource = relations?.find((relation) => {
    try {
      const hostname = new URL(relation.url?.resource ?? "").hostname;
      return hostname === domain || hostname.endsWith(`.${domain}`);
    } catch {
      return false;
    }
  })?.url?.resource;
  return resource ?? "";
}

function mapArtist(artist: MusicBrainzArtistRecord): MusicBrainzArtist | null {
  if (!artist.id || !artist.name) return null;
  return {
    id: artist.id,
    name: artist.name,
    type: artist.type ?? "Unknown",
    location: artist["begin-area"]?.name ?? artist.area?.name ?? "",
    country: artist.country ?? "",
    tags: (artist.tags ?? [])
      .filter((tag): tag is { name: string; count?: number } => typeof tag.name === "string")
      .sort((left, right) => (right.count ?? 0) - (left.count ?? 0))
      .slice(0, 8)
      .map((tag) => tag.name),
    profileUrl: `https://musicbrainz.org/artist/${artist.id}`,
    instagram: socialProfile(artist.relations, "instagram.com"),
    youtube: socialProfile(artist.relations, "youtube.com"),
    spotify: socialProfile(artist.relations, "spotify.com"),
  };
}

function readFilter(params: URLSearchParams, name: string, maxLength: number): string {
  const value = (params.get(name) ?? "").trim();
  if (value.length > maxLength) {
    throw new Error(`${name} must be ${maxLength} characters or fewer.`);
  }
  return value;
}

export async function searchMusicBrainz(
  params: URLSearchParams,
  fetcher: typeof fetch = fetch,
): Promise<{ artists: MusicBrainzArtist[]; total: number }> {
  const query = readFilter(params, "query", 80);
  const community = readFilter(params, "community", 60);
  const niche = readFilter(params, "niche", 60);
  const area = readFilter(params, "area", 80);
  const terms = ["country:IN"];
  if (query) terms.push(searchField("artist", query));
  if (community) terms.push(searchField("tag", community));
  if (niche) terms.push(searchField("tag", niche));
  if (area) terms.push(searchField("area", area));

  const url = new URL("https://musicbrainz.org/ws/2/artist/");
  url.searchParams.set("query", terms.join(" AND "));
  url.searchParams.set("fmt", "json");
  url.searchParams.set("limit", "100");
  url.searchParams.set("inc", "url-rels+tags");

  const requestOptions: RequestInit = {
    headers: {
      Accept: "application/json",
      "User-Agent": "RadarArtistDirectory/1.0 (https://github.com/Bluemoon-Productions/recent-artist-leasd)",
    },
  };
  let response = await fetcher(url, { ...requestOptions, signal: AbortSignal.timeout(15000) });
  if (response.status === 429 || response.status === 503) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    const waitMs = Number.isFinite(retryAfter) ? Math.min(Math.max(retryAfter, 1), 3) * 1000 : 1000;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    response = await fetcher(url, { ...requestOptions, signal: AbortSignal.timeout(15000) });
  }
  if (!response.ok) {
    throw new Error(`MusicBrainz returned HTTP ${response.status}. Please try again shortly.`);
  }

  const result = await response.json() as MusicBrainzResponse;
  return {
    artists: (result.artists ?? []).map(mapArtist).filter((artist): artist is MusicBrainzArtist => artist !== null),
    total: result.count ?? 0,
  };
}
