// Half resolution sitting cat sprite - downsampled from 123x124 to 62x62
// Cleans up background artifacts then downsamples with mode selection

import { sittingCatFullSprite } from './SittingCatFullSprite';
import { cleanupBackgroundArtifacts, downsampleWithMode } from './SpriteUtils';

// Clean up artifacts then downsample by factor of 2 (50%)
const cleanedSprite = cleanupBackgroundArtifacts(sittingCatFullSprite);
export const sittingCatHalfSprite: number[][] = downsampleWithMode(cleanedSprite, 2);

// Also export a cleaned full-resolution version
export const sittingCatFullCleanedSprite: number[][] = cleanedSprite;
