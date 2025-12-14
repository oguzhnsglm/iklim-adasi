import React, { useEffect, useMemo, useState } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import KeyboardScrollView from '../components/KeyboardScrollView';
import { NatureBackground } from './GameComponents';
import MemoryGame from './MemoryGame';
import MathGame from './MathGame';
import ClassicRecycleGame from './ClassicRecycleGame';
import SlingshotGame from './SlingshotGame';
import LaneSwapGame from './LaneSwapGame';
import SnakeRecycleGame from './SnakeRecycleGame';
import FlyBirdGame from './FlyBirdGameWebContent';
import LaneRunnerGame from './LaneRunnerGame';
import ForestScreen from './ForestScreen';
import AchievementsScreen from './AchievementsScreen';
import ProfileScreen from './ProfileScreen';
import ParentModeScreen from './ParentModeScreen';
import ThemeTasksScreen from './ThemeTasksScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../theme';
import { useThemeProgress } from '../ThemeProgressContext';
import MascotBanner from '../components/MascotBanner';

const COLORS = {
  bgDeep: "#01579B",
  bgMid: "#0288D1",
  accent: "#ffd700",
};

const BADGE_ICONS = ['🥉', '🥈', '🥇'];

const SIDE_ITEMS = [
  { id: 'GAMES', icon: '🎮', label: 'Oyunlar' },
  { id: 'THEMES', icon: '✨', label: 'Temalar' },
  { id: 'TASKS', icon: '📋', label: 'Görevler' },
];

