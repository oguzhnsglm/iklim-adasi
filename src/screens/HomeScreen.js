import React, { useMemo, useState, useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import KeyboardScrollView from '../components/KeyboardScrollView';
import { THEME } from "../theme";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForestScreen from './ForestScreen';
import AchievementsScreen from './AchievementsScreen';
import ProfileScreen from './ProfileScreen';
import soundManager from '../utils/sounds';

// Gelişmiş ana menü: Okyanus temalı arka plan, kartlar, birincil CTA
export default function HomeScreen({ onPlay }) {
  const [soundOn, setSoundOn] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [showForest, setShowForest] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

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
      // Her zaman 100k puan yükle
      await AsyncStorage.setItem('totalScore', '100000');
      setTotalScore(100000);
    } catch (error) {
      console.log('Total score load error:', error);
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

  return (
    <View style={styles.root}>
      <NatureSplash />

      <KeyboardScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brandTop}>DOĞAYI</Text>
          <Text style={styles.brandBottom}>KORU</Text>
          <View style={styles.totalScoreBox}>
            <Text style={styles.totalScoreLabel}>Toplam Puanım</Text>
            <Text style={styles.totalScoreValue}>⭐ {totalScore}</Text>
          </View>
        </View>

        {/* Daily Environmental Fact */}
        <View style={styles.dailyFactContainer}>
          <View style={styles.dailyFactHeader}>
            <Text style={styles.dailyFactBadge}>💡 GÜNÜN BİLGİSİ</Text>
          </View>
          <Text style={styles.dailyFactText}>{factOfDay}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.subtitle}>"{tipOfDay}"</Text>

          <TouchableOpacity style={styles.primaryCta} onPress={onPlay}>
            <Text style={styles.primaryCtaIcon}>▶</Text>
            <Text style={styles.primaryCtaText}>Hemen Başla</Text>
          </TouchableOpacity>

          <View style={styles.cards}>
            <MenuCard icon="🎮" title="Oyun Modları" desc="Eğlenceye katıl, doğayı kurtar!" onPress={onPlay} />
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
      </KeyboardScrollView>
    </View>
  );
}

function NatureSplash() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.treeBig} />
      <View style={styles.treeMid} />
      <View style={styles.treeSmall} />
    </View>
  );
}

function MenuCard({ icon, title, desc, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Text style={styles.cardChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 8,
    alignItems: "center",
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
    marginTop: 4,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 14,
    borderRadius: 16,
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
