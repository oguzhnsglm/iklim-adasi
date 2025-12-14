import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Animated, Easing, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import soundManager from '../utils/sounds';
import { useThemeProgress } from "../ThemeProgressContext";
import { useMascot } from "../context/MascotContext";

export const COLORS = {
  bgDeep: "#1a4d2e",
  bgMid: "#2d5f3f",
  accent: "#ffd700",
  glass: "rgba(255, 255, 255, 0.15)",
  plastic: "#fbbf24",
  paper: "#38bdf8",
  glassBin: "#4ade80",
  metal: "#f87171",
  organic: "#fb923c",
  text: "#ffffff"
};

export const TRASH_TYPES = ["plastic", "paper", "glass", "metal", "organic"];

export const TRASH_CONFIG = {
  plastic: { id: 'plastic', icon: '\u{1F964}', label: 'PLASTIK', color: COLORS.plastic, bgColor: '#FEF3C7' },
  paper:   { id: 'paper',   icon: '\u{1F4C4}', label: 'KAGIT',   color: COLORS.paper, bgColor: '#DBEAFE' },
  glass:   { id: 'glass',   icon: '\u{1F37E}', label: 'CAM',     color: COLORS.glassBin, bgColor: '#D1FAE5' },
  metal:   { id: 'metal',   icon: '\u2699',     label: 'METAL',   color: COLORS.metal, bgColor: '#FECACA' },
  organic: { id: 'organic', icon: '\u{1F342}', label: 'ORGANIK', color: COLORS.organic, bgColor: '#FED7AA' }
};


