import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LEVEL_BADGE_EVERY } from "./data/themeWorldMapConfig";
import { getThemeSegmentMeta, getTotalThemeWorldLevels, resolveGlobalLevel, resolveThemeLevel } from "./data/themeWorldLevels";

// v2: global sequential progress (still exposes per-theme derived progress)
const STORAGE_KEY = "themeWorldsProgress.v2";
const STORAGE_KEY_V1 = "themeWorldsProgress.v1";

export const THEME_WORLDS = [
  {
    id: "rainforest",
    name: "Yağmur Ormanı",
    icon: "🌿",
    slogan: "Ormanı koru, yaşamı yaşat.",
    gameType: "strategy",
  },
  {
    id: "pacific",
    name: "Pasifik Okyanusu",
    icon: "🌊",
    slogan: "Derinlikleri temizle, canlıları kurtar.",
    gameType: "action",
  },
  {
    id: "sahara",
    name: "Sahra Çölü",
    icon: "🏜️",
    slogan: "Suyunu yönet, hayatta kal.",
    gameType: "survival",
  },
  {
    id: "antarctica",
    name: "Antarktika Buzulu",
    icon: "🧊",
    slogan: "Dengeleri kur, buzları koru.",
    gameType: "puzzle",
  },
];

// Levels per theme are defined in src/data/themeWorldMapConfig.js

const DEFAULT_PROGRESS = {
  completedGlobal: 0,
  starsByLevelId: {},
  badges: [],
};

