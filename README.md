# Radar — Indian artist and release search

Radar is a responsive React/Vite search workspace for discovering Indian artists and music announcements across public platforms. Choose **YouTube**, **Instagram**, **Spotify**, or optional **MusicBrainz**, enter artist/genre/community/location keywords, then open the corresponding public search results.

There are no bundled/demo artist records. YouTube and Spotify open their own search pages; Instagram searches public Google-indexed Instagram pages; MusicBrainz returns live catalogue records inside Radar. External platforms do not provide Radar with a results API here, so their results are not scraped, copied or stored in the app.

## Search providers

- **YouTube:** Opens public YouTube search with artist, community, genre, location and release-announcement keywords. Review the channel/video and description manually.
- **Instagram:** Opens Google Search restricted to `site:instagram.com`, including release keywords and Google's documented [`after:` / `before:` date operators](https://support.google.com/websearch/answer/2466433) if a date range is entered. This only finds public, indexed pages; it cannot search private/login-only content or guarantee the post's release date.
- **Spotify:** Opens Spotify search for artist/music keywords. It is useful for discovering artist and track pages, not social release announcements.
- **MusicBrainz:** Optional direct catalogue search, returning community-maintained artist records, tags, area/country, catalogue URL and any linked social profiles. MusicBrainz does not provide complete release announcements, follower counts or contact details.

All providers are free to search without an API key from Radar. **Follower ranges cannot filter results** on these public search pages, so check each platform profile manually. The optional date range is enabled only for Instagram's Google-indexed public pages; its operators narrow indexed post pages, not confirmed release dates. Verify the original post, date, and professional outreach contact before acting on a lead. Never treat missing data as proof that an artist has no profile or release.

The public platform results link is the search source itself. Radar does not claim that a search-engine result is an artist's official announcement. No platform pages are scraped and no search results from YouTube, Instagram, Google or Spotify are imported into the directory.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`), create a local account, open the directory, select a provider, and click **Search live data**. The resulting **Open search results** link launches the selected public search in a new tab.

Build and preview:

```bash
npm run build
npm run preview
```

## MusicBrainz API

`GET /api/artists?query=...&community=...&niche=...&area=...` searches the MusicBrainz `country:IN` catalogue. It is implemented as a Vercel Function in `api/artists.ts` and local Vite middleware in `vite.config.ts`. Requests include an identifying `User-Agent`; transient busy/rate-limit responses are retried once. Results are capped at 100 and briefly cached by Vercel.

No YouTube, Instagram, Spotify, Google Search or AI API credentials are used. The existing public search links avoid scraping and paid search APIs. Instagram official API access is restricted; YouTube Data API requires a Google project/API key and quota. Neither offers a comprehensive unrestricted feed of all Indian artists' social release announcements.

## Accounts and privacy

Signup/login remains local to the current browser and is not production authentication. MusicBrainz responses are not persisted by Radar, and external search results stay on their respective platforms. Do not treat this as shared multi-user storage or use it to collect sensitive/private contact details. See [VERCEL.md](./VERCEL.md) for deployment notes.
