# Deploy via GitHub Pages

1. Create a GitHub repository and push this project there.
2. Ensure your default branch is `main` or `master`.
3. The repository already contains a GitHub Actions workflow at `.github/workflows/deploy.yml` which will:
   - install dependencies in `client`
   - run `npm run build` in `client`
   - publish the `client/dist` directory to the `gh-pages` branch
4. Push to GitHub. Open the **Actions** tab and watch `Deploy to GitHub Pages` run.
5. After a successful run, your site will be available at `https://<your-username>.github.io/<your-repo-name>/`.

Notes:
- If your repo is private, enable GitHub Pages or make the repo public.
- If your project uses a different branch name, update the workflow's `on.push.branches` or push to `main`/`master`.
- If you prefer Netlify or Vercel, tell me which and I can add a config or a deploy workflow for that provider.
