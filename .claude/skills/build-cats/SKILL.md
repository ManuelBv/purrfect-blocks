---
name: build-cats
description: Convert pixel art screenshots into 2D sprite matrices for Purrfect Blocks cats. Analyzes images and outputs TypeScript-ready number arrays.
---

# Build Cats Skill

Converts pixel art images into sprite matrices for the Purrfect Blocks cat rendering system.

## Usage

```
/build-cats [image-path]
/build-cats (then provide image in chat)
```

## Process

### Step 1: Read the Image

Use the Read tool to view the provided image file. The image should be:
- Pixel art style (clear, distinct pixels)
- Preferably on transparent or solid background
- Cat in a clear pose

### Step 2: Analyze Colors

Map the image colors to the standard palette indices:

| Index | Purpose | Typical Colors |
|-------|---------|----------------|
| 0 | Transparent | Background, empty |
| 1 | Outline | Dark brown (#442211), Dark gray (#5c5c5c) |
| 2 | Dark shade | Medium brown (#774422), Gray (#8a8a8a) |
| 3 | Mid tone | Orange-brown (#aa6633), Light gray (#b8b8b8) |
| 4 | Light tone | Tan (#cc8844), Off-white (#e0e0e0) |
| 5 | Highlight | Cream (#eebb88), White (#ffffff) |
| 6 | Pink | Ears/nose (#ddaa99, #e8b8b8) |
| 7 | Eye dark | Dark (#332211, #3a3a3a) |
| 8 | Eye highlight | Light (#ccbb99, #f0f0f0) |

### Step 3: Build the Matrix

Create a 2D array row by row:

1. Determine sprite dimensions (width × height)
2. For each row (top to bottom):
   - For each pixel (left to right):
   - Assign the color index (0-8)
3. Add row/column comments for readability

### Step 4: Output Format

```typescript
// [Cat pose] sprite - [width] wide x [height] tall
private [poseName]Sprite: number[][] = [
  //0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8
  [0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0], // 0 - ear tips
  [0,0,0,1,6,2,1,0,0,0,0,0,1,2,6,1,0,0,0], // 1 - ears
  // ... continue for all rows
];
```

## Example Conversion

Given a 5×5 pixel art of a simple shape:

**Visual:**
```
. . X X .
. X O O X
X O O O X
. X O O X
. . X X .
```

**Output:**
```typescript
private exampleSprite: number[][] = [
  //0 1 2 3 4
  [0,0,1,1,0], // 0
  [0,1,4,4,1], // 1
  [1,4,4,4,1], // 2
  [0,1,4,4,1], // 3
  [0,0,1,1,0], // 4
];
```

## Animation Frames

For multi-frame animations, create separate sprites for each frame:

```typescript
// Walking frame 1 - front legs forward
private walkFrame1: number[][] = [...];

// Walking frame 2 - mid stride
private walkFrame2: number[][] = [...];

// Walking frame 3 - back legs forward
private walkFrame3: number[][] = [...];

// Walking frame 4 - mid stride return
private walkFrame4: number[][] = [...];

// Combine into animation array
private walkFrames: number[][][] = [
  this.walkFrame1,
  this.walkFrame2,
  this.walkFrame3,
  this.walkFrame4,
];
```

## Tips for Good Sprites

1. **Consistent dimensions** - Keep all frames same size, pad with 0s
2. **Clear outlines** - Use index 1 for all edges
3. **Shading direction** - Light from top-left (highlight top, shadow bottom)
4. **Eye placement** - Use 7 for pupil outline, 8 for highlight
5. **Pink accents** - Index 6 for inner ears and nose only
6. **Stripe patterns** - Alternate 2 and 3 for tabby stripes

## Integration

After generating sprites, add them to `src/rendering/CatRenderer.ts`:

1. Add as private class property
2. Update `renderCat()` method to use new sprite
3. If animation, update frame selection logic
