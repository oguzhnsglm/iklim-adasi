import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeProgress } from "../../ThemeProgressContext";
import { useThemeWorldsProgress } from "../../ThemeWorldsProgressContext";

import {
  LEVEL_BADGE_EVERY,
  MAP_NODE_GAP,
  MAP_SECTION_PAD_BOTTOM,
  MAP_SECTION_PAD_TOP,
  MAP_THEME_TRANSITION_HEIGHT,
} from "../../data/themeWorldMapConfig";

import { getThemeVisual } from "../../data/themeVisuals";

export default function ThemeWorldDetailScreen({ themeId, onStartLevel }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { activeTheme } = useThemeProgress();
  const {
    themes,
    segments,
    totalLevels,
    getGlobalProgress,
    isThemeUnlocked,
    getStarsForLevelId,
    resolveGlobalLevel,
  } = useThemeWorldsProgress();

  const palette = activeTheme?.palette;
  const scrollRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const sectionW = Math.max(320, screenWidth);
  const globalProgress = getGlobalProgress?.() || { completedGlobal: 0, totalLevels: totalLevels || 0 };
  const completedGlobal = globalProgress.completedGlobal || 0;

  const segmentLayouts = useMemo(() => {
    const arr = [];
    let y = 0;
    (segments || []).forEach((s, idx) => {
      const levelCount = Math.max(1, Number(s.levelCount) || 1);
      const sectionH = Math.max(
        Math.max(560, screenHeight - 92),
        MAP_SECTION_PAD_TOP + MAP_SECTION_PAD_BOTTOM + (levelCount - 1) * MAP_NODE_GAP
      );
      arr.push({
        ...s,
        key: `seg:${s.themeId}:${idx}`,
        offsetY: y,
        sectionH,
      });
      y += sectionH;
      if (idx < (segments?.length || 0) - 1) y += MAP_THEME_TRANSITION_HEIGHT;
    });
    return arr;
  }, [segments, screenHeight]);

  const initialGlobalIndex = Math.max(0, Math.min((totalLevels || 1) - 1, completedGlobal));
  const [selectedGlobalIndex, setSelectedGlobalIndex] = useState(initialGlobalIndex);

  // Shared lightweight loops
  const pulse = useRef(new Animated.Value(1)).current;
  const micro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pulse.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.07, duration: 520, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 520, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    micro.setValue(0);
    const loop = Animated.loop(
      Animated.timing(micro, { toValue: 1, duration: 4200, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [micro]);

  // If the user opens a theme from the list, jump to that segment.
  useEffect(() => {
    const tid = themeId || segments?.[0]?.themeId;
    if (!tid) return;
    const layout = segmentLayouts.find((s) => s.themeId === tid);
    if (layout && scrollRef.current?.scrollTo) {
      scrollRef.current.scrollTo({ y: layout.offsetY, animated: false });
    }
    // keep selection on the next playable global level
    setSelectedGlobalIndex(Math.max(0, Math.min((totalLevels || 1) - 1, completedGlobal)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, segmentLayouts]);

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.mapScroll, { paddingBottom: 140 }]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {segmentLayouts.map((seg, idx) => {
          const next = idx < segmentLayouts.length - 1 ? segmentLayouts[idx + 1] : null;
          return (
            <React.Fragment key={seg.key}>
              <ThemeSection
                themeId={seg.themeId}
                themeDef={themes?.find((t) => t.id === seg.themeId)}
                palette={palette}
                sectionW={sectionW}
                sectionH={seg.sectionH}
                offsetY={seg.offsetY}
                segmentStartIndex={seg.startIndex}
                levelCount={seg.levelCount}
                completedGlobal={completedGlobal}
                totalLevels={totalLevels}
                isThemeUnlocked={isThemeUnlocked}
                selectedGlobalIndex={selectedGlobalIndex}
                onSelectGlobal={(g) => setSelectedGlobalIndex(g)}
                onStartLevel={onStartLevel}
                resolveGlobalLevel={resolveGlobalLevel}
                getStarsForLevelId={getStarsForLevelId}
                pulse={pulse}
                micro={micro}
                scrollY={scrollY}
              />

              {next && (
                <ThemeTransitionBand
                  fromThemeId={seg.themeId}
                  toThemeId={next.themeId}
                  palette={palette}
                  height={MAP_THEME_TRANSITION_HEIGHT}
                  stageW={sectionW}
                  bandStartY={seg.offsetY + seg.sectionH}
                  scrollY={scrollY}
                />
              )}
            </React.Fragment>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

function ThemeSection({
  themeId,
  themeDef,
  palette,
  sectionW,
  sectionH,
  offsetY,
  segmentStartIndex,
  levelCount,
  completedGlobal,
  totalLevels,
  isThemeUnlocked,
  selectedGlobalIndex,
  onSelectGlobal,
  onStartLevel,
  resolveGlobalLevel,
  getStarsForLevelId,
  pulse,
  micro,
  scrollY,
}) {
  const themeStyles = useMemo(() => getThemeStyles(themeId, palette), [themeId, palette]);
  const visual = useMemo(() => getThemeVisual(themeId), [themeId]);

  const unlockedTheme = isThemeUnlocked?.(themeId);

  const nodes = useMemo(() => {
    return buildSegmentNodes({
      themeId,
      segmentStartIndex,
      levelCount,
      stageW: sectionW,
      stageH: sectionH,
      completedGlobal,
      unlockedTheme,
    });
  }, [themeId, segmentStartIndex, levelCount, sectionW, sectionH, completedGlobal, unlockedTheme]);

  const sectionOpacity = unlockedTheme ? 1 : 0.72;

  const stageFade = scrollY
    ? scrollY.interpolate({
      inputRange: [
        Math.max(0, (offsetY || 0) - 120),
        Math.max(0, (offsetY || 0) + 80),
        Math.max(0, (offsetY || 0) + (sectionH || 600) - 80),
        Math.max(0, (offsetY || 0) + (sectionH || 600) + 120),
      ],
      outputRange: [0.85, 1, 1, 0.85],
      extrapolate: "clamp",
    })
    : 1;

  return (
    <Animated.View
      style={[
        styles.sectionStage,
        {
          width: sectionW,
          height: sectionH,
          backgroundColor: themeStyles.backgroundColor,
          opacity: Animated.multiply(stageFade, sectionOpacity),
        },
      ]}
    >
      <themeStyles.BackgroundLayer palette={palette} stageW={sectionW} stageH={sectionH} micro={micro} visual={visual} />
      <CandyRoad themeId={themeId} stageW={sectionW} stageH={sectionH} />
      <SideScenery themeId={themeId} stageW={sectionW} stageH={sectionH} micro={micro} visual={visual} />

      <View pointerEvents="none" style={styles.segmentHeader}>
        <Text style={styles.segmentHeaderTitle}>
          {(themeDef?.icon || "🌍")} {themeDef?.name || themeId}
        </Text>
        <Text style={styles.segmentHeaderSub}>
          Seviyeler {segmentStartIndex + 1}–{segmentStartIndex + levelCount} • Toplam {totalLevels || 0}
        </Text>
      </View>

      {nodes.map((n) => {
        const isSelected = selectedGlobalIndex === n.globalIndex;
        const disabled = !n.isUnlocked;

        const isMilestone = LEVEL_BADGE_EVERY > 0 && n.globalNumber % LEVEL_BADGE_EVERY === 0;
        const isThemeEnd = n.index === Math.max(0, (Number(levelCount) || 1) - 1);

        const levelMeta = resolveGlobalLevel?.(n.globalIndex);
        const stars = levelMeta ? getStarsForLevelId?.(levelMeta.id) : 0;

        const content = (
          <TouchableOpacity
            key={`node-${themeId}-${n.index}`}
            activeOpacity={0.9}
            disabled={disabled}
            onPress={() => {
              onSelectGlobal?.(n.globalIndex);
              if (!disabled) onStartLevel?.(n.globalIndex);
            }}
            style={[
              styles.nodeAbs,
              {
                left: n.cx - 29,
                top: n.cy - 29,
                opacity: n.isUnlocked ? 1 : 0.45,
              },
            ]}
          >
            <View style={styles.nodeHit}>
              <NodeVisual
                themeId={themeId}
                label={String(n.globalNumber)}
                selected={isSelected}
                isCompleted={n.isCompleted}
                isUnlocked={n.isUnlocked}
                stars={stars}
                milestone={isMilestone}
                themeEnd={isThemeEnd}
                nodeStyle={themeStyles.nodeStyle}
                completedStyle={themeStyles.completedStyle}
                lockedStyle={themeStyles.lockedStyle}
                micro={micro}
              />
            </View>
          </TouchableOpacity>
        );

        if (n.isNext) {
          return (
            <Animated.View
              key={`pulse-${themeId}-${n.index}`}
              style={[styles.pulseWrap, { left: n.cx - 29, top: n.cy - 29, transform: [{ scale: pulse }] }]}
            >
              {content}
            </Animated.View>
          );
        }

        return content;
      })}

      {!unlockedTheme && (
        <View pointerEvents="none" style={styles.themeLockedBanner}>
          <Text style={styles.themeLockedTxt}>🔒 Bu bölgeye henüz ulaşmadın • Seviye {completedGlobal + 1} ile devam et</Text>
        </View>
      )}
    </Animated.View>
  );
}

function buildSegmentNodes({ themeId, segmentStartIndex, levelCount, stageW, stageH, completedGlobal, unlockedTheme }) {
  const padTop = MAP_SECTION_PAD_TOP;
  const padBottom = MAP_SECTION_PAD_BOTTOM;
  const usableH = Math.max(260, (stageH || 600) - padTop - padBottom);
  const centerX = (stageW || 360) / 2;
  const amp = Math.min(110, Math.max(58, (stageW || 360) * 0.18));

  const phase = themeId === "pacific" ? 0.8 : themeId === "sahara" ? 1.25 : themeId === "antarctica" ? 0.2 : 0.55;
  const start = Number(segmentStartIndex) || 0;
  const count = Math.max(1, Number(levelCount) || 1);

  const arr = [];
  for (let i = 0; i < count; i += 1) {
    const globalIndex = start + i;
    const globalNumber = globalIndex + 1;
    const t = count <= 1 ? 0 : i / (count - 1);
    const y = padTop + t * usableH;
    const x = centerX + amp * Math.sin(t * Math.PI * 2.1 + phase);

    const isCompleted = unlockedTheme && globalIndex < (completedGlobal || 0);
    const isUnlocked = unlockedTheme && globalIndex <= (completedGlobal || 0);
    const isNext = unlockedTheme && globalIndex === (completedGlobal || 0);

    const jitter = getThemeJitter(themeId, i);

    arr.push({
      index: i,
      globalIndex,
      globalNumber,
      isCompleted,
      isUnlocked,
      isNext,
      cx: x + jitter.x * 0.35,
      cy: y + jitter.y * 0.35,
    });
  }
  return arr;
}

function CandyRoad({ themeId, stageW, stageH }) {
  const padTop = 120;
  const padBottom = 150;
  const usableH = Math.max(260, (stageH || 600) - padTop - padBottom);
  const centerX = (stageW || 360) / 2;
  const amp = Math.min(110, Math.max(58, (stageW || 360) * 0.18));
  const phase = themeId === "pacific" ? 0.8 : themeId === "sahara" ? 1.25 : themeId === "antarctica" ? 0.2 : 0.55;

  const segCount = Math.max(18, Math.floor(usableH / 66));
  const segH = Math.max(56, usableH / segCount);
  const roadW = 64;

  // "Candy" road: soft base + glossy highlight + diagonal stripe.
  const roadPaint = getThemeVisual(themeId)?.road;
  const baseColor = roadPaint?.base || (themeId === "sahara" ? "rgba(251,191,36,0.20)" : "rgba(255,255,255,0.11)");
  const stripeA = roadPaint?.stripeA || "rgba(255,255,255,0.12)";
  const stripeB = roadPaint?.stripeB || "rgba(255,255,255,0.10)";

  const pieces = [];
  for (let s = 0; s < segCount; s += 1) {
    const t = (s + 0.5) / segCount;
    const y = padTop + t * usableH;
    const x = centerX + amp * Math.sin(t * Math.PI * 2.1 + phase);

    const t2 = Math.min(1, t + 0.03);
    const y2 = padTop + t2 * usableH;
    const x2 = centerX + amp * Math.sin(t2 * Math.PI * 2.1 + phase);
    const ang = Math.atan2(y2 - y, x2 - x) * (180 / Math.PI);

    pieces.push(
      <View
        key={`road-${themeId}-${s}`}
        pointerEvents="none"
        style={{
          position: "absolute",
          left: x - roadW / 2,
          top: y - segH / 2,
          width: roadW,
          height: segH,
          borderRadius: roadW / 2,
          backgroundColor: baseColor,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          transform: [{ rotate: `${ang}deg` }],
          overflow: "hidden",
          opacity: 0.9,
        }}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.02)"]}
          locations={[0, 1]}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 18,
            opacity: 0.7,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: -16,
            top: 0,
            bottom: 0,
            width: roadW + 32,
            backgroundColor: s % 2 === 0 ? stripeA : stripeB,
            transform: [{ rotate: "-18deg" }],
            opacity: 0.55,
          }}
        />
      </View>
    );
  }

  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{pieces}</View>;
}

function SideScenery({ themeId, stageW, stageH, micro, visual }) {
  const items = useMemo(() => {
    const w = stageW || 360;
    const h = stageH || 600;
    const leftX = Math.max(8, w * 0.12);
    const rightX = Math.max(8, w * 0.78);

    const v = visual || getThemeVisual(themeId);
    const pool = v?.scenery?.edgeEmojis?.length ? v.scenery.edgeEmojis : ["🌿", "🌊", "🏜️", "❄️"];

    const res = [];
    const count = Math.max(8, Math.min(16, Number(v?.scenery?.density) || 10));
    for (let i = 0; i < count; i += 1) {
      const t = count <= 1 ? 0 : i / (count - 1);
      const y = 90 + t * (h - 220);
      const onRight = i % 2 === 0;
      const x = onRight ? rightX : leftX;
      const icon = pool[i % pool.length];
      const size = 18 + (i % 3) * 6;
      const opacity = 0.22 + (i % 4) * 0.04;
      const seed = ((i * 137) % 1000) / 1000; // deterministic phase offset [0..1)
      const lane = onRight ? 1 : -1;

      res.push({ key: `sc-${themeId}-${i}`, x, y, icon, size, opacity, seed, lane, index: i });
    }
    return res;
  }, [themeId, stageW, stageH, visual]);

  const w = stageW || 360;

  const isCreature = (emoji) => {
    // Keep it tiny & deterministic; no assets required.
    const set = new Set([
      "🐒",
      "🦉",
      "🦌",
      "🐿️",
      "🦋",
      "🐠",
      "🪼",
      "🐢",
      "🐬",
      "🦀",
      "🐪",
      "🦎",
      "🦂",
      "🐧",
      "🦭",
      "🐻‍❄️",
    ]);
    return set.has(emoji);
  };

  const animatedItems = items.map((it) => {
    const phase = micro ? Animated.modulo(Animated.add(micro, it.seed), 1) : null;

    const creature = isCreature(it.icon);
    const amp = creature ? 10 : 6;

    // Theme-specific feel:
    // - rainforest: sway + tiny hop
    // - pacific: swim sideways
    // - sahara: drift + heat wobble
    // - antarctica: bob + gentle sparkle
    const swayX = phase
      ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-amp, amp, -amp] })
      : 0;
    const swayY = phase
      ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [amp * 0.25, -amp * 0.25, amp * 0.25] })
      : 0;
    const spin = phase
      ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-6deg", "6deg", "-6deg"] })
      : "0deg";

    const swimX = phase
      ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-10 * it.lane, 14 * it.lane, -10 * it.lane] })
      : 0;
    const bobY = phase
      ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-4, 4, -4] })
      : 0;

    const shimmerX = phase
      ? phase.interpolate({ inputRange: [0, 1], outputRange: [-3 * it.lane, 3 * it.lane] })
      : 0;
    const shimmerRot = phase
      ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-2deg", "2deg", "-2deg"] })
      : "0deg";

    const sparkleOpacity = phase
      ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.0, 0.22, 0.0] })
      : 0;

    let transform = [];
    if (themeId === "pacific") transform = [{ translateX: swimX }, { translateY: bobY }];
    else if (themeId === "sahara") transform = [{ translateX: shimmerX }, { rotate: shimmerRot }];
    else if (themeId === "antarctica") transform = [{ translateY: bobY }, { rotate: spin }];
    else transform = [{ translateX: swayX }, { translateY: swayY }, { rotate: spin }];

    return (
      <Animated.View
        key={it.key}
        pointerEvents="none"
        style={{
          position: "absolute",
          left: it.x,
          top: it.y,
          opacity: it.opacity,
          transform,
        }}
      >
        <Text style={{ fontSize: it.size, opacity: 1 }}>{it.icon}</Text>

        {themeId === "rainforest" && creature && (
          <Animated.Text
            pointerEvents="none"
            style={{
              position: "absolute",
              left: it.lane > 0 ? -10 : 12,
              top: 6,
              fontSize: 12,
              opacity: sparkleOpacity,
            }}
          >
            🍃
          </Animated.Text>
        )}

        {themeId === "pacific" && creature && (
          <Animated.Text
            pointerEvents="none"
            style={{
              position: "absolute",
              left: it.lane > 0 ? -10 : 12,
              bottom: 2,
              fontSize: 12,
              opacity: sparkleOpacity,
            }}
          >
            🫧
          </Animated.Text>
        )}

        {themeId === "sahara" && creature && (
          <Animated.Text
            pointerEvents="none"
            style={{
              position: "absolute",
              left: it.lane > 0 ? -10 : 12,
              bottom: 2,
              fontSize: 12,
              opacity: sparkleOpacity,
            }}
          >
            💨
          </Animated.Text>
        )}

        {themeId === "antarctica" && creature && (
          <Animated.Text
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -8,
              bottom: -6,
              fontSize: 12,
              opacity: sparkleOpacity,
            }}
          >
            ✨
          </Animated.Text>
        )}
      </Animated.View>
    );
  });

  const anchorPhase = micro ? Animated.modulo(micro, 1) : null;
  const anchorBob = anchorPhase
    ? anchorPhase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -8, 0] })
    : 0;
  const anchorSway = anchorPhase
    ? anchorPhase.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-4deg", "4deg", "-4deg"] })
    : "0deg";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {animatedItems}

      {/* Larger anchors (non-interactive) */}
      {themeId === "rainforest" && (
        <Animated.Text
          style={[
            styles.anchorEmoji,
            { left: 18, top: 46, transform: [{ translateY: anchorBob }, { rotate: anchorSway }] },
          ]}
        >
          🦌
        </Animated.Text>
      )}
      {themeId === "pacific" && (
        <Animated.Text
          style={[
            styles.anchorEmoji,
            { left: w - 78, top: 52, transform: [{ translateX: anchorBob }, { rotate: anchorSway }] },
          ]}
        >
          🐢
        </Animated.Text>
      )}
      {themeId === "sahara" && (
        <Animated.Text
          style={[
            styles.anchorEmoji,
            { left: 18, top: 52, transform: [{ translateY: anchorBob }, { rotate: anchorSway }] },
          ]}
        >
          🐪
        </Animated.Text>
      )}
      {themeId === "antarctica" && (
        <Animated.Text
          style={[
            styles.anchorEmoji,
            { left: w - 82, top: 52, transform: [{ translateY: anchorBob }, { rotate: anchorSway }] },
          ]}
        >
          🐻‍❄️
        </Animated.Text>
      )}
    </View>
  );
}

