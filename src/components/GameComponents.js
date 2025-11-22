import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, useWindowDimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import soundManager from '../utils/sounds';

// --- PREMIUM TEMA RENKLERİ ---
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
  plastic: { id: 'plastic', icon: '🥤', label: 'PLASTİK', color: COLORS.plastic, bgColor: '#FEF3C7' },
  paper:   { id: 'paper',   icon: '📄', label: 'KAĞIT',   color: COLORS.paper, bgColor: '#DBEAFE' },
  glass:   { id: 'glass',   icon: '🍾', label: 'CAM',     color: COLORS.glassBin, bgColor: '#D1FAE5' },
  metal:   { id: 'metal',   icon: '⚙️', label: 'METAL',   color: COLORS.metal, bgColor: '#FECACA' },
  organic: { id: 'organic', icon: '🍂', label: 'ORGANİK', color: COLORS.organic, bgColor: '#FED7AA' }
};

// Arka Plan Efektleri (Orman & Hayvanlar)
export const NatureBackground = () => {
  const { width, height } = useWindowDimensions();
  
  const elements = React.useRef([...Array(15)].map(() => ({
    anim: new Animated.Value(0),
    left: Math.random() * width,
    size: Math.random() * 20 + 10,
    speed: Math.random() * 8000 + 6000,
    delay: Math.random() * 5000,
    isAnimal: Math.random() > 0.7
  }))).current;

  useEffect(() => {
    elements.forEach(e => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(e.delay),
          Animated.timing(e.anim, {
            toValue: 1,
            duration: e.speed,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ])
      ).start();
    });
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgDeep, overflow: 'hidden' }]}>
      <View style={{
        position: 'absolute',
        top: -height * 0.2,
        left: -width * 0.2,
        width: width * 1.4,
        height: width * 1.4,
        borderRadius: width,
        backgroundColor: COLORS.bgMid,
        opacity: 0.5,
        transform: [{ scaleX: 1.5 }]
      }} />

      <View style={{
        position: 'absolute',
        top: -100,
        left: width * 0.2,
        width: 60,
        height: height * 1.5,
        backgroundColor: 'rgba(255,255,255,0.08)',
        transform: [{ rotate: '25deg' }]
      }} />
      <View style={{
        position: 'absolute',
        top: -100,
        left: width * 0.5,
        width: 80,
        height: height * 1.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        transform: [{ rotate: '20deg' }]
      }} />

      {elements.map((e, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: e.left,
            bottom: -50,
            transform: [{
              translateY: e.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -height - 100]
              })
            }, {
              rotate: e.anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }]
          }}
        >
          <Text style={{ fontSize: e.size }}>
            {e.isAnimal ? (Math.random() > 0.5 ? '🦋' : '🐦') : '🍃'}
          </Text>
        </Animated.View>
      ))}

      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        opacity: 0.3
      }}>
        <Text style={{ fontSize: 50 }}>🌲</Text>
        <Text style={{ fontSize: 40 }}>🦌</Text>
        <Text style={{ fontSize: 50 }}>🌳</Text>
        <Text style={{ fontSize: 45 }}>🦊</Text>
        <Text style={{ fontSize: 50 }}>🌲</Text>
        <Text style={{ fontSize: 40 }}>🐿️</Text>
        <Text style={{ fontSize: 50 }}>🌳</Text>
      </View>
    </View>
  );
};

// 3D Görünümlü Kova
export const Bin3D = ({ type, style, label, icon, isSelected, onClick }) => {
  const cfg = TRASH_CONFIG[type];
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onClick} style={[styles.binWrapper, style, isSelected && styles.binSelected]}>
      <View style={[styles.binRim, { borderColor: cfg.color }]} />
      <View style={[styles.binBody, { borderColor: cfg.color }]}>
        <View style={[styles.binBodyGradient, { backgroundColor: cfg.color }]} />
        <View style={styles.binSticker}>
          <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
          <Text style={styles.binLabelText}>{cfg.label}</Text>
        </View>
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

  useEffect(() => {
    if (!saved) {
      saveScore();
      soundManager.playGameOver();
      setSaved(true);
    }
  }, []);

  const saveScore = async () => {
    try {
      const currentTotal = await AsyncStorage.getItem('totalScore');
      const newTotal = (parseInt(currentTotal, 10) || 0) + score;
      await AsyncStorage.setItem('totalScore', newTotal.toString());
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
        <Text style={{ color: '#4ade80', fontSize: 14, marginBottom: 10 }}>✓ Toplam puanınıza eklendi!</Text>
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
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
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
  backButton: {
    paddingHorizontal: 12,
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  hudIcon: { fontSize: 20, color: '#fff' },
  hudText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  
  binWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  binSelected: {
    transform: [{ scale: 1.1 }],
    shadowColor: COLORS.accent,
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  binRim: {
    width: '100%',
    height: 15,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 2,
    marginBottom: -8,
  },
  binBody: {
    width: '90%',
    height: 60,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderWidth: 2,
    borderTopWidth: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  binBodyGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  binSticker: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  binLabelText: { fontSize: 10, fontWeight: 'bold', color: '#333' },

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
