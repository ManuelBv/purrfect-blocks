# Purrfect Blocks 🐱☕

A cozy block puzzle game with a warm coffee shop aesthetic and interactive cats.

**🎮 [Play Now on GitHub Pages](https://manuelbv.github.io/purrfect-blocks/)**

## Features

- 8×8 grid with drag-and-drop gameplay
- 19 unique piece types (tetrominoes + solid squares)
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

## Claude Code Skills

Skills are reusable slash commands for Claude Code, stored in `.claude/skills/`. They extend Claude's behaviour with project-specific or community workflows.

### Installed Skills

| Skill | Command | Source | Purpose |
|-------|---------|--------|---------|
| TDD | `/tdd` | `mattpocock/skills/tdd` | Red-green-refactor loop — write one failing test, implement, refactor, repeat |
| Build Cats | `/build-cats` | project | Convert pixel art screenshots into TypeScript sprite matrices |

### Installing New Skills

```bash
# Install a community skill from the skills registry
npx skills add <author>/<skill-name>

# Examples
npx skills add mattpocock/skills/tdd
```

Skills are saved to `.claude/skills/` and picked up automatically by Claude Code in this project.

### Using Skills

Type the skill command in a Claude Code conversation:

```
/tdd          # Start a TDD session for a feature or bug fix
/build-cats   # Convert a pixel art image into a sprite matrix
```

## Tech Stack

- TypeScript
- Vite
- HTML5 Canvas
- IndexedDB
- Web Audio API

## License

MIT

Have fun!
