import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THEME } from "../theme";

// Gelişmiş ana menü: Okyanus temalı arka plan, kartlar, birincil CTA
export default function HomeScreen({ onPlay }) {
  const [soundOn, setSoundOn] = useState(true);

  const tips = useMemo(
    () => [
      "Atıkları türüne göre ayrıştır, puan kazan!",
      "Süre bitmeden daha çok atık temizle.",
      "Farklı modları deneyerek becerini geliştir!",
    ],
    []
  );

  const tipOfDay = useMemo(() => tips[Math.floor(Math.random() * tips.length)], [tips]);

  return (
    <View style={styles.root}>
      <OceanSplash />

      <View style={styles.header}>
        <Text style={styles.brandTop}>OKYANUS</Text>
        <Text style={styles.brandBottom}>TEMİZLİĞİ</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.subtitle}>"{tipOfDay}"</Text>

        <TouchableOpacity style={styles.primaryCta} onPress={onPlay}>
          <Text style={styles.primaryCtaIcon}>▶</Text>
          <Text style={styles.primaryCtaText}>Hemen Başla</Text>
        </TouchableOpacity>

        <View style={styles.cards}>
          <MenuCard icon="🎮" title="Oyun Modları" desc="Klasik, Sapan, Şerit" onPress={onPlay} />
          <MenuCard
            icon={soundOn ? "🔊" : "🔈"}
            title="Sesler"
            desc={soundOn ? "Açık" : "Kapalı"}
            onPress={() => setSoundOn((v) => !v)}
          />
          <MenuCard
            icon="🏆"
            title="Başarılar"
            desc="Çok yakında"
            onPress={() => Alert.alert("Başarılar", "Yakında eklenecek!")}
          />
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => Alert.alert("Hakkında", "Su Koruyucuları - İklim Adası")}
          >
            <Text style={styles.secondaryBtnText}>ℹ Hakkında</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onPlay}>
            <Text style={styles.secondaryBtnText}>⏱ Hızlı Oyun</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function OceanSplash() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.waveBig} />
      <View style={styles.waveMid} />
      <View style={styles.waveSmall} />
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
  panel: {
    flex: 1,
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
    justifyContent: "space-between",
    marginTop: 18,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: THEME.foam,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: THEME.deepSea,
    fontWeight: "700",
  },
  waveBig: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: THEME.wave,
    opacity: 0.25,
  },
  waveMid: {
    position: "absolute",
    top: -40,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: THEME.tide,
    opacity: 0.25,
  },
  waveSmall: {
    position: "absolute",
    bottom: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.sand,
    opacity: 0.25,
  },
});
