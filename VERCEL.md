# Deploy Radar to Vercel

This project deploys as a Vite site with one serverless API function for optional MusicBrainz searches. YouTube, Instagram, Google and Spotify searches open public search pages directly and do not require API credentials. No custom domain or paid hosting is required to get started; Vercel assigns a `your-project.vercel.app` URL.

## 1. Prepare the project

1. Install Node.js 20.19+ or 22.12+.
2. In the project folder run:

   ```bash
   npm install
   npm run build
   ```

3. Confirm the build finishes and creates `dist/`.
4. No artist dataset or demo records need to be prepared; public-platform searches open on their respective sites and MusicBrainz fetches live catalogue entries.
5. Commit and push the project to a GitHub repository. Do not commit credentials, private contact data or `.env` files.

## 2. Import the project into Vercel

1. Create a free account at [vercel.com](https://vercel.com/) and connect GitHub.
2. Choose **Add New → Project**, then import this repository.
3. Confirm the framework is **Vite** and use these build settings:
   - Application preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: leave the default/automatic setting, or set it to `npm install`
4. Enter commands as plain text in their respective fields. Do not include quote marks or commas, and do not combine the install and build commands in one field. For example, enter `npm install`, not `'npm install'`.
5. Keep the `api/artists.ts` serverless function in the project; Vercel detects and deploys it automatically alongside the Vite frontend.
6. Select **Deploy** and wait for the build to complete.
7. Open the generated `https://<project-name>.vercel.app` URL. The URL is provided by Vercel; no domain purchase is needed.

If a build log reports `npm install: command not found` and shows the command with single quotes (for example, `'npm install'`), remove the quote marks from the Install Command override in **Project Settings → Build and Deployment**, or restore automatic detection, then redeploy.

## 3. Subsequent updates

Push changes to the connected GitHub branch. Vercel automatically builds a preview for pull requests and updates the production deployment when the production branch changes. To roll back, open the Vercel project’s **Deployments** page and promote a previous successful deployment.

## 4. Search providers and limitations

- YouTube searches open the public YouTube search page; Instagram searches use Google results restricted to public/indexed `instagram.com` pages; Spotify searches open Spotify's search page.
- These searches are links, not API integrations: Radar does not scrape, ingest, or retain platform results. Instagram date operators narrow Google's indexed page dates and do not confirm a music release date. Follower ranges cannot automatically filter any of these public search pages and must be checked manually.
- Optional MusicBrainz catalog searches use the free public API; no API key or environment variable is required. Records are community-maintained and do not provide comprehensive release announcements, follower counts, location or professional contacts.
- The Vercel Function only serves MusicBrainz search requests and briefly caches successful responses. If MusicBrainz is unavailable or rate-limits the request, search shows an error instead of demo data.
- Signup/login is local to one browser and is not server-side authentication.
- The app does not persist live results. Vercel's static filesystem is not a shared writable database.

For automated official platform metrics and release-post discovery, separate authorized integrations are required. Instagram's official API is restricted and requires an authorized professional account and access token; YouTube's Data API requires a Google project/API key and quota. Neither provides an unrestricted, comprehensive feed of every Indian artist's release announcements. Do not scrape platform pages to work around API access or platform terms.

For a real multi-user launch, configure shared authentication and a database, enforce authorization, and add privacy/retention policies before storing contact data. Keep server-only secrets in Vercel **Project → Settings → Environment Variables**; never expose a service-role key in a `VITE_` variable.
