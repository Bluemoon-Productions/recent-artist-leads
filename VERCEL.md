# Deploy Radar to Vercel

This project deploys as a static Vite site. No custom domain or paid hosting is required to get started; Vercel assigns a `your-project.vercel.app` URL.

## 1. Prepare the project

1. Install Node.js 20.19+ or 22.12+.
2. In the project folder run:

   ```bash
   npm install
   npm run build
   ```

3. Confirm the build finishes and creates `dist/`.
4. Review `src/data/artists.json`. Replace the clearly labeled fictional sample records with verified records, or keep the samples for a demo.
5. Commit and push the project to a GitHub repository. Do not commit credentials, private contact data or `.env` files.

## 2. Import the project into Vercel

1. Create a free account at [vercel.com](https://vercel.com/) and connect GitHub.
2. Choose **Add New → Project**, then import this repository.
3. Confirm the framework is **Vite** and use these build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Select **Deploy** and wait for the build to complete.
5. Open the generated `https://<project-name>.vercel.app` URL. The URL is provided by Vercel; no domain purchase is needed.

## 3. Subsequent updates

Push changes to the connected GitHub branch. Vercel automatically builds a preview for pull requests and updates the production deployment when the production branch changes. To roll back, open the Vercel project’s **Deployments** page and promote a previous successful deployment.

## 4. Important prototype limitations

- Signup/login is local to one browser and is not server-side authentication.
- Imported artist data is saved in that browser's local storage; it is not shared with other users and is not backed up by Vercel. Use **Export list** to download a backup.
- Data shipped in `src/data/artists.json` is included in the public website bundle.
- Static Vercel deployments do not make a writable JSON file into a safe, persistent account database.

For a real multi-user launch, configure a backend such as Supabase Auth + Postgres (check its current free-plan quotas), enforce authorization on the server/database, and move directory records to that database. Keep server-only secrets in Vercel **Project → Settings → Environment Variables**; never expose a service-role key in a `VITE_` variable. Add a privacy notice and retention policy before storing personal/contact data.
