/**
 * Emoji Icons Library
 * Uygulamada kullanılan emoji ve ikonlar
 */

export const ICONS = {
  // Ağaçlar & Bitkiler
  tree: "🌳",
  sapling: "🌱",
  seedling: "🌿",
  earth: "🌍",
  greenLeaf: "🍃",
  flower: "🌼",
  cactus: "🌵",
  
  // Hayvanlar
  bird: "🐦",
  butterfly: "🦋",
  whale: "🐋",
  fish: "🐠",
  penguin: "🐧",
  camel: "🐪",
  bear: "🐻",
  
  // Su & Hava
  water: "💧",
  wave: "🌊",
  sun: "☀️",
  cloud: "☁️",
  snow: "❄️",
  
  // Emojiler - Giriş Ekranı
  globe: "🌍",
  recycle: "♻️",
  gamepad: "🎮",
  star: "⭐",
  sparkles: "✨",
  
  // Oyunlar
  trash: "🗑️",
  plastic: "🧴",
  paper: "📄",
  glass: "🥤",
  metal: "⚙️",
  organic: "🍂",
  
  // UI
  checkmark: "✅",
  cross: "❌",
  plus: "➕",
  minus: "➖",
  arrow: "→",
  close: "✕",
};

/**
 * Ağaç büyütme aşamaları
 */
export const TREE_STAGES = {
  soil: {
    emoji: "🌍",
    label: "Toprak",
    description: "Başlangıç noktası",
  },
  seedling: {
    emoji: "🌱",
    label: "Filiz",
    description: "İlk yeşillik",
  },
  sapling: {
    emoji: "🌿",
    label: "Fidan",
    description: "Büyüyor",
  },
  tree: {
    emoji: "🌳",
    label: "Ağaç",
    description: "Tamamlandı!",
  },
};

/**
 * Tema emojileri
 */
export const THEME_EMOJIS = {
  rainforest: {
    primary: "🌳",
    secondary: ["🌿", "🍃", "🦋", "🐦"],
    background: ["🌳", "🌲", "🌳", "🦗", "🐛"],
  },
  ocean: {
    primary: "🌊",
    secondary: ["🐠", "🐟", "🐳", "🦈"],
    background: ["🐠", "🐚", "⭐", "🦀", "🐙"],
  },
  desert: {
    primary: "🌵",
    secondary: ["☀️", "🐪", "🦂", "🐍"],
    background: ["🏜️", "🌞", "🌵", "🏜️"],
  },
  arctic: {
    primary: "❄️",
    secondary: ["🐧", "🦭", "🐻‍❄️", "🐾"],
    background: ["❄️", "🧊", "⛷️", "🏔️"],
  },
};

/**
 * Başarı & Achievement emojileri
 */
export const ACHIEVEMENT_ICONS = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  trophy: "🏆",
  medal: "🎖️",
  badge: "🏅",
};

/**
 * Ses efektleri (text representation)
 */
export const SOUND_EMOJIS = {
  tap: "👆",
  success: "✅",
  error: "❌",
  warning: "⚠️",
  levelup: "⬆️",
  plant: "🌱",
  water: "💧",
};

export default {
  ICONS,
  TREE_STAGES,
  THEME_EMOJIS,
  ACHIEVEMENT_ICONS,
  SOUND_EMOJIS,
};