const ThemeWorldsProgressContext = createContext(null);

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const ThemeWorldsProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = safeParse(stored);
          if (parsed && typeof parsed === "object") {
            setProgress(() => {
              const total = getTotalThemeWorldLevels();
              const completedGlobal = Math.max(0, Math.min(total, Number(parsed.completedGlobal) || 0));
              const starsByLevelId = parsed.starsByLevelId && typeof parsed.starsByLevelId === "object" ? parsed.starsByLevelId : {};
              const badges = Array.isArray(parsed.badges) ? parsed.badges.filter(Boolean) : [];
              return { completedGlobal, starsByLevelId, badges };
            });
            return;
          }
        }

        // Migration from v1 (per-theme progress) -> v2 (global sequential)
        const legacy = await AsyncStorage.getItem(STORAGE_KEY_V1);
        if (legacy) {
          const parsedV1 = safeParse(legacy);
          if (parsedV1 && typeof parsedV1 === "object") {
            const segments = getThemeSegmentMeta();
            let completedGlobal = 0;
            // Only count the contiguous prefix (sequential) in new model.
            for (const seg of segments) {
              const entry = parsedV1?.[seg.themeId];
              const c = Math.max(0, Number(entry?.completedLevels) || 0);
              const add = Math.min(seg.levelCount, c);
              completedGlobal += add;
              if (add < seg.levelCount) break;
            }

            const badges = [];
            segments.forEach((seg) => {
              const entry = parsedV1?.[seg.themeId];
              if (Array.isArray(entry?.badges)) badges.push(...entry.badges.filter(Boolean));
            });

            const next = {
              completedGlobal: Math.max(0, Math.min(getTotalThemeWorldLevels(), completedGlobal)),
              starsByLevelId: {},
              badges,
            };
            setProgress(next);
            persist(next);
          }
        }
      } finally {
        setInitialized(true);
      }
    };

    load();
  }, []);

  const persist = async (next) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const isThemeUnlocked = (themeId) => {
    if (!themeId) return false;
    const segments = getThemeSegmentMeta();
    const seg = segments.find((s) => s.themeId === themeId);
    if (!seg) return false;
    // Unlocked when the player reaches the start of that segment.
    return (progress?.completedGlobal || 0) >= seg.startIndex;
  };

  const getThemeProgress = (themeId) => {
    const segments = getThemeSegmentMeta();
    const seg = segments.find((s) => s.themeId === themeId);
    if (!seg) return { completedLevels: 0, badges: [], levelCount: 0, segmentStartIndex: 0 };

    const completedGlobal = progress?.completedGlobal || 0;
    const completedLevels = Math.max(0, Math.min(seg.levelCount, completedGlobal - seg.startIndex));
    return { completedLevels, badges: progress?.badges || [], levelCount: seg.levelCount, segmentStartIndex: seg.startIndex };
  };

  const getTotalLevels = () => getTotalThemeWorldLevels();

  const getGlobalProgress = () => ({
    completedGlobal: progress?.completedGlobal || 0,
    totalLevels: getTotalThemeWorldLevels(),
  });

  const getStarsForLevelId = (levelId) => {
    const map = progress?.starsByLevelId;
    if (!map || typeof map !== "object") return 0;
    const v = map[levelId];
    return Math.max(0, Math.min(3, Number(v) || 0));
  };

  const completeLevel = async ({ themeId, levelIndex, levelGlobalIndex, levelId, stars, learned = [], success = true }) => {
    // Back-compat: accept (themeId, levelIndex) OR levelGlobalIndex OR levelId.
    let meta = null;
    if (typeof levelGlobalIndex === "number") {
      meta = resolveGlobalLevel(levelGlobalIndex);
    } else if (levelId && typeof levelId === "string" && levelId.startsWith("tw:")) {
      const num = Number(levelId.replace("tw:", ""));
      if (Number.isFinite(num) && num > 0) meta = resolveGlobalLevel(num - 1);
    } else if (themeId && typeof levelIndex === "number") {
      meta = resolveThemeLevel(themeId, levelIndex);
    }

    if (!meta) return;

    setProgress((prev) => {
      const total = getTotalThemeWorldLevels();
      const completedGlobal = prev?.completedGlobal || 0;

      // Only advance sequentially globally; replays are allowed but don't skip.
      const willAdvance = !!success && meta.globalIndex === completedGlobal;
      const nextCompletedGlobal = willAdvance ? Math.min(total, completedGlobal + 1) : completedGlobal;

      const nextStars = Math.max(0, Math.min(3, Number(stars) || (success ? 3 : 0)));
      const nextStarsByLevelId = {
        ...(prev?.starsByLevelId && typeof prev.starsByLevelId === "object" ? prev.starsByLevelId : {}),
        [meta.id]: Math.max(nextStars, Number(prev?.starsByLevelId?.[meta.id]) || 0),
      };

      const nextBadges = Array.isArray(prev?.badges) ? [...prev.badges] : [];
      // Per-level badge (kept for compatibility with existing badge views)
      const perLevelBadgeId = `tw:${meta.themeId}:level:${meta.themeLevelNumber}`;
      if (!nextBadges.includes(perLevelBadgeId)) nextBadges.push(perLevelBadgeId);
      // Milestone badge every N global levels
      if (LEVEL_BADGE_EVERY > 0 && (meta.globalNumber % LEVEL_BADGE_EVERY === 0)) {
        const milestoneId = `tw:milestone:${meta.globalNumber}`;
        if (!nextBadges.includes(milestoneId)) nextBadges.push(milestoneId);
      }

      const next = {
        completedGlobal: nextCompletedGlobal,
        starsByLevelId: nextStarsByLevelId,
        badges: nextBadges,
        lastLearned: learned,
      };

      persist(next);
      return next;
    });
  };

  const awardThemeBadgeIfCompleted = async (themeId) => {
    if (!themeId) return;
    setProgress((prev) => {
      const segments = getThemeSegmentMeta();
      const seg = segments.find((s) => s.themeId === themeId);
      if (!seg) return prev;

      const completedGlobal = prev?.completedGlobal || 0;
      const themeCompleted = Math.max(0, Math.min(seg.levelCount, completedGlobal - seg.startIndex));
      if (themeCompleted < seg.levelCount) return prev;

      const badgeId = `tw:${themeId}:master`;
      const nextBadges = Array.isArray(prev?.badges) ? [...prev.badges] : [];
      if (nextBadges.includes(badgeId)) return prev;
      nextBadges.push(badgeId);

      const next = {
        ...prev,
        badges: nextBadges,
      };
      persist(next);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      initialized,
      themes: THEME_WORLDS,
      segments: getThemeSegmentMeta(),
      totalLevels: getTotalThemeWorldLevels(),
      progress,
      isThemeUnlocked,
      getThemeProgress,
      getTotalLevels,
      getGlobalProgress,
      resolveGlobalLevel,
      resolveThemeLevel,
      getStarsForLevelId,
      completeLevel,
      awardThemeBadgeIfCompleted,
    }),
    [initialized, progress]
  );

  return <ThemeWorldsProgressContext.Provider value={value}>{children}</ThemeWorldsProgressContext.Provider>;
};

export const useThemeWorldsProgress = () => {
  const ctx = useContext(ThemeWorldsProgressContext);
  if (!ctx) {
    throw new Error("useThemeWorldsProgress must be used within ThemeWorldsProgressProvider");
  }
  return ctx;
};
