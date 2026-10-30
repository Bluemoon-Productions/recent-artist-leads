# Radar — live Indian artist catalogue search

Radar is a responsive React/Vite website for searching artist records from [MusicBrainz](https://musicbrainz.org/), a free, community-maintained music database. Searches run on demand through `/api/artists`; there are no bundled/demo artist records and no API key is required.

## What live search returns

- Artist name and artist type (person, group, etc.).
- Country and the area recorded in MusicBrainz.
- Community-maintained genre/style tags.
- MusicBrainz catalogue link.
- Instagram, YouTube and Spotify links only if contributors have attached those relationships to the artist record.

Search filters are sent to MusicBrainz for artist name, community tag, genre/niche tag and area. Its artist search results are capped at 100 records per request. MusicBrainz is a volunteer catalogue, so coverage, tags, location and social links vary.

## What no free public source can reliably provide here

This is **not** an upcoming-release monitor. MusicBrainz does not index Instagram announcements, and its catalogue does not provide follower counts, reliable city/state for every artist, private/professional contact details, or a complete feed of future single/EP/album/video announcements. Instagram's [official API](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/) is restricted to professional accounts and requires an authorized professional account/access token; it is not an unrestricted public search API. YouTube's [Data API](https://developers.google.com/youtube/data-api) requires a Google project/API key and quota; its [video search](https://developers.google.com/youtube/v3/docs/search/list) is not a comprehensive feed of music-release announcements. Google Search/AI and scraped website results are not a free, stable, unrestricted substitute.

For these reasons, Radar disables no filters while pretending to know missing data: it searches only the fields MusicBrainz supplies, and explicitly explains the unavailable follower/date/release/contact fields. A MusicBrainz artist profile is labelled as a **catalogue source**, not a release-announcement source. Empty social links mean the catalogue has no linked URL; they do not prove that the artist has no social profile.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`), create a local account, then click **Search live data** in the directory. Vite provides a development API route that calls MusicBrainz server-side. The deployed site uses the Vercel Function in `api/artists.ts`.

Build and preview:

```bash
npm run build
npm run preview
```

## API behavior

- `GET /api/artists?query=...&community=...&niche=...&area=...`
- The endpoint searches MusicBrainz `country:IN`, adds any supplied search fields, and returns at most 100 artist records with catalogue tags and linked artist URLs.
- Requests include an identifying `User-Agent` and use the [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API) rather than scraping its website. Transient busy/rate-limit responses are retried once; search results are cached briefly by Vercel.
- No Instagram, Google, YouTube, Spotify or AI API credentials are used by this implementation.

## Accounts and privacy

Signup/login in this prototype remains local to the current browser and is not production authentication. Artist results are fetched from MusicBrainz when requested and are not retained by the app. Do not treat this as shared multi-user storage or use it to collect sensitive/private contact details. See [VERCEL.md](./VERCEL.md) for deployment notes.
