# Project task — Radar artist and release discovery

## Goal

Build a website that helps music professionals find Indian musicians and review publicly announced or upcoming releases, then approach artists using verified professional contact routes.

## Intended audience and artist coverage

The directory can cover musicians, rappers, bands, Indian hip-hop and pop artists, pop-hop, independent/indie and unplugged music, and related scenes.

## Website requirements

- Provide a public homepage with an About section, vision, problem statement and explanation of how the directory works.
- Put a clear **Check artist data now** call to action before the footer and open the discovery workspace from it.
- Include login and signup screens.
- Search public YouTube, Instagram, Spotify, and optional MusicBrainz sources with provider-specific behavior disclosed to the user.
- Include keyword filters for community, niche, area/city/state, and a date range where a provider supports it; clearly explain that follower-range filtering is unavailable in public search results.
- Do not scrape third-party platform pages or fabricate records when a source cannot provide a requested field.
- Show artist name, Instagram/YouTube/Spotify profile URLs, original announcement/source URL, professional mobile/email and management contact (when provided).
- Make external profile and announcement URLs clickable and open them in a new tab.
- Support song/single, album, EP and music-video release records.
- Keep the experience responsive, accessible and straightforward to maintain.
- Use a suitable JSON artist-data template and document deployment to Vercel.
- Keep the initial deployment possible on free tools and a Vercel-provided URL.

## Delivered in this prototype

- Responsive React + TypeScript + Vite homepage and artist directory.
- Provider dropdown for YouTube, Instagram public web results, Spotify and optional MusicBrainz.
- Link-out search queries for YouTube/Spotify and Google-indexed public Instagram pages; no third-party page scraping or result ingestion.
- Optional MusicBrainz live artist search with artist, community tag, genre tag and area fields.
- Date-range hinting for Google-indexed Instagram pages with limitations clearly shown; manual profile verification for follower counts.
- No bundled example artist rows; results are fetched live and are not persisted by the app.
- Clear disclosure that public search pages cannot apply follower ranges, exact release-date filters, or comprehensive social release search.
- Vercel serverless API route and Vite local-development API middleware.
- Browser-local signup/login, with salted password hashes rather than plain-text passwords.
- `README.md` and `VERCEL.md` setup and deployment instructions.

## Boundaries and next steps for a production service

1. Evaluate authorized YouTube Data API integration for structured channel/video results if a Google project/key and quota are acceptable; video search is not a comprehensive upcoming music release feed.
2. Obtain authorized artist/management sources or build a reviewed opt-in release submission workflow. Public social APIs do not offer unrestricted access to every artist's announcement posts.
3. Consider platform search result ingestion only through documented, authorized APIs and subject to their current terms.
4. Add shared authentication and storage only when a backend and access-control model are selected.
5. Establish privacy, retention, access-control and outreach policies before storing or sharing contact details.
6. Deploy through GitHub → Vercel using the steps in `VERCEL.md`.

## Acceptance checklist

- [x] Homepage explains the product and includes the pre-footer directory call to action.
- [x] Users can choose YouTube, Instagram, Spotify or MusicBrainz as a search provider.
- [x] Search is routed to the chosen provider and public results open in a new tab.
- [x] No fictional local artist dataset is used.
- [x] Unsupported follower/date filtering and release/contact fields are disclosed rather than fabricated.
- [x] README and Vercel deployment guide are present.
- [x] Live API and local-account limitations are disclosed.
- [ ] Automatically collecting verified announcement posts, exact release dates and follower counts requires authorized APIs/data sources; public search links do not return structured results to Radar.
- [ ] Production shared authentication, database and real release-data ingestion are intentionally out of scope for this frontend-only prototype.
