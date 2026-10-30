# Project task — Radar artist and release discovery

## Goal

Build a website that helps music professionals find Indian musicians and review publicly announced or upcoming releases, then approach artists using verified professional contact routes.

## Intended audience and artist coverage

The directory can cover musicians, rappers, bands, Indian hip-hop and pop artists, pop-hop, independent/indie and unplugged music, and related scenes.

## Website requirements

- Provide a public homepage with an About section, vision, problem statement and explanation of how the directory works.
- Put a clear **Check artist data now** call to action before the footer and open the discovery workspace from it.
- Include login and signup screens.
- Search/filter artists by community, follower-count range, niche, area/city and state.
- Filter release leads by a selectable date range and release status.
- Show artist name, Instagram/YouTube/Spotify profile URLs, original announcement/source URL, professional mobile/email and management contact (when provided).
- Make external profile and announcement URLs clickable and open them in a new tab.
- Support song/single, album, EP and music-video release records.
- Keep the experience responsive, accessible and straightforward to maintain.
- Use a suitable JSON artist-data template and document deployment to Vercel.
- Keep the initial deployment possible on free tools and a Vercel-provided URL.

## Delivered in this prototype

- Responsive React + TypeScript + Vite homepage and artist directory.
- On-demand live Indian artist search through the free MusicBrainz API with artist, community tag, genre tag and area search fields.
- Artist name/type, recorded area/country, catalogue tags, MusicBrainz record link, and available linked Instagram/YouTube/Spotify profiles.
- No bundled example artist rows; results are fetched live and are not persisted by the app.
- Clear disclosure that MusicBrainz cannot provide reliable follower counts, state-level location, professional contact details or comprehensive social release announcements.
- Vercel serverless API route and Vite local-development API middleware.
- Browser-local signup/login, with salted password hashes rather than plain-text passwords.
- `README.md` and `VERCEL.md` setup and deployment instructions.

## Boundaries and next steps for a production service

1. Evaluate authorized YouTube Data API integration for channel/video discovery if a Google project/key and quota are acceptable; video search is not a comprehensive upcoming music release feed.
2. Obtain authorized artist/management sources or build a reviewed opt-in release submission workflow. Public social APIs do not offer unrestricted access to every artist's announcement posts.
3. Add shared authentication and storage only when a backend and access-control model are selected.
4. Establish privacy, retention, access-control and outreach policies before storing or sharing contact details.
5. Deploy through GitHub → Vercel using the steps in `VERCEL.md`.

## Acceptance checklist

- [x] Homepage explains the product and includes the pre-footer directory call to action.
- [x] Live artist search is performed against a public source, not a fictional local dataset.
- [x] Catalogue and available profile links are external and open in a new tab.
- [x] Unsupported follower, upcoming-release, announcement and contact fields are disclosed rather than fabricated.
- [x] README and Vercel deployment guide are present.
- [x] Live API and local-account limitations are disclosed.
- [ ] Comprehensive upcoming-release search and follower-range filtering require sources/APIs that provide those fields; no unrestricted free public source has been identified.
- [ ] Production shared authentication, database and real release-data ingestion are intentionally out of scope for this frontend-only prototype.
