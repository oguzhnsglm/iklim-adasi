import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserProgressContext = createContext(null);

const STORAGE_KEY = "userProgress";
const TREE_COST = 250; // Her ağaç için gerekli EkoPuan

// Rozet tanımları
export const BADGES_CATALOG = [
  { id: "sprout", title: "🌱 Filiz", requirementTrees: 1, color: "#4CAF50" },
  { id: "planter", title: "🌿 Fidan Bekçisi", requirementTrees: 3, color: "#2E7D32" },
  { id: "forest", title: "🌳 Orman Dostu", requirementTrees: 5, color: "#1B5E20" },
  { id: "guardian", title: "🛡️ Doğa Koruyucu", requirementTrees: 10, color: "#00695C" },
  { id: "hero", title: "⭐ Gezegen Kahramanı", requirementTrees: 20, color: "#FFD700" },
];

// Tema tanımları ve kilit kuralları
export const THEMES_CATALOG = [
  { id: "forest", name: "🌳 Orman Ülkesi", unlockAtTrees: 0, colors: ["#1B5E20", "#2E7D32", "#4CAF50"] },
  { id: "ocean", name: "🌊 Deniz Kıtası", unlockAtTrees: 5, colors: ["#0C4B72", "#0E76A8", "#1E88E5"] },
  { id: "air", name: "☁️ Hava Dünyası", unlockAtTrees: 12, colors: ["#87CEEB", "#ADD8E6", "#E0F6FF"] },
  { id: "glacier", name: "❄️ Buzul Gezegen", unlockAtTrees: 20, colors: ["#0B4A74", "#0EA5E9", "#E8F8FF"] },
];

export const UserProgressProvider = ({ children }) => {
  const [userProgress, setUserProgress] = useState({
    ecoPoints: 0,
    treesPlanted: 0,
    currentTheme: "forest",
    badges: [],
    level: 1,
    lastThemeUnlockAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState(null);

  // Başlangıçta veri yükle
  useEffect(() => {
    loadProgress();
  }, []);

  // AsyncStorage'den yükle
  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProgress(parsed);
      }
    } catch (error) {
      console.log("Progress yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  // AsyncStorage'e kaydet
  const saveProgress = async (newProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.log("Progress kayıt hatası:", error);
    }
  };

  // EkoPuan ekle (oyun sonunda çağrılır)
  const addEcoPoints = async (points) => {
    const newProgress = {
      ...userProgress,
      ecoPoints: userProgress.ecoPoints + points,
    };
    setUserProgress(newProgress);
    await saveProgress(newProgress);
  };

  // Ağaç dik (EkoPuan harcan)
  const plantTree = async () => {
    // Puan yetersizse false döndür
    if (userProgress.ecoPoints < TREE_COST) {
      return { success: false, reason: "insufficient_points" };
    }

    const newProgress = {
      ...userProgress,
      ecoPoints: userProgress.ecoPoints - TREE_COST,
      treesPlanted: userProgress.treesPlanted + 1,
    };

    // Tema ve rozetleri kontrol et
    const withThemeUpdate = updateThemeByTrees(newProgress);
    const withBadgesUpdate = await checkAndUnlockBadges(withThemeUpdate);

    setUserProgress(withBadgesUpdate);
    await saveProgress(withBadgesUpdate);

    return { success: true, newTree: withBadgesUpdate.treesPlanted };
  };

  // Tema otomatik güncelle
  const updateThemeByTrees = (progress) => {
    let newTheme = "forest";
    let themeChanged = false;

    // Ağaç sayısına göre tema belirle
    if (progress.treesPlanted >= 20) {
      newTheme = "glacier";
    } else if (progress.treesPlanted >= 12) {
      newTheme = "air";
    } else if (progress.treesPlanted >= 5) {
      newTheme = "ocean";
    } else {
      newTheme = "forest";
    }

    if (newTheme !== progress.currentTheme) {
      themeChanged = true;
    }

    return {
      ...progress,
      currentTheme: newTheme,
      lastThemeUnlockAt: themeChanged ? new Date().toISOString() : progress.lastThemeUnlockAt,
    };
  };

  // Rozetleri kontrol et ve aç
  const checkAndUnlockBadges = async (progress) => {
    const newBadges = [...progress.badges];
    let badgeJustUnlocked = null;

    for (const badge of BADGES_CATALOG) {
      // Henüz açılmamış ve şartı sağlıyorsa
      if (!newBadges.includes(badge.id) && progress.treesPlanted >= badge.requirementTrees) {
        newBadges.push(badge.id);
        badgeJustUnlocked = badge; // Son açılan rozeti sakla
      }
    }

    if (badgeJustUnlocked) {
      setNewBadgeUnlocked(badgeJustUnlocked);
      // 3 saniye sonra notification'u temizle
      setTimeout(() => setNewBadgeUnlocked(null), 3000);
    }

    return {
      ...progress,
      badges: newBadges,
    };
  };

  // Tema kilitli mi kontrol et
  const isThemeUnlocked = (themeId) => {
    const theme = THEMES_CATALOG.find((t) => t.id === themeId);
    if (!theme) return false;
    return userProgress.treesPlanted >= theme.unlockAtTrees;
  };

  // Tema bilgisini al
  const getThemeInfo = (themeId) => {
    const theme = THEMES_CATALOG.find((t) => t.id === themeId);
    return theme || THEMES_CATALOG[0];
  };

  // Rozet bilgisini al
  const getBadgeInfo = (badgeId) => {
    return BADGES_CATALOG.find((b) => b.id === badgeId);
  };

  // Sonraki ağaca kaç puan kaldığını hesapla
  const getPointsToNextTree = () => {
    const pointsNeeded = TREE_COST - (userProgress.ecoPoints % TREE_COST);
    return pointsNeeded === TREE_COST ? 0 : pointsNeeded;
  };

  // Progress yüzdesini hesapla (şu anki ağaca)
  const getProgressPercentage = () => {
    const pointsInCurrentCycle = userProgress.ecoPoints % TREE_COST;
    return (pointsInCurrentCycle / TREE_COST) * 100;
  };

  const value = {
    userProgress,
    loading,
    addEcoPoints,
    plantTree,
    updateThemeByTrees,
    checkAndUnlockBadges,
    isThemeUnlocked,
    getThemeInfo,
    getBadgeInfo,
    getPointsToNextTree,
    getProgressPercentage,
    newBadgeUnlocked,
    TREE_COST,
  };

  return <UserProgressContext.Provider value={value}>{children}</UserProgressContext.Provider>;
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error("useUserProgress must be used within UserProgressProvider");
  }
  return context;
};
