# GitHub Pages Deployment Guide

## What's Configured

Your Purrfect Blocks game is fully configured for GitHub Pages deployment with the following optimizations:

### Build Configuration (vite.config.ts)
- ✅ Base path set to `/purrfect-blocks/`
- ✅ Assets inlined when smaller than 100KB
- ✅ Single JS bundle (no code splitting)
- ✅ Minified with Terser (console logs removed)
- ✅ Optimized for production

### Static Assets
- ✅ Favicon embedded as data URL (no external file needed)
- ✅ CSS inlined or bundled
- ✅ All game assets self-contained

### Output Structure
When you run `npm run build`, the `dist` folder contains:
```
dist/
├── index.html          (4.5KB) - Main HTML file
└── assets/
    ├── index.*.css     (7.2KB) - Bundled styles
    └── index.*.js      (36KB)  - Single JS bundle with all game code
```

## Deployment Options

### Option 1: Automatic Deployment (Recommended)

A GitHub Actions workflow is configured at `.github/workflows/deploy.yml` that automatically:
1. Builds the project on every push to `main`
2. Deploys to GitHub Pages

**Setup Steps:**
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Enable GitHub Pages:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Build and deployment", select **Source: GitHub Actions**
   - Save

3. Your site will be live at:
   ```
   https://<your-username>.github.io/purrfect-blocks/
   ```

### Option 2: Manual Deployment

Deploy manually using gh-pages:

```bash
npm run deploy
```

This will:
1. Run `npm run build` to create the production bundle
2. Push the `dist` folder to the `gh-pages` branch
3. GitHub Pages will automatically serve from that branch

## What Gets Deployed

The production build includes:
- ✅ **Single page application** - All code in one bundle
- ✅ **No external dependencies** - Everything is bundled
- ✅ **IndexedDB** - Game saves and player settings (browser-local)
- ✅ **Web Audio API** - Sound effects (browser API)
- ✅ **Canvas rendering** - All graphics are drawn programmatically
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **No server required** - Pure static site

## Browser Requirements

Your game works in all modern browsers with support for:
- ES2020 JavaScript
- IndexedDB
- Web Audio API
- HTML5 Canvas
- CSS Grid/Flexbox

## Testing Production Build Locally

Before deploying, you can test the production build:

```bash
npm run build
npm run preview
```

This will serve the production build at `http://localhost:4173/purrfect-blocks/`

## Troubleshooting

### Issue: 404 errors for assets
- **Solution**: Make sure `base: '/purrfect-blocks/'` in vite.config.ts matches your repo name

### Issue: Game doesn't load
- **Solution**: Check browser console for errors. Ensure IndexedDB is not blocked

### Issue: Deployment fails
- **Solution**: Check that GitHub Actions has permission to deploy (Settings → Actions → General → Workflow permissions)

## File Size Summary

Total deployment size: ~48KB (12KB gzipped)
- HTML: 4.5KB (1.5KB gzipped)
- CSS: 7.2KB (2KB gzipped)
- JS: 36KB (10.4KB gzipped)

This is extremely lightweight for a complete game!
