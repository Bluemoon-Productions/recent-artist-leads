# Radar — Indian independent artist & release directory

Radar is a responsive, open-source starter website for researching Indian independent musicians and their publicly announced music releases. It brings artist/community, genre, location, follower-range and release-date filters together with profile links, announcement sources and outreach details.

> **Prototype, not a live data service.** The included directory contains fictional example records. It does not scrape social networks, discover announcements automatically, or contain verified artist/contact information. Add only information you have verified and are permitted to use.

## What is included

- Public landing page explaining the product, its purpose and workflow.
- Email/password sign-up and login for a **single browser profile**.
- Search and filters for community, niche, state, follower count, release status and date range.
- Artist and release table with Instagram, YouTube, Spotify and announcement-source links. Valid links open in a new tab.
- JSON import (merge by artist `id`) and export for the directory.
- Responsive layouts for desktop and mobile.
- Vercel-ready static build.

## Run locally

**Requirements:** Node.js 20.19+ or 22.12+, and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Create an account on the sign-in screen; the starter account list is intentionally empty.

Create a production build and test it locally:

```bash
npm run build
npm run preview
```

## Data format

`src/data/artists.json` is the starter dataset and the import template. Each record describes an artist and a release lead:

```json
{
  "id": "artist-unique-id",
  "name": "Artist or band name",
  "community": "Indian independent",
  "niche": "Indie pop",
  "area": "Mumbai",
  "state": "Maharashtra",
  "followers": 18400,
  "releaseTitle": "Release title",
  "releaseType": "Single",
  "releaseStatus": "Upcoming",
  "releaseDate": "2026-11-18",
  "instagram": "https://www.instagram.com/artist/",
  "youtube": "https://www.youtube.com/@artist",
  "spotify": "https://open.spotify.com/artist/...",
  "source": "https://www.instagram.com/p/...",
  "mobile": "",
  "email": "",
  "management": ""
}
```

Allowed `releaseType` values: `Single`, `Album`, `EP`, `Music video`. Allowed `releaseStatus` values: `Announced`, `Upcoming`, `Released`. Dates use `YYYY-MM-DD`; follower count is a non-negative number. Keep a stable unique `id` per artist: importing an existing ID updates that record, and a new ID adds one. The browser validates required fields before importing.

The browser stores imported directory records in `localStorage`, so export a backup before clearing site data or changing browsers. The included sample records are fictional and are visibly marked as examples.

## Authentication and storage limitations

This static prototype **does not provide production authentication**. Signup stores a salted password hash in the browser's `localStorage`; it does not store a plain-text password or send credentials to a server. Accounts, login sessions and imported data are local to that browser. They are not shared across users or devices, and a user with access to the browser can alter its local data.

Do not put real passwords, private contact lists or sensitive information in a JSON file shipped with the website. A JSON file bundled into a static site is public, and Vercel's static filesystem is not a persistent shared database. For multi-user accounts, shared data and access controls, connect a backend before inviting users. A practical no-cost starting path is Supabase Auth + Postgres on its free plan (check current plan limits), with server-side authorization and environment variables for public configuration. Never put a service-role key in browser code.

## Release-data sourcing

The website is a directory and filter UI—not a release-monitoring crawler. There is no dependable, free, unrestricted API covering all Indian artists' social announcements, and scraping platforms may violate their terms. Curate records from public artist/label announcements, link the original post in `source`, record when it was checked in your own process, and verify dates before outreach. Only include contact details published for professional enquiries or shared with permission.

## Deploy

Follow [VERCEL.md](./VERCEL.md) for a step-by-step deployment guide. Vercel provides a free `*.vercel.app` address; you do not need to buy a domain or hosting to publish this prototype.
