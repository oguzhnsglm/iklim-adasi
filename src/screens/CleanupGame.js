import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THEME } from "../theme";

// Ekran boyutları ve sabitler
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRASH = 20;               // Maksimum çöp sayısı
const MAX_SHARKS = 3;               // Maksimum köpekbalığı sayısı
const TOTAL_TIME = 90;              // Oyun süresi (saniye)
const INITIAL_HP = 3;               // Başlangıç canı
const BOAT_SPEED = 80;              // Kayık hızı (su akış hızı)
const WAVE_SPEED = 100;             // Dalga hızı

// Kayık pozisyonu (ekranın alt kısmında sabit)
const BOAT = {
  x: 0,
  y: SCREEN_HEIGHT * 0.75,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT * 0.25,
};

// Kova pozisyonları (kayığın içinde - ekran koordinatlarında)
const BINS = {
  battery: {
    type: "battery",
    label: "PİL",
    x: 20,
    y: SCREEN_HEIGHT * 0.80,
    width: 70,
    height: 80,
    color: "#DC2626",
    emoji: "🔋",
  },
  paper: {
    type: "paper",
    label: "KAĞIT",
    x: SCREEN_WIDTH * 0.22,
    y: SCREEN_HEIGHT * 0.80,
    width: 70,
    height: 80,
    color: "#2563EB",
    emoji: "📄",
  },
  glass: {
    type: "glass",
    label: "CAM",
    x: SCREEN_WIDTH * 0.41,
    y: SCREEN_HEIGHT * 0.80,
    width: 70,
    height: 80,
    color: "#10B981",
    emoji: "🍾",
  },
  plastic: {
    type: "plastic",
    label: "PLASTİK",
    x: SCREEN_WIDTH * 0.60,
    y: SCREEN_HEIGHT * 0.80,
    width: 70,
    height: 80,
    color: "#F59E0B",
    emoji: "♻️",
  },
  general: {
    type: "general",
    label: "EVSEL",
    x: SCREEN_WIDTH * 0.79,
    y: SCREEN_HEIGHT * 0.80,
    width: 70,
    height: 80,
    color: "#6B7280",
    emoji: "🗑️",
  },
};

// Combo çarpanları (ardışık doğru atışlarda artar)
const COMBOS = [1, 1.5, 2, 3];

// Yardımcı fonksiyonlar
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;
const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

// Dalga oluşturma (ekranın üstünden başlar, aşağı kayar)
const createWave = (offsetY = 0) => ({
  id: `wave-${Math.random().toString(36).slice(2)}`,
  y: -50 + offsetY,
  x: rand(-20, 20),
  amplitude: rand(10, 25),
  frequency: rand(0.01, 0.03),
});

// Çöp oluşturma (ekranın üstünden spawn olur, aşağı kayar)
const spawnTrash = () => {
  const types = ["battery", "paper", "glass", "plastic", "general"];
  const selectedType = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `trash-${Math.random().toString(36).slice(2)}`,
    type: selectedType,
    x: rand(SCREEN_WIDTH * 0.15, SCREEN_WIDTH * 0.85),
    y: -80,  // Ekranın üstünden başlar
    rotation: rand(0, 360),
    bobPhase: rand(0, Math.PI * 2),
    dragging: false,   // Sürükleniyor mu?
    startX: 0,         // Sürükleme başlangıç pozisyonu
    startY: 0,
    offsetX: 0,        // Dokunma noktası ile obje merkezi arası fark
    offsetY: 0,
    inBoat: false,
    targetBin: null,
    spinSpeed: 0,      // Dönerken hız
  };
};

// Köpekbalığı oluşturma (yukarıdan aşağıya kayar)
const spawnShark = () => ({
  id: `shark-${Math.random().toString(36).slice(2)}`,
  x: rand(SCREEN_WIDTH * 0.15, SCREEN_WIDTH * 0.85),
  y: -80,  // Ekranın üstünden başlar
  rotation: rand(-15, 15),
  bobPhase: rand(0, Math.PI * 2),
  attackCooldown: 0,
  hit: false,
});

