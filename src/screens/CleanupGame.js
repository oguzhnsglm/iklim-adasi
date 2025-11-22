import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, PanResponder, useWindowDimensions, Animated, Easing } from "react-native";
import KeyboardScrollView from '../components/KeyboardScrollView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import soundManager from '../utils/sounds';
import MemoryGame from './MemoryGame';
import MathGame from './MathGame';
import EnglishRecycleGame from './EnglishRecycleGame';

// --- PREMIUM TEMA RENKLERİ ---
const COLORS = {
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

const TRASH_TYPES = ["plastic", "paper", "glass", "metal", "organic"];
const TRASH_CONFIG = {
  plastic: { id: 'plastic', icon: '🥤', label: 'PLASTİK', color: COLORS.plastic, bgColor: '#FEF3C7' },
  paper:   { id: 'paper',   icon: '📄', label: 'KAĞIT',   color: COLORS.paper, bgColor: '#DBEAFE' },
  glass:   { id: 'glass',   icon: '🍾', label: 'CAM',     color: COLORS.glassBin, bgColor: '#D1FAE5' },
  metal:   { id: 'metal',   icon: '⚙️', label: 'METAL',   color: COLORS.metal, bgColor: '#FECACA' },
  organic: { id: 'organic', icon: '🍂', label: 'ORGANİK', color: COLORS.organic, bgColor: '#FED7AA' }
};

// --- YARDIMCI BİLEŞENLER ---

// Arka Plan Efektleri (Orman & Hayvanlar)
const NatureBackground = () => {
  const { width, height } = useWindowDimensions();
  
  // Uçan yapraklar ve hayvanlar
  const elements = useRef([...Array(15)].map(() => ({
    anim: new Animated.Value(0),
    left: Math.random() * width,
    size: Math.random() * 20 + 10,
    speed: Math.random() * 8000 + 6000,
    delay: Math.random() * 5000,
    isAnimal: Math.random() > 0.7 // %30 hayvan, %70 yaprak
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
      {/* Orman gradyan efekti */}
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

      {/* Güneş ışınları */}
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

      {/* Uçan yapraklar ve hayvanlar */}
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

      {/* Alt kısımda ağaçlar */}
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
const Bin3D = ({ type, style, label, icon, isSelected, onClick }) => {
  const cfg = TRASH_CONFIG[type];
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onClick} style={[styles.binWrapper, style, isSelected && styles.binSelected]}>
      {/* Kova Ağzı (Rim) */}
      <View style={[styles.binRim, { borderColor: cfg.color }]} />
      {/* Kova Gövdesi */}
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

// --- TUTORIAL MODAL (ORTAK) ---
const TutorialModal = ({ title, instructions, onStart }) => (
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
const GameHUD = ({ score, time, lives, onBack }) => (
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

// --- ANA BİLEŞEN ---
export default function CleanupGame({ onExit }) {
  const [gameMode, setGameMode] = useState("SELECTION"); // SELECTION | CLASSIC | SLINGSHOT | LANE | SNAKE | MEMORY | MATH | ENGLISH

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <NatureBackground />
      
      {gameMode === "SELECTION" && <ModeSelectionScreen onSelectMode={setGameMode} onExit={onExit} />}
      {gameMode === "CLASSIC" && <CleanupGameClassic onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "SLINGSHOT" && <CleanupGameSlingshot onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "LANE" && <CleanupGameLaneSwap onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "SNAKE" && <SnakeGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "MEMORY" && <MemoryGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "MATH" && <MathGame onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "ENGLISH" && <EnglishRecycleGame onBack={() => setGameMode("SELECTION")} />}
    </View>
  );
}

// --- MENÜ EKRANI ---
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
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.menuTitle}>DOĞAYI{"\n"}<Text style={{ fontSize: 24, opacity: 0.8 }}>KORU</Text></Text>
        
        <TouchableOpacity style={styles.modeCard} onPress={() => onSelectMode("CLASSIC")}>
          <View style={styles.cardIconBg}><Text style={{ fontSize: 30 }}>🚮</Text></View>
          <View>
            <Text style={styles.cardTitle}>Klasik Ayrıştırma</Text>
            <Text style={styles.cardDesc}>Atıkları sürükle ve kutulara bırak.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={() => onSelectMode("SLINGSHOT")}>
          <View style={styles.cardIconBg}><Text style={{ fontSize: 30 }}>🏀</Text></View>
          <View>
            <Text style={styles.cardTitle}>Sapan Basketi</Text>
            <Text style={styles.cardDesc}>Çek, nişan al ve potaya basket at!</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={() => onSelectMode("LANE")}>
          <View style={styles.cardIconBg}><Text style={{ fontSize: 30 }}>🎹</Text></View>
          <View>
            <Text style={styles.cardTitle}>Şerit Değiştir</Text>
            <Text style={styles.cardDesc}>Kutuların yerini değiştir, atığı yakala.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={() => onSelectMode("SNAKE")}>
          <View style={styles.cardIconBg}><Text style={{ fontSize: 30 }}>🐍</Text></View>
          <View>
            <Text style={styles.cardTitle}>Yılan Oyunu</Text>
            <Text style={styles.cardDesc}>Atıkları topla, zararlılardan kaç!</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={() => onSelectMode("MEMORY")}>
          <View style={styles.cardIconBg}><Text style={{ fontSize: 30 }}>🧩</Text></View>
          <View>
            <Text style={styles.cardTitle}>Hafıza Oyunu</Text>
            <Text style={styles.cardDesc}>Kartları eşleştir, hafızanı güçlendir!</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={() => onSelectMode("MATH")}>
          <View style={styles.cardIconBg}><Text style={{ fontSize: 30 }}>🧮</Text></View>
          <View>
            <Text style={styles.cardTitle}>Matematik Oyunu</Text>
            <Text style={styles.cardDesc}>Kovadaki atıkları say, matematiğini güçlendir!</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={() => onSelectMode("ENGLISH")}>
          <View style={styles.cardIconBg}><Text style={{ fontSize: 30 }}>📚</Text></View>
          <View>
            <Text style={styles.cardTitle}>İngilizce Kelime Oyunu</Text>
            <Text style={styles.cardDesc}>Geri dönüşüm yaparken İngilizce öğren!</Text>
          </View>
        </TouchableOpacity>
      </KeyboardScrollView>
    </View>
  );
}

// --- MOD 1: KLASİK (SÜRÜKLE BIRAK) ---
function CleanupGameClassic({ onBack }) {
  const { width, height } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(120);
  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState("TUTORIAL");

  const lastTimeRef = useRef(null);
  const spawnTimerRef = useRef(0);

  const spawnItem = () => {
    const type = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
    const id = Math.random().toString();
    setItems(prev => [...prev, {
      id, type, 
      x: Math.random() * (width - 60), 
      y: -60, 
      speed: 100 + Math.random() * 50
    }]);
  };

  useEffect(() => {
    if (phase === "TUTORIAL") return;
    
    const loop = (timeNow) => {
      if (!lastTimeRef.current) lastTimeRef.current = timeNow;
      const dt = Math.min((timeNow - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timeNow;

      if (phase === "RUNNING") {
        setTime(t => {
          const next = t - dt;
          if (next <= 0) setPhase("ENDED");
          return next;
        });

        spawnTimerRef.current -= dt;
        if (spawnTimerRef.current <= 0) {
          spawnItem();
          spawnTimerRef.current = 2;
        }

        setItems(prev => {
          const nextItems = [];
          for (let item of prev) {
            if (!item.dragging) {
              item.y += item.speed * dt;
            }
            if (item.y < height) {
              nextItems.push(item);
            } else {
              // Can kaybı
              setLives(l => Math.max(0, l - 1));
              soundManager.playDamage(); // Ses efekti
            }
          }
          return nextItems;
        });
        
        if (lives <= 0) setPhase("ENDED");
      }
      requestAnimationFrame(loop);
    };
    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, score, lives]);

  return (
    <View style={{ flex: 1, backgroundColor: '#2d5f3f' }}> {/* Orman yeşili */}
      <NatureBackground />
      {phase === "TUTORIAL" && (
        <TutorialModal 
          title="Klasik Ayrıştırma"
          instructions={[
            "🎯 Atıkları sürükleyerek doğru kutuya bırakın",
            "⏱️ 2 dakika içinde mümkün olduğunca çok puan kazanın",
            "❤️ Yanlış kutuya atarsanız can kaybedersiniz",
            "🚮 Atıklar yere düşerse de can gider",
            "⭐ Her doğru atık +10 puan!"
          ]}
          onStart={() => setPhase("RUNNING")}
        />
      )}
      <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
      
      {/* Oyun Alanı */}
      <View style={{ flex: 1, position: 'relative' }} pointerEvents="box-none">
        {items.map((item, index) => (
          <DraggableItem 
            key={item.id} 
            item={item}
            baseZIndex={index}
            onDrop={(mouseX, mouseY, type, id) => {
              // Kova kontrolü - 2 cm yakınlık (yaklaşık 75px)
              const binWidth = width / 5;
              const binStartY = height - 150;
              const binEndY = height;
              const proximityRange = 75; // 2 cm yaklaşık
              
              // Kova merkezlerini hesapla
              for (let binIndex = 0; binIndex < 5; binIndex++) {
                const binCenterX = (binIndex * binWidth) + (binWidth / 2);
                const binCenterY = height - 100;
                
                // Mesafe kontrolü
                const distance = Math.hypot(mouseX - binCenterX, mouseY - binCenterY);
                
                if (distance <= proximityRange) {
                  const targetType = TRASH_TYPES[binIndex];
                  if (targetType === type) {
                    setScore(s => s + 10);
                    soundManager.playScore(); // Ses efekti
                    // Animasyon yok, direkt sil
                    setItems(prev => prev.filter(i => i.id !== id));
                    return 'success';
                  } else {
                    setLives(l => l - 1);
                    soundManager.playDamage(); // Ses efekti
                    setItems(prev => prev.filter(i => i.id !== id));
                    return 'fail';
                  }
                }
              }
              return 'miss';
            }}
          />
        ))}
      </View>

      {/* Kovalar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 20, paddingHorizontal: 10 }}>
        {TRASH_TYPES.map(type => (
          <Bin3D key={type} type={type} style={{ width: width / 6 }} />
        ))}
      </View>

      {phase === "ENDED" && <GameOverModal score={score} onRestart={() => {
        setScore(0);
        setLives(3);
        setTime(120);
        setItems([]);
        setPhase("RUNNING");
      }} onMenu={onBack} />}
    </View>
  );
}

// Sürüklenebilir Öğe Bileşeni
const DraggableItem = ({ item, baseZIndex, onDrop }) => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: item.x, y: item.y });
  const originalPos = useRef({ x: item.x, y: item.y });
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const ITEM_SIZE = 70; // wasteBubble boyutu

  // item.y değiştiğinde pozisyonu güncelle (sürüklenmiyorsa)
  useEffect(() => {
    if (!dragging) {
      setPosition({ x: item.x, y: item.y });
      originalPos.current = { x: item.x, y: item.y };
    }
  }, [item.x, item.y, dragging]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    // Mouse'u itemin ortasına getir
    setPosition({ 
      x: e.nativeEvent.pageX - ITEM_SIZE / 2, 
      y: e.nativeEvent.pageY - ITEM_SIZE / 2 
    });
    Animated.spring(scale, {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    // Item mouse'un tam altında olsun
    setPosition({ 
      x: e.nativeEvent.pageX - ITEM_SIZE / 2, 
      y: e.nativeEvent.pageY - ITEM_SIZE / 2 
    });
  };

  const handleMouseUp = (e) => {
    if (!dragging) return;
    
    // Item'in merkez noktası
    const dropX = e.nativeEvent.pageX;
    const dropY = e.nativeEvent.pageY;
    
    setDragging(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Kova kontrolü
    const result = onDrop(dropX, dropY, item.type, item.id);
    
    if (result === 'success') {
      // Başarılı - Kovaya girme animasyonu
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else if (result === 'fail') {
      // Yanlış kova - Geri dön
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
      setPosition(originalPos.current);
    } else {
      // Kovaya atılmadı - Geri dön
      setPosition(originalPos.current);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web' && dragging) {
      const handleGlobalMouseMove = (e) => {
        // Item mouse'un tam altında olsun
        setPosition({ 
          x: e.pageX - ITEM_SIZE / 2, 
          y: e.pageY - ITEM_SIZE / 2 
        });
      };
      const handleGlobalMouseUp = (e) => {
        // Item'in merkez noktası
        const dropX = e.pageX;
        const dropY = e.pageY;
        
        setDragging(false);
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        const result = onDrop(dropX, dropY, item.type, item.id);
        
        if (result === 'success') {
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            })
          ]).start();
        } else if (result === 'fail') {
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            })
          ]).start();
          setPosition(originalPos.current);
        } else {
          setPosition(originalPos.current);
        }
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [dragging]);

  const cfg = TRASH_CONFIG[item.type];

  return (
    <Animated.View
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: dragging ? 1000 : baseZIndex,
        cursor: Platform.OS === 'web' ? (dragging ? 'grabbing' : 'grab') : 'auto',
        transform: [{ scale }],
        opacity,
      }}
    >
      <View style={{ 
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
      }}>
        <Text style={{ fontSize: 50, filter: dragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none' }}>{cfg.icon}</Text>
      </View>
    </Animated.View>
  );
};


// --- MOD 2: SAPAN (BASKETBOL) ---
function CleanupGameSlingshot({ onBack }) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  
  // Oyun boyutları
  const gameW = isPortrait ? height : width;
  const gameH = isPortrait ? width : height;

  // Çöl arka plan - kum tepeleri
  const DesertBackground = () => {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Kum tepeleri (dalgalı desenler) */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: gameH * 0.4,
        }}>
          {/* Arka tepe */}
          <View style={{
            position: 'absolute',
            bottom: gameH * 0.1,
            left: -50,
            width: gameW * 0.6,
            height: gameH * 0.25,
            backgroundColor: 'rgba(139, 90, 43, 0.3)',
            borderTopLeftRadius: gameW * 0.3,
            borderTopRightRadius: gameW * 0.3,
          }} />
          
          {/* Orta tepe */}
          <View style={{
            position: 'absolute',
            bottom: gameH * 0.05,
            right: gameW * 0.1,
            width: gameW * 0.5,
            height: gameH * 0.2,
            backgroundColor: 'rgba(139, 90, 43, 0.4)',
            borderTopLeftRadius: gameW * 0.25,
            borderTopRightRadius: gameW * 0.25,
          }} />
          
          {/* Ön tepe */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: gameW * 0.2,
            width: gameW * 0.7,
            height: gameH * 0.15,
            backgroundColor: 'rgba(139, 90, 43, 0.5)',
            borderTopLeftRadius: gameW * 0.35,
            borderTopRightRadius: gameW * 0.35,
          }} />
        </View>
      </View>
    );
  };

  // Fizik Ayarları (Kullanıcının istediği koddan uyarlandı)
  const SLING_CONFIG = {
    maxDrag: 150,
    powerScale: 12, // Hız çarpanı
    gravity: 1200,  // Yerçekimi
    anchorX: 120,   // Sapan X
    anchorY: gameH - 200 // Sapan Y
  };

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(120);
  const [phase, setPhase] = useState("TUTORIAL");
  
  const [projectile, setProjectile] = useState(null);
  const [currentType, setCurrentType] = useState(TRASH_TYPES[0]);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  // State Ref
  const lastTimeRef = useRef(null);
  const stateRef = useRef({ phase, projectile, currentType, isPortrait, lives });
  useEffect(() => {
    stateRef.current = { phase, projectile, currentType, isPortrait, lives };
  }, [phase, projectile, currentType, isPortrait, lives]);

  // Kovalar (Sağ tarafta, yan yana tek sıra)
  const startBinX = gameW * 0.45;
  const binSpacing = 75;
  const binY = gameH * 0.75; // Daha aşağıda ve tek sıra
  const BINS = [
    { type: "plastic", x: startBinX, y: binY },
    { type: "paper", x: startBinX + binSpacing, y: binY },
    { type: "glass", x: startBinX + binSpacing * 2, y: binY },
    { type: "metal", x: startBinX + binSpacing * 3, y: binY },
    { type: "organic", x: startBinX + binSpacing * 4, y: binY },
  ];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const { phase, projectile } = stateRef.current;
        return phase === "RUNNING" && !projectile;
      },
      onPanResponderGrant: (evt) => {
        setDragStart({ x: SLING_CONFIG.anchorX, y: SLING_CONFIG.anchorY });
        setDragCurrent({ x: SLING_CONFIG.anchorX, y: SLING_CONFIG.anchorY });
      },
      onPanResponderMove: (evt, gestureState) => {
        const { isPortrait } = stateRef.current;
        let { dx, dy } = gestureState;
        if (isPortrait) { const temp = dx; dx = dy; dy = -temp; }
        
        // Mesafe sınırlama
        const dist = Math.hypot(dx, dy);
        if (dist > SLING_CONFIG.maxDrag) {
          const ratio = SLING_CONFIG.maxDrag / dist;
          dx *= ratio; dy *= ratio;
        }
        setDragCurrent({ x: SLING_CONFIG.anchorX + dx, y: SLING_CONFIG.anchorY + dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { currentType, isPortrait } = stateRef.current;
        let { dx, dy } = gestureState;
        if (isPortrait) { const temp = dx; dx = dy; dy = -temp; }
        
        const dist = Math.hypot(dx, dy);
        // Eğer çok az çekildiyse iptal et
        if (dist < 20) {
          setDragStart(null); setDragCurrent(null);
          return;
        }

        // Sınırla
        if (dist > SLING_CONFIG.maxDrag) {
          const r = SLING_CONFIG.maxDrag/dist; dx*=r; dy*=r;
        }

        // Fırlatma (Ters vektör * powerScale)
        const vx = -dx * SLING_CONFIG.powerScale;
        const vy = -dy * SLING_CONFIG.powerScale;

        setProjectile({
          x: SLING_CONFIG.anchorX, y: SLING_CONFIG.anchorY,
          vx, vy,
          type: currentType, active: true
        });
        setCurrentType(TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)]);
        setDragStart(null); setDragCurrent(null);
      }
    })
  ).current;

  // Fizik Döngüsü
  useEffect(() => {
    if (phase === "TUTORIAL") return;
    if (phase !== "RUNNING") return;

    let raf;
    let lastT = 0;
    
    const loop = (t) => {
      if (!lastT) { lastT = t; }
      const dt = Math.min((t - lastT)/1000, 0.05);
      lastT = t;

      // StateRef'ten güncel veriyi al (Closure sorununu çözer)
      const { projectile: p, lives: l, phase: currentPhase } = stateRef.current;

      if (currentPhase !== "RUNNING") {
        cancelAnimationFrame(raf);
        return;
      }

      if (p && p.active) {
        let { x, y, vx, vy } = p;
        
        // Fizik
        vy += SLING_CONFIG.gravity * dt;
        x += vx * dt;
        y += vy * dt;

        // Çarpışma
        let hit = false;
        let newScore = 0;
        let lifeLost = false;

        for (let bin of BINS) {
          if (Math.hypot(x - bin.x, y - bin.y) < 45) {
            if (vy > 0) { // Sadece düşerken
              hit = true;
              if (bin.type === p.type) newScore = 15;
              else lifeLost = true;
              break;
            }
          }
        }

        if (hit) {
          if (newScore > 0) {
            setScore(s => s + newScore);
            soundManager.playScore(); // Ses efekti
          }
          if (lifeLost) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setPhase("ENDED");
              }
              return newLives;
            });
            soundManager.playDamage(); // Ses efekti
          }
          setProjectile(null); // Yok et
        } else if (x > gameW + 50 || y > gameH + 50 || x < -50) {
           setProjectile(null); // Ekran dışı
        } else {
           // Güncelle
           setProjectile({ ...p, x, y, vx, vy });
        }
      }

      // Zaman
      setTime(prev => {
        const n = prev - dt;
        if (n <= 0) {
            setPhase("ENDED");
            return 0;
        }
        return n;
      });
      
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, gameW, gameH]); // Projectile bağımlılığı kaldırıldı!

  const containerStyle = isPortrait ? {
    width: gameW, height: gameH,
    position: 'absolute',
    top: (height - gameH) / 2, left: (width - gameW) / 2,
    transform: [{ rotate: '90deg' }]
  } : { width: gameW, height: gameH };

  // Gelişmiş Nişan Oku ve Rota
  const renderTrajectory = () => {
    if (!dragCurrent) return null;
    
    const dx = dragCurrent.x - SLING_CONFIG.anchorX;
    const dy = dragCurrent.y - SLING_CONFIG.anchorY;
    
    // Fırlatma vektörü (Ters)
    const aimX = -dx;
    const aimY = -dy;
    
    const dist = Math.hypot(aimX, aimY);
    const powerRatio = Math.min(dist / SLING_CONFIG.maxDrag, 1.0);
    
    // Renk (Yeşil -> Kırmızı)
    const hue = 120 - (powerRatio * 120);
    const color = `hsl(${hue}, 100%, 50%)`;
    
    // 1. Ok Çizimi
    const angle = Math.atan2(aimY, aimX) * 180 / Math.PI;
    const arrowLen = 40 + (powerRatio * 100);

    // 2. Rota Noktaları (Trajectory Dots)
    const dots = [];
    const vx = aimX * SLING_CONFIG.powerScale;
    const vy = aimY * SLING_CONFIG.powerScale;
    
    for(let i=1; i<=8; i++) {
      const t = i * 0.15; // Zaman adımları
      const tx = SLING_CONFIG.anchorX + vx * t;
      const ty = SLING_CONFIG.anchorY + vy * t + 0.5 * SLING_CONFIG.gravity * t * t;
      
      dots.push(
        <View key={`dot-${i}`} style={{
          position: 'absolute', left: tx - 4, top: ty - 4,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.6)'
        }} />
      );
    }

    return (
      <>
        {/* Ok */}
        <View style={{
          position: 'absolute',
          left: SLING_CONFIG.anchorX, top: SLING_CONFIG.anchorY,
          width: arrowLen, height: 0,
          transform: [{ rotate: `${angle}deg` }, { translateX: 0 }] // Merkezden başlasın
        }}>
           <View style={{
             position: 'absolute', left: 0, top: -3,
             width: arrowLen, height: 6,
             backgroundColor: color, borderRadius: 3,
             opacity: 0.8
           }} />
           {/* Ok Ucu */}
           <View style={{
             position: 'absolute', right: -5, top: -8,
             width: 0, height: 0,
             borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 14,
             borderTopColor: 'transparent', borderBottomColor: 'transparent',
             borderLeftColor: color
           }} />
        </View>
        {/* Rota Noktaları */}
        {dots}
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#C19A6B' }}> {/* Çöl rengi */}
      <DesertBackground />
      <View style={containerStyle}>
        {phase === "TUTORIAL" && (
          <TutorialModal 
            title="Sapan Basketi"
            instructions={[
              "🏀 Atıkları sürükle, geri çek ve bırak!",
              "🎯 Doğru renkli kutuya at",
              "⏱️ 2 dakika içinde maksimum puan topla",
              "❤️ 3 hakkın var - dikkatli nişan al",
              "🔥 Fizik tabanlı atış mekaniği",
              "📱 Telefonu yatay tut!"
            ]}
            onStart={() => setPhase("RUNNING")}
          />
        )}
        <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
        
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
          {/* Kovalar */}
          {BINS.map((bin, i) => (
            <View key={i} style={{ position: 'absolute', left: bin.x - 35, top: bin.y - 35 }}>
              <Bin3D type={bin.type} style={{ width: 70, height: 70 }} />
            </View>
          ))}

          {/* Rota ve Ok */}
          {renderTrajectory()}

          {/* Sapan Gövdesi */}
          <View style={{ 
            position: 'absolute', 
            left: SLING_CONFIG.anchorX - 5, top: SLING_CONFIG.anchorY, 
            width: 10, height: 80, backgroundColor: '#5D4037' 
          }} />
          
          {/* Lastikler */}
          {dragCurrent && (
            <View style={{
              position: 'absolute', left: SLING_CONFIG.anchorX, top: SLING_CONFIG.anchorY,
              width: Math.hypot(dragCurrent.x - SLING_CONFIG.anchorX, dragCurrent.y - SLING_CONFIG.anchorY),
              height: 4, backgroundColor: '#3E2723',
              transformOrigin: 'left center',
              transform: [{ rotate: `${Math.atan2(dragCurrent.y - SLING_CONFIG.anchorY, dragCurrent.x - SLING_CONFIG.anchorX)}rad` }]
            }} />
          )}

          {/* Top (Sapanın ucunda veya havada) */}
          {dragCurrent ? (
            <View style={{ position: 'absolute', left: dragCurrent.x - 25, top: dragCurrent.y - 25, zIndex: 10 }}>
              <Text style={{fontSize:50}}>{TRASH_CONFIG[currentType].icon}</Text>
            </View>
          ) : (
            !projectile && (
              <View style={{ position: 'absolute', left: SLING_CONFIG.anchorX - 25, top: SLING_CONFIG.anchorY - 25, zIndex: 10 }}>
                <Text style={{fontSize:50}}>{TRASH_CONFIG[currentType].icon}</Text>
              </View>
            )
          )}

          {/* Uçan Mermi */}
          {projectile && (
            <View style={{ position: 'absolute', left: projectile.x - 25, top: projectile.y - 25, zIndex: 10 }}>
              <Text style={{fontSize:50}}>{TRASH_CONFIG[projectile.type].icon}</Text>
            </View>
          )}
        </View>

        {phase === "ENDED" && (
          <View style={styles.overlay}>
             <GameOverModal score={score} onRestart={() => {
               lastTimeRef.current = null;
               setScore(0);
               setLives(3);
               setTime(120);
               setProjectile(null);
               setCurrentType(TRASH_TYPES[0]);
               setDragStart(null);
               setDragCurrent(null);
               setPhase("RUNNING");
             }} onMenu={onBack} />
          </View>
        )}
      </View>
    </View>
  );
}

