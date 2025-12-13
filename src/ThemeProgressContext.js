import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tema zinciri: Yağmur Ormanı → Pasifik Okyanusu → Sahra Çölü → Antarktika Buzulu
const THEMES = [
  {
    id: "rainforest",
    name: "Yağmur Ormanı Teması",
    icon: "🌳",
    description: "Sıcak ve nemli iklimde, gökyüzünü örten yoğun ağaçlar ve rengarenk hayvanlar.",
    totalZones: 8,
    pointsPerZone: 500,
    maxLevels: 15,
    palette: {
      background: "#E8F5E9",
      primary: "#166534",
      accent: "#4ade80",
    },
  },
  {
    id: "pacific",
    name: "Pasifik Okyanusu Teması",
    icon: "🌊",
    description: "Balıklarla, mercan resifleriyle ve derin mavi sularla dolu geniş okyanus dünyası.",
    totalZones: 8,
    pointsPerZone: 600,
    unlockAfter: "rainforest",
    maxLevels: 15,
    palette: {
      background: "#E0F7FA",
      primary: "#0369A1",
      accent: "#38bdf8",
    },
  },
  {
    id: "sahara",
    name: "Sahra Çölü Teması",
    icon: "🏜️",
    description: "Sıcak kum tepeleri, güneşli günler ve dayanıklı bitkiler.",
    totalZones: 8,
    pointsPerZone: 625,
    unlockAfter: "pacific",
    maxLevels: 15,
    palette: {
      background: "#FFF7ED",
      primary: "#C2410C",
      accent: "#FDBA74",
    },
  },
  {
    id: "antarctica",
    name: "Antarktika Buzul Teması",
    icon: "❄️",
    description: "Buzullarla kaplı kıta, kutup hayvanları ve soğuk rüzgarlar.",
    totalZones: 8,
    pointsPerZone: 650,
    unlockAfter: "sahara",
    maxLevels: 15,
    palette: {
      background: "#E3F2FD",
      primary: "#0ea5e9",
      accent: "#bae6fd",
    },
  },
];

const THEME_MAP = THEMES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

const STORAGE_KEY = "themeState";

const ThemeProgressContext = createContext(null);

