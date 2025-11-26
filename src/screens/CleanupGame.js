import React, { useState } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import KeyboardScrollView from '../components/KeyboardScrollView';
import { NatureBackground } from './GameComponents';
import MemoryGame from './MemoryGame';
import MathGame from './MathGame';
import EnglishRecycleGame from './EnglishRecycleGame';
import ClassicRecycleGame from './ClassicRecycleGame';
import SlingshotGame from './SlingshotGame';
import LaneSwapGame from './LaneSwapGame';
import SnakeRecycleGame from './SnakeRecycleGame';
import FlyBirdGame from './FlyBirdGameWebContent';
import LaneRunnerGame from './LaneRunnerGame';

const COLORS = {
  bgDeep: "#1a4d2e",
  bgMid: "#2d5f3f",
  accent: "#ffd700",
};

export default function CleanupGame({ onExit }) {
  const [gameMode, setGameMode] = useState("SELECTION");

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <NatureBackground />
      
      {gameMode === "SELECTION" && <ModeSelectionScreen onSelectMode={setGameMode} onExit={onExit} />}
      {gameMode === "CLASSIC" && <ClassicRecycleGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "SLINGSHOT" && <SlingshotGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "LANE" && <LaneSwapGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "SNAKE" && <SnakeRecycleGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "MEMORY" && <MemoryGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "MATH" && <MathGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "ENGLISH" && <EnglishRecycleGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "FLYBIRD" && <FlyBirdGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "LANERUNNER" && <LaneRunnerGame onBack={() => setGameMode("SELECTION")} />}
    </View>
  );
}

function ModeSelectionScreen({ onSelectMode, onExit }) {
  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuHeader}>
        <TouchableOpacity style={[styles.glassPanel, styles.backButton]} onPress={onExit}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Ana Menü</Text>
        </TouchableOpacity>
      </View>
      
      <KeyboardScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 15 }}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.menuTitle}>DOĞAYI{"\n"}<Text style={{ fontSize: 24, opacity: 0.8 }}>KORU</Text></Text>
        
        <View style={styles.gridContainer}>
          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(76, 175, 80, 0.25)', borderColor: 'rgba(76, 175, 80, 0.5)' }]} onPress={() => onSelectMode("CLASSIC")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(76, 175, 80, 0.3)' }]}><Text style={{ fontSize: 30 }}>🚮</Text></View>
            <Text style={styles.cardTitle}>Klasik Ayrıştırma</Text>
            <Text style={styles.cardDesc}>Atıkları sürükle ve kutulara bırak.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(255, 152, 0, 0.25)', borderColor: 'rgba(255, 152, 0, 0.5)' }]} onPress={() => onSelectMode("SLINGSHOT")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(255, 152, 0, 0.3)' }]}><Text style={{ fontSize: 30 }}>🏀</Text></View>
            <Text style={styles.cardTitle}>Sapan Basketi</Text>
            <Text style={styles.cardDesc}>Çek, nişan al ve potaya basket at!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(33, 150, 243, 0.25)', borderColor: 'rgba(33, 150, 243, 0.5)' }]} onPress={() => onSelectMode("LANE")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(33, 150, 243, 0.3)' }]}><Text style={{ fontSize: 30 }}>🎹</Text></View>
            <Text style={styles.cardTitle}>Şerit Değiştir</Text>
            <Text style={styles.cardDesc}>Kutuların yerini değiştir, atığı yakala.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(139, 195, 74, 0.25)', borderColor: 'rgba(139, 195, 74, 0.5)' }]} onPress={() => onSelectMode("SNAKE")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(139, 195, 74, 0.3)' }]}><Text style={{ fontSize: 30 }}>🌍</Text></View>
            <Text style={styles.cardTitle}>İklim Yılanı</Text>
            <Text style={styles.cardDesc}>Yeşil öğeler topla, gezegeni koru!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(156, 39, 176, 0.25)', borderColor: 'rgba(156, 39, 176, 0.5)' }]} onPress={() => onSelectMode("MEMORY")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(156, 39, 176, 0.3)' }]}><Text style={{ fontSize: 30 }}>🧩</Text></View>
            <Text style={styles.cardTitle}>Hafıza Oyunu</Text>
            <Text style={styles.cardDesc}>Kartları eşleştir, hafızanı güçlendir!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(244, 67, 54, 0.25)', borderColor: 'rgba(244, 67, 54, 0.5)' }]} onPress={() => onSelectMode("MATH")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(244, 67, 54, 0.3)' }]}><Text style={{ fontSize: 30 }}>🧮</Text></View>
            <Text style={styles.cardTitle}>Matematik Oyunu</Text>
            <Text style={styles.cardDesc}>Kovadaki atıkları say, matematiğini güçlendir!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(63, 81, 181, 0.25)', borderColor: 'rgba(63, 81, 181, 0.5)' }]} onPress={() => onSelectMode("ENGLISH")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(63, 81, 181, 0.3)' }]}><Text style={{ fontSize: 30 }}>📚</Text></View>
            <Text style={styles.cardTitle}>İngilizce Kelime Oyunu</Text>
            <Text style={styles.cardDesc}>Geri dönüşüm yaparken İngilizce öğren!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(0, 188, 212, 0.25)', borderColor: 'rgba(0, 188, 212, 0.5)' }]} onPress={() => onSelectMode("FLYBIRD")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(0, 188, 212, 0.3)' }]}><Text style={{ fontSize: 30 }}>🐦</Text></View>
            <Text style={styles.cardTitle}>Uçan Kuş</Text>
            <Text style={styles.cardDesc}>Çöp yığınlarından kaç, temiz uç!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.gridCard, { backgroundColor: 'rgba(255, 193, 7, 0.25)', borderColor: 'rgba(255, 193, 7, 0.5)' }]} onPress={() => onSelectMode("LANERUNNER")}>
            <View style={[styles.cardIconBg, { backgroundColor: 'rgba(255, 193, 7, 0.3)' }]}><Text style={{ fontSize: 30 }}>🏃</Text></View>
            <Text style={styles.cardTitle}>Koşucu Oyunu</Text>
            <Text style={styles.cardDesc}>Şerit değiştir, atıkları topla!</Text>
          </TouchableOpacity>
        </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  menuHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
  },
  menuTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: COLORS.bgMid,
    textShadowRadius: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 10,
  },
  modeCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 20,
  },
  gridCard: {
    width: 170,
    height: 180,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cardIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.accent, textAlign: 'center' },
  cardDesc: { fontSize: 11, color: '#ddd', marginTop: 4, textAlign: 'center' },
});

