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
- Directory filters for search, community, niche, state, follower range, release status and release-date range.
- JSON import/export, record validation and merge-by-ID behavior.
- New-tab links with URL scheme validation.
- Browser-local signup/login, with salted password hashes rather than plain-text passwords.
- `README.md` and `VERCEL.md` setup and deployment instructions.
- Fictional demo rows only; no claims that sample artists, releases or contacts are real.

## Boundaries and next steps for a production service

1. Replace demo entries with reviewed, permission-appropriate data and link each release to its original announcement.
2. Connect a backend for shared accounts and directory data. A static JSON file and browser storage are not a secure multi-user database. Evaluate Supabase Auth + Postgres free-plan limits or another suitable backend.
3. Add a server-side data import/curation workflow and source-verification timestamps.
4. Establish privacy, retention, access-control and outreach policies before storing or sharing contact details.
5. Deploy through GitHub → Vercel using the steps in `VERCEL.md`, then re-test authentication/data behavior after the backend integration.

## Acceptance checklist

- [x] Homepage explains the product and includes the pre-footer directory call to action.
- [x] Directory can be searched and filtered by the requested artist and release criteria.
- [x] Profile and announcement links are external, clickable and open in a new tab.
- [x] Contact and management fields are represented without inventing personal data.
- [x] JSON data format and local import/export are documented.
- [x] README and Vercel deployment guide are present.
- [x] Static deployment and local-account limitations are disclosed.
- [ ] Production shared authentication, database and real release-data ingestion are intentionally out of scope for this frontend-only prototype.