// --- MOD 3: ŞERİT (LANE SWAP) ---
function CleanupGameLaneSwap({ onBack }) {
  const { width, height } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(100);
  const [phase, setPhase] = useState("TUTORIAL"); // TUTORIAL, RUNNING, ENDED
  
  // Okyanus arka plan animasyonu - baloncuklar
  const OceanBackground = () => {
    const bubbles = useRef([...Array(10)].map(() => ({
      anim: new Animated.Value(0),
      left: Math.random() * width,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 4000 + 3000,
      delay: Math.random() * 2000,
    }))).current;

    useEffect(() => {
      bubbles.forEach(b => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(b.delay),
            Animated.timing(b.anim, {
              toValue: 1,
              duration: b.speed,
              useNativeDriver: true,
            }),
            Animated.timing(b.anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            })
          ])
        ).start();
      });
    }, []);

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {bubbles.map((b, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: b.left,
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 0.6)',
              transform: [{
                translateY: b.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, -50]
                })
              }]
            }}
          />
        ))}
      </View>
    );
  };
  
  // Sabit kova sırası (değişmez)
  const binOrder = [...TRASH_TYPES]; // [plastic, paper, glass, metal, organic]
  
  const [items, setItems] = useState([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0); // Kontrol edilen item
  
  const spawnTimerRef = useRef(0);
  const lastTimeRef = useRef(null);

  // Her seferinde sadece 1 item spawn et (rastgele tip, rastgele şerit)
  const spawnItem = () => {
    const type = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
    
    // Rastgele şerit seç (doğru kovada olmasın)
    let randomLane;
    do {
      randomLane = Math.floor(Math.random() * 5);
    } while (binOrder[randomLane] === type);
    
    const newItem = {
      id: `${Date.now()}`,
      type,
      lane: randomLane,
      y: -60,
      speed: (height + 60) / 2.5 // 2.5 saniyede kovalara ulaşsın
    };
    
    setItems(prev => [...prev, newItem]);
  };

  // Klavye kontrolü
  useEffect(() => {
    if (phase !== "RUNNING") return;
    
    const handleKeyPress = (e) => {
      if (items.length === 0) return;
      
      const currentItem = items[activeItemIndex];
      if (!currentItem) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setItems(prev => prev.map((item, idx) => 
          idx === activeItemIndex 
            ? { ...item, lane: Math.max(0, item.lane - 1) }
            : item
        ));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setItems(prev => prev.map((item, idx) => 
          idx === activeItemIndex 
            ? { ...item, lane: Math.min(4, item.lane + 1) }
            : item
        ));
      }
    };

    if (Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [phase, items, activeItemIndex]);

  useEffect(() => {
    // Tutorial fazında animasyon döngüsünü başlatma
    if (phase === "TUTORIAL") return;
    
    const loop = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = Math.min((t - lastTimeRef.current)/1000, 0.05);
      lastTimeRef.current = t;

      if (phase === "RUNNING") {
        setTime(prev => {
          const n = prev - dt;
          if (n <= 0) setPhase("ENDED");
          return n;
        });

        spawnTimerRef.current -= dt;
        if (spawnTimerRef.current <= 0) {
          spawnItem();
          spawnTimerRef.current = 2.5; // 2.5 saniyede bir spawn
        }

        setItems(prev => {
          const next = [];
          let itemRemoved = false;
          
          for (let i = 0; i < prev.length; i++) {
            const item = { ...prev[i] };
            item.y += item.speed * dt;
            
            if (item.y > height - 150) {
              // Kovaya ulaştı
              if (binOrder[item.lane] === item.type) {
                // Doğru kova - puan
                setScore(s => s + 10);
                soundManager.playScore(); // Ses efekti
              } else {
                // Yanlış kova - can kaybı
                setLives(l => l - 1);
                soundManager.playDamage(); // Ses efekti
              }
              
              // İlk item silindi, aktif index'i güncelle
              if (i === 0) {
                itemRemoved = true;
              }
            } else {
              next.push(item);
            }
          }
          
          // Eğer ilk item silindiyse, activeItemIndex'i 0'da tut (yeni ilk item)
          if (itemRemoved) {
            setActiveItemIndex(0);
          }
          
          return next;
        });
        
        if (lives <= 0) setPhase("ENDED");
      }
      requestAnimationFrame(loop);
    };
    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, binOrder, score, lives, height]);

  return (
    <View style={{ flex: 1, backgroundColor: '#006994' }}> {/* Okyanus mavisi */}
      <OceanBackground />
      <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
      
      {/* Tutorial Ekranı */}
      {phase === "TUTORIAL" && (
        <TutorialModal 
          title="Şerit Değiştir"
          instructions={[
            "←️ ➡️ Yön Tuşları ile itemi hareket ettir",
            "✅ Doğru kova → +10 Puan",
            "❌ Yanlış kova → -1 Can",
            "⏱️ 100 saniye içinde maksimum puan!",
            "💡 Parlak item aktiftir - sadece onu kontrol edersin"
          ]}
          onStart={() => setPhase("RUNNING")}
        />
      )}
      
      {/* Şeritler */}
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {[0,1,2,3,4].map(i => (
          <View key={i} style={{ flex: 1, borderRightWidth: i<4?1:0, borderColor: 'rgba(255,255,255,0.1)' }} />
        ))}
      </View>

      {/* Düşen itemler */}
      {items.map((item, index) => (
        <View
          key={item.id}
          style={{
            position: 'absolute',
            left: (item.lane * (width/5)) + (width/10) - 35,
            top: item.y,
          }}
        >
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 70,
            height: 70,
            opacity: index === activeItemIndex ? 1 : 0.5,
            transform: [{ scale: index === activeItemIndex ? 1.2 : 1 }],
          }}>
            <Text style={{ fontSize: 50 }}>{TRASH_CONFIG[item.type].icon}</Text>
          </View>
        </View>
      ))}

      {/* Kovalar (Sabit) */}
      <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', height: 100, alignItems: 'flex-end' }}>
        {binOrder.map((type, i) => (
          <View key={i} style={{ flex: 1, padding: 2 }}>
            <Bin3D 
              type={type}
              style={{ width: '100%' }}
            />
          </View>
        ))}
      </View>

      {phase === "ENDED" && <GameOverModal score={score} onRestart={() => {
        setScore(0);
        setLives(3);
        setTime(100);
        setItems([]);
        setActiveItemIndex(0);
        spawnTimerRef.current = 0;
        lastTimeRef.current = null;
        setPhase("TUTORIAL");
      }} onMenu={onBack} />}
    </View>
  );
}

