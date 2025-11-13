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
  glass: {
    type: "glass",
    label: "CAM",
    x: SCREEN_WIDTH * 0.15,
    y: SCREEN_HEIGHT * 0.78,
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_HEIGHT * 0.15,
    color: "#10B981",
  },
  plastic: {
    type: "plastic",
    label: "PLASTİK",
    x: SCREEN_WIDTH * 0.55,
    y: SCREEN_HEIGHT * 0.78,
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_HEIGHT * 0.15,
    color: "#3B82F6",
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
const spawnTrash = () => ({
  id: `trash-${Math.random().toString(36).slice(2)}`,
  type: Math.random() > 0.5 ? "glass" : "plastic",
  x: rand(SCREEN_WIDTH * 0.15, SCREEN_WIDTH * 0.85),
  y: -80,  // Ekranın üstünden başlar
  rotation: rand(0, 360),
  bobPhase: rand(0, Math.PI * 2),
  dragging: false,   // Sürükleniyor mu?
  startX: 0,         // Sürükleme başlangıç pozisyonu
  startY: 0,
  touchStartX: 0,    // Dokunma başlangıç noktası
  touchStartY: 0,
  inBoat: false,
  targetBin: null,
});

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
  }, []);

  useEffect(() => {
    resetGame();
    setPhase("TUTORIAL");
  }, [resetGame]);

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
    draggingTrashRef.current = null;
    
    // Çöpün merkez noktasını kullanarak çarpışma kontrolü yap
    const trashCenterX = trash.x;
    const trashCenterY = trash.y;
    
    // Daha geniş çarpışma alanı - merkez noktası kova içindeyse kabul et
    const glassHit = trashCenterX >= BINS.glass.x && 
                     trashCenterX <= BINS.glass.x + BINS.glass.width &&
                     trashCenterY >= BINS.glass.y && 
                     trashCenterY <= BINS.glass.y + BINS.glass.height;
                     
    const plasticHit = trashCenterX >= BINS.plastic.x && 
                       trashCenterX <= BINS.plastic.x + BINS.plastic.width &&
                       trashCenterY >= BINS.plastic.y && 
                       trashCenterY <= BINS.plastic.y + BINS.plastic.height;
    
    if ((glassHit && trash.type === "glass") || (plasticHit && trash.type === "plastic")) {
      // Doğru kovaya atıldı
      trash.inBoat = true;
      trash.targetBin = trash.type === "glass" ? BINS.glass : BINS.plastic;
      
      const multiplier = COMBOS[comboIndexRef.current];
      const gained = 10 * multiplier;
      scoreRef.current += gained;
      comboIndexRef.current = Math.min(comboIndexRef.current + 1, COMBOS.length - 1);
      
      setScoreState(Math.round(scoreRef.current));
      setComboState(`x${multiplier.toFixed(1)}`);
      
      setTimeout(() => {
        trashRef.current = trashRef.current.filter((t) => t.id !== trash.id);
      }, 300);
    } else if (glassHit || plasticHit) {
      // Yanlış kovaya atıldı - combo sıfırla
      comboIndexRef.current = 0;
      setComboState("x1.0");
    }
  }, [phase]);

  // Köpekbalığına tıklama - hasar al
  const handleSharkPress = useCallback((shark) => {
    if (phase !== "RUNNING" || shark.hit) return;
    
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
        // Kovaya doğru animasyon
        const dx = item.targetBin.x - item.x;
        const dy = item.targetBin.y - item.y;
        item.x += dx * delta * 8;
        item.y += dy * delta * 8;
        item.rotation += 360 * delta * 2;
        return;
      }
      
      if (item.dragging) {
        // Sürüklenirken hareket etme
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
      {/* HUD: Süre, skor, combo, can ve duraklat butonu */}
      <View style={styles.hudRow}>
        <Text style={styles.hudText}>⏱ {timeState}s</Text>
        <Text style={styles.hudText}>🎯 {scoreState}</Text>
        <Text style={styles.hudText}>🔥 {comboState}</Text>
        <Text style={styles.hudText}>❤️ {hpState}</Text>
        <TouchableOpacity style={styles.pauseButton} onPress={handlePauseToggle}>
          <Text style={styles.pauseLabel}>{phase === "PAUSED" ? "▶" : "||"}</Text>
        </TouchableOpacity>
      </View>

      {/* Oyun alanı: Su akıyor, kayık gidiyor */}
      <View style={styles.playArea}>
        {/* Akan su dalgaları (yukarıdan aşağıya) */}
        {wavesSnapshot.map((wave) => (
          <View
            key={wave.id}
            style={[
              styles.waveStripe,
              {
                top: wave.y,
                left: wave.x,
              },
            ]}
          />
        ))}

        {/* Köpekbalıkları (tehlikeli! - yukarıdan aşağıya kayıyor) */}
        {sharksSnapshot.map((shark) => (
          <TouchableOpacity
            key={shark.id}
            activeOpacity={0.7}
            onPress={() => handleSharkPress(shark)}
            style={[
              styles.shark,
              {
                left: shark.x - 35,
                top: shark.y - 25,
                transform: [{ rotate: `${shark.rotation}deg` }],
                opacity: shark.hit ? 0.3 : 1,
              },
            ]}
          >
            <Text style={styles.sharkEmoji}>🦈</Text>
          </TouchableOpacity>
        ))}

        {/* Çöpler (yukarıdan aşağıya kayıyor - sürüklenebilir) */}
        {trashSnapshot.map((item) => {
          return (
            <View
              key={item.id}
              onStartShouldSetResponder={() => phase === "RUNNING" && !item.inBoat}
              onResponderGrant={(evt) => {
                if (phase === "RUNNING" && !item.inBoat) {
                  item.dragging = true;
                  item.startX = item.x;
                  item.startY = item.y;
                  item.touchStartX = evt.nativeEvent.pageX;
                  item.touchStartY = evt.nativeEvent.pageY;
                  draggingTrashRef.current = item;
                }
              }}
              onResponderMove={(evt) => {
                if (phase === "RUNNING" && item.dragging) {
                  const dx = evt.nativeEvent.pageX - item.touchStartX;
                  const dy = evt.nativeEvent.pageY - item.touchStartY;
                  item.x = item.startX + dx;
                  item.y = item.startY + dy;
                }
              }}
              onResponderRelease={() => {
                if (phase === "RUNNING" && item.dragging) {
                  handleTrashRelease(item);
                }
              }}
              style={[
                styles.trash,
                {
                  left: item.x - 30,
                  top: item.y - 40,
                  transform: [{ rotate: `${item.rotation}deg` }],
                  opacity: item.dragging ? 0.8 : item.inBoat ? 0.6 : 1,
                  zIndex: item.inBoat ? 100 : item.dragging ? 50 : 10,
                },
              ]}
            >
              {/* Şişe görünümü */}
              <View
                style={[
                  styles.bottle,
                  {
                    backgroundColor: item.type === "glass" ? "#10B981" : "#3B82F6",
                    borderColor: item.type === "glass" ? "#065F46" : "#1E3A8A",
                  },
                ]}
              >
                {/* Şişe kapağı */}
                <View
                  style={[
                    styles.bottleCap,
                    {
                      backgroundColor: item.type === "glass" ? "#047857" : "#1E40AF",
                    },
                  ]}
                />
                {/* Şişe etiketi */}
                <View style={styles.bottleLabel}>
                  <Text style={styles.bottleLabelText}>{item.type === "glass" ? "CAM" : "PET"}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Kayık (alt kısımda sabit) */}
        <View style={styles.boat}>
          {/* Kayık gövdesi */}
          <View style={styles.boatBody}>
            {/* Kayık kenarları (perspektif) */}
            <View style={styles.boatEdgeLeft} />
            <View style={styles.boatEdgeRight} />
            
            {/* Kayık tabanı */}
            <View style={styles.boatFloor} />
            
            {/* Kovalar (kayığın içinde) */}
            <View style={styles.binsContainer}>
              <View style={[styles.bin, { backgroundColor: BINS.glass.color }]}>
                <Text style={styles.binIcon}>♻️</Text>
                <Text style={styles.binLabel}>CAM</Text>
              </View>
              <View style={[styles.bin, { backgroundColor: BINS.plastic.color }]}>
                <Text style={styles.binIcon}>♻️</Text>
                <Text style={styles.binLabel}>PLASTİK</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Alt bar: Kontrol butonları */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={resetGame}>
          <Text style={styles.secondaryText}>Sıfırla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSoundOn((prev) => !prev)}>
          <Text style={styles.secondaryText}>{soundOn ? "Ses Açık" : "Ses Kapalı"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onExit}>
          <Text style={styles.secondaryText}>Menü</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay: Tutorial, Duraklat, Oyun Bitti */}
      {(phase === "PAUSED" || phase === "ENDED" || phase === "TUTORIAL") && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            {phase === "PAUSED" && <Text style={styles.overlayTitle}>Duraklatıldı</Text>}
            {phase === "ENDED" && <Text style={styles.overlayTitle}>Süre Bitti</Text>}
            {phase === "TUTORIAL" && (
              <>
                <Text style={styles.overlayTitle}>🚣 Nasıl Oynanır?</Text>
                <Text style={styles.overlayText}>Kayıkla suda gidiyorsun!</Text>
                <Text style={styles.overlayText}>🌊 Su akıyor, dalgalar geliyor</Text>
                <Text style={styles.overlayText}>� ŞİŞELERİ PARMAĞINLA SÜRÜKLE!</Text>
                <Text style={styles.overlayText}>♻️ Cam → Sol (yeşil), Plastik → Sağ (mavi)</Text>
                <Text style={styles.overlayText}>🦈 KÖPEKBALIĞIna TIKLA yoksa can gider! (❤️ -1)</Text>
                <Text style={styles.overlayText}>⚠️ Şişeleri kaçırırsan combo sıfırlanır!</Text>
              </>
            )}
            {phase === "PAUSED" && (
              <TouchableOpacity style={styles.cta} onPress={handlePauseToggle}>
                <Text style={styles.ctaText}>Devam Et</Text>
              </TouchableOpacity>
            )}
            {phase === "ENDED" && (
              <>
                <Text style={styles.overlayText}>Skor: {scoreState}</Text>
                <TouchableOpacity style={styles.cta} onPress={resetGame}>
                  <Text style={styles.ctaText}>Yeniden Oyna</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={onExit}>
                  <Text style={styles.secondaryText}>Menü</Text>
                </TouchableOpacity>
              </>
            )}
            {phase === "TUTORIAL" && (
              <TouchableOpacity style={styles.cta} onPress={handleTutorialStart}>
                <Text style={styles.ctaText}>Hazırım</Text>
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
    backgroundColor: "#0369A1",  // Derin deniz mavisi
    paddingTop: 40,
    paddingBottom: 10,
  },
  hudRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 8,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  hudText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 16,
  },
  pauseButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pauseLabel: {
    fontWeight: "800",
    color: "#FFFFFF",
    fontSize: 16,
  },
  playArea: {
    flex: 1,
    backgroundColor: "#0C4A6E",  // Derin su mavisi
    position: "relative",
    overflow: "hidden",
  },
  waveStripe: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 40,
  },
  boat: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.25,
    justifyContent: "flex-end",
  },
  boatBody: {
    width: "100%",
    height: "100%",
    backgroundColor: "#78350F",
    borderTopLeftRadius: SCREEN_WIDTH * 0.3,
    borderTopRightRadius: SCREEN_WIDTH * 0.3,
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  boatEdgeLeft: {
    position: "absolute",
    left: 20,
    top: 10,
    bottom: 30,
    width: 15,
    backgroundColor: "#451A03",
    borderRadius: 8,
  },
  boatEdgeRight: {
    position: "absolute",
    right: 20,
    top: 10,
    bottom: 30,
    width: 15,
    backgroundColor: "#451A03",
    borderRadius: 8,
  },
  boatFloor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#92400E",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  binsContainer: {
    position: "absolute",
    bottom: 35,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 60,
  },
  trash: {
    position: "absolute",
    width: 60,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  bottle: {
    width: 32,
    height: 50,
    borderRadius: 10,
    borderWidth: 3,
    justifyContent: "flex-start",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  bottleCap: {
    width: 22,
    height: 10,
    borderRadius: 5,
    marginTop: -3,
  },
  bottleLabel: {
    position: "absolute",
    top: "50%",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bottleLabelText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1F2937",
  },
  shark: {
    position: "absolute",
    width: 70,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  sharkEmoji: {
    fontSize: 50,
  },
  bin: {
    width: 90,
    height: 80,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  binIcon: {
    fontSize: 30,
    marginBottom: 2,
  },
  binLabel: {
    fontWeight: "800",
    color: "#FFFFFF",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  secondaryBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 13,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayCard: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    gap: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0369A1",
  },
  overlayText: {
    color: "#374151",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