function getThemeJitter(themeId, i) {
  const seq = [
    { x: 0, y: 0 },
    { x: 8, y: -6 },
    { x: -10, y: 10 },
    { x: 12, y: 8 },
    { x: -6, y: -10 },
  ];
  const base = seq[i % seq.length];

  if (themeId === "pacific") return { x: base.x * 0.8, y: base.y * 0.7 + 4 };
  if (themeId === "sahara") return { x: base.x * 0.9, y: base.y * 0.8 + 10 };
  if (themeId === "antarctica") return { x: base.x * 0.75, y: base.y * 0.85 + 2 };
  return base; // rainforest
}

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#", "").trim();
  const normalized = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

function FogOverlay({ palette, themeId }) {
  // "Buğulu" görünüm: sahnenin üstüne hafif sis katmanı.
  // Not: pointerEvents none -> seviye tıklamaları etkilenmez.
  const v = getThemeVisual(themeId);
  const base = v?.background?.baseColor || palette?.background || "#0B1220";
  const fogTopHex = v?.background?.fogTop || base;
  const fogMidHex = v?.background?.fogMid || base;
  const fogBottomHex = v?.background?.fogBottom || base;

  // More vivid color presence, but still soft and readable.
  const topFog = hexToRgba(fogTopHex, themeId === "pacific" ? 0.26 : 0.30);
  const midFog = hexToRgba(fogMidHex, 0.36);
  const baseFog = hexToRgba(fogBottomHex, themeId === "sahara" ? 0.16 : 0.14);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[topFog, midFog, "rgba(255,255,255,0.08)"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.16)", "rgba(0,0,0,0.00)", baseFog]}
        locations={[0, 0.45, 1]}
        style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}
      />
    </View>
  );
}

