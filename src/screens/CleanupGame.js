import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, PanResponder, useWindowDimensions, Animated, Easing } from "react-native";

// --- PREMIUM TEMA RENKLERİ ---
const COLORS = {
  bgDeep: "#001e36",
  bgMid: "#004e7a",
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
  plastic: { id: 'plastic', icon: '🥤', label: 'Plastik', color: COLORS.plastic },
  paper:   { id: 'paper',   icon: '🗞️', label: 'Kağıt',   color: COLORS.paper },
  glass:   { id: 'glass',   icon: '🍾', label: 'Cam',     color: COLORS.glassBin },
  metal:   { id: 'metal',   icon: '🔋', label: 'Metal',   color: COLORS.metal },
  organic: { id: 'organic', icon: '🦴', label: 'Evsel',   color: COLORS.organic }
};

// --- YARDIMCI BİLEŞENLER ---

// Arka Plan Efektleri (God Rays & Bubbles)
const OceanBackground = () => {
  const { width, height } = useWindowDimensions();
  
  // Baloncuklar
  const bubbles = useRef([...Array(15)].map(() => ({
    anim: new Animated.Value(0),
    left: Math.random() * width,
    size: Math.random() * 20 + 5,
    speed: Math.random() * 5000 + 5000,
    delay: Math.random() * 5000
  }))).current;

  useEffect(() => {
    bubbles.forEach(b => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(b.delay),
          Animated.timing(b.anim, {
            toValue: 1,
            duration: b.speed,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ])
      ).start();
    });
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgDeep, overflow: 'hidden' }]}>
      {/* Radyal Gradyan benzeri bir efekt için merkezde aydınlık bir daire */}
      <View style={{
        position: 'absolute',
        top: -height * 0.2,
        left: -width * 0.2,
        width: width * 1.4,
        height: width * 1.4,
        borderRadius: width,
        backgroundColor: COLORS.bgMid,
        opacity: 0.4,
        transform: [{ scaleX: 1.5 }]
      }} />

      {/* God Rays (Işık Hüzmeleri) */}
      <View style={{
        position: 'absolute',
        top: -100,
        left: width * 0.2,
        width: 60,
        height: height * 1.5,
        backgroundColor: 'rgba(255,255,255,0.05)',
        transform: [{ rotate: '25deg' }]
      }} />
      <View style={{
        position: 'absolute',
        top: -100,
        left: width * 0.5,
        width: 80,
        height: height * 1.5,
        backgroundColor: 'rgba(255,255,255,0.03)',
        transform: [{ rotate: '20deg' }]
      }} />

      {/* Baloncuklar */}
      {bubbles.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: b.left,
            bottom: -50,
            width: b.size,
            height: b.size,
            borderRadius: b.size / 2,
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.3)',
            transform: [{
              translateY: b.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -height - 100]
              })
            }]
          }}
        />
      ))}
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

// HUD (Skor Tablosu)
const GameHUD = ({ score, time, lives, onBack }) => (
  <View style={styles.hudBar}>
    <TouchableOpacity style={styles.glassPanel} onPress={onBack}>
      <Text style={styles.hudIcon}>↩</Text>
    </TouchableOpacity>
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
);

// --- ANA BİLEŞEN ---
export default function CleanupGame({ onExit }) {
  const [gameMode, setGameMode] = useState("SELECTION"); // SELECTION | CLASSIC | SLINGSHOT | LANE | SNAKE

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <OceanBackground />
      
      {gameMode === "SELECTION" && <ModeSelectionScreen onSelectMode={setGameMode} onExit={onExit} />}
      {gameMode === "CLASSIC" && <CleanupGameClassic onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "SLINGSHOT" && <CleanupGameSlingshot onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "LANE" && <CleanupGameLaneSwap onBack={() => setGameMode("SELECTION")} />}
      {gameMode === "SNAKE" && <SnakeGame onBack={() => setGameMode("SELECTION")} />}
    </View>
  );
}

