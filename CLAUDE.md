# Purrfect Blocks 🐱☕

A cozy block puzzle web game (like 1010!/Block Blast, NOT Tetris) with coffee shop aesthetic and interactive cats.

## Tech Stack

- TypeScript (strict mode), Vite, HTML5 Canvas 2D, Web Audio API
- IndexedDB with localStorage fallback
- Vitest (unit) + Playwright (E2E)
- GitHub Pages deployment

## Code Conventions

- **Classes:** PascalCase (`GameBoard`, `PieceFactory`)
- **Methods/Properties:** camelCase (`placePiece`, `cellSize`)
- **Constants:** CONSTANT_CASE (`GRID_WIDTH`, `BASE_SCORE`)
- **Private fields:** underscore prefix (`_occupied`, `_score`)
- **Interfaces:** in `src/types/`

## Architecture

```
src/
├── audio/      # AudioEngine, SoundEffects
├── board/      # Cell, CollisionDetector, GridManager
├── entities/   # Cat companion system
├── game/       # GamePhase2, GameBoard, CascadeEngine, LineDetector, PieceManager, ScoreManager
├── input/      # DragHandler, GhostPreview, InputManager
├── pieces/     # Piece, BombPiece, PieceFactory, PieceDefinitions
├── rendering/  # All Canvas renderers (BoardRenderer, PieceRenderer, etc.)
├── storage/    # GameStorage (IndexedDB)
├── types/      # GameTypes, PieceTypes, RenderTypes, StorageTypes
├── utils/      # constants, Colors, CanvasUtils, ErrorHandler
└── main.ts     # Entry point
```

## Design Patterns

- **Manager Pattern:** ScoreManager, PieceManager, ClearAnimationManager
- **Factory Pattern:** PieceFactory
- **Renderer Pattern:** Separate renderers per visual layer
- **Observer Pattern:** Game events → audio/cats reactions
- **State Machine:** GameState, CatAnimationState

## Game Mechanics

- **Grid:** 12×18 cells, responsive sizing
- **Pieces:** 22 types (16 tetrominoes + 4 squares + bombs)
- **Scoring:** 100 points/line × cascade multiplier (1.5x per level)
- **Bombs:** 1×1 yarn balls → 3×3 explosion (50 pts/block)

## Performance

- 60fps target (16ms frame budget)
- Mobile: 2-4 particles/block, Desktop: 4-8 particles/block
- Autosave debounced 300ms

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build
npm test         # Unit tests
npm run deploy   # Deploy to GitHub Pages
```

## Agents

Custom agents in `.claude/agents/`:

| Agent | Purpose |
|-------|---------|
| `orchestrator` | **Workflow coordinator** - directs full workflows or individual agents |
| `cat-builder` | Convert pixel art to sprite matrices for cats |
| `code-reviewer` | Review code for quality/performance |
| `unit-tester` | Write Vitest unit tests |
| `implementer` | Implement features following patterns |
| `implementation-planner` | Create detailed implementation plans |
| `architecture-researcher` | Research technical approaches |
| `legal-researcher` | Research compliance requirements |

### Using the Orchestrator

The orchestrator coordinates agents for you. Use it for:

```
Use orchestrator to add [new feature]     # Full workflow: research → plan → build → review → test
Use orchestrator to continue the plan     # Resume existing implementation
Use orchestrator to review and test       # Just verification steps
```

### Running Individual Agents

```
Use cat-builder to create sprites from this image
Use code-reviewer to review my recent changes
Use unit-tester to write tests for ScoreManager
Use implementer to add [feature]
Use implementation-planner to plan [feature]
```

### Manual Workflow

If you prefer to run agents individually:

```
1. Research: Use architecture-researcher to research [feature]
2. Plan: Use implementation-planner to create a plan
3. Build: Use implementer to work on Phase 1
4. Review: Use code-reviewer to review changes
5. Test: Use unit-tester to write tests
```

## Skills

Custom skills in `.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| `/build-cats` | Convert pixel art images to sprite matrices |

### Using Skills

```
/build-cats [path-to-image]
```

The cat-builder agent uses this skill internally to process screenshots.

## Key Files

| File | Purpose |
|------|---------|
| `src/game/GamePhase2.ts` | Main game controller |
| `src/game/GameBoard.ts` | Grid state and placement |
| `src/game/CascadeEngine.ts` | Line clearing and combos |
| `src/rendering/CatRenderer.ts` | Cat sprite matrices and rendering |
| `src/entities/Cat.ts` | Cat entity with animation states |
| `src/utils/constants.ts` | Configuration values |
## Communication Guidelines

- Do NOT claim work is "high quality" or "good performance" unless backed by actual measured numbers and visual proof
- Do NOT make assumptions about performance improvements without profiling data
- Be honest about the current state - if animations are janky, say so
- If there's only one sprite being used for all states, acknowledge that limitation
- **NEVER specify status claims like "fully functional", "error-free", "working perfectly" without substantiation**
  - ✅ GOOD: "Build completed successfully with exit code 0. TypeScript compilation passed with no errors."
  - ❌ BAD: "Status: Fully functional and error-free!"
  - Always explain WHY something is claimed to work, with evidence (build output, test results, console logs, etc.)

## Current Cat Animation Issues (as of 2026-01-24)

1. Performance is still bad, especially during Y translation movements
2. Only ONE sprite (sittingCatFullSprite) is used for ALL states - no visual distinction between sitting/standing/walking/etc.
3. The state machine changes internal state but visually the cat looks the same
4. Need separate sprite assets for each animation state to have meaningful visual differences
