# Deploy Radar to Vercel

This project deploys as a Vite site with one serverless API function. The function calls MusicBrainz, a free public music catalogue; it does not need API credentials. No custom domain or paid hosting is required to get started; Vercel assigns a `your-project.vercel.app` URL.

## 1. Prepare the project

1. Install Node.js 20.19+ or 22.12+.
2. In the project folder run:

   ```bash
   npm install
   npm run build
   ```

3. Confirm the build finishes and creates `dist/`.
4. No artist dataset or demo records need to be prepared; searches fetch live artist catalogue entries from MusicBrainz.
5. Commit and push the project to a GitHub repository. Do not commit credentials, private contact data or `.env` files.

## 2. Import the project into Vercel

1. Create a free account at [vercel.com](https://vercel.com/) and connect GitHub.
2. Choose **Add New → Project**, then import this repository.
3. Confirm the framework is **Vite** and use these build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Keep the `api/artists.ts` serverless function in the project; Vercel detects and deploys it automatically alongside the Vite frontend.
5. Select **Deploy** and wait for the build to complete.
6. Open the generated `https://<project-name>.vercel.app` URL. The URL is provided by Vercel; no domain purchase is needed.

## 3. Subsequent updates

Push changes to the connected GitHub branch. Vercel automatically builds a preview for pull requests and updates the production deployment when the production branch changes. To roll back, open the Vercel project’s **Deployments** page and promote a previous successful deployment.

## 4. Data source and limitations

- Live artist catalog searches use the free MusicBrainz API; no API key or environment variable is required.
- MusicBrainz records are community-maintained and incomplete. The API does not provide complete Instagram release announcements, follower counts, reliable state/city coverage, or professional contact details. Radar does not invent these fields.
- The Vercel Function calls MusicBrainz and caches successful search responses briefly. If MusicBrainz is unavailable or rate-limits the request, search will show an error instead of demo data.
- Signup/login is local to one browser and is not server-side authentication.
- The app does not persist live results. Vercel's static filesystem is not a shared writable database.

For official platform metrics and release-post discovery, separate authorized integrations are required. Instagram's official API is restricted and requires an authorized professional account and access token; YouTube's Data API requires a Google project/API key and quota. Neither provides an unrestricted, comprehensive, free feed of every Indian artist's release announcements. Do not scrape platform pages to work around API access or platform terms.

For a real multi-user launch, configure shared authentication and a database, enforce authorization, and add privacy/retention policies before storing contact data. Keep server-only secrets in Vercel **Project → Settings → Environment Variables**; never expose a service-role key in a `VITE_` variable.
