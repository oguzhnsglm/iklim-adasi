import React, { useMemo, useState, useEffect, useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import KeyboardScrollView from '../components/KeyboardScrollView';
import { THEME } from "../theme";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForestScreen from './ForestScreen';
import AchievementsScreen from './AchievementsScreen';
import ProfileScreen from './ProfileScreen';
import ParentModeScreen from './ParentModeScreen';
import ThemeTasksScreen from './ThemeTasksScreen';
import soundManager from '../utils/sounds';
import { useThemeProgress } from "../ThemeProgressContext";
import ThemeTransitionOverlay from "../components/ThemeTransitionOverlay";

const THEME_TASKS = {
  forest: [
    { id: 'forest-1', title: 'Ağaç dik ve ormanı büyüt' },
    { id: 'forest-2', title: 'Ormandaki çöpleri temizle' },
    { id: 'forest-3', title: 'Hayvanların yuvalarını koru' },
  ],
  sea: [
    { id: 'sea-1', title: 'Dalgaların getirdiği atıkları topla' },
    { id: 'sea-2', title: 'Deniz altı canlılarını keşfet' },
    { id: 'sea-3', title: 'Mercan resiflerini koru' },
  ],
  snow: [
    { id: 'snow-1', title: 'Kar tanelerini biriktir' },
    { id: 'snow-2', title: 'Kış sporları yaparken doğayı koru' },
    { id: 'snow-3', title: 'Kutup hayvanları için güvenli alan oluştur' },
  ],
};

// Gelişmiş ana menü: Okyanus temalı arka plan, kartlar, birincil CTA
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
  const [activeTab, setActiveTab] = useState("GAMES");
  const panelAnim = useRef(new Animated.Value(1)).current;
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    soundManager.init();
    return () => soundManager.stopBackgroundMusic();
  }, []);

  useEffect(() => {
    soundManager.setEnabled(soundOn);
    soundManager.setMusicEnabled(soundOn);
  }, [soundOn]);

  // Günlük çevre bilgileri
  const dailyFacts = useMemo(
    () => [
      "🌍 Biliyor musunuz? Bir plastik poşetin doğada yok olması 500 yıl sürebilir!",
      "💧 Biliyor musunuz? Muslukları kapatarak günde 200 litre su tasarrufu yapabilirsiniz!",
      "🌳 Biliyor musunuz? Bir ağaç yılda 22 kg CO₂ emer ve 260 kg oksijen üretir!",
      "♻️ Biliyor musunuz? 1 ton kağıt geri dönüştürmek 17 ağacı kurtarır!",
      "🍃 Biliyor musunuz? Cam şişeler sonsuz kez geri dönüştürülebilir!",
      "⚡ Biliyor musunuz? LED ampuller %75 daha az enerji tüketir!",
      "🐝 Biliyor musunuz? Arılar olmadan gıdaların %30'u yok olur!",
      "🌊 Biliyor musunuz? Okyanuslar her yıl 8 milyon ton plastik atıkla kirleniyor!",
      "🔋 Biliyor musunuz? Bir pil toprağı 50 yıl boyunca zehirleyebilir!",
      "🌱 Biliyor musunuz? Kompost yaparak çöp miktarını %30 azaltabilirsiniz!",
      "🚗 Biliyor musunuz? Toplu taşıma kullanmak kişi başı %45 karbon salınımını azaltır!",
      "📱 Biliyor musunuz? Eski telefonları geri dönüştürmek altın ve gümüş kazandırır!",
      "🌲 Biliyor musunuz? Amazon ormanları dünya oksijeninin %20'sini üretir!",
      "💡 Biliyor musunuz? Cihazları prize takılı bırakmak elektriğin %10'unu tüketir!",
      "🥤 Biliyor musunuz? Cam şişe yerine pet kullanmak 3 kat daha fazla karbon salınımı yapar!",
      "🌿 Biliyor musunuz? Organik atıklar 2 haftada, plastikler 450 yılda çürür!",
      "🐠 Biliyor musunuz? Plastik atıklar yüzünden her yıl 1 milyon deniz kuşu ölüyor!",
      "🌞 Biliyor musunuz? Güneş enerjisi temiz ve sınırsız bir enerji kaynağıdır!",
      "🍽️ Biliyor musunuz? Gıda israfını önlemek 4.4 milyar ton CO₂'den tasarruf sağlar!",
      "🌺 Biliyor musunuz? Yerel ürünler tercih etmek nakliye emisyonunu %80 azaltır!",
      "🌡️ Biliyor musunuz? Son 100 yılda küresel sıcaklık 1.1°C arttı ve bu artış hızlanıyor!",
      "🧊 Biliyor musunuz? Kutuplardaki buzullar her yıl 413 milyar ton eriyerek deniz seviyesini yükseltiyor!",
      "🌪️ Biliyor musunuz? İklim değişikliği aşırı hava olaylarını 5 kat artırdı!",
      "🦋 Biliyor musunuz? Böcek popülasyonu son 50 yılda %40 azaldı!",
      "🌾 Biliyor musunuz? Organik tarım kimyasal kullanımını %95 azaltır!",
      "🚲 Biliyor musunuz? Bisiklet kullanmak arabayla karşılaştırıldığında km başına 21 kat daha az karbon salınımı yapar!",
      "💦 Biliyor musunuz? Dünya nüfusunun %40'ı su kıtlığı yaşıyor!",
      "🌴 Biliyor musunuz? Her dakika 40 futbol sahası büyüklüğünde orman kaybediliyor!",
      "🐘 Biliyor musunuz? Son 50 yılda yaban hayatı popülasyonu %68 azaldı!",
      "🏔️ Biliyor musunuz? Dağlardaki kar örtüsü son 40 yılda %10 azaldı!",
      "🌋 Biliyor musunuz? Okyanuslar atmosferdeki CO₂'nin %30'unu emiyor ama bu asidifikasyona neden oluyor!",
      "🐋 Biliyor musunuz? Bir balina ölünce 33 ton CO₂'yi okyanus dibinde tutar!",
      "🌹 Biliyor musunuz? Arı popülasyonu %50 azaldı, bu gıda güvenliğimizi tehdit ediyor!",
      "🔥 Biliyor musunuz? Orman yangınları 2023'te 7 milyon hektarlık alanı yok etti!",
      "🌊 Biliyor musunuz? 2050'de okyanuslarda balıktan çok plastik olacak!",
      "🌡️ Biliyor musunuz? 1.5°C ısınma sınırını aşarsak geri dönüşü olmayan değişiklikler yaşanacak!",
      "🌳 Biliyor musunuz? Ağaç dikmek en ucuz ve etkili karbon emme yöntemidir!",
      "⚡ Biliyor musunuz? Yenilenebilir enerji son 10 yılda %90 ucuzladı!",
      "🚿 Biliyor musunuz? 5 dakikalık duş 75 litre su tüketir!",
      "🥩 Biliyor musunuz? Et üretimi küresel sera gazının %14.5'ini oluşturuyor!",
      "🌊 Biliyor musunuz? Deniz seviyesi yüzyılda 3.3 mm yükseliyordu, şimdi yıllık 4.4 mm yükseliyor!",
      "🦎 Biliyor musunuz? Her gün 150 tür yok oluyor!",
      "🌿 Biliyor musunuz? Tropikal yağmur ormanları dünya karbon stokunun %25'ini tutuyor!",
      "💨 Biliyor musunuz? Hava kirliliği her yıl 7 milyon insanın erken ölümüne neden oluyor!",
      "🌏 Biliyor musunuz? Ekolojik ayak izimiz Dünya'nın yenilenme kapasitesinin 1.7 katı!",
      "🧃 Biliyor musunuz? Bir alüminyum kutu geri dönüştürmek 95% enerji tasarrufu sağlar!",
      "🐻 Biliyor musunuz? Kutup ayılarının buzulları eridiği için av alanları %50 azaldı!",
      "🌾 Biliyor musunuz? Çölleşme 2 milyar insanı ve 12 milyon hektar toprağı etkiliyor!",
      "🔌 Biliyor musunuz? Bekleme modundaki cihazlar yıllık elektriğin %10'unu tüketir!",
      "🌊 Biliyor musunuz? Mercan resifleri son 30 yılda %50 azaldı!",
      "♻️ Biliyor musunuz? Geri dönüşüm oranı %70'e çıkarsa 1.5 milyon iş imkanı doğar!",
      "🌳 Biliyor musunuz? Şehir ağaçları havayı serinletir ve klima kullanımını %30 azaltır!",
      "🚰 Biliyor musunuz? Damlayan bir musluk yılda 11.000 litre su israfına neden olur!",
      "🌍 Biliyor musunuz? Dünya kaynakları 29 Temmuz'da bitiyor, yılın geri kalanı borçla yaşıyoruz!",
      "🦜 Biliyor musunuz? Orman kaybı yüzünden kuş türlerinin %12'si kritik tehdit altında!",
      "💧 Biliyor musunuz? Sanal su kullanımı: 1 kg sığır eti için 15.000 litre su gerekir!",
      "🌱 Biliyor musunuz? Bitki bazlı beslenme karbon ayak izini %73 azaltabilir!",
      "🏠 Biliyor musunuz? Binalardaki enerji verimliliği %50 artırılabilir!",
      "🌊 Biliyor musunuz? Okyanus asitliği sanayi devriminden bu yana %30 arttı!",
      "🌸 Biliyor musunuz? Kentsel yeşil alanlar hava kalitesini %60 iyileştirebilir!",
      "🔋 Biliyor musunuz? Lityum piller 500'den fazla şarj döngüsü ile uzun ömürlüdür!",
      "🌳 Biliyor musunuz? Mangrove ormanları kara ormanlarından 4 kat daha fazla karbon tutar!",
      "💨 Biliyor musunuz? Rüzgar enerjisi 2023'te 1.9 milyon kişiye iş sağladı!",
      "🌍 Biliyor musunuz? Toprak erozyonu yılda 24 milyar ton verimli toprağı yok ediyor!",
      "🦎 Biliyor musunuz? Karada yaşayan omurgalı sayısı 1970'ten bu yana %39 azaldı!",
      "🌊 Biliyor musunuz? Denizlerde yaşayan omurgalı sayısı %36 azaldı!",
      "🎋 Biliyor musunuz? Bambu günde 90 cm uzayabilen en hızlı büyüyen bitkidir!",
    ],
    []
  );

  const factOfDay = useMemo(() => {
    return dailyFacts[currentHour % dailyFacts.length];
  }, [dailyFacts, currentHour]);

  const tips = useMemo(
    () => [
      "Atıkları türüne göre ayrıştır, doğayı koru!",
      "Süre bitmeden daha çok atık temizle.",
      "Ağaç dik, ormanını büyüt, doğayı koru!",
    ],
    []
  );

  const tipOfDay = useMemo(() => tips[Math.floor(Math.random() * tips.length)], [tips]);

  const currentTasks = useMemo(
    () => THEME_TASKS[activeTheme.id] || [],
    [activeTheme.id]
  );

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
    }, 60000); // Her dakika kontrol et

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
      const stored = await AsyncStorage.getItem('totalScore');
      const value = parseInt(stored || '0', 10);
      setTotalScore(isNaN(value) ? 0 : value);
    } catch (error) {
      console.log('Total score load error:', error);
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
    const theme = themes.find(t => t.id === themeId);
    if (!theme || !theme.unlocked) {
      Alert.alert(
        "Tema Kilitli",
        "Bu temayı açmak için önce orman temasını tamamen temizlemelisin!"
      );
      return;
    }
    setTransitionTarget(themeId);
  };

  const handleTransitionFinished = () => {
    if (transitionTarget) {
      setActiveTheme(transitionTarget);
      setTransitionTarget(null);
    }
  };

  // Orman ekranı göster
  if (showForest) {
    return <ForestScreen totalScore={totalScore} onBack={() => setShowForest(false)} />;
  }

  // Başarılar ekranı göster
  if (showAchievements) {
    return <AchievementsScreen onBack={() => setShowAchievements(false)} />;
  }

  // Profil ekranı göster
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
    <View style={[styles.root, darkMode && styles.rootDark]}>
      <ThemeTransitionOverlay
        visible={!!transitionTarget}
        targetThemeId={transitionTarget || undefined}
        onFinished={handleTransitionFinished}
      />
      <NatureSplash themeId={activeTheme.id} />

      <KeyboardScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.brandTop}>DOĞAYI</Text>
            <View style={styles.topRightMenu}>
              <TouchableOpacity onPress={() => setShowProfile(true)}>
                <Text style={styles.topRightIcon}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowParentMode(true)}>
                <Text style={styles.topRightIcon}>👨‍👩‍👧</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDarkMode((v) => !v)}>
                <Text style={styles.topRightIcon}>{darkMode ? '🌙' : '☀️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.brandBottom}>KORU</Text>
          <View style={styles.themePill}>
            <Text style={styles.themePillIcon}>{activeTheme.icon}</Text>
            <Text style={styles.themePillText}>{activeTheme.name} Teması</Text>
          </View>
          <View style={styles.totalScoreBox}>
            <Text style={styles.totalScoreLabel}>Toplam Puanım</Text>
            <Text style={styles.totalScoreValue}>⭐ {totalScore}</Text>
          </View>
        </View>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === "GAMES" && styles.tabChipActive]}
            onPress={() => animatePanelChange("GAMES")}
          >
            <Text
              style={[styles.tabChipText, activeTab === "GAMES" && styles.tabChipTextActive]}
            >
              Oyunlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === "THEMES" && styles.tabChipActive]}
            onPress={() => animatePanelChange("THEMES")}
          >
            <Text
              style={[styles.tabChipText, activeTab === "THEMES" && styles.tabChipTextActive]}
            >
              Temalar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Günün bilgisi her iki sekmede de gösterilsin */}
        <View style={styles.dailyFactContainer}>
          <View style={styles.dailyFactHeader}>
            <Text style={styles.dailyFactBadge}>💡 GÜNÜN BİLGİSİ</Text>
          </View>
          <Text style={styles.dailyFactText}>{factOfDay}</Text>
        </View>

        {activeTab === "GAMES" && (
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
            <View style={styles.panelRow}>
              <View style={styles.sideRail}>
                <Text style={styles.sideRailLabel}>Aktif Tema</Text>
                <Text style={styles.sideRailThemeName}>{activeTheme.name}</Text>
                <Text style={styles.sideRailItemText}>
                  🎯 Görevler: {activeTheme.completedLevels}/{activeTheme.maxLevels}
                </Text>
                <Text style={styles.sideRailItemText}>
                  🏅 Rozetler: {activeTheme.badges.length}
                </Text>
                {currentTasks.slice(0, 3).map((task) => (
                  <Text key={task.id} style={styles.sideRailTaskText}>
                    • {task.title}
                  </Text>
                ))}
                <TouchableOpacity
                  style={styles.sideRailButton}
                  onPress={() => setShowThemeTasks(true)}
                >
                  <Text style={styles.sideRailButtonText}>🎯 Görevler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sideRailButton}
                  onPress={() => setShowAchievements(true)}
                >
                  <Text style={styles.sideRailButtonText}>🏅 Rozetler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sideRailButton}
                  onPress={() => setShowForest(true)}
                >
                  <Text style={styles.sideRailButtonText}>🧹 Temizleme</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.mainColumn}>
                <View style={styles.leftRail}>
                  <Text style={styles.leftRailTitle}>{activeTheme.name}</Text>
                  <Text style={styles.leftRailText}>
                    Görevler: {activeTheme.completedLevels}/{activeTheme.maxLevels} · Rozet: {activeTheme.badges.length}
                  </Text>
                </View>

                <Text style={styles.subtitle}>"{tipOfDay}"</Text>

                <TouchableOpacity style={styles.primaryCta} onPress={onPlay}>
                  <Text style={styles.primaryCtaIcon}>▶</Text>
                  <Text style={styles.primaryCtaText}>Hemen Başla</Text>
                </TouchableOpacity>

                <View style={styles.cards}>
                  <MenuCard icon="🎮" title="Oyun Modları" desc="Tüm oyun modlarını keşfet" onPress={onPlay} />
                  <MenuCard 
                    icon="🌲" 
                    title="Ormanım" 
                    desc="Ağaç dik, orman yetiştir" 
                    onPress={() => setShowForest(true)} 
                  />
                  <MenuCard
                    icon="🏆"
                    title="Başarılarım"
                    desc="Rozetler ve görevler"
                    onPress={() => setShowAchievements(true)}
                  />
                  <MenuCard
                    icon="👤"
                    title="Profilim"
                    desc="İstatistikler ve ilerleme"
                    onPress={() => setShowProfile(true)}
                  />
                </View>

                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => setSoundOn((v) => !v)}
                  >
                    <Text style={styles.secondaryBtnText}>
                      {soundOn ? "🔊 Sesler Açık" : "🔈 Sesler Kapalı"}
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
              <Text style={styles.themeRowTitle}>Temalar</Text>
              <Text style={styles.themeRowSubtitle}>
                Her temanın atmosferini keşfet ve seçimini yap
              </Text>
            </View>

            <View style={styles.themeProgressContainer}>
              <Text style={styles.themeProgressTitle}>Aktif Tema Seviye İlerlemesi</Text>
              <View style={styles.themeProgressBar}>
                <View
                  style={[
                    styles.themeProgressFill,
                    { width: `${Math.round((activeTheme.progressRatio || 0) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.themeProgressText}>
                Seviye {activeTheme.completedLevels}/{activeTheme.maxLevels} · Rozet {activeTheme.badges.length}
              </Text>
            </View>

            <View style={styles.cards}>
              {themes.map((theme) => (
                <MenuCard
                  key={theme.id}
                  icon={theme.icon}
                  title={theme.name}
                  desc={`${theme.completedLevels}/${theme.maxLevels} seviye · ${theme.badges.length} rozet`}
                  locked={!theme.unlocked}
                  accent={theme.id === activeTheme.id}
                  onPress={() => handleSelectTheme(theme.id)}
                />
              ))}
            </View>
          </Animated.View>
        )}
      </KeyboardScrollView>
    </View>
  );
}

function NatureSplash({ themeId }) {
  // Basit tema kapak efektleri: orman için yeşil tonlu halkalar,
  // deniz için mavi dalga tonları, kar için buzlu mavi-beyaz halkalar.
  const isForest = themeId === 'forest';
  const isSea = themeId === 'sea';
  const isSnow = themeId === 'snow';

  const bigColor = isForest ? '#A5D6A7' : isSea ? THEME.wave : '#BBDEFB';
  const midColor = isForest ? '#66BB6A' : isSea ? THEME.tide : '#90CAF9';
  const smallColor = isForest ? '#C8E6C9' : isSea ? THEME.sand : '#E3F2FD';

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.treeBig, { backgroundColor: bigColor }]} />
      <View style={[styles.treeMid, { backgroundColor: midColor }]} />
      <View style={[styles.treeSmall, { backgroundColor: smallColor }]} />
    </View>
  );
}

function MenuCard({ icon, title, desc, onPress, locked, accent }) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        locked && styles.cardLocked,
        accent && styles.cardAccent,
      ]}
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.9}
    >
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, accent && styles.cardTitleAccent]}>
          {title}
        </Text>
        <Text
          style={[
            styles.cardDesc,
            locked && styles.cardDescLocked,
          ]}
        >
          {locked ? "Kilitli - Önce ormanı temizle" : desc}
        </Text>
      </View>
      <Text style={styles.cardChevron}>{locked ? "🔒" : "›"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  rootDark: {
    backgroundColor: '#020617',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 8,
    alignItems: "center",
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
  },
  topRightMenu: {
    flexDirection: 'row',
    gap: 12,
  },
  topRightIcon: {
    fontSize: 20,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    fontWeight: '700',
    color: THEME.deepSea,
  },
  tabSwitcher: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 16,
    padding: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
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
    fontWeight: '600',
    color: THEME.deepSea,
  },
  tabChipTextActive: {
    color: THEME.textLight,
  },
  totalScoreBox: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  totalScoreLabel: {
    fontSize: 12,
    color: THEME.textDark,
    textAlign: 'center',
    marginBottom: 2,
  },
  totalScoreValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffd700',
    textAlign: 'center',
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
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  themeProgressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.deepSea,
    marginBottom: 6,
  },
  themeProgressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  themeProgressFill: {
    height: '100%',
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
  cards: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  themeRowHeader: {
    marginBottom: 4,
  },
  themeRowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.deepSea,
  },
  themeRowSubtitle: {
    fontSize: 12,
    color: THEME.wave,
  },
  leftRail: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  leftRailTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.deepSea,
  },
  leftRailText: {
    marginTop: 4,
    fontSize: 12,
    color: THEME.textDark,
  },
  panelRow: {
    flexDirection: 'row',
  },
  sideRail: {
    width: 120,
    marginRight: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  sideRailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.wave,
    marginBottom: 4,
  },
  sideRailThemeName: {
    fontSize: 13,
    fontWeight: '800',
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
    backgroundColor: 'rgba(76,175,80,0.15)',
    alignItems: 'center',
  },
  sideRailButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.deepSea,
  },
  mainColumn: {
    flex: 1,
  },
  card: {
    width: '48%',
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 14,
    borderRadius: 16,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardAccent: {
    borderWidth: 2,
    borderColor: THEME.accent,
    backgroundColor: "rgba(76, 175, 80, 0.12)",
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
