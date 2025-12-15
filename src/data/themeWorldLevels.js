import { THEME_WORLD_SEGMENTS } from "./themeWorldMapConfig";

export function getTotalThemeWorldLevels() {
  return THEME_WORLD_SEGMENTS.reduce((sum, s) => sum + (Number(s.levelCount) || 0), 0);
}

export function getThemeSegmentMeta() {
  const segments = [];
  let cursor = 0;
  for (const seg of THEME_WORLD_SEGMENTS) {
    const levelCount = Math.max(0, Number(seg.levelCount) || 0);
    segments.push({
      themeId: seg.themeId,
      levelCount,
      startIndex: cursor,
      endIndexExclusive: cursor + levelCount,
    });
    cursor += levelCount;
  }
  return segments;
}

export function resolveGlobalLevel(globalIndex) {
  const idx = Number(globalIndex);
  if (!Number.isFinite(idx) || idx < 0) return null;
  const segments = getThemeSegmentMeta();
  const seg = segments.find((s) => idx >= s.startIndex && idx < s.endIndexExclusive);
  if (!seg) return null;
  return {
    id: `tw:${idx + 1}`,
    globalIndex: idx,
    globalNumber: idx + 1,
    themeId: seg.themeId,
    themeLevelIndex: idx - seg.startIndex,
    themeLevelNumber: idx - seg.startIndex + 1,
    segmentStartIndex: seg.startIndex,
    segmentLevelCount: seg.levelCount,
  };
}

export function resolveThemeLevel(themeId, themeLevelIndex) {
  const idx = Number(themeLevelIndex);
  if (!themeId || !Number.isFinite(idx) || idx < 0) return null;
  const segments = getThemeSegmentMeta();
  const seg = segments.find((s) => s.themeId === themeId);
  if (!seg) return null;
  if (idx >= seg.levelCount) return null;
  return resolveGlobalLevel(seg.startIndex + idx);
}