const THEME_TASKS = {
  // Her tema için 15 rozet, her rozet içinde 3 mini görev olacak şekilde
  rainforest: [
    { id: 'forest-1', title: '1. Rozet: 3 çöp kutusunu doldur, 5 ağaç dik, 1 hayvan yuvasını temiz tut.' },
    { id: 'forest-2', title: '2. Rozet: Ormanda 10 plastik topla, 3 yeni fide sula, kurumuş yaprakları komposta taşı.' },
    { id: 'forest-3', title: '3. Rozet: 5 cam şişe geri dönüştür, yürüyüş yolundaki çöpleri temizle, 1 kuş yuvasını onar.' },
    { id: 'forest-4', title: '4. Rozet: 2 farklı ağaç türü dik, 5 kağıt atığı geri dönüştür, sessizce hayvanları gözlemle.' },
    { id: 'forest-5', title: '5. Rozet: Ormanda 15 atık topla, 3 defa sulama yap, güneş alan alana ağaç yerleştir.' },
    { id: 'forest-6', title: '6. Rozet: 3 mantar bölgesini koru, fosforlu çöpleri seçip ayır, orman yolunu çöpünden arındır.' },
    { id: 'forest-7', title: '7. Rozet: 20 metal atığı topla, 5 fideyi rüzgârdan koru, dere kenarındaki çöpleri temizle.' },
    { id: 'forest-8', title: '8. Rozet: 3 farklı geri dönüşüm kutusunu doldur, 10 yaprak kompost kutusuna taşı, orman yangını işaretlerini ara.' },
    { id: 'forest-9', title: '9. Rozet: Geceleri parlayan çöpleri bul, 2 hayvan yuvasına engel olacak atıkları kaldır, 5 kütüğü etiketle.' },
    { id: 'forest-10', title: '10. Rozet: 25 plastik topla, 5 cam şişe, 5 metal kutuyu doğru kutulara at.' },
    { id: 'forest-11', title: '11. Rozet: Ormanın uzak köşesindeki çöpleri temizle, 3 yeni alanı ağaçlandır, gürültü yapan makineleri sustur.' },
    { id: 'forest-12', title: '12. Rozet: 30 atığı zaman bitmeden topla, 2 dereyi çöpten arındır, 5 hayvanı güvende tut.' },
    { id: 'forest-13', title: '13. Rozet: Sadece geri dönüştürülebilir atıkları seç, 10 hatalı atığı düzelt, ormanı tertemiz hâle getir.' },
    { id: 'forest-14', title: '14. Rozet: Haritada gizli çöpleri bul, 3 gizli bölgeyi temizle, zamana karşı yarış.' },
    { id: 'forest-15', title: '15. Rozet: En yüksek zorlukta 40 atığı doğru kutulara at, 5 ağacı kurtar, tüm ormanı parlat.' },
  ],
  pacific: [
    { id: 'sea-1', title: '1. Rozet: 5 plastik şişe topla, 3 deniz yıldızını kurtar, sahili süpür.' },
    { id: 'sea-2', title: '2. Rozet: Suda yüzen 10 atığı yakala, geri dönüşüm kutusuna taşı, yosunlara dokunma.' },
    { id: 'sea-3', title: '3. Rozet: 3 kumsal bölgesini temizle, kaplumbağa yolundaki çöpleri kaldır, cam şişeleri ayır.' },
    { id: 'sea-4', title: '4. Rozet: 15 mikroplastik topla, 2 balık sürüsünü koru, ağlara takılan çöpleri kes.' },
    { id: 'sea-5', title: '5. Rozet: Dalgaların getirdiği 20 atığı yakala, 3 defa doğru kutuya at, karaya vuran atıkları ayır.' },
    { id: 'sea-6', title: '6. Rozet: 5 cam şişe, 5 metal kutu, 5 plastik topla ve hepsini doğru renge bırak.' },
    { id: 'sea-7', title: '7. Rozet: Mercanların arasına saklanan çöpleri bul, 10 tanesini çıkar, balıklara zarar verme.' },
    { id: 'sea-8', title: '8. Rozet: 3 batık gemi çevresini temizle, petrol lekelerinden kaç, yosunları koru.' },
    { id: 'sea-9', title: '9. Rozet: Su altındaki 25 atığı süre dolmadan topla, 2 kaplumbağayı kurtar, 1 ağı kes.' },
    { id: 'sea-10', title: '10. Rozet: Fırtınadan sonra sahile vuran 30 atığı ayrıştır, metal ve plastiği karıştırma.' },
    { id: 'sea-11', title: '11. Rozet: Akıntıya kapılmış 15 atığı yakala, 3 farklı kutuya böl, dalgalardan kaç.' },
    { id: 'sea-12', title: '12. Rozet: Gece dalışında parlayan çöpleri bul, 20 tanesini çıkar, mercanlara çarpmadan yüz.' },
    { id: 'sea-13', title: '13. Rozet: Sadece plastikleri toplayan bir tur yap, sonra sadece metalleri, sonra sadece camları topla.' },
    { id: 'sea-14', title: '14. Rozet: 35 atığı art arda doğru kutuya at, hiçbir hata yapma, akıntıya dikkat et.' },
    { id: 'sea-15', title: '15. Rozet: En zor dalgada 40 deniz çöpünü temizle, 3 kaplumbağayı kurtar, mercanları tamamen koru.' },
  ],
  antarctica: [
    { id: 'antarctica-1', title: '1. Rozet: 5 kar topu ile çöpleri örtme, 5 gerçek çöpü bul ve topla, kutup ayısına yol aç.' },
    { id: 'antarctica-2', title: '2. Rozet: Buz üstündeki 10 atığı topla, buzları kırmadan ilerle, geri dönüşüm kutusuna taşı.' },
    { id: 'antarctica-3', title: '3. Rozet: 3 iglo çevresini temizle, soba külünü ayrı bir kutuya koy, pilleri ayır.' },
    { id: 'antarctica-4', title: '4. Rozet: 15 plastik atığı topla, rüzgârda uçan çöpleri yakala, buzda kaymadan ilerle.' },
    { id: 'antarctica-5', title: '5. Rozet: 5 metal kutu, 5 cam şişe, 5 plastik atığı doğru kutulara bırak.' },
    { id: 'antarctica-6', title: '6. Rozet: Donmuş gölün üzerindeki çöpleri topla, çatlaklardan kaç, 2 kutup tilkisini koru.' },
    { id: 'antarctica-7', title: '7. Rozet: Kar fırtınasında 20 atığı zaman dolmadan topla, görünürlüğe dikkat et, yolunu kaybetme.' },
    { id: 'antarctica-8', title: '8. Rozet: 3 dağ geçidini çöpten arındır, işaret levhalarını görünür yap, kayakçılara güvenli yol aç.' },
    { id: 'antarctica-9', title: '9. Rozet: Buzda saklanan atıkları termal izlerine göre bul, 15 tanesini çıkar, suya düşmeden dön.' },
    { id: 'antarctica-10', title: '10. Rozet: Kutup kampındaki 25 atığı sınıflandır, yanıcı, geri dönüşebilir ve normal atığı ayır.' },
    { id: 'antarctica-11', title: '11. Rozet: 3 farklı bölgede enerji tasarruflu ışıkları aç, gereksiz yananları kapat, karanlıkta çöpleri topla.' },
    { id: 'antarctica-12', title: '12. Rozet: Eriyen buzların altından çıkan 20 atığı topla, suya karışmadan kutulara taşı.' },
    { id: 'antarctica-13', title: '13. Rozet: Sadece pilleri ve tehlikeli atıkları topla, güvenli kutuya koy, diğerlerini elleme.' },
    { id: 'antarctica-14', title: '14. Rozet: Fırtına sırasında 35 atığı topla, rüzgâra kapılma, buz çatlaklarından kaç.' },
    { id: 'antarctica-15', title: '15. Rozet: En zor kar seviyesinde 40 atığı doğru yere bırak, 3 kutup hayvanını kurtar, kampı tertemiz yap.' },
  ],
};