function getThemeStyles(themeId, palette) {
  const rainforestVisual = getThemeVisual("rainforest");
  const pacificVisual = getThemeVisual("pacific");
  const saharaVisual = getThemeVisual("sahara");
  const antarcticaVisual = getThemeVisual("antarctica");

  const rainforest = {
    // Use per-theme solid base colors to avoid transparent look.
    backgroundColor: rainforestVisual?.background?.baseColor || "#14532D",
    BackgroundLayer: RainforestLayer,
    nodeStyle: {
      surface: { backgroundColor: "rgba(101, 67, 33, 0.36)", borderColor: "rgba(168, 109, 63, 0.55)" },
      inner: { backgroundColor: "rgba(0,0,0,0.10)", borderColor: "rgba(255,255,255,0.10)" },
      labelColor: "rgba(255,255,255,0.94)",
      motif: "🍃",
      motifOpacity: 0.9,
    },
    completedStyle: {
      badgeBg: "rgba(34,197,94,0.28)",
      badgeBorder: "rgba(34,197,94,0.50)",
      badgeText: "✓",
    },
    lockedStyle: {
      overlayText: "🌿",
      overlayBg: "rgba(15, 23, 42, 0.12)",
    },
  };

  const pacific = {
    backgroundColor: pacificVisual?.background?.baseColor || "#0C4A6E",
    BackgroundLayer: OceanLayer,
    nodeStyle: {
      surface: { backgroundColor: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.18)" },
      inner: { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" },
      labelColor: "rgba(255,255,255,0.94)",
      motif: "🫧",
      motifOpacity: 0.75,
    },
    completedStyle: {
      badgeBg: "rgba(56,189,248,0.20)",
      badgeBorder: "rgba(56,189,248,0.40)",
      badgeText: "✓",
    },
    lockedStyle: {
      overlayText: "🪸",
      overlayBg: "rgba(2, 132, 199, 0.12)",
    },
  };

  const sahara = {
    backgroundColor: saharaVisual?.background?.baseColor || "#B45309",
    BackgroundLayer: DesertLayer,
    nodeStyle: {
      surface: { backgroundColor: "rgba(251,191,36,0.14)", borderColor: "rgba(251,191,36,0.32)" },
      inner: { backgroundColor: "rgba(120, 53, 15, 0.10)", borderColor: "rgba(255,255,255,0.10)" },
      labelColor: "rgba(255,255,255,0.92)",
      motif: "🪨",
      motifOpacity: 0.75,
    },
    completedStyle: {
      badgeBg: "rgba(251,191,36,0.18)",
      badgeBorder: "rgba(251,191,36,0.40)",
      badgeText: "🏁",
    },
    lockedStyle: {
      overlayText: "🏜️",
      overlayBg: "rgba(120, 53, 15, 0.10)",
    },
  };

  const antarctica = {
    backgroundColor: antarcticaVisual?.background?.baseColor || "#075985",
    BackgroundLayer: IceLayer,
    nodeStyle: {
      surface: { backgroundColor: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.18)" },
      inner: { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" },
      labelColor: "rgba(255,255,255,0.94)",
      motif: "🧊",
      motifOpacity: 0.7,
    },
    completedStyle: {
      badgeBg: "rgba(167,139,250,0.18)",
      badgeBorder: "rgba(167,139,250,0.34)",
      badgeText: "✓",
    },
    lockedStyle: {
      overlayText: "❄️",
      overlayBg: "rgba(255,255,255,0.08)",
    },
  };

  if (themeId === "pacific") return pacific;
  if (themeId === "sahara") return sahara;
  if (themeId === "antarctica") return antarctica;
  return rainforest;
}

function NodeVisual({ themeId, label, selected, isCompleted, isUnlocked, stars, milestone, themeEnd, nodeStyle, completedStyle, lockedStyle, micro }) {
  const showMotif = !selected && !isCompleted;

  const leafDrift = micro
    ? micro.interpolate({ inputRange: [0, 1], outputRange: [0, -6] })
    : 0;
  const leafTilt = micro
    ? micro.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-8deg", "8deg", "-8deg"] })
    : "0deg";
  const fishSwim = micro
    ? micro.interpolate({ inputRange: [0, 1], outputRange: [-10, 18] })
    : 0;
  const sparkle = micro
    ? micro.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.42, 0.15] })
    : 0.22;

  return (
    <View style={styles.nodeVisualWrap}>
      <View
        style={[
          styles.nodeSurface,
          nodeStyle?.surface,
          selected && styles.nodeSelected,
          !isUnlocked && styles.nodeLocked,
        ]}
      >
        <View style={[styles.nodeInner, nodeStyle?.inner]}>
          {/* glossy candy highlight */}
          <LinearGradient
            colors={["rgba(255,255,255,0.26)", "rgba(255,255,255,0.00)"]}
            locations={[0, 1]}
            style={styles.nodeGloss}
            pointerEvents="none"
          />
          <View pointerEvents="none" style={styles.nodeSpec} />
          {showMotif && <Text style={[styles.nodeMotif, { opacity: nodeStyle?.motifOpacity ?? 0.8 }]}>{nodeStyle?.motif}</Text>}
          <Text style={[styles.nodeLabel, { color: nodeStyle?.labelColor || "rgba(255,255,255,0.92)" }]}>
            {label}
          </Text>
        </View>

        {isCompleted && (
          <View
            style={[
              styles.completedBadge,
              {
                backgroundColor: completedStyle?.badgeBg,
                borderColor: completedStyle?.badgeBorder,
              },
            ]}
          >
            <Text style={styles.completedBadgeText}>{completedStyle?.badgeText || "✓"}</Text>
          </View>
        )}

        {(milestone || themeEnd) && (
          <View pointerEvents="none" style={styles.milestoneBadge}>
            <Text style={styles.milestoneBadgeTxt}>{themeEnd ? "🏁" : "🎖️"}</Text>
          </View>
        )}

        {isCompleted && (Number(stars) || 0) > 0 && (
          <View pointerEvents="none" style={styles.starRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Text key={`st-${i}`} style={[styles.star, i < stars ? styles.starOn : styles.starOff]}>★</Text>
            ))}
          </View>
        )}

        {!isUnlocked && (
          <View style={[styles.lockedOverlay, { backgroundColor: lockedStyle?.overlayBg || "rgba(0,0,0,0.10)" }]}>
            <Text style={styles.lockedOverlayText}>{lockedStyle?.overlayText || "🔒"}</Text>
          </View>
        )}

        {/* theme-specific micro-details */}
        {themeId === "rainforest" && !isUnlocked && <View style={styles.vineStrip} />}
        {themeId === "pacific" && !isUnlocked && <View style={styles.seaweedStrip} />}
        {themeId === "sahara" && !isUnlocked && <View style={styles.sandCover} />}
        {themeId === "antarctica" && !isUnlocked && <View style={styles.frostCover} />}

        {themeId === "antarctica" && isCompleted && <View style={styles.iceShine} />}

        {/* Micro effects for completed levels (single-layer, low opacity) */}
        {isCompleted && themeId === "rainforest" && (
          <Animated.Text
            pointerEvents="none"
            style={[
              styles.micro,
              styles.microLeaf,
              {
                transform: [{ translateY: leafDrift }, { rotate: leafTilt }],
              },
            ]}
          >
            🍃
          </Animated.Text>
        )}

        {isCompleted && themeId === "pacific" && (
          <Animated.Text
            pointerEvents="none"
            style={[
              styles.micro,
              styles.microFish,
              {
                transform: [{ translateX: fishSwim }],
              },
            ]}
          >
            🐟
          </Animated.Text>
        )}

        {isCompleted && themeId === "sahara" && (
          <Text pointerEvents="none" style={[styles.micro, styles.microFoot]}>👣</Text>
        )}

        {isCompleted && themeId === "antarctica" && (
          <Animated.Text
            pointerEvents="none"
            style={[styles.micro, styles.microSparkle, { opacity: sparkle }]}
          >
            ✨
          </Animated.Text>
        )}
      </View>
    </View>
  );
}