// Arka Plan Efektleri (Orman & Okyanus & Çöl & Kutup)
export const NatureBackground = ({
  themeId = "rainforest",
  intensity = 1,
  baseColor,
  midColor,
} = {}) => {
  const { width, height } = useWindowDimensions();

  const isPacific = themeId === "pacific";
  const isDesert = themeId === "sahara";
  const isArctic = themeId === "antarctica";
  const themeColors = isPacific
    ? { deep: "#0c4b72", mid: "#0e76a8", beam: "rgba(255,255,255,0.08)" }
    : isDesert
      ? { deep: "#c26d2c", mid: "#eab676", beam: "rgba(255,199,120,0.22)" }
      : isArctic
        ? { deep: "#0b4a74", mid: "#0ea5e9", beam: "rgba(255,255,255,0.18)" }
        : { deep: COLORS.bgDeep, mid: COLORS.bgMid, beam: "rgba(255,255,255,0.08)" };

  const deep = baseColor || themeColors.deep;
  const mid = midColor || themeColors.mid;
  const beamColor = themeColors.beam;

  const floatIcons = isPacific
    ? ['\u{1F420}', '\u{1F41F}', '\u{1F42C}', '\u{1F433}', '\u{1F419}', '\u{1F980}', '\u{1F30A}', '\u{2B50}']
    : isDesert
      ? ['\u{1F335}', '\u{1F42A}', '\u2600', '\u{1F98E}', '\u{1F982}', '\u{1F30C}', '\u{1F4A8}']
      : isArctic
        ? ['\u2744', '\u2603', '\u{1F427}', '\u{1F9CA}', '\u{1F98A}', '\u{26C4}', '\u{1F3D4}', '\u{1F30C}']
        : ['\u{1F98B}', '\u{1F426}', '\u{1F343}'];

  const groundIcons = isPacific
    ? ['\u{1F41F}', '\u{1F41A}', '\u{1F980}', '\u{1F433}', '\u{1F42C}', '\u{1F30A}', '\u{2B50}']
    : isDesert
      ? ['\u{1F335}', '\u{1F42A}', '\u{1F32C}', '\u{1F30C}', '\u{1F336}', '\u{1F335}']
      : isArctic
        ? ['\u2744', '\u{1F427}', '\u{1F9CA}', '\u{1F3D4}', '\u{26C4}', '\u2744']
        : ['\u{1F332}', '\u{1F98C}', '\u{1F333}', '\u{1F98A}', '\u{1F332}', '\u{1F43F}', '\u{1F333}'];

  const elementsRef = useRef([]);
  const loopsRef = useRef([]);
  const lastThemeRef = useRef(themeId);

  const buildElements = () =>
    [...Array(15)].map(() => ({
      anim: new Animated.Value(0),
      left: Math.random() * width,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 8000 + 6000,
      delay: Math.random() * 5000,
      icon: floatIcons[Math.floor(Math.random() * floatIcons.length)],
    }));

  if (elementsRef.current.length === 0) {
    elementsRef.current = buildElements();
    lastThemeRef.current = themeId;
  }

  useEffect(() => {
    const themeChanged = lastThemeRef.current !== themeId;
    lastThemeRef.current = themeId;

    loopsRef.current.forEach((anim) => anim?.stop && anim.stop());

    if (themeChanged) {
      elementsRef.current = buildElements();
    }

    const animations = elementsRef.current.map((e) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(e.delay),
          Animated.timing(e.anim, {
            toValue: 1,
            duration: e.speed,
            easing: Easing.linear,
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

    loopsRef.current = animations;
    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [themeId, width, height]);

  const normalizedIntensity = Math.max(0, Math.min(1, intensity));
  const visibleCount =
    normalizedIntensity <= 0
      ? 0
      : Math.max(1, Math.round(normalizedIntensity * elementsRef.current.length));
  const ambientOpacity = 0.2 + normalizedIntensity * 0.6;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: deep, overflow: "hidden" }]}
    >
      <View
        style={{
          position: "absolute",
          top: -height * 0.2,
          left: -width * 0.2,
          width: width * 1.4,
          height: width * 1.4,
          borderRadius: width,
          backgroundColor: mid,
          opacity: 0.2 + normalizedIntensity * 0.5,
          transform: [{ scaleX: 1.5 }],
        }}
      />

      <View
        style={{
          position: "absolute",
          top: -100,
          left: width * 0.2,
          width: 60,
          height: height * 1.5,
          backgroundColor: beamColor,
          transform: [{ rotate: "25deg" }],
          opacity: 0.1 + normalizedIntensity * 0.4,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: -100,
          left: width * 0.5,
          width: 80,
          height: height * 1.5,
          backgroundColor: beamColor,
          transform: [{ rotate: "20deg" }],
          opacity: 0.08 + normalizedIntensity * 0.35,
        }}
      />

      {elementsRef.current &&
        elementsRef.current.slice(0, visibleCount).map((e, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: e.left,
              bottom: -50,
              transform: [
                {
                  translateY: e.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -height - 100],
                  }),
                },
                {
                  rotate: e.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
              opacity: ambientOpacity,
            }}
          >
            <Text style={{ fontSize: e.size }}>{e.icon}</Text>
          </Animated.View>
        ))}

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "flex-end",
          opacity: 0.1 + normalizedIntensity * 0.6,
        }}
      >
        {groundIcons.map((icon, idx) => (
          <Text key={idx} style={{ fontSize: idx % 2 === 0 ? 50 : 40 }}>
            {icon}
          </Text>
        ))}
      </View>
    </View>
  );
};
// 3D Görünümlü Kova
export const Bin3D = ({ type, style, label, icon, isSelected, onClick }) => {
  const cfg = TRASH_CONFIG[type];
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onClick}
      style={[styles.binWrapper, style, isSelected && styles.binSelected]}
    >
      <View style={[styles.binBody, { borderColor: cfg.color, backgroundColor: cfg.bgColor }]}>
        <View style={styles.binIconCircle}>
          <Text style={styles.binIconText}>{cfg.icon}</Text>
        </View>
        <Text style={styles.binLabelText}>{cfg.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Tutorial Modal
export const TutorialModal = ({ title, instructions, onStart }) => (
  <View style={styles.overlay}>
    <View style={[styles.modalCard, { maxWidth: 500 }]}>
      <Text style={{ color: '#ffd700', fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        🎮 {title.toUpperCase()}
      </Text>
      
      <View style={{ alignItems: 'flex-start', width: '100%', gap: 12 }}>
        {instructions.map((instruction, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 24, minWidth: 35, textAlign: 'center' }}>
              {instruction.split(' ')[0]}
            </Text>
            <Text style={{ color: '#fff', fontSize: 15, flex: 1 }}>
              {instruction.split(' ').slice(1).join(' ')}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.btnAction, { marginTop: 30, width: '100%', backgroundColor: '#4ade80' }]} 
        onPress={() => {
          soundManager.playStart();
          onStart();
        }}
      >
        <Text style={[styles.btnText, { fontSize: 18 }]}>🚀 Oyuna Başla</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// HUD (Skor Tablosu)
export const GameHUD = ({ score, time, lives, onBack }) => (
  <View style={styles.hudBar}>
    <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
      <TouchableOpacity style={[styles.glassPanel, styles.backButton]} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>
    </View>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={styles.glassPanel}>
        <Text style={styles.hudIcon}>⭐</Text>
        <Text style={styles.hudText}>{score}</Text>
      </View>
      <View style={styles.glassPanel}>
        <Text style={styles.hudIcon}>⏱️</Text>
        <Text style={styles.hudText}>{Math.ceil(time)}</Text>
      </View>
      <View style={styles.glassPanel}>
        <Text style={styles.hudIcon}>❤️</Text>
        <Text style={styles.hudText}>{lives}</Text>
      </View>
    </View>
  </View>
);

// Game Over Modal
export const GameOverModal = ({ score, onRestart, onMenu }) => {
  const [saved, setSaved] = useState(false);
  const [badgeType, setBadgeType] = useState(null);
  const { registerScore, registerLevelResult } = useThemeProgress();
  const { celebrate } = useMascot();

  useEffect(() => {
    if (!saved) {
      saveScore();
      soundManager.playGameOver();
      setSaved(true);
    }
  }, [saved]);

  const saveScore = async () => {
    try {
      // Puanı global toplam puana ekle ve aktif temanın çevre temizliğine yansıt
      const currentTotal = await AsyncStorage.getItem('totalScore');
      const newTotal = (parseInt(currentTotal, 10) || 0) + score;
      await AsyncStorage.setItem('totalScore', newTotal.toString());
      registerScore(score);
      // Seviye rozetini belirle ve kaydet
      const badge = score >= 700 ? 'gold' : score >= 300 ? 'silver' : 'bronze';
      setBadgeType(badge);
      registerLevelResult(badge);
      // Oyun/Seviye tamamlandığında maskot kutlaması
      celebrate('questCompleted');
      console.log('Score saved:', score, 'Total:', newTotal);
    } catch (error) {
      console.log('Error saving score:', error);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        <Text style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>Oyun Bitti</Text>
        <Text style={{ color: '#ccc', fontSize: 16 }}>Bu Oyun Skoru</Text>
        <Text style={{ color: COLORS.accent, fontSize: 48, fontWeight: '900', marginVertical: 20 }}>{score}</Text>
        <Text style={{ color: '#4ade80', fontSize: 14, marginBottom: 6 }}>✓ Toplam puanınıza eklendi!</Text>
        {badgeType && (
          <Text style={{ color: '#fde68a', fontSize: 16, marginBottom: 12 }}>
            🎖️ Kazandığın rozet: {badgeType === 'gold' ? 'Altın' : badgeType === 'silver' ? 'Gümüş' : 'Bronz'}
          </Text>
        )}
        <TouchableOpacity style={styles.btnAction} onPress={onRestart}>
          <Text style={styles.btnText}>Tekrar Oyna</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnAction, styles.btnSecondary]} onPress={onMenu}>
          <Text style={styles.btnText}>Ana Menü</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 50 : 40,
    zIndex: 100,
  },
  glassPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 30, 60, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  hudIcon: { fontSize: 20, color: '#fff' },
  hudText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backButton: {
    backgroundColor: 'rgba(255, 100, 100, 0.3)',
    borderColor: 'rgba(255, 100, 100, 0.5)',
  },
  backIcon: { 
    fontSize: 24, 
    color: '#fff',
    fontWeight: 'bold',
  },
  backText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#fff',
  },
  binWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  binSelected: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  binBody: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  binIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  binIconText: {
    fontSize: 22,
  },
  binLabelText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: '#111827',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#1e293b',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  btnAction: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
