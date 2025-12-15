// Visual-only theme configuration for the Candy-style map.
// Must not affect progression, questions, rewards.

export const themeVisuals = {
  // Aliases to match the requested naming (forest/ocean/desert/ice)
  forest: null,
  ocean: null,
  desert: null,
  ice: null,

  rainforest: {
    id: "rainforest",
    name: "Orman",
    background: {
      baseAlpha: 0.22,
    },
    scenery: {
      edgeEmojis: ["🌳", "🦉", "🦌", "🐒", "🦋", "🍄", "🌿"],
      density: 12,
    },
    effects: {
      type: "leaf",
      intensity: 1,
    },
    road: {
      base: "rgba(255,255,255,0.11)",
      stripeA: "rgba(34,197,94,0.22)",
      stripeB: "rgba(255,255,255,0.12)",
    },
  },

  pacific: {
    id: "pacific",
    name: "Okyanus",
    background: {
      baseAlpha: 0.18,
    },
    scenery: {
      edgeEmojis: ["🐠", "🪼", "🐢", "🐬", "🦀", "🪸", "🌊"],
      density: 12,
    },
    effects: {
      type: "wave",
      intensity: 1,
    },
    road: {
      base: "rgba(255,255,255,0.10)",
      stripeA: "rgba(56,189,248,0.22)",
      stripeB: "rgba(255,255,255,0.12)",
    },
  },

  sahara: {
    id: "sahara",
    name: "Çöl",
    background: {
      baseAlpha: 0.10,
    },
    scenery: {
      edgeEmojis: ["🌵", "🐪", "🦎", "🦂", "🪨", "🏜️"],
      density: 11,
    },
    effects: {
      type: "heat",
      intensity: 1,
    },
    road: {
      base: "rgba(251,191,36,0.20)",
      stripeA: "rgba(251,191,36,0.16)",
      stripeB: "rgba(255,255,255,0.10)",
    },
  },

  antarctica: {
    id: "antarctica",
    name: "Buzul",
    background: {
      baseAlpha: 0.14,
    },
    scenery: {
      edgeEmojis: ["🐧", "🦭", "🐻‍❄️", "❄️", "🧊", "🌌"],
      density: 11,
    },
    effects: {
      type: "snow",
      intensity: 1,
    },
    road: {
      base: "rgba(255,255,255,0.10)",
      stripeA: "rgba(167,139,250,0.18)",
      stripeB: "rgba(255,255,255,0.12)",
    },
  },
};

// Fill aliases (kept as separate keys for clarity)
themeVisuals.forest = themeVisuals.rainforest;
themeVisuals.ocean = themeVisuals.pacific;
themeVisuals.desert = themeVisuals.sahara;
themeVisuals.ice = themeVisuals.antarctica;

export function getThemeVisual(themeId) {
  return themeVisuals[themeId] || themeVisuals.rainforest;
}