function ThemeTransitionBand({ fromThemeId, toThemeId, palette, height, stageW, bandStartY, scrollY }) {
  const from = getThemeStyles(fromThemeId, palette);
  const to = getThemeStyles(toThemeId, palette);
  const fromVisual = getThemeVisual(fromThemeId);
  const toVisual = getThemeVisual(toThemeId);

  const h = Math.max(160, Number(height) || MAP_THEME_TRANSITION_HEIGHT);
  const startY = Number(bandStartY) || 0;
  const endY = startY + h;

  const p = scrollY
    ? scrollY.interpolate({ inputRange: [startY, endY], outputRange: [0, 1], extrapolate: "clamp" })
    : 0;
  const fromOpacity = Animated.subtract(1, p);
  const toOpacity = p;

  return (
    <View style={[styles.transitionBand, { height: h }]} pointerEvents="none">
      <LinearGradient
        colors={[from.backgroundColor, to.backgroundColor]}
        locations={[0.15, 0.85]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fromOpacity }]} pointerEvents="none">
        <TransitionEdgeScenery themeId={fromThemeId} stageW={stageW} stageH={h} visual={fromVisual} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: toOpacity }]} pointerEvents="none">
        <TransitionEdgeScenery themeId={toThemeId} stageW={stageW} stageH={h} visual={toVisual} />
      </Animated.View>

      <View pointerEvents="none" style={styles.transitionRoadWrap}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fromOpacity }]}> 
          <RoadRibbon paint={fromVisual?.road} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: toOpacity }]}> 
          <RoadRibbon paint={toVisual?.road} />
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.transitionTxt,
          { opacity: Animated.add(0.15, Animated.multiply(p, 0.85)) },
        ]}
      >
        {fromVisual?.name || "Tema"} ➜ {toVisual?.name || "Tema"}
      </Animated.Text>
    </View>
  );
}

