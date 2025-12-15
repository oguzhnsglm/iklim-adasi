// Data-only config for the Candy-style Theme Worlds map.
// Add new themes/segments by editing this file (no UI code changes needed).

export const THEME_WORLD_SEGMENTS = [
  { themeId: "rainforest", levelCount: 60 },
  { themeId: "pacific", levelCount: 60 },
  { themeId: "sahara", levelCount: 60 },
  { themeId: "antarctica", levelCount: 60 },
];

// Award / show milestone badges at this cadence.
export const LEVEL_BADGE_EVERY = 10;

// Height tuning for the map layout.
export const MAP_NODE_GAP = 92;
export const MAP_SECTION_PAD_TOP = 120;
export const MAP_SECTION_PAD_BOTTOM = 150;

// A small blending band between theme segments for a smooth scroll transition.
export const MAP_THEME_TRANSITION_HEIGHT = 240;
