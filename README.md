# Purrfect Blocks 🐱☕

A cozy block puzzle game with a warm coffee shop aesthetic and interactive cats.

**🎮 [Play Now on GitHub Pages](https://manuelbv.github.io/purrfect-blocks/)**

## Features

- 12×18 grid with drag-and-drop gameplay
- 22 unique piece types (tetrominoes + solid squares)
- Cascade combo system for high scores
- Interactive cats that react to your moves
- Coffee shop color palette
- Full accessibility support

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages on every push to the `main` branch.

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Under "Build and deployment", select "GitHub Actions" as the source
4. The site will be automatically deployed at `https://<username>.github.io/purrfect-blocks/`

### Manual Deployment

Alternatively, you can deploy manually:

```bash
npm run deploy
```

This will build the project and push the `dist` folder to the `gh-pages` branch.

### Build Output

The Vite build creates an optimized bundle:
- Single HTML file with all CSS inlined
- Single JavaScript bundle with all code
- Favicon embedded as data URL
- All assets optimized and minified
- Compatible with GitHub Pages static hosting

## Tech Stack

- TypeScript
- Vite
- HTML5 Canvas
- IndexedDB
- Web Audio API

## License

MIT

Have fun!!!
