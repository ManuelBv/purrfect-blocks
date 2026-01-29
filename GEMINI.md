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

Gemini CLI can delegate tasks to specialized sub-agents to assist in completing a task. These agents have expertise in specific areas.

Available agents:
- `codebase_investigator`: The specialized tool for codebase analysis, architectural mapping, and understanding system-wide dependencies. Use this for tasks like vague requests, bug root-cause analysis, system refactoring, comprehensive feature implementation or to answer questions about the codebase that require investigation.
- `cli_help`: Specialized in answering questions about how users use Gemini CLI: features, documentation, and current runtime configuration.

### Using Agents

To use an agent, utilize the `delegate_to_agent` tool:

```javascript
delegate_to_agent({
  agent_name: "codebase_investigator",
  objective: "Analyze the architecture of the game's rendering system."
});
```

## Skills

Gemini CLI can activate specialized skills to extend its capabilities with specialized knowledge, workflows, or tool integrations.

Available skills:
- `skill-creator`: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Gemini CLI's capabilities.

### Using Skills

To activate a skill and receive its detailed instructions, call the `activate_skill` tool with the skill's name:

```javascript
activate_skill({ name: "skill-creator" });
```

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