export default function CleanupGame({ onRequestSessionStart, onSessionEnd }) {
  const [gameMode, setGameMode] = useState("SELECTION");
  const [showForest, setShowForest] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showParentMode, setShowParentMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { activeTheme } = useThemeProgress();

  const handleEnterGame = (mode) => {
    if (mode === "SELECTION") {
      setGameMode("SELECTION");
      return;
    }
    if (!onRequestSessionStart || onRequestSessionStart()) {
      setGameMode(mode);
    }
  };

  const handleBackToSelection = () => {
    if (onSessionEnd) {
      onSessionEnd();
    }
    setGameMode("SELECTION");
  };

  if (showForest) {
    return <ForestScreen onBack={() => setShowForest(false)} />;
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

  if (gameMode === "CLASSIC") {
    return <ClassicRecycleGame onBack={handleBackToSelection} />;
  }
  if (gameMode === "SLINGSHOT") {
    return <SlingshotGame onBack={handleBackToSelection} />;
  }
  if (gameMode === "LANE") {
    return <LaneSwapGame onBack={handleBackToSelection} />;
  }
  if (gameMode === "SNAKE") {
    return <SnakeRecycleGame onBack={handleBackToSelection} />;
  }
  if (gameMode === "MEMORY") {
    return <MemoryGame onBack={handleBackToSelection} />;
  }
  if (gameMode === "MATH") {
    return <MathGame onBack={handleBackToSelection} />;
  }
  if (gameMode === "FLYBIRD") {
    return <FlyBirdGame onBack={handleBackToSelection} />;
  }
  if (gameMode === "LANERUNNER") {
    return <LaneRunnerGame onBack={handleBackToSelection} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <NatureBackground
        key={activeTheme.id}
        themeId={activeTheme.id}
        palette={activeTheme.palette}
        intensity={1}
      />
      {activeTheme.id === "pacific" && (
        <OceanOverlay palette={activeTheme.palette} />
      )}
      <ModeSelectionScreen
        onSelectMode={handleEnterGame}
        onShowForest={() => setShowForest(true)}
        onShowAchievements={() => setShowAchievements(true)}
        onShowProfile={() => setShowProfile(true)}
        onShowParentMode={() => setShowParentMode(true)}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((v) => !v)}
      />
    </View>
  );
}