function TransitionEdgeScenery({ themeId, stageW, stageH, visual }) {
  const w = stageW || 360;
  const h = stageH || 220;
  const pool = visual?.scenery?.edgeEmojis?.length ? visual.scenery.edgeEmojis : ["✨"];
  const count = Math.max(8, Math.min(14, Number(visual?.scenery?.density) || 10));
  const leftX = Math.max(8, w * 0.10);
  const rightX = Math.max(8, w * 0.82);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => {
        const t = count <= 1 ? 0 : i / (count - 1);
        const y = 18 + t * (h - 36);
        const onRight = i % 2 === 0;
        const x = onRight ? rightX : leftX;
        const icon = pool[i % pool.length];
        const size = 16 + (i % 3) * 6;
        const opacity = 0.10 + (i % 4) * 0.06;
        return (
          <Text
            key={`tr-sc-${themeId}-${i}`}
            style={{ position: "absolute", left: x, top: y, fontSize: size, opacity }}
          >
            {icon}
          </Text>
        );
      })}
    </View>
  );
}

function RoadRibbon({ paint }) {
  const base = paint?.base || "rgba(255,255,255,0.10)";
  const stripeA = paint?.stripeA || "rgba(255,255,255,0.12)";
  const stripeB = paint?.stripeB || "rgba(255,255,255,0.08)";

  return (
    <View style={styles.roadRibbon}>
      <View style={[styles.roadRibbonBase, { backgroundColor: base }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.02)"]}
          locations={[0, 1]}
          style={styles.roadRibbonGloss}
        />
        <View style={[styles.roadRibbonStripe, { backgroundColor: stripeA, left: -18 }]} />
        <View style={[styles.roadRibbonStripe, { backgroundColor: stripeB, left: 6, opacity: 0.45 }]} />
      </View>
    </View>
  );
}

function RainforestLayer({ palette, stageW, stageH, micro }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <FogOverlay palette={palette} themeId="rainforest" />
      <View style={[styles.sunbeam, { left: 38 }]} />
      <View style={[styles.sunbeam, { left: 160, opacity: 0.08 }]} />
      <View style={[styles.sunbeam, { left: 278, opacity: 0.06 }]} />

      {Array.from({ length: 7 }).map((_, idx) => {
        const driftX = micro
          ? micro.interpolate({ inputRange: [0, 1], outputRange: [0, 14 + idx * 2] })
          : 0;
        const driftY = micro
          ? micro.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -10 - idx, 0] })
          : 0;
        const x = 18 + ((idx * 61) % Math.max(180, (stageW || 360) - 80));
        const y = 78 + ((idx * 97) % Math.max(240, (stageH || 540) - 220));
        const opacity = 0.10 + (idx % 3) * 0.04;
        return (
          <Animated.Text
            key={`leaf-emoji-${idx}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontSize: 18 + (idx % 3) * 4,
              opacity,
              transform: [{ translateX: driftX }, { translateY: driftY }],
            }}
          >
            🍃
          </Animated.Text>
        );
      })}

      {/* leaves */}
      {Array.from({ length: 12 }).map((_, idx) => {
        const s = 26 + (idx % 5) * 12;
        const x = 12 + ((idx * 73) % Math.max(160, (stageW || 360) - 80));
        const y = 110 + ((idx * 61) % Math.max(220, (stageH || 540) - 220));
        return (
          <View
            key={`leaf-${idx}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s / 2,
              // White-toned soft spots (reduce the green translucent "bubble" look)
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          />
        );
      })}

      {/* grass canopy */}
      <View
        style={{
          position: "absolute",
          bottom: -40,
          left: -60,
          right: -60,
          height: 170,
          borderTopLeftRadius: 140,
          borderTopRightRadius: 140,
          backgroundColor: "rgba(0,0,0,0.10)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -30,
          left: -80,
          right: -80,
          height: 140,
          borderTopLeftRadius: 120,
          borderTopRightRadius: 120,
          backgroundColor: "rgba(34,197,94,0.06)",
        }}
      />

      {/* Simple tree silhouettes (no assets) */}
      <Tree style={{ left: 10, bottom: 18, transform: [{ scale: 1.05 }] }} />
      <Tree style={{ left: (stageW || 360) * 0.24, bottom: 10, transform: [{ scale: 0.85 }] }} />
      <Tree style={{ left: (stageW || 360) * 0.52, bottom: 16, transform: [{ scale: 1.0 }] }} />
      <Tree style={{ left: (stageW || 360) * 0.74, bottom: 12, transform: [{ scale: 0.9 }] }} />
      <Tree style={{ left: (stageW || 360) - 64, bottom: 20, transform: [{ scale: 1.1 }] }} />
    </View>
  );
}