export const ThemeProgressProvider = ({ children }) => {
  const emptyProgress = THEMES.reduce((acc, t) => {
    acc[t.id] = { cleanedZones: 0, spentPoints: 0 };
    return acc;
  }, {});

  const emptyLevels = THEMES.reduce((acc, t) => {
    acc[t.id] = { completedLevels: 0, badges: [] };
    return acc;
  }, {});

  const [state, setState] = useState({
     activeThemeId: "rainforest",
     unlockedThemeIds: ["rainforest"],
    progressMap: emptyProgress,
    levelState: emptyLevels,
    totalScore: 0,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const storedScore = await AsyncStorage.getItem("totalScore");

        let nextState = { ...state };
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            nextState = {
              ...nextState,
              ...parsed,
              progressMap: {
                ...emptyProgress,
                ...(parsed.progressMap || {}),
              },
              levelState: {
                ...emptyLevels,
                ...(parsed.levelState || {}),
              },
            };
          } catch (e) {
            console.log("Theme state parse error", e);
          }
        }

        if (storedScore) {
          const parsedScore = parseInt(storedScore, 10);
          if (!isNaN(parsedScore)) {
            nextState.totalScore = parsedScore;
          }
        }

        // Orman her zaman açık olsun; diğer temalar seviye durumuna göre açılır
          // Yağmur ormanı her zaman açık olsun; diğer temalar seviye durumuna göre açılır
        const unlocked = new Set(nextState.unlockedThemeIds || []);
          unlocked.add("rainforest");

        THEMES.forEach((theme) => {
          if (!theme.unlockAfter) return;
          const parent = theme.unlockAfter;
          const lvl = nextState.levelState?.[parent] || { completedLevels: 0, badges: [] };
          const def = THEME_MAP[parent];
          const maxLevels = def?.maxLevels || 12;
          if (lvl.completedLevels >= maxLevels) {
            unlocked.add(theme.id);
          }
        });

        nextState.unlockedThemeIds = THEMES.map((t) => t.id).filter((id) =>
          unlocked.has(id)
        );

        setState(nextState);
      } catch (e) {
        console.log("Theme state load error", e);
      } finally {
        setInitialized(true);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistState = async (next) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeThemeId: next.activeThemeId,
          unlockedThemeIds: next.unlockedThemeIds,
          progressMap: next.progressMap,
          levelState: next.levelState,
        })
      );
      if (typeof next.totalScore === "number") {
        await AsyncStorage.setItem("totalScore", next.totalScore.toString());
      }
    } catch (e) {
      console.log("Theme state persist error", e);
    }
  };

  const registerScore = async (delta) => {
    if (!delta || delta <= 0) return;

    setState((prev) => {
      const activeThemeId = prev.activeThemeId || "rainforest";
      const themeDef = THEME_MAP[activeThemeId] || THEMES[0];
      const prevProgress = prev.progressMap[activeThemeId] || {
        cleanedZones: 0,
        spentPoints: 0,
      };

      let spentPoints = prevProgress.spentPoints + delta;
      let cleanedZones = prevProgress.cleanedZones;

      const zoneCost = themeDef.pointsPerZone;
      const maxZones = themeDef.totalZones;

      while (spentPoints >= zoneCost && cleanedZones < maxZones) {
        spentPoints -= zoneCost;
        cleanedZones += 1;
      }

      const newProgressMap = {
        ...prev.progressMap,
        [activeThemeId]: { cleanedZones, spentPoints },
      };

      const next = {
        ...prev,
        progressMap: newProgressMap,
        totalScore: (prev.totalScore || 0) + delta,
      };

      // AsyncStorage kaydını tetikle (fire-and-forget)
      persistState(next);
      return next;
    });
  };

  const registerLevelResult = (badgeType) => {
    if (!badgeType) return;

    setState((prev) => {
      const themeId = prev.activeThemeId || "rainforest";
      const themeDef = THEME_MAP[themeId] || THEMES[0];
      const maxLevels = themeDef.maxLevels || 12;
      const current = prev.levelState?.[themeId] || { completedLevels: 0, badges: [] };

      if (current.completedLevels >= maxLevels) {
        return prev; // tüm seviyeler zaten tamamlandı
      }

      const updatedThemeLevel = {
        completedLevels: current.completedLevels + 1,
        badges: [...current.badges, badgeType],
      };

      const nextLevelState = {
        ...prev.levelState,
        [themeId]: updatedThemeLevel,
      };

      // Seviye tamamlandıysa bir sonraki temayı aç
      const unlocked = new Set(prev.unlockedThemeIds || []);
      unlocked.add("rainforest");

      THEMES.forEach((theme) => {
        if (!theme.unlockAfter) return;
        const parent = theme.unlockAfter;
        const parentDef = THEME_MAP[parent];
        const parentMax = parentDef?.maxLevels || 12;
        const parentLevels =
          (parent === themeId ? updatedThemeLevel : nextLevelState[parent]) ||
          { completedLevels: 0, badges: [] };
        if (parentLevels.completedLevels >= parentMax) {
          unlocked.add(theme.id);
        }
      });

      const next = {
        ...prev,
        levelState: nextLevelState,
        unlockedThemeIds: THEMES.map((t) => t.id).filter((id) => unlocked.has(id)),
      };

      persistState(next);
      return next;
    });
  };

  const setActiveTheme = (themeId) => {
    if (!THEME_MAP[themeId]) return;
    setState((prev) => {
      if (!prev.unlockedThemeIds.includes(themeId)) return prev;
      const next = { ...prev, activeThemeId: themeId };
      persistState(next);
      return next;
    });
  };

  const enhancedThemes = THEMES.map((theme) => {
    const progress = state.progressMap[theme.id] || {
      cleanedZones: 0,
      spentPoints: 0,
    };
    const levelInfo = state.levelState?.[theme.id] || {
      completedLevels: 0,
      badges: [],
    };
    const unlocked = state.unlockedThemeIds.includes(theme.id);
    const maxLevels = theme.maxLevels || 12;
    const completed = levelInfo.completedLevels >= maxLevels;
    const ratio = maxLevels > 0 ? levelInfo.completedLevels / maxLevels : 0;

    return {
      ...theme,
      unlocked,
      completed,
      cleanedZones: progress.cleanedZones,
      progressRatio: ratio,
      completedLevels: levelInfo.completedLevels,
      maxLevels,
      badges: levelInfo.badges,
    };
  });

  const activeTheme =
    enhancedThemes.find((t) => t.id === state.activeThemeId) || enhancedThemes[0];

  return (
    <ThemeProgressContext.Provider
      value={{
        initialized,
        themes: enhancedThemes,
        activeTheme,
        activeThemeId: state.activeThemeId,
        totalScore: state.totalScore,
        registerScore,
        registerLevelResult,
        setActiveTheme,
      }}
    >
      {children}
    </ThemeProgressContext.Provider>
  );
};

export const useThemeProgress = () => {
  const ctx = useContext(ThemeProgressContext);
  if (!ctx) {
    throw new Error("useThemeProgress must be used within ThemeProgressProvider");
  }
  return ctx;
};
