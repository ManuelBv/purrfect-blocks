#!/usr/bin/env python3
"""
Sprite Converter for Purrfect Blocks
Converts pixel art images into 2D sprite matrices for cat rendering.

Usage:
    python sprite_converter.py <image_path> [--output <output_path>] [--name <sprite_name>]

Example:
    python sprite_converter.py cat_sitting.png --name sittingSprite
    python sprite_converter.py cat_walk1.png --output sprites.ts --name walkFrame1
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Error: Required packages not installed.")
    print("Run: pip install Pillow numpy")
    sys.exit(1)


# Color palette for Purrfect Blocks cats
# Each entry: (R, G, B) -> index
# Index 0 is transparent (handled separately)
PALETTE = {
    # Orange Tabby palette
    'outline_dark': [(0x44, 0x22, 0x11), (0x33, 0x22, 0x11), (0x5c, 0x5c, 0x5c)],  # 1
    'dark_shade': [(0x77, 0x44, 0x22), (0x8a, 0x8a, 0x8a)],  # 2
    'mid_tone': [(0xaa, 0x66, 0x33), (0xb8, 0xb8, 0xb8)],  # 3
    'light_tone': [(0xcc, 0x88, 0x44), (0xe0, 0xe0, 0xe0)],  # 4
    'highlight': [(0xee, 0xbb, 0x88), (0xff, 0xff, 0xff)],  # 5
    'pink': [(0xdd, 0xaa, 0x99), (0xe8, 0xb8, 0xb8)],  # 6
    'eye_dark': [(0x33, 0x22, 0x11), (0x3a, 0x3a, 0x3a)],  # 7
    'eye_highlight': [(0xcc, 0xbb, 0x99), (0xf0, 0xf0, 0xf0)],  # 8
}

# Flattened palette for matching: list of (r, g, b, index)
FLAT_PALETTE = []
for idx, (name, colors) in enumerate(PALETTE.items(), start=1):
    for color in colors:
        FLAT_PALETTE.append((color[0], color[1], color[2], idx))


def color_distance(c1, c2):
    """Calculate Euclidean distance between two RGB colors."""
    return ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2) ** 0.5


def find_closest_palette_index(r, g, b, alpha):
    """Find the closest palette index for a given RGBA color."""
    # Transparent pixels
    if alpha < 128:
        return 0

    # Find closest color in palette
    min_distance = float('inf')
    best_index = 1  # Default to outline

    for pr, pg, pb, idx in FLAT_PALETTE:
        dist = color_distance((r, g, b), (pr, pg, pb))
        if dist < min_distance:
            min_distance = dist
            best_index = idx

    return best_index


def image_to_sprite_matrix(image_path: str) -> tuple[list[list[int]], int, int]:
    """
    Convert an image to a 2D sprite matrix.

    Returns:
        (matrix, width, height)
    """
    img = Image.open(image_path)

    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    pixels = np.array(img)

    matrix = []
    for y in range(height):
        row = []
        for x in range(width):
            r, g, b, a = pixels[y, x]
            index = find_closest_palette_index(r, g, b, a)
            row.append(index)
        matrix.append(row)

    return matrix, width, height


def matrix_to_typescript(matrix: list[list[int]], name: str, width: int, height: int) -> str:
    """Convert a sprite matrix to TypeScript code."""
    lines = []
    lines.append(f"// {name} sprite - {width} wide x {height} tall")
    lines.append(f"private {name}: number[][] = [")

    # Column header comment
    if width <= 30:
        header = "  //" + "".join(f"{i%10}" for i in range(width))
        lines.append(header)

    for y, row in enumerate(matrix):
        row_str = "[" + ",".join(str(v) for v in row) + "]"
        if y < len(matrix) - 1:
            row_str += ","
        lines.append(f"  {row_str} // {y}")

    lines.append("];")

    return "\n".join(lines)


def analyze_image(image_path: str) -> dict:
    """Analyze an image and return color statistics."""
    img = Image.open(image_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    pixels = np.array(img)

    # Count unique colors
    colors = {}
    transparent_count = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[y, x]
            if a < 128:
                transparent_count += 1
            else:
                key = (r, g, b)
                colors[key] = colors.get(key, 0) + 1

    return {
        'width': width,
        'height': height,
        'total_pixels': width * height,
        'transparent_pixels': transparent_count,
        'unique_colors': len(colors),
        'top_colors': sorted(colors.items(), key=lambda x: -x[1])[:10]
    }


def print_analysis(analysis: dict):
    """Print image analysis results."""
    print(f"\n=== Image Analysis ===")
    print(f"Dimensions: {analysis['width']} x {analysis['height']}")
    print(f"Total pixels: {analysis['total_pixels']}")
    print(f"Transparent: {analysis['transparent_pixels']}")
    print(f"Unique colors: {analysis['unique_colors']}")
    print(f"\nTop 10 colors (RGB, count):")
    for color, count in analysis['top_colors']:
        r, g, b = color
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        idx = find_closest_palette_index(r, g, b, 255)
        print(f"  {hex_color} -> palette index {idx} (count: {count})")


def main():
    parser = argparse.ArgumentParser(
        description="Convert pixel art images to Purrfect Blocks sprite matrices"
    )
    parser.add_argument("image", help="Path to the input image")
    parser.add_argument("--output", "-o", help="Output file path (default: stdout)")
    parser.add_argument("--name", "-n", default="sprite", help="Sprite variable name")
    parser.add_argument("--analyze", "-a", action="store_true", help="Only analyze, don't convert")

    args = parser.parse_args()

    if not Path(args.image).exists():
        print(f"Error: Image not found: {args.image}")
        sys.exit(1)

    # Analyze the image
    analysis = analyze_image(args.image)
    print_analysis(analysis)

    if args.analyze:
        sys.exit(0)

    # Convert to matrix
    print(f"\nConverting to sprite matrix...")
    matrix, width, height = image_to_sprite_matrix(args.image)

    # Generate TypeScript
    typescript = matrix_to_typescript(matrix, args.name, width, height)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(typescript)
        print(f"Saved to: {args.output}")
    else:
        print(f"\n=== TypeScript Output ===\n")
        print(typescript)

    print(f"\nDone! Sprite is {width}x{height} pixels.")


if __name__ == "__main__":
    main()
