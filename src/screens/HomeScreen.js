import React, { useMemo, useState, useEffect, useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from "react-native";
import KeyboardScrollView from "../components/KeyboardScrollView";
import { THEME } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ForestScreen from "./ForestScreen";
import AchievementsScreen from "./AchievementsScreen";
import ProfileScreen from "./ProfileScreen";
import ParentModeScreen from "./ParentModeScreen";
import ThemeTasksScreen from "./ThemeTasksScreen";
import soundManager from "../utils/sounds";
import { useThemeProgress } from "../ThemeProgressContext";
import ThemeTransitionOverlay from "../components/ThemeTransitionOverlay";
import { NatureBackground } from "./GameComponents";

const THEME_TASKS = {
  rainforest: [
    { id: "rainforest-1", title: "Ağaç dik ve ormanı büyüt" },
    { id: "rainforest-2", title: "Ormandaki çöpleri temizle" },
    { id: "rainforest-3", title: "Hayvanların yuvalarını koru" },
  ],
  pacific: [
    { id: "pacific-1", title: "Dalgaların getirdiği atıkları topla" },
    { id: "pacific-2", title: "Mercan resiflerini onar ve koru" },
    { id: "pacific-3", title: "Deniz canlılarına güvenli alan yarat" },
  ],
  antarctica: [
    { id: "antarctica-1", title: "Buzullardaki çatlakları işaretle" },
    { id: "antarctica-2", title: "Kutup hayvanlarını korumak için bariyer kur" },
  ],
};

// Gelişmiş ana menü: aktif temaya göre renkli arka plan ve kartlar
export default function HomeScreen({ onPlay }) {
  const [soundOn, setSoundOn] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [showForest, setShowForest] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showParentMode, setShowParentMode] = useState(false);
  const [showThemeTasks, setShowThemeTasks] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const { themes, activeTheme, setActiveTheme } = useThemeProgress();
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("GAMES"); // GAMES | THEMES | SETTINGS
  const panelAnim = useRef(new Animated.Value(1)).current;
  const [darkMode, setDarkMode] = useState(false);

  const palette = useMemo(() => {
    const base = activeTheme?.palette || {};
    return {
      background: base.background || THEME.background,
      primary: base.primary || THEME.deepSea,
      accent: base.accent || THEME.accent,
      foam: base.foam || THEME.foam,
      wave: base.wave || THEME.wave,
      tide: base.tide || THEME.tide,
      sand: base.sand || THEME.sand,
      textDark: base.textDark || THEME.textDark,
      textLight: base.textLight || "#f8fafc",
    };
  }, [activeTheme]);

  const withAlpha = (hex, alphaHex = "22") =>
    typeof hex === "string" && hex.startsWith("#") ? `${hex}${alphaHex}` : hex;

  useEffect(() => {
    soundManager.init();
    return () => soundManager.stopBackgroundMusic();
  }, []);

  useEffect(() => {
    soundManager.setEnabled(soundOn);
    soundManager.setMusicEnabled(soundOn);
  }, [soundOn]);

  const dailyFacts = useMemo(
    () => [
      "Bir plastik poşetin doğada yok olması 500 yıl sürebilir.",
      "Muslukları kapatarak günde 200 litre su tasarrufu yapabilirsin.",
      "Amazon ormanları dünyanın oksijeninin %20'sini üretir.",
      "Okyanuslar her yıl 8 milyon ton plastikle kirleniyor.",
      "Mercan resifleri son 30 yılda %50 azaldı.",
      "LED ampuller %75 daha az enerji tüketir.",
      "Bir ağaç yılda 260 kg oksijen üretir.",
      "Geri dönüşüm enerji tüketimini büyük ölçüde azaltır.",
    ],
    []
  );

  const factOfDay = useMemo(() => dailyFacts[currentHour % dailyFacts.length], [dailyFacts, currentHour]);

  const tips = useMemo(
    () => [
      "Atıkları türüne göre ayır, doğayı koru!",
      "Süre bitmeden daha çok atık temizle.",
      "Ağaç dik, ormanını büyüt, doğayı koru!",
    ],
    []
  );

  const tipOfDay = useMemo(() => tips[Math.floor(Math.random() * tips.length)], [tips]);

  const currentTasks = useMemo(() => THEME_TASKS[activeTheme.id] || [], [activeTheme.id]);

  // Toplam puanı yükle
  useEffect(() => {
    loadTotalScore();
  }, []);

  // Saat değişikliğini kontrol et
  useEffect(() => {
    const interval = setInterval(() => {
      const newHour = new Date().getHours();
      if (newHour !== currentHour) {
        setCurrentHour(newHour);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentHour]);

  // Orman ekranından dönerken puanı yenile
  useEffect(() => {
    if (!showForest && !showAchievements && !showProfile) {
      loadTotalScore();
    }
  }, [showForest, showAchievements, showProfile]);

  const loadTotalScore = async () => {
    try {
      const stored = await AsyncStorage.getItem("totalScore");
      const value = parseInt(stored || "0", 10);
      setTotalScore(isNaN(value) ? 0 : value);
    } catch (error) {
      console.log("Total score load error:", error);
    }
  };

  const animatePanelChange = (nextTab) => {
    if (nextTab === activeTab) return;
    Animated.timing(panelAnim, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(nextTab);
      Animated.timing(panelAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSelectTheme = (themeId) => {
    if (themeId === activeTheme.id) return;
    const theme = themes.find((t) => t.id === themeId);
    if (!theme || !theme.unlocked) {
      Alert.alert(
        "Tema Kilitli",
        "Bu temayı açmak için önce orman temasını tamamen temizlemelisin!"
      );
      return;
    }
    // Temayı hemen değiştir, animasyon sadece görsel olsun
    setActiveTheme(themeId);
    setTransitionTarget(themeId);
  };

  const handleTransitionFinished = () => {
    if (transitionTarget) {
      setActiveTheme(transitionTarget);
      setTransitionTarget(null);
    }
  };

  if (showForest) {
    return <ForestScreen totalScore={totalScore} onBack={() => setShowForest(false)} />;
  }

  if (showAchievements) {
    return <AchievementsScreen onBack={() => setShowAchievements(false)} />;
  }

  if (showProfile) {
    return <ProfileScreen onBack={() => setShowProfile(false)} />;
  }

  if (showParentMode) {
    return <ParentModeScreen onBack={() => setShowParentMode(false)} />;
  }

  if (showThemeTasks) {
    return <ThemeTasksScreen onBack={() => setShowThemeTasks(false)} />;
  }

  return (
    <View style={[styles.root, darkMode && styles.rootDark, { backgroundColor: palette.background }]}>
      <NatureBackground
        key={activeTheme.id}
        themeId={activeTheme.id}
        palette={activeTheme.palette}
        intensity={1}
      />
      {activeTheme.id === "pacific" && <OceanFloatOverlay />}
      <ThemeTransitionOverlay
        visible={!!transitionTarget}
        targetThemeId={transitionTarget || undefined}
        onFinished={handleTransitionFinished}
      />
      <NatureSplash themeId={activeTheme.id} palette={palette} />

      <KeyboardScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.brandTop, { color: palette.primary }]}>DOĞAYI</Text>
            <View style={styles.topRightMenu}>
              <TouchableOpacity onPress={() => setShowProfile(true)}>
                <Text style={styles.topRightIcon}>§Y'Ï</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowParentMode(true)}>
                <Text style={styles.topRightIcon}>§Y'ùƒ??§Y'¸ƒ??§Y'õ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDarkMode((v) => !v)}>
                <Text style={styles.topRightIcon}>{darkMode ? "§YOt" : "ƒ~?‹÷?"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.brandBottom, { color: palette.wave }]}>KORU</Text>
          <View style={[styles.themePill, { backgroundColor: withAlpha(palette.accent, "14") }]}>
            <Text style={styles.themePillIcon}>{activeTheme.icon}</Text>
            <Text style={[styles.themePillText, { color: palette.primary }]}>{activeTheme.name} Teması</Text>
          </View>
          <View style={styles.totalScoreBox}>
            <Text style={[styles.totalScoreLabel, { color: palette.textDark }]}>Toplam Puanım</Text>
            <Text style={styles.totalScoreValue}>ƒð? {totalScore}</Text>
          </View>
        </View>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[
              styles.tabChip,
              activeTab === "GAMES" && styles.tabChipActive,
              activeTab === "GAMES" && { backgroundColor: palette.accent },
            ]}
            onPress={() => animatePanelChange("GAMES")}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: palette.primary },
                activeTab === "GAMES" && styles.tabChipTextActive,
                activeTab === "GAMES" && { color: palette.textLight },
              ]}
            >
              Oyunlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabChip,
              activeTab === "THEMES" && styles.tabChipActive,
              activeTab === "THEMES" && { backgroundColor: palette.accent },
            ]}
            onPress={() => animatePanelChange("THEMES")}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: palette.primary },
                activeTab === "THEMES" && styles.tabChipTextActive,
                activeTab === "THEMES" && { color: palette.textLight },
              ]}
            >
              Temalar
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.dailyFactContainer,
            { backgroundColor: withAlpha(palette.accent, "24"), borderColor: palette.accent },
          ]}
        >
          <View style={styles.dailyFactHeader}>
            <Text style={[styles.dailyFactBadge, { backgroundColor: palette.accent }]}>§Y'­ GÜNÜN BİLGİSİ</Text>
          </View>
          <Text style={[styles.dailyFactText, { color: palette.primary }]}>{factOfDay}</Text>
        </View>

        {activeTab === "GAMES" && (
          <Animated.View
            style={[
              styles.panel,
              {
                opacity: panelAnim,
                backgroundColor: withAlpha(palette.foam, "88"),
                transform: [
                  {
                    translateY: panelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.panelRow}>
              <View style={[styles.sideRail, { backgroundColor: withAlpha(palette.foam, "55") }]}>
                <Text style={[styles.sideRailLabel, { color: palette.wave }]}>Aktif Tema</Text>
                <Text style={[styles.sideRailThemeName, { color: palette.primary }]}>{activeTheme.name}</Text>
                <Text style={[styles.sideRailItemText, { color: palette.textDark }]}>
                  §Y?î Görevler: {activeTheme.completedLevels}/{activeTheme.maxLevels}
                </Text>
                <Text style={[styles.sideRailItemText, { color: palette.textDark }]}>
                  §Y? Rozetler: {activeTheme.badges.length}
                </Text>
                {currentTasks.slice(0, 3).map((task) => (
                  <Text key={task.id} style={[styles.sideRailTaskText, { color: palette.textDark }]}>
                    ƒ?½ {task.title}
                  </Text>
                ))}
                <TouchableOpacity
                  style={[styles.sideRailButton, { backgroundColor: withAlpha(palette.accent, "26") }]}
                  onPress={() => setShowThemeTasks(true)}
                >
                  <Text style={[styles.sideRailButtonText, { color: palette.primary }]}>§Y?î Görevler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sideRailButton, { backgroundColor: withAlpha(palette.accent, "26") }]}
                  onPress={() => setShowAchievements(true)}
                >
                  <Text style={[styles.sideRailButtonText, { color: palette.primary }]}>§Y? Rozetler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sideRailButton, { backgroundColor: withAlpha(palette.accent, "26") }]}
                  onPress={() => setShowForest(true)}
                >
                  <Text style={[styles.sideRailButtonText, { color: palette.primary }]}>§Yõû Temizleme</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sideRailButton}
                  onPress={() => animatePanelChange("SETTINGS")}
                >
                  <Text style={styles.sideRailButtonText}>⚙️ Ayarlar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.mainColumn}>
                <View style={[styles.leftRail, { backgroundColor: withAlpha(palette.foam, "60") }]}>
                  <Text style={[styles.leftRailTitle, { color: palette.primary }]}>{activeTheme.name}</Text>
                  <Text style={[styles.leftRailText, { color: palette.textDark }]}>
                    Görevler: {activeTheme.completedLevels}/{activeTheme.maxLevels} ¶ú Rozet:{" "}
                    {activeTheme.badges.length}
                  </Text>
                </View>

                <Text style={[styles.subtitle, { color: palette.textDark }]}>"{tipOfDay}"</Text>

                <TouchableOpacity
                  style={[styles.primaryCta, { backgroundColor: palette.accent, shadowColor: palette.accent }]}
                  onPress={onPlay}
                >
                  <Text style={[styles.primaryCtaIcon, { color: palette.textLight }]}>ƒ-ô</Text>
                  <Text style={[styles.primaryCtaText, { color: palette.textLight }]}>Hemen Başla</Text>
                </TouchableOpacity>

                <View style={styles.cards}>
                  <MenuCard
                    icon="§Y?©"
                    title="Oyun Modları"
                    desc="Tüm oyun modlarını keşfet"
                    onPress={onPlay}
                    palette={palette}
                    withAlpha={withAlpha}
                  />
                  <MenuCard
                    icon="§YOý"
                    title="Ormanım"
                    desc="Ağaç dik, orman yetiştir"
                    onPress={() => setShowForest(true)}
                    palette={palette}
                    withAlpha={withAlpha}
                  />
                  <MenuCard
                    icon="§Y?Å"
                    title="Başarılarım"
                    desc="Rozetler ve görevler"
                    onPress={() => setShowAchievements(true)}
                    palette={palette}
                    withAlpha={withAlpha}
                  />
                  <MenuCard
                    icon="§Y'Ï"
                    title="Profilim"
                    desc="İstatistikler ve ilerleme"
                    onPress={() => setShowProfile(true)}
                    palette={palette}
                    withAlpha={withAlpha}
                  />
                </View>

                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { backgroundColor: withAlpha(palette.foam, "88") }]}
                    onPress={() => setSoundOn((v) => !v)}
                  >
                    <Text style={[styles.secondaryBtnText, { color: palette.primary }]}>
                      {soundOn ? "§Y\"S Sesler Açık" : "§Y\"^ Sesler Kapalı"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {activeTab === "THEMES" && (
          <Animated.View
            style={[
              styles.panel,
              {
                opacity: panelAnim,
                backgroundColor: withAlpha(palette.foam, "88"),
                transform: [
                  {
                    translateY: panelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.themeRowHeader}>
              <Text style={[styles.themeRowTitle, { color: palette.primary }]}>Temalar</Text>
              <Text style={[styles.themeRowSubtitle, { color: palette.wave }]}>
                Her temanı atmosferini keşfet ve seçimini yap
              </Text>
            </View>

            <View style={styles.themeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  activeTheme.id === "rainforest" && styles.themeToggleActive,
                  activeTheme.id === "rainforest" && { backgroundColor: palette.accent },
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelectTheme("rainforest")}
              >
                <Text
                  style={[
                    styles.themeToggleText,
                    { color: palette.primary },
                    activeTheme.id === "rainforest" && styles.themeToggleTextActive,
                  ]}
                >
                  Yağmur Ormanı
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  activeTheme.id === "pacific" && styles.themeToggleActive,
                  activeTheme.id === "pacific" && { backgroundColor: palette.accent },
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelectTheme("pacific")}
              >
                <Text
                  style={[
                    styles.themeToggleText,
                    { color: palette.primary },
                    activeTheme.id === "pacific" && styles.themeToggleTextActive,
                  ]}
                >
                  Pasifik Okyanusu
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.themeProgressContainer,
                { borderColor: palette.accent, backgroundColor: withAlpha(palette.accent, "18") },
              ]}
            >
              <Text style={[styles.themeProgressTitle, { color: palette.primary }]}>Aktif Tema Seviye İlerlemesi</Text>
              <View style={styles.themeProgressBar}>
                <View
                  style={[
                    styles.themeProgressFill,
                    {
                      width: `${Math.round((activeTheme.progressRatio || 0) * 100)}%`,
                      backgroundColor: palette.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.themeProgressText, { color: palette.textDark }]}>
                Seviye {activeTheme.completedLevels}/{activeTheme.maxLevels} ¶ú Rozet {activeTheme.badges.length}
              </Text>
            </View>

            <View style={styles.cards}>
              {themes.map((theme) => (
                <MenuCard
                  key={theme.id}
                  icon={theme.icon}
                  title={theme.name}
                  desc={`${theme.completedLevels}/${theme.maxLevels} seviye ¶ú ${theme.badges.length} rozet`}
                  locked={!theme.unlocked}
                  accent={theme.id === activeTheme.id}
                  onPress={() => handleSelectTheme(theme.id)}
                  palette={theme.palette || palette}
                  withAlpha={withAlpha}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {activeTab === "SETTINGS" && (
          <Animated.View
            style={[
              styles.panel,
              {
                opacity: panelAnim,
                transform: [
                  {
                    translateY: panelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.settingsHeaderRow}>
              <Text style={styles.settingsTitle}>Ayarlar</Text>
              <Text style={styles.settingsSubtitle}>
                Ses, görünüm ve ebeveyn modu tercihlerini buradan yönetebilirsin.
              </Text>
            </View>

            <View style={styles.cards}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => setSoundOn((v) => !v)}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconWrap}>
                  <Text style={styles.cardIcon}>{soundOn ? '🔊' : '🔈'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Sesler</Text>
                  <Text style={styles.cardDesc}>
                    {soundOn ? 'Müzik ve efektler açık.' : 'Tüm oyun sesleri kapalı.'}
                  </Text>
                </View>
                <Text style={styles.cardChevron}>{soundOn ? 'I' : 'O'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() => setDarkMode((v) => !v)}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconWrap}>
                  <Text style={styles.cardIcon}>{darkMode ? '🌙' : '☀️'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Görünüm</Text>
                  <Text style={styles.cardDesc}>
                    {darkMode
                      ? 'Karanlık mod açık. Daha yumuşak, loş bir görünüm.'
                      : 'Aydınlık mod açık. Canlı ve parlak bir görünüm.'}
                  </Text>
                </View>
                <Text style={styles.cardChevron}>{darkMode ? '🌙' : '☀️'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() => setShowParentMode(true)}
                activeOpacity={0.9}
              >
                <View style={styles.cardIconWrap}>
                  <Text style={styles.cardIcon}>🧩</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Ebeveyn Modu</Text>
                  <Text style={styles.cardDesc}>
                    Oyun süresini, zorluk seviyesini ve çocuk güvenliğini ayarla.
                  </Text>
                </View>
                <Text style={styles.cardChevron}>›</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </KeyboardScrollView>
    </View>
  );
}

function NatureSplash({ themeId, palette }) {
  const isForest = themeId === "rainforest";
  const isSea = themeId === "pacific";

  const bigColor = isForest ? palette.wave : isSea ? palette.wave : "#BBDEFB";
  const midColor = isForest ? palette.tide : isSea ? palette.accent : "#90CAF9";
  const smallColor = isForest ? palette.sand : isSea ? palette.foam : "#E3F2FD";

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      <View style={[styles.treeBig, { backgroundColor: bigColor }]} />
      <View style={[styles.treeMid, { backgroundColor: midColor }]} />
      <View style={[styles.treeSmall, { backgroundColor: smallColor }]} />
    </View>
  );
}

function OceanFloatOverlay() {
  const { width, height } = Dimensions.get("window");
  const icons = ["🐠", "🐟", "🐬", "🐳", "🐙", "🦀", "🪼", "🐚", "⭐", "🌊"];
  const elementsRef = useRef(
    [...Array(14)].map(() => ({
      anim: new Animated.Value(0),
      left: Math.random() * width,
      size: Math.random() * 18 + 12,
      speed: Math.random() * 8000 + 5000,
      delay: Math.random() * 5000,
      icon: icons[Math.floor(Math.random() * icons.length)],
    }))
  );

  useEffect(() => {
    const loops = elementsRef.current.map((e) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(e.delay),
          Animated.timing(e.anim, {
            toValue: 1,
            duration: e.speed,
            easing: Animated.Easing ? Animated.Easing.linear : undefined,
            useNativeDriver: true,
          }),
          Animated.timing(e.anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {elementsRef.current.map((e, idx) => (
        <Animated.View
          key={idx}
          style={{
            position: "absolute",
            left: e.left,
            bottom: -40,
            transform: [
              {
                translateY: e.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -height - 120],
                }),
              },
              {
                rotate: e.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
            opacity: 0.3,
          }}
        >
          <Text style={{ fontSize: e.size }}>{e.icon}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

function MenuCard({ icon, title, desc, onPress, locked, accent, palette, withAlpha }) {
  const cardPalette = palette || THEME;
  const accentColor = cardPalette.accent || THEME.accent;
  const primaryColor = cardPalette.primary || THEME.deepSea;
  const textColor = cardPalette.textDark || THEME.textDark;
  const foamColor = cardPalette.foam || THEME.foam;
  const chevronColor = cardPalette.wave || accentColor;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: withAlpha(primaryColor, "22") },
        locked && styles.cardLocked,
        accent && {
          borderColor: accentColor,
          backgroundColor: withAlpha(accentColor, "1f"),
        },
      ]}
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.9}
    >
      <View style={[styles.cardIconWrap, { backgroundColor: withAlpha(foamColor, "44") }]}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: primaryColor }]}>{title}</Text>
        <Text
          style={[
            styles.cardDesc,
            { color: textColor },
            locked && styles.cardDescLocked,
          ]}
        >
          {locked ? "Kilitli - Önce ormanı temizle" : desc}
        </Text>
      </View>
      <Text style={[styles.cardChevron, { color: chevronColor }]}>{locked ? "§Y'\"" : "ƒ?Ð"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  rootDark: {
    backgroundColor: "#020617",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 8,
    alignItems: "center",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 24,
  },
  topRightMenu: {
    flexDirection: "row",
    gap: 12,
  },
  topRightIcon: {
    fontSize: 20,
  },
  themePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  themePillIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  themePillText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.deepSea,
  },
  tabSwitcher: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 16,
    padding: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  tabChip: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tabChipActive: {
    backgroundColor: THEME.accent,
  },
  tabChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.deepSea,
  },
  tabChipTextActive: {
    color: THEME.textLight,
  },
  totalScoreBox: {
    marginTop: 12,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffd700",
  },
  totalScoreLabel: {
    fontSize: 12,
    color: THEME.textDark,
    textAlign: "center",
    marginBottom: 2,
  },
  totalScoreValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffd700",
    textAlign: "center",
  },
  brandTop: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.deepSea,
    letterSpacing: 2,
  },
  brandBottom: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.wave,
    letterSpacing: 6,
  },
  themeProgressContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  themeProgressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.deepSea,
    marginBottom: 6,
  },
  themeProgressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  themeProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: THEME.accent,
  },
  themeProgressText: {
    marginTop: 6,
    fontSize: 12,
    color: THEME.deepSea,
  },
  dailyFactContainer: {
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: THEME.accent,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dailyFactHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  dailyFactBadge: {
    backgroundColor: THEME.accent,
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    letterSpacing: 1,
  },
  dailyFactText: {
    fontSize: 15,
    lineHeight: 22,
    color: THEME.deepSea,
    textAlign: "center",
    fontWeight: "600",
  },
  panel: {
    margin: 20,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  subtitle: {
    textAlign: "center",
    color: THEME.textDark,
    marginBottom: 16,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.accent,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: THEME.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  primaryCtaIcon: {
    color: THEME.textLight,
    fontWeight: "800",
    fontSize: 18,
    marginRight: 8,
  },
  primaryCtaText: {
    color: THEME.textLight,
    fontWeight: "800",
    fontSize: 18,
  },
  themeToggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  themeToggle: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  themeToggleActive: {
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  themeToggleTextActive: {
    color: "#ffffff",
  },
  cards: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  themeRowHeader: {
    marginBottom: 4,
  },
  themeRowTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.deepSea,
  },
  themeRowSubtitle: {
    fontSize: 12,
    color: THEME.wave,
  },
  settingsHeaderRow: {
    marginBottom: 4,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.deepSea,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: THEME.wave,
    marginTop: 2,
  },
  leftRail: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  leftRailTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.deepSea,
  },
  leftRailText: {
    marginTop: 4,
    fontSize: 12,
    color: THEME.textDark,
  },
  panelRow: {
    flexDirection: "row",
  },
  sideRail: {
    width: 120,
    marginRight: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  sideRailLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.wave,
    marginBottom: 4,
  },
  sideRailThemeName: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.deepSea,
    marginBottom: 8,
  },
  sideRailItemText: {
    fontSize: 11,
    color: THEME.textDark,
    marginBottom: 4,
  },
  sideRailTaskText: {
    fontSize: 11,
    color: THEME.textDark,
  },
  sideRailButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(76,175,80,0.15)",
    alignItems: "center",
  },
  sideRailButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.deepSea,
  },
  mainColumn: {
    flex: 1,
  },
  card: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: THEME.foam,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.deepSea,
  },
  cardDesc: {
    fontSize: 12,
    color: THEME.textDark,
    opacity: 0.8,
    marginTop: 2,
  },
  cardDescLocked: {
    opacity: 0.5,
  },
  cardChevron: {
    fontSize: 28,
    color: THEME.wave,
    marginLeft: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  secondaryBtn: {
    backgroundColor: THEME.foam,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: THEME.deepSea,
    fontWeight: "700",
  },
  treeBig: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: THEME.wave,
    opacity: 0.3,
  },
  treeMid: {
    position: "absolute",
    top: -40,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: THEME.tide,
    opacity: 0.3,
  },
  treeSmall: {
    position: "absolute",
    bottom: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.sand,
    opacity: 0.3,
  },
});
