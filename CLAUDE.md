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

- **Grid:** 8×8 cells, responsive sizing
- **Pieces:** 19 types (16 tetromino rotations: L×4, I×4, F×4, T×4) + (3 squares: 1×1, 2×2, 3×3) + bombs
- **Scoring:** 100 points/line × streak multiplier (+0.5x per consecutive clearing turn); streak resets when a placement causes no clear
- **Bombs:** 1×1 yarn balls → 3×3 explosion (50 pts/block); spawned every 3–5 turns by PieceManager (independent of streak)

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
| `src/game/Game.ts` | Main game controller |
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

## Cat Sprite Work Status

**Work on cat sprites and animations is currently SUSPENDED.**

Previous issues identified (as of 2026-01-24):
1. Performance was poor, especially during Y translation movements
2. Only ONE sprite (sittingCatFullSprite) was used for ALL states - no visual distinction between sitting/standing/walking/etc.
3. The state machine changed internal state but visually the cat looked the same
4. Needed separate sprite assets for each animation state to have meaningful visual differences

Do not attempt to fix or improve cat sprite work unless explicitly requested by the user.

## Session Archival Protocol

### User Command
When the user requests to "store this session" or "save this conversation", follow this protocol to create a comprehensive session archive file.

### Archive File Naming
Format: `[YYYY-MM-DD]-CLAUDE-[subject].md`

Example: `2026-02-01-CLAUDE-claude-convo-extractor-github-setup.md`

### Required Content Structure

Generate a complete session archive file with the following sections:

#### 1. Header Metadata
- Date (YYYY-MM-DD)
- Session Subject (descriptive title)
- Duration estimate
- Status (Completed/In Progress)
- Completeness indicator (100% - All conversation + technical details)

#### 2. Conversation Flow Section
For each user message, include:
- **User Request**: Exact user message text in blockquote format
- **Claude Response**: Summary of what Claude responded
- **Actions Taken**: Bullet list of what was executed
- **Sample Results**: Key outputs or file changes

#### 3. Technical Execution Details Section
For each major action/file modification, include:
- **File Path**: Absolute path to the file
- **File Details**: Total lines, language, type
- **Original Content**: Code/text before changes (in code blocks)
- **New Content**: Code/text after changes (in code blocks)
- **Changes Made**: Bullet list of modifications
- **Status**: ✅/❌ indicator

#### 4. Tool Calls & Outputs Section
For each bash/tool command executed:
- **Command**: Exact command with proper formatting
- **Output**: Complete command output
- **Exit Code**: Success/failure indicator
- **Impact**: What changed as a result

#### 5. Git History Section (if applicable)
- Commit hashes
- Commit messages
- Files changed
- Insertions/deletions
- Push status and results

#### 6. Summary & Metrics Section
Include:
- Table of all actions performed with status
- File statistics (paths, lines, actions)
- Total counts (files modified, created, renamed)
- Timeline breakdown by phase
- Key achievements checklist

#### 7. Code Review Notes (if applicable)
- Security considerations
- Performance impacts
- Testing coverage
- Breaking changes

#### 8. Complete File Listing (if applicable)
For bulk operations (file renames, creations):
- Complete numbered list of all files
- Before/after names for renames
- Status for each file

#### 9. Timeline Section
Table with columns:
- Step/Phase
- Action description
- Duration
- Status

### Quality Standards

**Completeness**: ✅ Must include ALL conversation details and technical execution
- No summarization that omits details
- Full code diffs for every edit
- Complete command outputs
- All user questions and Claude responses

**Accuracy**: ✅ All information must be factual
- Exact file paths (not approximations)
- Actual code snippets (not paraphrased)
- Real command outputs (not examples)
- Correct timestamps and dates
- Actual line numbers and file lengths

**Organization**: ✅ Logical, easy-to-navigate structure
- Clear section headings
- Numbered or bulleted lists
- Code blocks with syntax highlighting
- Tables for metrics and comparisons
- Proper markdown formatting

**Comprehensiveness**: ✅ Nothing important is left out
- Every file edited is documented
- Every command executed is shown
- Every user interaction is captured
- Full before/after for all changes
- All git operations logged

### Minimum Sections Required
1. ✅ Conversation flow with all user messages
2. ✅ Detailed technical execution for each major action
3. ✅ Complete code/content changes with diffs
4. ✅ All command outputs and results
5. ✅ Git history (if applicable)
6. ✅ Summary metrics and timeline
7. ✅ Complete status indicators

### Trigger Phrases
Create session archive when user says:
- "save this conversation"
- "store this session"
- "archive this conversation"
- "save this to conversations"
- "create a session file"
- "store this in [folder]"

### Special Instructions
- **Timestamps**: Include session date (today's date in YYYY-MM-DD format)
- **Tool Calls**: Show every bash command, read operation, edit operation
- **Outputs**: Capture actual tool outputs, not summaries
- **Code Context**: Show surrounding code and file context when possible
- **Security**: Highlight any security considerations or patterns
- **Completeness Check**: Verify every action in conversation is documented