// Ana oyun bileşeni
export default function CleanupGame({ onExit }) {
  // State'ler (sadece UI için)
  const [scoreState, setScoreState] = useState(0);
  const [comboState, setComboState] = useState("x1.0");
  const [timeState, setTimeState] = useState(TOTAL_TIME);
  const [hpState, setHpState] = useState(INITIAL_HP);
  const [phase, setPhase] = useState("TUTORIAL");  // TUTORIAL | RUNNING | PAUSED | ENDED
  const [soundOn, setSoundOn] = useState(true);
  const [hoverBin, setHoverBin] = useState(null); // Hangi kutunun üzerindeyiz?
  const [, setTick] = useState(0);  // Render zorlamak için

  // Ref'ler (performans için - her frame'de güncellenir)
  const wavesRef = useRef([createWave(0), createWave(200), createWave(400)]);
  const trashRef = useRef([]);
  const sharksRef = useRef([]);
  const draggingTrashRef = useRef(null);  // Şu an sürüklenen çöp
  const scoreRef = useRef(0);
  const comboIndexRef = useRef(0);
  const hpRef = useRef(INITIAL_HP);
  const timeRef = useRef(TOTAL_TIME);
  const spawnTimerRef = useRef(1.5);
  const sharkSpawnTimerRef = useRef(3);
  const rafRef = useRef(null);
  const lastFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const mouseStartRef = useRef({ x: 0, y: 0 });

  // Oyunu sıfırlama
  const resetGame = useCallback(() => {
    wavesRef.current = [createWave(0), createWave(200), createWave(400)];
    trashRef.current = [];
    sharksRef.current = [];
    draggingTrashRef.current = null;
    scoreRef.current = 0;
    comboIndexRef.current = 0;
    hpRef.current = INITIAL_HP;
    timeRef.current = TOTAL_TIME;
    spawnTimerRef.current = 1.5;
    sharkSpawnTimerRef.current = 3;
    setScoreState(0);
    setComboState("x1.0");
    setHpState(INITIAL_HP);
    setTimeState(TOTAL_TIME);
    setPhase("RUNNING");
    setHoverBin(null);
  }, []);

  useEffect(() => {
    resetGame();
    setPhase("TUTORIAL");
  }, [resetGame]);

  // Global mouse olayları (web için)
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDraggingRef.current || !draggingTrashRef.current) return;
      e.preventDefault();
      const item = draggingTrashRef.current;
      const currentX = e.clientX || e.pageX;
      const currentY = e.clientY || e.pageY;
      const dx = currentX - mouseStartRef.current.x;
      const dy = currentY - mouseStartRef.current.y;
      item.x = item.startX + dx;
      item.y = item.startY + dy;
      
      // Web için hover kontrolü
      let closestBin = null;
      let minDst = Infinity;
      Object.values(BINS).forEach(bin => {
         const binCX = bin.x + bin.width/2;
         const binCY = bin.y + bin.height/2;
         const d = Math.hypot(item.x - binCX, item.y - binCY);
         if (d < 100 && d < minDst) {
            minDst = d;
            closestBin = bin.type;
         }
      });
      setHoverBin(closestBin);

      setTick((prev) => (prev + 1) % 1000);
    };

    const handleGlobalMouseUp = () => {
      if (!isDraggingRef.current || !draggingTrashRef.current) return;
      const item = draggingTrashRef.current;
      if (!item.dragging) return;
      
      // Çöp bırakma işlemi
      item.dragging = false;
      isDraggingRef.current = false;
      setHoverBin(null);
      
      // Çarpışma kontrolü - ÇOK GENİŞ ALAN
      const trashCenterX = item.x;
      const trashCenterY = item.y;
      
      let hitBin = null;
      let minDistance = Infinity;
      
      // En yakın kutuyu bul
      Object.values(BINS).forEach((bin) => {
        const binCenterX = bin.x + bin.width / 2;
        const binCenterY = bin.y + bin.height / 2;
        const distance = Math.sqrt(
          Math.pow(trashCenterX - binCenterX, 2) + 
          Math.pow(trashCenterY - binCenterY, 2)
        );
        
        // 300px mesafe içindeyse (ÇOK ÇOK GENİŞ)
        if (distance < 300 && distance < minDistance) {
          minDistance = distance;
          hitBin = bin;
        }
      });
      
      if (hitBin && hitBin.type === item.type && phase === "RUNNING") {
        // TODO: Play correct sound
        item.inBoat = true;
        item.targetBin = hitBin;
        item.spinSpeed = 900;
        draggingTrashRef.current = null;
        
        const multiplier = COMBOS[comboIndexRef.current];
        const gained = 10 * multiplier;
        scoreRef.current += gained;
        comboIndexRef.current = Math.min(comboIndexRef.current + 1, COMBOS.length - 1);
        
        setScoreState(Math.round(scoreRef.current));
        setComboState(`x${multiplier.toFixed(1)}`);
        
        setTimeout(() => {
          trashRef.current = trashRef.current.filter((t) => t.id !== item.id);
        }, 500);
      } else {
        // TODO: Play wrong sound
        draggingTrashRef.current = null;
        if (hitBin) {
          comboIndexRef.current = 0;
          setComboState("x1.0");
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [phase]);

  // Skor güncelleme (doğru/yanlış sayısına göre combo artır/sıfırla)
  const updateScore = useCallback((correct, wrong) => {
    if (wrong > 0) {
      comboIndexRef.current = 0;  // Yanlış atış combo'yu sıfırlar
    } else if (correct > 0) {
      comboIndexRef.current = Math.min(comboIndexRef.current + 1, COMBOS.length - 1);
    }
    const multiplier = COMBOS[comboIndexRef.current];
    const gained = correct * 10 * multiplier;
    const penalty = wrong * 5;
    scoreRef.current = Math.max(0, scoreRef.current + gained - penalty);  // Skor 0 altına inmez
    setScoreState(Math.round(scoreRef.current));
    setComboState(`x${multiplier.toFixed(1)}`);
  }, []);

  // Çöp bırakma
  const handleTrashRelease = useCallback((trash) => {
    if (phase !== "RUNNING" || !trash.dragging) return;
    
    trash.dragging = false;
    isDraggingRef.current = false;
    setHoverBin(null);
    
    // Çarpışma kontrolü - EN YAKIN KUTUYU BUL
    const trashCenterX = trash.x;
    const trashCenterY = trash.y;
    
    let hitBin = null;
    let minDistance = Infinity;
    
    // En yakın kutuyu bul
    Object.values(BINS).forEach((bin) => {
      const binCenterX = bin.x + bin.width / 2;
      const binCenterY = bin.y + bin.height / 2;
      const distance = Math.sqrt(
        Math.pow(trashCenterX - binCenterX, 2) + 
        Math.pow(trashCenterY - binCenterY, 2)
      );
      
      // 300px mesafe içindeyse (ÇOK ÇOK GENİŞ)
      if (distance < 300 && distance < minDistance) {
        minDistance = distance;
        hitBin = bin;
      }
    });
    
    if (hitBin && hitBin.type === trash.type) {
      // Doğru kovaya atıldı
      // TODO: Play correct sound
      trash.inBoat = true;
      trash.targetBin = hitBin;
      trash.spinSpeed = 900;
      draggingTrashRef.current = null;
      
      const multiplier = COMBOS[comboIndexRef.current];
      const gained = 10 * multiplier;
      scoreRef.current += gained;
      comboIndexRef.current = Math.min(comboIndexRef.current + 1, COMBOS.length - 1);
      
      setScoreState(Math.round(scoreRef.current));
      setComboState(`x${multiplier.toFixed(1)}`);
      
      setTimeout(() => {
        trashRef.current = trashRef.current.filter((t) => t.id !== trash.id);
      }, 500);
    } else {
      // TODO: Play wrong sound
      draggingTrashRef.current = null;
      // Yanlış kovaya atıldı - combo sıfırla
      if (hitBin) {
        comboIndexRef.current = 0;
        setComboState("x1.0");
      }
    }
  }, [phase]);

  // Köpekbalığına tıklama - hasar al
  const handleSharkPress = useCallback((shark) => {
    if (phase !== "RUNNING" || shark.hit) return;
    
    // TODO: Play shark hit sound
    shark.hit = true;
    hpRef.current = Math.max(0, hpRef.current - 1);
    setHpState(hpRef.current);
    
    // Köpekbalığını kaldır
    setTimeout(() => {
      sharksRef.current = sharksRef.current.filter((s) => s.id !== shark.id);
    }, 300);
    
    // Can biterse oyun biter
    if (hpRef.current <= 0) {
      setPhase("ENDED");
    }
  }, [phase]);

  // Dalgaları güncelle (yukarıdan aşağıya hareket)
  const updateWaves = useCallback((delta) => {
    wavesRef.current.forEach((wave) => {
      wave.y += WAVE_SPEED * delta;
      // Ekranın altından çıkınca üste geri dön
      if (wave.y > SCREEN_HEIGHT + 50) {
        wave.y = -50;
        wave.x = rand(-20, 20);
      }
    });
  }, []);

  // Çöpleri güncelle (yukarıdan aşağıya kayar)
  const updateTrash = useCallback((delta) => {
    trashRef.current.forEach((item) => {
      if (item.inBoat && item.targetBin) {
        // Kovaya doğru animasyon - HIZLI DÖNEREK GİR!
        const targetX = item.targetBin.x + item.targetBin.width / 2;
        const targetY = item.targetBin.y + item.targetBin.height / 2;
        const dx = targetX - item.x;
        const dy = targetY - item.y;
        
        // Hızlı hareket
        item.x += dx * delta * 12;
        item.y += dy * delta * 12;
        
        // Hızlı dönüş - spinSpeed yoksa varsayılan kullan
        const spinSpeed = item.spinSpeed || 900;
        item.rotation += spinSpeed * delta;
        
        return;
      }
      
      if (item.dragging) {
        // Sürüklenirken hafif dönme
        item.rotation += 180 * delta;
        return;
      }
      
      // Su akışı ile aşağı kay
      item.y += BOAT_SPEED * delta;
      item.bobPhase += 3 * delta;
      item.x += Math.sin(item.bobPhase) * 15 * delta;
      item.rotation += 30 * delta;
      
      // Ekranın altından geçtiyse kaldır (kaçırıldı)
      if (item.y > SCREEN_HEIGHT + 50) {
        // Combo sıfırla (çöp kaçırıldı)
        comboIndexRef.current = 0;
        setComboState("x1.0");
      }
    });
    
    // Ekranın altından geçen çöpleri kaldır
    trashRef.current = trashRef.current.filter((item) => item.y < SCREEN_HEIGHT + 50 || item.inBoat);
  }, []);

  // Köpekbalıklarını güncelle (yukarıdan aşağıya kayar)
  const updateSharks = useCallback((delta) => {
    sharksRef.current.forEach((shark) => {
      if (shark.hit) return;
      
      // Su akışı ile aşağı kay
      shark.y += BOAT_SPEED * delta;
      shark.bobPhase += 2 * delta;
      shark.x += Math.sin(shark.bobPhase) * 20 * delta;
      
      // Ekranın altından geçtiyse hasar ver
      if (shark.y > SCREEN_HEIGHT - 50 && !shark.hit) {
        shark.hit = true;
        hpRef.current = Math.max(0, hpRef.current - 1);
        setHpState(hpRef.current);
        
        // Can biterse oyun biter
        if (hpRef.current <= 0) {
          setPhase("ENDED");
        }
      }
    });
    
    // Ekranın dışına çıkan köpekbalıklarını kaldır
    sharksRef.current = sharksRef.current.filter((shark) => shark.y < SCREEN_HEIGHT + 100);
  }, []);

  // Çöp spawn sistemi
  const updateSpawn = useCallback(() => {
    const activeTrash = trashRef.current.filter((t) => !t.inBoat).length;
    if (activeTrash >= MAX_TRASH) return;
    
    // Yeni çöp ekle
    trashRef.current.push(spawnTrash());
  }, []);

  // Köpekbalığı spawn sistemi
  const updateSharkSpawn = useCallback(() => {
    if (sharksRef.current.length >= MAX_SHARKS) return;
    sharksRef.current.push(spawnShark());
  }, []);

  // Süre sayacı (0'a düşünce oyun biter)
  const updateTimer = useCallback(
    (delta) => {
      timeRef.current = Math.max(0, timeRef.current - delta);
      const seconds = Math.ceil(timeRef.current);
      if (seconds !== timeState) {
        setTimeState(seconds);
      }
      if (timeRef.current <= 0) {
        setPhase("ENDED");
      }
    },
    [timeState],
  );

  // Oyun döngüsü (requestAnimationFrame)
  useEffect(() => {
    const loop = (ts) => {
      if (!lastFrameRef.current) lastFrameRef.current = ts;
      const delta = Math.min((ts - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = ts;

      if (phase === "RUNNING") {
        // Çöp spawn timer
        spawnTimerRef.current -= delta;
        if (spawnTimerRef.current <= 0) {
          updateSpawn();
          // Oyun ilerledikçe spawn hızlanır
          spawnTimerRef.current = clamp(2 - (1 - timeRef.current / TOTAL_TIME) * 1.2, 0.5, 2);
        }
        
        // Köpekbalığı spawn timer
        sharkSpawnTimerRef.current -= delta;
        if (sharkSpawnTimerRef.current <= 0) {
          updateSharkSpawn();
          sharkSpawnTimerRef.current = rand(4, 8);  // 4-8 saniye arası
        }
        
        updateWaves(delta);
        updateTrash(delta);
        updateSharks(delta);
        updateTimer(delta);
        setTick((prev) => (prev + 1) % 1000);  // Render zorla
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, updateSharkSpawn, updateSharks, updateSpawn, updateTimer, updateTrash, updateWaves]);

  // Duraklatma/devam kontrolü
  const handlePauseToggle = () => {
    if (phase === "RUNNING") setPhase("PAUSED");
    else if (phase === "PAUSED") setPhase("RUNNING");
  };

  // Tutorial'dan oyuna başlama
  const handleTutorialStart = () => {
    setPhase("RUNNING");
  };

  // Render için snapshot'lar (ref'lerin anlık değerleri)
  const wavesSnapshot = wavesRef.current;
  const trashSnapshot = trashRef.current;
  const sharksSnapshot = sharksRef.current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. Underwater Background */}
      <View style={styles.bgLayer1} />
      <View style={styles.bgLayer2} />
      {/* Decorative bubbles/elements could go here */}
      
      {/* HUD: Modernized Top Bar */}
      <View style={styles.hudRow}>
        <View style={styles.hudGroup}>
          <View style={styles.hudItem}>
            <Text style={styles.hudIcon}>⏱</Text>
            <Text style={styles.hudText}>{timeState}s</Text>
          </View>
          <View style={styles.hudItem}>
            <Text style={styles.hudIcon}>🎯</Text>
            <Text style={styles.hudText}>{scoreState}</Text>
          </View>
        </View>
        
        <View style={styles.hudGroup}>
          <View style={[styles.hudItem, { borderColor: comboState !== "x1.0" ? "#F59E0B" : "rgba(255,255,255,0.15)" }]}>
            <Text style={styles.hudIcon}>🔥</Text>
            <Text style={[styles.hudText, { color: comboState !== "x1.0" ? "#FCD34D" : "#E0F2FE" }]}>{comboState}</Text>
          </View>
          <View style={styles.hudItem}>
            <Text style={styles.hudIcon}>❤️</Text>
            <Text style={[styles.hudText, { color: hpState < 2 ? "#EF4444" : "#E0F2FE" }]}>{hpState}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.pauseButton} onPress={handlePauseToggle}>
          <Text style={styles.pauseLabel}>{phase === "PAUSED" ? "▶" : "||"}</Text>
        </TouchableOpacity>
      </View>

      {/* Oyun alanı */}
      <View style={styles.playArea}>
        {/* Akan su dalgaları (dekoratif) */}
        {wavesSnapshot.map((wave) => (
          <View
            key={wave.id}
            style={{
              position: "absolute",
              top: wave.y,
              left: wave.x,
              width: SCREEN_WIDTH,
              height: 2,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              transform: [{ scaleX: 1 + wave.amplitude / 50 }],
            }}
          />
        ))}

        {/* Köpekbalıkları */}
        {sharksSnapshot.map((shark) => (
          <TouchableOpacity
            key={shark.id}
            activeOpacity={0.7}
            onPress={() => handleSharkPress(shark)}
            style={[
              styles.shark,
              {
                left: shark.x - 40,
                top: shark.y - 30,
                transform: [{ rotate: `${shark.rotation}deg` }],
                opacity: shark.hit ? 0.3 : 1,
              },
            ]}
          >
            <Text style={styles.sharkBody}>🦈</Text>
          </TouchableOpacity>
        ))}

        {/* Çöpler */}
        {trashSnapshot.map((item) => {
          const trashIcons = {
            battery: { emoji: "🔋", color: "#DC2626" },
            paper: { emoji: "📄", color: "#2563EB" },
            glass: { emoji: "🍾", color: "#10B981" },
            plastic: { emoji: "♻️", color: "#F59E0B" },
            general: { emoji: "🗑️", color: "#6B7280" },
          };
          
          const icon = trashIcons[item.type];
          const isHovered = item.dragging; // Basitçe sürükleniyorsa highlight
          
          const handleMouseDown = (e) => {
            if (phase !== "RUNNING" || item.inBoat) return;
            e.preventDefault();
            e.stopPropagation();
            item.dragging = true;
            item.startX = item.x;
            item.startY = item.y;
            mouseStartRef.current = { x: e.clientX || e.pageX, y: e.clientY || e.pageY };
            draggingTrashRef.current = item;
            isDraggingRef.current = true;
          };
          
          return (
            <View
              key={item.id}
              onStartShouldSetResponder={() => phase === "RUNNING" && !item.inBoat}
              onMoveShouldSetResponder={() => phase === "RUNNING" && item.dragging}
              onResponderGrant={(evt) => {
                if (phase === "RUNNING" && !item.inBoat) {
                  item.dragging = true;
                  item.startX = item.x;
                  item.startY = item.y;
                  mouseStartRef.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
                  draggingTrashRef.current = item;
                  isDraggingRef.current = true;
                }
              }}
              onResponderMove={(evt) => {
                if (phase === "RUNNING" && item.dragging && draggingTrashRef.current?.id === item.id) {
                  const touch = evt.nativeEvent;
                  const dx = touch.pageX - mouseStartRef.current.x;
                  const dy = touch.pageY - mouseStartRef.current.y;
                  item.x = item.startX + dx;
                  item.y = item.startY + dy;
                  
                  // Hover check
                  let closestBin = null;
                  let minDst = Infinity;
                  Object.values(BINS).forEach(bin => {
                     const binCX = bin.x + bin.width/2;
                     const binCY = bin.y + bin.height/2;
                     const d = Math.hypot(item.x - binCX, item.y - binCY);
                     if (d < 100 && d < minDst) {
                        minDst = d;
                        closestBin = bin.type;
                     }
                  });
                  setHoverBin(closestBin);

                  setTick((prev) => (prev + 1) % 1000);
                }
              }}
              onResponderRelease={() => {
                if (phase === "RUNNING" && item.dragging) {
                  setHoverBin(null);
                  handleTrashRelease(item);
                }
              }}
              style={[
                styles.trash,
                {
                  left: item.x - 35,
                  top: item.y - 35,
                  transform: [
                    { rotate: `${item.rotation}deg` },
                    { scale: item.dragging ? 1.2 : 1 }
                  ],
                  opacity: item.inBoat ? 0.5 : 1,
                  zIndex: item.inBoat ? 100 : item.dragging ? 50 : 10,
                  cursor: 'pointer',
                },
              ]}
              // @ts-ignore
              onMouseDown={handleMouseDown}
            >
              <View
                style={[
                  styles.trashBubble,
                  {
                    backgroundColor: item.dragging ? icon.color : "rgba(255,255,255,0.2)",
                    borderColor: item.dragging ? "#FFF" : icon.color,
                  },
                ]}
              >
                <Text style={styles.trashEmoji}>{icon.emoji}</Text>
              </View>
            </View>
          );
        })}

        {/* Bins Area (Bottom) */}
        <View style={styles.boat}>
          <View style={styles.boatBody}>
            {Object.values(BINS).map((bin) => {
              const isHovered = hoverBin === bin.type;
              return (
                <View key={bin.type} style={styles.binWrapper}>
                  <View 
                    style={[
                      styles.bin, 
                      { 
                        backgroundColor: bin.color,
                        transform: isHovered ? [{scale: 1.1}, {translateY: -5}] : [],
                        borderColor: isHovered ? "#FFF" : "transparent",
                        borderWidth: isHovered ? 2 : 0,
                      }
                    ]}
                  >
                    <View style={styles.binLid} />
                    <Text style={styles.binIcon}>{bin.emoji}</Text>
                  </View>
                  <Text style={styles.binLabel}>{bin.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Alt bar: Modern Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={resetGame}>
          <Text style={styles.secondaryText}>🔄 Sıfırla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSoundOn((prev) => !prev)}>
          <Text style={styles.secondaryText}>{soundOn ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onExit}>
          <Text style={styles.secondaryText}>🏠 Menü</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay: Tutorial, Duraklat, Oyun Bitti */}
      {(phase === "PAUSED" || phase === "ENDED" || phase === "TUTORIAL") && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            {phase === "PAUSED" && <Text style={styles.overlayTitle}>Duraklatıldı</Text>}
            {phase === "ENDED" && <Text style={styles.overlayTitle}>Süre Bitti!</Text>}
            {phase === "TUTORIAL" && (
              <>
                <Text style={styles.overlayTitle}>🌊 Okyanus Temizliği</Text>
                <Text style={styles.overlayText}>Denizlerimizi temiz tutalım!</Text>
                <Text style={styles.overlayText}>👆 Atıkları sürükle ve doğru kutuya bırak.</Text>
                <Text style={styles.overlayText}>🔋 Pil 📄 Kağıt 🍾 Cam ♻️ Plastik 🗑️ Evsel</Text>
                <Text style={styles.overlayText}>🦈 Köpekbalıklarına dikkat et! Dokunarak uzaklaştır.</Text>
              </>
            )}
            {phase === "PAUSED" && (
              <TouchableOpacity style={styles.cta} onPress={handlePauseToggle}>
                <Text style={styles.ctaText}>Devam Et</Text>
              </TouchableOpacity>
            )}
            {phase === "ENDED" && (
              <>
                <Text style={styles.overlayText}>Toplam Skor: {scoreState}</Text>
                <TouchableOpacity style={styles.cta} onPress={resetGame}>
                  <Text style={styles.ctaText}>Tekrar Oyna</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={onExit}>
                  <Text style={styles.secondaryText}>Çıkış</Text>
                </TouchableOpacity>
              </>
            )}
            {phase === "TUTORIAL" && (
              <TouchableOpacity style={styles.cta} onPress={handleTutorialStart}>
                <Text style={styles.ctaText}>BAŞLA</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001e3c", // Deep ocean base
  },
  // Background Layers
  bgLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0288d1", // Lighter blue
    opacity: 0.3,
  },
  bgLayer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#4fc3f7", // Surface light
    opacity: 0.2,
  },
  bgDecor: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 200,
    opacity: 0.6,
  },
  bubble: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
  },
  
  // HUD
  hudRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: (StatusBar.currentHeight || 40) + 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 100,
  },
  hudGroup: {
    flexDirection: "row",
    gap: 8,
  },
  hudItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  hudIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  hudText: {
    fontWeight: "800",
    color: "#E0F2FE",
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pauseLabel: {
    fontWeight: "900",
    color: "#FFFFFF",
    fontSize: 14,
  },

  // Play Area
  playArea: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  
  // Game Elements
  shark: {
    position: "absolute",
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  sharkBody: {
    fontSize: 50,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  
  trash: {
    position: "absolute",
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },
  trashBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  trashEmoji: {
    fontSize: 30,
  },
  
  // Bins Area
  boat: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.22,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  boatBody: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent", // Removed boat look, now just bins on sea floor/dock
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  binWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: SCREEN_WIDTH / 5.5,
  },
  bin: {
    width: 60,
    height: 70,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 5,
  },
  binLid: {
    position: "absolute",
    top: -5,
    width: 64,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  binIcon: {
    fontSize: 28,
    marginBottom: 2,
  },
  binLabel: {
    fontWeight: "800",
    color: "#FFFFFF",
    fontSize: 10,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    gap: 6,
  },
  secondaryText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 14,
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
    backdropFilter: "blur(10px)", // Works on some versions/web
  },
  overlayCard: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: "#1e293b",
    borderRadius: 30,
    padding: 30,
    gap: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#38bdf8",
    textAlign: "center",
    marginBottom: 10,
  },
  overlayText: {
    color: "#cbd5e1",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  cta: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 10,
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
});

