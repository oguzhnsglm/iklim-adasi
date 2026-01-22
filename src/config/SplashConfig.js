/**
 * Splash Screen Konfigürasyonu
 * Giriş ekranının görünümünü ve davranışını kontrol eder
 */

export const SPLASH_CONFIG = {
  // Temel ayarlar
  enabled: true,
  showDuration: null, // null = kullanıcı kapatana kadar
  autoHideDelay: 0, // ms, 0 = devre dışı

  // Başlık ve metin
  title: "Doğayı Koru",
  subtitle: "Oyna, öğren, dünyayı iyileştir",
  infoText: "Her oyun oynayarak doğayı kurtarabilirsin ✨",

  // Ağaç dikme kartı
  treePlanting: {
    enabled: true,
    position: "middle", // top | middle | bottom
    showCounter: true,
    counterPrefix: "🌳 Bugün dikildi: ",
    counterSuffix: " ağaç",
    animationEnabled: true,
  },

  // Buton ayarları
  playButton: {
    title: "OYUNA BAŞLA",
    emoji: "🎮",
    animationEnabled: true,
  },

  // Tema ayarları
  theme: {
    gradient: {
      colors: ["#E8F5E9", "#C8E6C9", "#A5D6A7"],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    // Glassmorphism yoğunluğu (0-100)
    glassIntensity: 60,
  },

  // Animasyon ayarları
  animations: {
    fadeInDuration: 800,
    slideUpDuration: 800,
    cardDelay: 400,
    cardDuration: 600,
    buttonScaleDuration: 100,
    exitDuration: 400,
  },

  // Dekoratif öğeler
  decorations: {
    floatingElements: true,
    topLeftElement: "🍃",
    bottomLeftElement: "🌼",
    bottomRightElement: "🐦",
    opacityLevels: {
      topLeft: 0.4,
      bottomLeft: 0.3,
      bottomRight: 0.25,
    },
  },

  // Logo / Header
  header: {
    logoEmojis: ["🌍", "♻️"],
    decorLine: true,
    decorLineColor: "#34C759",
  },
};

/**
 * Tema ayarlarını dinamik olarak güncellemek için helper
 */
export const updateSplashConfig = (updates) => {
  return { ...SPLASH_CONFIG, ...updates };
};

/**
 * Giriş ekranını devre dışı bırak
 */
export const disableSplash = () => {
  SPLASH_CONFIG.enabled = false;
};

/**
 * Giriş ekranını etkinleştir
 */
export const enableSplash = () => {
  SPLASH_CONFIG.enabled = true;
};

export default SPLASH_CONFIG;