function OceanLayer({ palette, stageW, stageH }) {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    drift.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 5200, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 5200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const rise = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <FogOverlay palette={palette} themeId="pacific" />
      <View style={[styles.waveBand, { top: 0, backgroundColor: "rgba(255,255,255,0.06)" }]} />
      <View style={[styles.waveBand, { top: 70, backgroundColor: "rgba(255,255,255,0.05)" }]} />
      <View style={[styles.waveBand, { top: 140, backgroundColor: "rgba(255,255,255,0.04)" }]} />

      <View style={[styles.oceanDeep, { bottom: -40, backgroundColor: "rgba(14,165,233,0.18)" }]} />

      {/* subtle bubbles */}
      {Array.from({ length: 8 }).map((_, idx) => {
        const x = 18 + ((idx * 71) % Math.max(160, (stageW || 360) - 60));
        const y = 60 + ((idx * 83) % Math.max(200, (stageH || 540) - 120));
        const s = 10 + (idx % 4) * 6;
        return (
          <Animated.View
            key={`b-${idx}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s / 2,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              transform: [{ translateY: rise }],
            }}
          />
        );
      })}
    </View>
  );
}

function DesertLayer({ palette, stageW }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    shimmer.setValue(0);
    const loop = Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 7000, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const dx = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-20, 40] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <FogOverlay palette={palette} themeId="sahara" />
      <View
        style={[
          styles.dune,
          {
            bottom: 18,
            left: -80,
            width: (stageW || 360) + 220,
            backgroundColor: "rgba(251,191,36,0.16)",
          },
        ]}
      />
      <View
        style={[
          styles.dune,
          {
            bottom: -10,
            left: -120,
            width: (stageW || 360) + 260,
            height: 170,
            opacity: 0.85,
            backgroundColor: "rgba(251,191,36,0.12)",
          },
        ]}
      />

      <Cactus style={{ left: 24, bottom: 34 }} />
      <Cactus style={{ left: (stageW || 360) - 70, bottom: 48, transform: [{ scale: 0.85 }] }} />
      <Cactus style={{ left: (stageW || 360) * 0.55, bottom: 26, transform: [{ scale: 0.75 }] }} />

      {/* heat shimmer */}
      <Animated.View
        style={{
          position: "absolute",
          left: -40,
          right: -40,
          top: 110,
          height: 180,
          opacity: 0.06,
          transform: [{ translateX: dx }, { rotate: "-6deg" }],
          backgroundColor: "rgba(255,255,255,1)",
          borderRadius: 40,
        }}
      />
    </View>
  );
}

function IceLayer({ palette, stageW, stageH, micro }) {
  const sparkle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    sparkle.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 4200, useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0, duration: 4200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sparkle]);

  const glintOpacity = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.08] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <FogOverlay palette={palette} themeId="antarctica" />

      {/* lightweight falling snow (purely decorative) */}
      {Array.from({ length: 14 }).map((_, idx) => {
        const w = stageW || 360;
        const h = stageH || 540;
        const seed = ((idx * 97) % 1000) / 1000;
        const phase = micro ? Animated.modulo(Animated.add(micro, seed), 1) : null;
        const fallY = phase ? phase.interpolate({ inputRange: [0, 1], outputRange: [-30, h + 40] }) : 0;
        const driftX = phase ? phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-8, 10, -8] }) : 0;
        const x = 12 + ((idx * 61) % Math.max(160, w - 24));
        const size = 3 + (idx % 3);
        const opacity = 0.12 + (idx % 4) * 0.05;

        return (
          <Animated.View
            key={`snow-${idx}`}
            style={{
              position: "absolute",
              left: x,
              top: -20,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: "rgba(255,255,255,0.9)",
              opacity,
              transform: [{ translateY: fallY }, { translateX: driftX }],
            }}
          />
        );
      })}
      <View
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          right: 18,
          height: 70,
          borderRadius: 22,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
        }}
      />

      {Array.from({ length: 7 }).map((_, idx) => {
        const w = 70 + (idx % 3) * 26;
        const h = 26 + (idx % 2) * 12;
        const x = 12 + ((idx * 93) % Math.max(160, (stageW || 360) - 120));
        const y = 120 + ((idx * 77) % 240);
        return (
          <View
            key={`ice-${idx}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.07)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
        );
      })}

      <View
        style={{
          position: "absolute",
          bottom: -20,
          left: -40,
          right: -40,
          height: 140,
          borderTopLeftRadius: 120,
          borderTopRightRadius: 120,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
        }}
      />

      <Animated.View
        style={{
          position: "absolute",
          left: -60,
          right: -60,
          top: 70,
          height: stageH || 540,
          opacity: glintOpacity,
          backgroundColor: "rgba(255,255,255,1)",
          transform: [{ rotate: "-14deg" }],
        }}
      />
    </View>
  );
}