// --- ORTAK MODAL ---
const GameOverModal = ({ score, onRestart, onMenu }) => {
  const [saved, setSaved] = useState(false);

  // Oyun bitince puanı kaydet
  useEffect(() => {
    if (!saved) {
      saveScore();
      soundManager.playGameOver(); // Oyun bitti sesi
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
  // --- UI STYLES ---
  hudBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
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

  // --- MENU STYLES ---
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
  modeCard: {
    width: '100%',
    maxWidth: 400,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  cardIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.accent },
  cardDesc: { fontSize: 14, color: '#ddd', marginTop: 4 },

  // --- GAME ELEMENTS ---
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

  wasteBubble: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  // --- MODAL ---
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

// --- MOD 4: YILAN OYUNU ---
function SnakeGame({ onBack }) {
  const { width, height } = useWindowDimensions();
  const GRID_SIZE = 25; // Daha büyük kareler
  const TILE_COUNT = 16; // 16x16 grid (400px)
  const GAME_SPEED = 250; // Daha yavaş (180'den 250'ye)

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(120);
  const [phase, setPhase] = useState("TUTORIAL");
  const [snake, setSnake] = useState([{ x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }]);
  const [direction, setDirection] = useState({ dx: 1, dy: 0 });
  const [nextDirection, setNextDirection] = useState({ dx: 1, dy: 0 });
  const [goodWaste, setGoodWaste] = useState({ x: 10, y: 8, icon: '🍎' });
  const [hazards, setHazards] = useState([]);
  const [isDamaged, setIsDamaged] = useState(false);

  const stateRef = useRef({ phase, snake, direction: nextDirection, goodWaste, hazards, lives, score });
  const lastTimeRef = useRef(null);
  const hazardTimerRef = useRef(0);
  const moveIntervalRef = useRef(null);

  useEffect(() => {
    stateRef.current = { phase, snake, direction: nextDirection, goodWaste, hazards, lives, score };
  }, [phase, snake, nextDirection, goodWaste, hazards, lives, score]);

  const GOOD_ICONS = ['🍎', '🍌', '🍉', '🍇', '🥕'];
  const BAD_ICONS = ['🔋', '🥤', '💊', '🧴', '🛢️'];

  const getRandomPos = () => ({
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT)
  });

  const isOccupied = (pos, snakeBody) => snakeBody.some(s => s.x === pos.x && s.y === pos.y);

  const spawnGoodWaste = () => {
    let pos;
    do { pos = getRandomPos(); } while (isOccupied(pos, stateRef.current.snake));
    setGoodWaste({ ...pos, icon: GOOD_ICONS[Math.floor(Math.random() * GOOD_ICONS.length)] });
  };

  const spawnHazard = () => {
    if (stateRef.current.phase !== "RUNNING") return;
    let pos;
    do { pos = getRandomPos(); } while (
      isOccupied(pos, stateRef.current.snake) ||
      (stateRef.current.goodWaste && pos.x === stateRef.current.goodWaste.x && pos.y === stateRef.current.goodWaste.y)
    );
    const hazard = { ...pos, icon: BAD_ICONS[Math.floor(Math.random() * BAD_ICONS.length)], id: Math.random() };
    setHazards(prev => [...prev, hazard]);
    setTimeout(() => {
      setHazards(prev => prev.filter(h => h.id !== hazard.id));
    }, 15000);
  };

  // Interval tabanlı hareket sistemi
  useEffect(() => {
    if (phase === "TUTORIAL") return;
    if (phase !== "RUNNING") return;

    const moveSnake = () => {
      const { snake: currentSnake, direction: dir, goodWaste: gw, hazards: hz, lives: lv, score: sc } = stateRef.current;

      setDirection(dir);
      const head = { x: currentSnake[0].x + dir.dx, y: currentSnake[0].y + dir.dy };

      if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        setPhase("ENDED");
        return;
      }

      if (currentSnake.some(s => s.x === head.x && s.y === head.y)) {
        setPhase("ENDED");
        return;
      }

      const newSnake = [head, ...currentSnake];

      if (gw && head.x === gw.x && head.y === gw.y) {
        setScore(sc + 1);
        soundManager.playScore(); // Ses efekti
        spawnGoodWaste();
      } else {
        newSnake.pop();
      }

      let hitHazard = false;
      const newHazards = hz.filter(h => {
        if (h.x === head.x && h.y === head.y) {
          hitHazard = true;
          setLives(prev => prev - 1);
          soundManager.playDamage(); // Ses efekti
          setIsDamaged(true);
          setTimeout(() => setIsDamaged(false), 1000);
          return false;
        }
        return true;
      });

      if (hitHazard) {
        setHazards(newHazards);
        // Boyu kısalt - 2 segment çıkar
        if (newSnake.length > 3) {
          newSnake.pop();
          newSnake.pop();
        }
        if (lv - 1 <= 0) {
          setPhase("ENDED");
          return;
        }
      }

      setSnake(newSnake);
    };

    moveIntervalRef.current = setInterval(moveSnake, GAME_SPEED);

    // Zaman sayacı
    const timeInterval = setInterval(() => {
      setTime(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setPhase("ENDED");
          return 0;
        }
        return next;
      });
    }, 1000);

    // Hazard spawn
    const hazardInterval = setInterval(() => {
      spawnHazard();
    }, 15000);

    return () => {
      clearInterval(moveIntervalRef.current);
      clearInterval(timeInterval);
      clearInterval(hazardInterval);
    };
  }, [phase]);

  const handleSwipe = (dx, dy) => {
    const { dx: curDx, dy: curDy } = direction;
    if (dx !== 0 && curDx === 0) setNextDirection({ dx, dy: 0 });
    else if (dy !== 0 && curDy === 0) setNextDirection({ dx: 0, dy });
  };

  // Klavye kontrolü (Web için)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleKeyPress = (e) => {
      if (phase !== "RUNNING") return;
      
      const { dx: curDx, dy: curDy } = stateRef.current.direction;
      
      if (e.key === 'ArrowUp' && curDy === 0) {
        e.preventDefault();
        setNextDirection({ dx: 0, dy: -1 });
      } else if (e.key === 'ArrowDown' && curDy === 0) {
        e.preventDefault();
        setNextDirection({ dx: 0, dy: 1 });
      } else if (e.key === 'ArrowLeft' && curDx === 0) {
        e.preventDefault();
        setNextDirection({ dx: -1, dy: 0 });
      } else if (e.key === 'ArrowRight' && curDx === 0) {
        e.preventDefault();
        setNextDirection({ dx: 1, dy: 0 });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [phase]);

  return (
    <View style={{ flex: 1 }}>
      {phase === "TUTORIAL" && (
        <TutorialModal 
          title="Yılan Oyunu"
          instructions={[
            "🐍 Ok tuşları ile yönü kontrol et",
            "🍎 İyi atıkları topla (+1 puan)",
            "☠️ Zehirli atıklardan kaç (-1 can)",
            "⏱️ 2 dakika içinde maksimum puan topla",
            "❤️ 3 canın var - dikkatli ol",
            "⌨️ ← → ↑ ↓ tuşlarını kullan"
          ]}
          onStart={() => setPhase("RUNNING")}
        />
      )}
      <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgDeep }}>
        <View style={{ 
          width: TILE_COUNT * GRID_SIZE, 
          height: TILE_COUNT * GRID_SIZE,
          backgroundColor: isDamaged ? '#8B0000' : '#795548',
          position: 'relative',
          borderWidth: 3,
          borderColor: isDamaged ? '#FF0000' : '#5D4037',
          transition: 'background-color 0.1s, border-color 0.1s'
        }}>
          {/* Checkerboard Background */}
          {[...Array(TILE_COUNT * TILE_COUNT)].map((_, index) => {
            const row = Math.floor(index / TILE_COUNT);
            const col = index % TILE_COUNT;
            return (
              <View key={index} style={{
                position: 'absolute',
                left: col * GRID_SIZE,
                top: row * GRID_SIZE,
                width: GRID_SIZE,
                height: GRID_SIZE,
                backgroundColor: (row + col) % 2 === 0 ? '#8D6E63' : '#795548'
              }} />
            );
          })}

          {/* Snake Segments - Düz Çizgi */}
          {snake.map((segment, i) => {
            const isHead = i === 0;
            const nextSegment = snake[i + 1];
            
            // Segment yönünü hesapla
            let segmentStyle = {
              position: 'absolute',
              backgroundColor: isHead ? '#4285F4' : '#5C9EF5',
            };
            
            if (isHead) {
              // Kafa - yuvarlak
              segmentStyle = {
                ...segmentStyle,
                left: segment.x * GRID_SIZE + 3,
                top: segment.y * GRID_SIZE + 3,
                width: GRID_SIZE - 6,
                height: GRID_SIZE - 6,
                borderRadius: (GRID_SIZE - 6) / 2,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#1967D2'
              };
            } else {
              // Gövde - düz çizgi
              segmentStyle = {
                ...segmentStyle,
                left: segment.x * GRID_SIZE + 5,
                top: segment.y * GRID_SIZE + 5,
                width: GRID_SIZE - 10,
                height: GRID_SIZE - 10,
                borderRadius: 3
              };
            }
            
            return (
              <View key={`snake-${i}`} style={segmentStyle}>
                {isHead && <Text style={{ fontSize: 10 }}>👀</Text>}
              </View>
            );
          })}

          {/* Good Waste */}
          {goodWaste && (
            <View style={{
              position: 'absolute',
              left: goodWaste.x * GRID_SIZE,
              top: goodWaste.y * GRID_SIZE,
              width: GRID_SIZE,
              height: GRID_SIZE,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 20 }}>{goodWaste.icon}</Text>
            </View>
          )}

          {/* Hazards */}
          {hazards.map(h => (
            <View key={h.id} style={{
              position: 'absolute',
              left: h.x * GRID_SIZE,
              top: h.y * GRID_SIZE,
              width: GRID_SIZE,
              height: GRID_SIZE,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 20 }}>{h.icon}</Text>
            </View>
          ))}
        </View>
      </View>

      {phase === "ENDED" && (
        <GameOverModal
          score={score}
          onRestart={() => {
            setScore(0);
            setLives(3);
            setTime(120);
            setPhase("RUNNING");
            setSnake([{ x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }]);
            setDirection({ dx: 1, dy: 0 });
            setNextDirection({ dx: 1, dy: 0 });
            setGoodWaste({ x: 10, y: 8, icon: '🍎' });
            setHazards([]);
          }}
          onMenu={onBack}
        />
      )}
    </View>
  );
}

