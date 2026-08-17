#!/usr/bin/env bash
# One-shot: clear stale caches, commit the fixes, push to GitHub.
# Run from the project root:  bash finish-setup.sh
set -e

cd "$(dirname "$0")"

echo "==> Clearing stale build caches"
rm -rf .astro node_modules/.vite dist .wrangler
rm -f src/components/Prose.astro

echo "==> Verifying the production build works"
npm run build

echo "==> Committing"
git add -A
git commit -m "Fix Keystatic Cloud slug, nullable schema fields, build-only CF adapter" || echo "(nothing new to commit)"

echo "==> Pushing to GitHub"
git push

echo
echo "=================================================="
echo " Done. Code is on GitHub and the build is green."
echo
echo " Next, in the Cloudflare dashboard:"
echo "   Workers & Pages -> Create -> Connect to Git"
echo "   Repo:             pijauk/rimante-mizaraite"
echo "   Build command:    npm run build"
echo "   Output directory: dist"
echo "   Env vars:         PUBLIC_KEYSTATIC_STORAGE = cloud"
echo "                     NODE_VERSION            = 22"
echo "=================================================="