function Cactus({ style }) {
  return (
    <View style={[styles.cactusBase, style]}>
      <View style={styles.cactusArmLeft} />
      <View style={styles.cactusArmRight} />
    </View>
  );
}

function Tree({ style }) {
  return (
    <View pointerEvents="none" style={[styles.treeWrap, style]}>
      <View style={styles.treeTrunk} />
      <View style={[styles.treeCanopy, { left: -14, top: -24 }]} />
      <View style={[styles.treeCanopy, { left: 6, top: -34, opacity: 0.85 }]} />
      <View style={[styles.treeCanopy, { left: 16, top: -18, opacity: 0.78 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Prevent underlying screens/backgrounds from bleeding through.
    backgroundColor: "rgba(15,23,42,1)",
  },
  titleCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  titleIcon: {
    fontSize: 34,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  slogan: {
    marginTop: 2,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "700",
    fontSize: 12,
  },
  progressText: {
    marginTop: 6,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "800",
    fontSize: 12,
  },
  lockHint: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 16,
  },
  mapScroll: {
    paddingTop: 14,
    paddingBottom: 14,
  },
  stage: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 2,
    overflow: "hidden",
  },
  sectionStage: {
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
  },
  themeLockedBanner: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  themeLockedTxt: {
    color: "rgba(255,255,255,0.86)",
    fontWeight: "900",
    fontSize: 12,
    textAlign: "center",
  },
  pulseWrap: {
    position: "absolute",
  },
  nodeAbs: {
    position: "absolute",
    width: 58,
    height: 58,
  },
  segmentHeader: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  segmentHeaderTitle: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 13,
  },
  segmentHeaderSub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.72)",
    fontWeight: "800",
    fontSize: 11,
  },
  nodeHit: {
    width: 58,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  nodeVisualWrap: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  nodeSurface: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  nodeInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  nodeGloss: {
    position: "absolute",
    left: -4,
    top: -4,
    width: 30,
    height: 30,
    borderRadius: 18,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.9,
  },
  nodeSpec: {
    position: "absolute",
    right: 8,
    bottom: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  nodeSelected: {
    borderColor: "rgba(255,255,255,0.75)",
  },
  nodeLocked: {
    opacity: 0.95,
  },
  nodeLabel: {
    fontWeight: "900",
    fontSize: 14,
  },
  nodeMotif: {
    position: "absolute",
    top: 5,
    right: 6,
    fontSize: 14,
  },
  completedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadgeText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 11,
  },
  milestoneBadge: {
    position: "absolute",
    left: -6,
    top: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  milestoneBadgeTxt: {
    fontSize: 12,
    opacity: 0.95,
  },
  starRow: {
    position: "absolute",
    left: -10,
    right: -10,
    bottom: -18,
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
  },
  star: {
    fontSize: 10,
    fontWeight: "900",
  },
  starOn: {
    color: "rgba(255,255,255,0.92)",
    opacity: 0.95,
  },
  starOff: {
    color: "rgba(255,255,255,0.60)",
    opacity: 0.45,
  },

  transitionBand: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  transitionRoadWrap: {
    width: 74,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    marginTop: 2,
  },
  transitionRoadHint: {
    width: 70,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    opacity: 0.7,
  },
  transitionTxt: {
    marginTop: 10,
    color: "rgba(255,255,255,0.82)",
    fontWeight: "900",
    fontSize: 12,
  },
  roadRibbon: {
    width: 74,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  roadRibbonBase: {
    width: 74,
    height: 120,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  roadRibbonGloss: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    opacity: 0.7,
  },
  roadRibbonStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 110,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.55,
  },
  lockedOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedOverlayText: {
    fontSize: 16,
    opacity: 0.9,
  },

  vineStrip: {
    position: "absolute",
    left: -8,
    right: -8,
    top: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  seaweedStrip: {
    position: "absolute",
    left: -8,
    right: -8,
    bottom: 10,
    height: 12,
    borderRadius: 10,
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  sandCover: {
    position: "absolute",
    left: -6,
    right: -6,
    bottom: -2,
    height: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "rgba(251,191,36,0.10)",
  },
  frostCover: {
    position: "absolute",
    left: -6,
    right: -6,
    top: -2,
    height: 22,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  iceShine: {
    position: "absolute",
    left: -20,
    top: -30,
    width: 34,
    height: 90,
    opacity: 0.08,
    backgroundColor: "rgba(255,255,255,1)",
    transform: [{ rotate: "-18deg" }],
  },

  micro: {
    position: "absolute",
    fontSize: 14,
    opacity: 0.32,
  },
  microLeaf: {
    right: 6,
    top: 6,
  },
  microFish: {
    left: 6,
    bottom: 6,
    opacity: 0.26,
    fontSize: 13,
  },
  microFoot: {
    left: 7,
    top: 7,
    opacity: 0.24,
    fontSize: 13,
  },
  microSparkle: {
    right: 8,
    bottom: 8,
    fontSize: 13,
  },
  startBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
  },
  startTxt: {
    fontWeight: "900",
    fontSize: 14,
  },
  quickBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  quickTxt: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "800",
    fontSize: 13,
  },

  anchorEmoji: {
    position: "absolute",
    fontSize: 40,
    opacity: 0.22,
  },

  // Backdrop helpers
  sunbeam: {
    position: "absolute",
    top: -60,
    width: 120,
    height: 760,
    backgroundColor: "rgba(255,255,255,0.10)",
    transform: [{ rotate: "-18deg" }],
  },
  waveBand: {
    position: "absolute",
    left: -40,
    right: -40,
    height: 52,
    borderRadius: 32,
  },
  oceanDeep: {
    position: "absolute",
    left: -60,
    right: -60,
    height: 220,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
  },
  dune: {
    position: "absolute",
    height: 140,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
    opacity: 0.9,
  },
  treeWrap: {
    position: "absolute",
    width: 40,
    height: 70,
  },
  treeTrunk: {
    position: "absolute",
    left: 16,
    bottom: 0,
    width: 8,
    height: 28,
    borderRadius: 4,
    backgroundColor: "rgba(101, 67, 33, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(168, 109, 63, 0.35)",
  },
  treeCanopy: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(34, 197, 94, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.16)",
  },
  cactusBase: {
    position: "absolute",
    width: 18,
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.20)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.28)",
  },
  cactusArmLeft: {
    position: "absolute",
    left: -10,
    top: 18,
    width: 12,
    height: 22,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.20)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.28)",
  },
  cactusArmRight: {
    position: "absolute",
    right: -10,
    top: 10,
    width: 12,
    height: 18,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.20)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.28)",
  },
});