function ModeSelectionScreen({
  onSelectMode,
  onShowForest,
  onShowAchievements,
  onShowProfile,
  onShowParentMode,
  darkMode,
  onToggleDark,
}) {
  const { themes, activeTheme, setActiveTheme } = useThemeProgress();
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [totalScore, setTotalScore] = useState(0);
  const [activeSide, setActiveSide] = useState('GAMES');
  const [lives, setLives] = useState(3);

  const dailyFacts = useMemo(() => {
    const perTheme = {
      rainforest: [
        "Yağmur ormanları, dünyadaki oksijenin büyük kısmını üretir.",
        "Birçok hayvan türü sadece yağmur ormanlarında yaşar.",
        "Ağaç kesimini azaltmak, iklim değişikliğini yavaşlatır.",
      ],
      pacific: [
        "Pasifik Okyanusu, dünyanın en büyük okyanusudur.",
        "Denize atılan her plastik, bir canlı için tehlikedir.",
        "Bir plastik şişe denizde yüzlerce yıl kalabilir.",
      ],
      sahara: [
        "Çöllerde de hassas ekosistemler ve canlılar yaşar.",
        "Rüzgar, çölde kilometrelerce uzağa kum taşıyabilir.",
        "Güneş enerjisi çöllerde çok güçlü bir kaynaktır.",
      ],
      antarctica: [
        "Isınan hava, buzulların daha hızlı erimesine neden olur.",
        "Kutuplardaki buzlar eridikçe deniz seviyesi yükselir.",
        "Enerji tasarrufu yapmak, kutup hayvanlarının yuvalarını korur.",
      ],
    };
    return perTheme[activeTheme.id] || perTheme.rainforest;
  }, [activeTheme.id]);

  const factOfDay = useMemo(
    () => dailyFacts[currentHour % dailyFacts.length],
    [dailyFacts, currentHour]
  );

  const currentTasks = useMemo(
    () => THEME_TASKS[activeTheme.id] || [],
    [activeTheme.id]
  );

  const currentLevelIndex = activeTheme.completedLevels || 0;
  const currentBadge = currentTasks[currentLevelIndex] || currentTasks[0];
  const currentTaskTitle = currentBadge ? currentBadge.title : '';

  const handleSelectTheme = (themeId) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme || !theme.unlocked) return;
    if (themeId === activeTheme.id) return;
    setActiveTheme(themeId);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('totalScore');
        const value = parseInt(stored || '0', 10);
        setTotalScore(isNaN(value) ? 0 : value);
      } catch (e) {
        console.log('score load error', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const h = new Date().getHours();
      if (h !== currentHour) setCurrentHour(h);
    }, 60000);
    return () => clearInterval(id);
  }, [currentHour]);

  return (
    <View style={[styles.screenRoot, darkMode && styles.screenRootDark]}>
      <View
        style={[
          styles.sideBar,
          {
            backgroundColor:
              activeTheme.palette?.background || 'rgba(255,255,255,0.9)',
          },
        ]}
      >
        <View style={styles.sideThemeCard}>
          <Text style={styles.sideThemeIcon}>{activeTheme.icon}</Text>
          <Text style={styles.sideThemeName} numberOfLines={1}>{activeTheme.name}</Text>
          <Text style={styles.sideThemeScore}>⭐ {totalScore}</Text>
        </View>
        {SIDE_ITEMS.map((item) => {
          const selected = activeSide === item.id;
          const handlePress = () => {
            setActiveSide(item.id);
          };

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.sideItem, selected && styles.sideItemActive]}
              onPress={handlePress}
            >
              <View style={styles.sideItemInner}>
                <Text style={styles.sideIcon}>{item.icon}</Text>
                <Text style={styles.sideLabel} numberOfLines={1}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <KeyboardScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
              <Text style={styles.logoText}>DOĞAYI KORU</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={onShowProfile}>
              <Text style={styles.headerIcon}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onShowParentMode}>
              <Text style={styles.headerIcon}>👨‍👩‍👧</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleDark}>
              <Text style={styles.headerIcon}>{darkMode ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <MascotBanner
          themeId={activeTheme.id}
          lives={lives}
          maxLives={3}
          currentTaskTitle={currentTaskTitle}
        />
        <View style={styles.factInlineContainer}>
          <Text style={styles.factInlineTitle}>Günün Bilgisi</Text>
          <Text style={styles.factInlineText}>{factOfDay}</Text>
        </View>

        {activeSide === 'GAMES' && (
          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>Oyunlar</Text>
            <View style={styles.gameGrid}>
              <GameCard
                icon="🚮"
                title="Klasik Ayrıştırma"
                desc="Atıkları sürükle ve kutulara bırak."
                onPress={() => onSelectMode("CLASSIC")}
              />
              <GameCard
                icon="🏀"
                title="Sapan Basketi"
                desc="Çek, nişan al ve potaya basket at!"
                onPress={() => onSelectMode("SLINGSHOT")}
              />
              <GameCard
                icon="🎹"
                title="Şerit Değiştir"
                desc="Kutuların yerini değiştir, atığı yakala."
                onPress={() => onSelectMode("LANE")}
              />
              <GameCard
                icon="🌍"
                title="İklim Yılanı"
                desc="Yeşil öğeler topla, gezegeni koru!"
                onPress={() => onSelectMode("SNAKE")}
              />
              <GameCard
                icon="🧩"
                title="Hafıza Oyunu"
                desc="Kartları eşleştir, hafızanı güçlendir!"
                onPress={() => onSelectMode("MEMORY")}
              />
              <GameCard
                icon="🧮"
                title="Matematik Oyunu"
                desc="Kovadaki atıkları say, matematiğini güçlendir!"
                onPress={() => onSelectMode("MATH")}
              />
              <GameCard
                icon="🐦"
                title="Uçan Kuş"
                desc="Çöp yığınlarından kaç, temiz uç!"
                onPress={() => onSelectMode("FLYBIRD")}
              />
              <GameCard
                icon="🏃"
                title="Koşucu Oyunu"
                desc="Şerit değiştir, atıkları topla!"
                onPress={() => onSelectMode("LANERUNNER")}
              />
            </View>
          </View>
        )}

        {activeSide === 'THEMES' && (
          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>Temalar</Text>
            <View style={styles.gameGrid}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    !theme.unlocked && styles.themeCardLocked,
                    theme.id === activeTheme.id && styles.themeCardActive,
                    {
                      borderColor: theme.palette?.accent || THEME.accent,
                    },
                  ]}
                  onPress={() => handleSelectTheme(theme.id)}
                  activeOpacity={theme.unlocked ? 0.9 : 1}
                  disabled={!theme.unlocked}
                >
                  <Text style={styles.themeIcon}>{theme.icon}</Text>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  <Text style={styles.themeProgress}>
                    {theme.completedLevels}/{theme.maxLevels} seviye · {theme.badges.length} rozet
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeSide === 'TASKS' && (
          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>Görevler</Text>
            <View style={styles.badgeGrid}>
              {currentTasks.map((task, index) => {
                const levelIndex = index; // 0 tabanlı rozet indexi
                const completedLevels = activeTheme.completedLevels || 0;
                const isCompleted = levelIndex < completedLevels;
                const isUnlocked = levelIndex <= completedLevels; // sadece ilk rozet başlangıçta açık

                const [namePart, rest] = (task.title || '').split(':');
                const badgeName = (namePart || '').trim();
                const tasksRaw = rest ? rest.split(',') : [];
                const taskLines = tasksRaw.map((t) => t.trim()).filter(Boolean).slice(0, 3);
                const filledBars = isCompleted ? taskLines.length : 0;
                const icon = BADGE_ICONS[index % BADGE_ICONS.length];

                return (
                  <View
                    key={task.id}
                    style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}
                  >
                    <View style={styles.badgeHeader}>
                      <View style={styles.badgeIconCircle}>
                        <Text style={styles.badgeIcon}>{icon}</Text>
                      </View>
                      <View style={styles.badgeTitleContainer}>
                        <Text style={styles.badgeTitle}>{badgeName || `Rozet ${index + 1}`}</Text>
                        <Text style={styles.badgeSubtitle}>{activeTheme.name}</Text>
                      </View>
                      {!isUnlocked && <Text style={styles.badgeLock}>🔒</Text>}
                    </View>

                    {taskLines.map((line, i) => (
                      <View key={i} style={styles.badgeTaskRow}>
                        <Text style={styles.badgeTaskText}>{line}</Text>
                        <View style={styles.badgeProgressTrack}>
                          <View
                            style={[
                              styles.badgeProgressFill,
                              i < filledBars && styles.badgeProgressFillActive,
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </KeyboardScrollView>
    </View>
  );
}

function OceanOverlay({ palette }) {
  const deep = palette?.background || "#012a4a";
  const mid = palette?.wave || "#0369A1";
  const icons = ["🐠", "🐟", "🦀", "🐚", "🪼", "🐙", "🐬", "🐳", "⭐", "🌊"];

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: deep, opacity: 0.9 },
      ]}
    >
      <View
        style={{
          position: "absolute",
          top: -120,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: mid,
          opacity: 0.35,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: -40,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: palette?.accent || "#0ea5e9",
          opacity: 0.28,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "flex-end",
          opacity: 0.55,
        }}
      >
        {icons.map((icon, idx) => (
          <Text key={idx} style={{ fontSize: idx % 2 === 0 ? 42 : 34 }}>
            {icon}
          </Text>
        ))}
      </View>
    </View>
  );
}

function GameCard({ icon, title, desc, onPress }) {
  return (
    <TouchableOpacity style={styles.gameCard} onPress={onPress}>
      <Text style={styles.gameCardIcon}>{icon}</Text>
      <Text style={styles.gameCardTitle}>{title}</Text>
      <Text style={styles.gameCardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  screenRootDark: {
    backgroundColor: '#020617',
  },
  sideBar: {
    width: 70,
    paddingVertical: 40,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  sideThemeCard: {
    width: 50,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 18,
    alignItems: 'center',
  },
  sideThemeIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  sideThemeName: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textDark,
    textAlign: 'center',
  },
  sideThemeScore: {
    marginTop: 2,
    fontSize: 10,
    color: THEME.textDark,
  },
  sideItem: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sideItemActive: {
    backgroundColor: 'rgba(148,163,184,0.35)',
  },
  sideIcon: {
    fontSize: 24,
  },
  sideItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
    color: THEME.textDark,
  },
  mainContent: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    fontSize: 22,
  },
  factInlineContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  factInlineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  factInlineText: {
    fontSize: 13,
    color: '#fff',
  },
  scoreBanner: {
    marginTop: 8,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },
  scoreText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textDark,
  },
  factBox: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
    marginTop: 16,
  },
  factBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 4,
  },
  factText: {
    fontSize: 13,
    color: THEME.textDark,
  },
  themeSummary: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  themeSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
  },
  themeSummaryName: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textDark,
  },
  themeSummaryText: {
    marginTop: 2,
    fontSize: 12,
    color: THEME.textDark,
  },
  themeTaskItem: {
    marginTop: 2,
    fontSize: 11,
    color: THEME.textDark,
  },
  gamesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tasksList: {
    marginTop: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  taskBullet: {
    fontSize: 13,
    color: '#fff',
    marginRight: 6,
    marginTop: 1,
  },
  taskText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
  },
  badgeCard: {
    width: '47%',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15,23,42,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeCardLocked: {
    opacity: 0.45,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.8)',
    marginRight: 8,
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeTitleContainer: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  badgeSubtitle: {
    fontSize: 11,
    color: '#e5e7eb',
    marginTop: 1,
  },
  badgeLock: {
    fontSize: 18,
    marginLeft: 4,
  },
  badgeTaskRow: {
    marginTop: 4,
  },
  badgeTaskText: {
    fontSize: 11,
    color: '#e5e7eb',
    marginBottom: 2,
  },
  badgeProgressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.5)',
    overflow: 'hidden',
  },
  badgeProgressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  badgeProgressFillActive: {
    backgroundColor: '#22c55e',
  },
  gameCard: {
    width: '47%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  gameCardIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  gameCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textDark,
  },
  gameCardDesc: {
    marginTop: 4,
    fontSize: 11,
    color: THEME.textDark,
  },
  themeCard: {
    width: '47%',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  themeCardLocked: {
    opacity: 0.6,
  },
  themeCardActive: {
    borderWidth: 2,
    shadowColor: THEME.accent,
    shadowOpacity: 0.25,
  },
  themeIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textDark,
  },
  themeProgress: {
    marginTop: 4,
    fontSize: 11,
    color: THEME.textDark,
  },
});