// --- MENÜ EKRANI ---
function ModeSelectionScreen({ onSelectMode, onExit }) {
  return (
    <View style={styles.menuContainer}>
      <Text style={styles.menuTitle}>OKYANUS{"\n"}<Text style={{ fontSize: 24, opacity: 0.8 }}>TEMİZLİĞİ</Text></Text>
      
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

      <TouchableOpacity style={[styles.glassPanel, { marginTop: 20 }]} onPress={onExit}>
        <Text style={styles.hudText}>Ana Menüye Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- MOD 1: KLASİK (SÜRÜKLE BIRAK) ---
function CleanupGameClassic({ onBack }) {
  const { width, height } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(60);
  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState("RUNNING");

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
          spawnTimerRef.current = Math.max(0.6, 2 - (score * 0.01));
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
    <View style={{ flex: 1 }}>
      <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
      
      {/* Oyun Alanı */}
      <View style={{ flex: 1 }}>
        {items.map(item => (
          <DraggableItem 
            key={item.id} 
            item={item} 
            onDrop={(x, y, type) => {
              // Kutu kontrolü
              const binWidth = width / 5;
              const binIndex = Math.floor(x / binWidth);
              if (binIndex >= 0 && binIndex < 5) {
                const targetType = TRASH_TYPES[binIndex];
                if (targetType === type) {
                  setScore(s => s + 10);
                  setItems(prev => prev.filter(i => i.id !== item.id));
                } else {
                  setLives(l => l - 1);
                  setItems(prev => prev.filter(i => i.id !== item.id));
                }
              }
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
        setScore(0); setLives(3); setTime(60); setItems([]); setPhase("RUNNING");
      }} onMenu={onBack} />}
    </View>
  );
}

// Sürüklenebilir Öğe Bileşeni
const DraggableItem = ({ item, onDrop }) => {
  const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // item.y değiştiğinde animasyonu güncelle (sürüklenmiyorsa)
  useEffect(() => {
    if (!dragging) {
      pan.setValue({ x: item.x, y: item.y });
    }
  }, [item.x, item.y, dragging]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        setDragging(false);
        pan.flattenOffset();
        onDrop(gesture.moveX, gesture.moveY, item.type);
      }
    })
  ).current;

  // Web uyumluluğu için mouse/touch event'leri
  const handleStart = (e) => {
    if (Platform.OS === 'web') {
      setDragging(true);
      const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
      dragOffsetRef.current = { 
        x: touch.pageX - pan.x._value, 
        y: touch.pageY - pan.y._value 
      };
    }
  };

  const handleMove = (e) => {
    if (Platform.OS === 'web' && dragging) {
      const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
      pan.setValue({ 
        x: touch.pageX - dragOffsetRef.current.x, 
        y: touch.pageY - dragOffsetRef.current.y 
      });
    }
  };

  const handleEnd = (e) => {
    if (Platform.OS === 'web' && dragging) {
      setDragging(false);
      const touch = e.nativeEvent.changedTouches ? e.nativeEvent.changedTouches[0] : e.nativeEvent;
      onDrop(touch.pageX, touch.pageY, item.type);
    }
  };

  const handlers = Platform.OS === 'web' ? {
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    onMouseDown: handleStart,
    onMouseMove: handleMove,
    onMouseUp: handleEnd
  } : panResponder.panHandlers;

  return (
    <Animated.View
      {...handlers}
      style={{
        position: 'absolute',
        transform: pan.getTranslateTransform(),
        zIndex: dragging ? 100 : 1,
        cursor: Platform.OS === 'web' ? (dragging ? 'grabbing' : 'grab') : 'auto'
      }}
    >
      <View style={styles.wasteBubble}>
        <Text style={{ fontSize: 30 }}>{TRASH_CONFIG[item.type].icon}</Text>
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
  const [time, setTime] = useState(60);
  const [phase, setPhase] = useState("RUNNING");
  
  const [projectile, setProjectile] = useState(null);
  const [currentType, setCurrentType] = useState(TRASH_TYPES[0]);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  // State Ref
  const stateRef = useRef({ phase, projectile, currentType, isPortrait });
  useEffect(() => {
    stateRef.current = { phase, projectile, currentType, isPortrait };
  }, [phase, projectile, currentType, isPortrait]);

  // Kovalar (Sağ tarafta, piramit/sıralı düzen)
  const startBinX = gameW * 0.65;
  const BINS = [
    { type: "plastic", x: startBinX, y: gameH * 0.65 },
    { type: "paper", x: startBinX + 90, y: gameH * 0.65 },
    { type: "glass", x: startBinX + 180, y: gameH * 0.65 },
    { type: "metal", x: startBinX + 45, y: gameH * 0.45 },
    { type: "organic", x: startBinX + 135, y: gameH * 0.45 },
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
    if (phase !== "RUNNING") return;

    let raf;
    let lastT = 0;
    
    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      
      if (!lastT) { lastT = t; return; }
      const dt = Math.min((t - lastT)/1000, 0.05);
      lastT = t;

      // StateRef'ten güncel veriyi al (Closure sorununu çözer)
      const { projectile: p, lives: l } = stateRef.current;

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
          if (newScore > 0) setScore(s => s + newScore);
          if (lifeLost) setLives(prev => prev - 1);
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
      
      if (l <= 0) setPhase("ENDED");
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
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={containerStyle}>
        <OceanBackground />
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
            <View style={{ position: 'absolute', left: dragCurrent.x - 20, top: dragCurrent.y - 20 }}>
              <View style={styles.wasteBubble}><Text style={{fontSize:24}}>{TRASH_CONFIG[currentType].icon}</Text></View>
            </View>
          ) : (
            !projectile && (
              <View style={{ position: 'absolute', left: SLING_CONFIG.anchorX - 20, top: SLING_CONFIG.anchorY - 20 }}>
                <View style={styles.wasteBubble}><Text style={{fontSize:24}}>{TRASH_CONFIG[currentType].icon}</Text></View>
              </View>
            )
          )}

          {/* Uçan Mermi */}
          {projectile && (
            <View style={{ position: 'absolute', left: projectile.x - 20, top: projectile.y - 20 }}>
              <View style={styles.wasteBubble}><Text style={{fontSize:24}}>{TRASH_CONFIG[projectile.type].icon}</Text></View>
            </View>
          )}
        </View>

        {phase === "ENDED" && (
          <View style={[styles.overlay, { transform: [{ rotate: '-90deg' }] }]}>
             <GameOverModal score={score} onRestart={() => {
               setScore(0); setLives(3); setTime(60); setPhase("RUNNING");
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
  const [time, setTime] = useState(60);
  const [phase, setPhase] = useState("RUNNING");
  
  const [binOrder, setBinOrder] = useState([...TRASH_TYPES]);
  const [selectedLane, setSelectedLane] = useState(null);
  const [items, setItems] = useState([]);
  
  const spawnTimerRef = useRef(0);
  const lastTimeRef = useRef(null);

  const handleLanePress = (index) => {
    if (selectedLane === null) setSelectedLane(index);
    else {
      if (selectedLane !== index) {
        const newOrder = [...binOrder];
        const temp = newOrder[selectedLane];
        newOrder[selectedLane] = newOrder[index];
        newOrder[index] = temp;
        setBinOrder(newOrder);
      }
      setSelectedLane(null);
    }
  };

  useEffect(() => {
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
          const lane = Math.floor(Math.random() * 5);
          const type = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
          setItems(p => [...p, { id: Math.random().toString(), type, lane, y: -60, speed: 150 + score }]);
          spawnTimerRef.current = Math.max(0.5, 1.5 - score * 0.01);
        }

        setItems(prev => {
          const next = [];
          for (let item of prev) {
            item.y += item.speed * dt;
            if (item.y > height - 150) {
              if (binOrder[item.lane] === item.type) setScore(s => s + 10);
              else setLives(l => l - 1);
            } else {
              next.push(item);
            }
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
    <View style={{ flex: 1 }}>
      <OceanBackground />
      <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
      
      {/* Şeritler */}
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {[0,1,2,3,4].map(i => (
          <View key={i} style={{ flex: 1, borderRightWidth: i<4?1:0, borderColor: 'rgba(255,255,255,0.1)' }} />
        ))}
      </View>

      {/* Düşenler */}
      {items.map(item => (
        <View key={item.id} style={{
          position: 'absolute',
          left: (item.lane * (width/5)) + (width/10) - 25,
          top: item.y,
        }}>
          <View style={styles.wasteBubble}><Text style={{fontSize:24}}>{TRASH_CONFIG[item.type].icon}</Text></View>
        </View>
      ))}

      {/* Kovalar */}
      <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', height: 100, alignItems: 'flex-end' }}>
        {binOrder.map((type, i) => (
          <View key={i} style={{ flex: 1, padding: 2 }}>
            <Bin3D 
              type={type} 
              isSelected={selectedLane === i} 
              onClick={() => handleLanePress(i)}
              style={{ width: '100%' }}
            />
          </View>
        ))}
      </View>

      {phase === "ENDED" && <GameOverModal score={score} onRestart={() => {
        setScore(0); setLives(3); setTime(60); setItems([]); setPhase("RUNNING");
      }} onMenu={onBack} />}
    </View>
  );
}

// --- ORTAK MODAL ---
const GameOverModal = ({ score, onRestart, onMenu }) => (
  <View style={styles.overlay}>
    <View style={styles.modalCard}>
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>Oyun Bitti</Text>
      <Text style={{ color: '#ccc', fontSize: 16 }}>Toplam Skor</Text>
      <Text style={{ color: COLORS.accent, fontSize: 48, fontWeight: '900', marginVertical: 20 }}>{score}</Text>
      <TouchableOpacity style={styles.btnAction} onPress={onRestart}>
        <Text style={styles.btnText}>Tekrar Oyna</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btnAction, styles.btnSecondary]} onPress={onMenu}>
        <Text style={styles.btnText}>Ana Menü</Text>
      </TouchableOpacity>
    </View>
  </View>
);

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

  // --- MENU STYLES ---
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
  const [time, setTime] = useState(60);
  const [phase, setPhase] = useState("RUNNING");
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
        spawnGoodWaste();
      } else {
        newSnake.pop();
      }

      let hitHazard = false;
      const newHazards = hz.filter(h => {
        if (h.x === head.x && h.y === head.y) {
          hitHazard = true;
          setLives(prev => prev - 1);
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
            setScore(0); setLives(3); setTime(60); setPhase("RUNNING");
            setSnake([{ x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }]);
            setDirection({ dx: 1, dy: 0 }); setNextDirection({ dx: 1, dy: 0 });
            setGoodWaste({ x: 10, y: 8, icon: '🍎' }); setHazards([]);
          }}
          onMenu={onBack}
        />
      )}
    </View>
  );
}

