import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, PanResponder, useWindowDimensions, StyleSheet, Text, Platform } from "react-native";
import * as ScreenOrientation from 'expo-screen-orientation';
import soundManager from '../utils/sounds';
import {
  TRASH_TYPES,
  TRASH_CONFIG,
  Bin3D,
  TutorialModal,
  GameHUD,
  GameOverModal
} from './GameComponents';

export default function SlingshotGame({ onBack }) {
  const { width, height } = useWindowDimensions();
  
  // Dinamik boyutlandırma: gerçek render alanını ölç (özellikle landscape + cihaz inset'lerinde taşmayı engeller)
  const [gameLayout, setGameLayout] = useState({ w: width, h: height });
  const gameW = gameLayout.w;
  const gameH = gameLayout.h;

  const onGameLayout = (e) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (!w || !h) return;
    if (w === gameLayout.w && h === gameLayout.h) return;
    setGameLayout({ w, h });
  };

  // Sadece bu oyunda yatay kilit (diğer ekranlar etkilenmesin)
  const prevOrientationLockRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const prev = await ScreenOrientation.getOrientationLockAsync();
        if (!cancelled) prevOrientationLockRef.current = prev;
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch {
        // no-op: orientation lock supported olmayabilir
      }
    })();

    return () => {
      cancelled = true;
      (async () => {
        try {
          const prev = prevOrientationLockRef.current;
          if (prev != null) {
            await ScreenOrientation.lockAsync(prev);
          } else {
            await ScreenOrientation.unlockAsync();
          }
        } catch {
          // ignore
        }
      })();
    };
  }, []);

  // Drag sırasında sürekli re-render olunca Math.random() ile yıldızlar her kare değişiyordu (kasıyor).
  // Boyut değişmedikçe yıldızları sabitle.
  const stars = useMemo(() => {
    const count = 15;
    return Array.from({ length: count }, () => ({
      top: Math.random() * (gameH * 0.6),
      left: Math.random() * gameW,
      size: Math.max(1, Math.random() * 3),
      opacity: Math.random(),
    }));
  }, [gameW, gameH]);

  // --- FÜTÜRİSTİK ÇÖL ARKA PLANI (Neon tema) ---
  const FuturisticDesertBackground = () => {
    // Yardımcı: Neon Dağlar (CSS Üçgenleri ile)
    const Mountain = ({ size, color, left, bottom }) => (
      <View
        style={{
          position: 'absolute',
          left: left,
          bottom: bottom,
          width: 0,
          height: 0,
          borderLeftWidth: size,
          borderRightWidth: size,
          borderBottomWidth: size * 1.5,
          borderStyle: 'solid',
          backgroundColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          opacity: 0.8,
        }}
      />
    );

    // Yardımcı: Neon Kaktüs
    const NeonCactus = ({ scale = 1, left, bottom }) => {
      const cactusColor = '#0f172a'; // Koyu gövde
      const glowColor = '#00ff9d'; // Neon yeşil kenar

      return (
        <View style={{ position: 'absolute', left, bottom, transform: [{ scale }] }}>
          {/* Ana Gövde */}
          <View
            style={{
              width: 20,
              height: 70,
              backgroundColor: cactusColor,
              borderWidth: 2,
              borderColor: glowColor,
              borderRadius: 10,
              shadowColor: glowColor,
              shadowOpacity: 0.8,
              shadowRadius: 10,
            }}
          />
          {/* Sol Kol */}
          <View
            style={{
              position: 'absolute',
              top: 25,
              left: -12,
              width: 15,
              height: 10,
              borderBottomWidth: 2,
              borderLeftWidth: 2,
              borderColor: glowColor,
              borderBottomLeftRadius: 10,
              backgroundColor: cactusColor,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 15,
              left: -12,
              width: 15,
              height: 12,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderRightWidth: 2,
              borderColor: glowColor,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: cactusColor,
            }}
          />
          {/* Sağ Kol */}
          <View
            style={{
              position: 'absolute',
              top: 20,
              right: -12,
              width: 15,
              height: 10,
              borderBottomWidth: 2,
              borderRightWidth: 2,
              borderColor: glowColor,
              borderBottomRightRadius: 10,
              backgroundColor: cactusColor,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: -12,
              width: 15,
              height: 12,
              borderTopWidth: 2,
              borderRightWidth: 2,
              borderLeftWidth: 2,
              borderColor: glowColor,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: cactusColor,
            }}
          />
        </View>
      );
    };

    // Zemin Yüksekliği (%25)
    const GROUND_HEIGHT = gameH * 0.25;

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* 1. GÖKYÜZÜ (Derin Mor Gradyan Simülasyonu) */}
        <View style={{ flex: 1, backgroundColor: '#240b36' }}>
          {/* Katmanlı renk geçişleri */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '40%',
              backgroundColor: '#1a0524',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: '40%',
              width: '100%',
              height: '30%',
              backgroundColor: '#2d1b4e',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: '70%',
              width: '100%',
              height: '30%',
              backgroundColor: '#4a2b5e',
            }}
          />
        </View>

        {/* 2. YILDIZLAR (Basit noktalar) */}
        {stars.map((s, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              backgroundColor: '#fff',
              borderRadius: 2,
              opacity: s.opacity,
            }}
          />
        ))}

        {/* 3. FÜTÜRİSTİK GÜNEŞ (Synthwave Sun) */}
        <View
          style={{
            position: 'absolute',
            bottom: GROUND_HEIGHT + 20,
            alignSelf: 'center',
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: '#ff2a6d',
            shadowColor: '#ff2a6d',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 40,
          }}
        >
          {/* Güneş içindeki çizgiler (Retro hissi için) */}
          <View
            style={{
              position: 'absolute',
              bottom: 40,
              width: '100%',
              height: 6,
              backgroundColor: '#240b36',
              opacity: 0.3,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 25,
              width: '100%',
              height: 8,
              backgroundColor: '#240b36',
              opacity: 0.3,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              width: '100%',
              height: 10,
              backgroundColor: '#240b36',
              opacity: 0.3,
            }}
          />
        </View>

        {/* 4. SİLÜET DAĞLAR (Arka Plan) */}
        <Mountain size={100} color="#371a46" left={-50} bottom={GROUND_HEIGHT} />
        <Mountain size={140} color="#2d1238" left={gameW * 0.2} bottom={GROUND_HEIGHT} />
        <Mountain size={90} color="#371a46" left={gameW * 0.5} bottom={GROUND_HEIGHT} />
        <Mountain size={180} color="#2d1238" left={gameW * 0.7} bottom={GROUND_HEIGHT} />

        {/* 5. ZEMİN (Düz ve Modern) */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: GROUND_HEIGHT,
            backgroundColor: '#100818',
            borderTopWidth: 2,
            borderTopColor: '#05d9e8',
            shadowColor: '#05d9e8',
            shadowOpacity: 0.8,
            shadowRadius: 15,
          }}
        >
          {/* Zemin üzerindeki ızgara çizgisi (Grid) efekti */}
          <View
            style={{
              position: 'absolute',
              left: '10%',
              bottom: 0,
              width: 2,
              height: '100%',
              backgroundColor: '#05d9e8',
              opacity: 0.1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '30%',
              bottom: 0,
              width: 2,
              height: '100%',
              backgroundColor: '#05d9e8',
              opacity: 0.1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 0,
              width: 2,
              height: '100%',
              backgroundColor: '#05d9e8',
              opacity: 0.1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '70%',
              bottom: 0,
              width: 2,
              height: '100%',
              backgroundColor: '#05d9e8',
              opacity: 0.1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '90%',
              bottom: 0,
              width: 2,
              height: '100%',
              backgroundColor: '#05d9e8',
              opacity: 0.1,
            }}
          />
        </View>

        {/* 6. ÖN PLAN DEKORLARI (Neon Kaktüsler) */}
        <NeonCactus scale={1.2} left={50} bottom={GROUND_HEIGHT - 10} />
        <NeonCactus scale={0.8} left={gameW - 80} bottom={GROUND_HEIGHT - 5} />
        <NeonCactus scale={0.6} left={gameW * 0.3} bottom={GROUND_HEIGHT - 15} />
      </View>
    );
  };

  // Zemin Yüksekliğine göre ayarlar (Ekranın %25'i zemin)
  const GROUND_LEVEL = gameH * 0.25;
  
  // Sapan ayarları: basit ve tutarlı fizik
  const SLING_CONFIG = {
    maxDrag: 150,           // En fazla geriye çekme mesafesi
    powerScale: 10,         // Çekme mesafesini hız kuvvetine çevirme katsayısı
    gravity: 1100,          // Yer çekimi
    anchorX: 120,
    anchorY: gameH - GROUND_LEVEL - 80 // Sapanı zeminin biraz üstüne koy
  };

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(120);
  const [phase, setPhase] = useState("TUTORIAL");
  const [level, setLevel] = useState(1);
  const [hits, setHits] = useState(0);
  
  const [projectile, setProjectile] = useState(null);
  const [currentType, setCurrentType] = useState(TRASH_TYPES[0]);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  const lastTimeRef = useRef(null);
  const stateRef = useRef({ phase, projectile, currentType, lives, level });
  useEffect(() => {
    stateRef.current = { phase, projectile, currentType, lives, level };
  }, [phase, projectile, currentType, lives, level]);

  // Kovaları zemine oturt (Düz zemin)
  const startBinX = gameW * 0.45;
  const binSpacing = 75;
  // Bin Y pozisyonu: Ekran boyu - Zemin yüksekliği - Kova boyu + offset
  const binY = gameH - GROUND_LEVEL - 60; 
  
  const BINS = [
    { type: "plastic", x: startBinX, y: binY },
    { type: "paper", x: startBinX + binSpacing, y: binY },
    { type: "glass", x: startBinX + binSpacing * 2, y: binY },
    { type: "metal", x: startBinX + binSpacing * 3, y: binY },
    { type: "organic", x: startBinX + binSpacing * 4, y: binY },
  ];

  const BIN_HIT_PADDING = Platform.OS === 'web'
    ? 0
    : Math.min(26, Math.max(14, Math.round(Math.min(gameW, gameH) * 0.03)));

  const BIN_SIZE = Math.round(Math.max(70, Math.min(92, Math.min(gameW, gameH) * 0.12)));

  // Global ekran koordinatını oyun alanı lokal koordinatına çevir (yatay/dikey tutarlı)
  const panAreaRef = useRef(null);
  const panAreaWindowRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const rafDragRef = useRef(null);
  const pendingDragPointRef = useRef(null);

  const measurePanAreaInWindow = () => {
    if (!panAreaRef.current || typeof panAreaRef.current.measureInWindow !== 'function') return;
    panAreaRef.current.measureInWindow((x, y, w, h) => {
      panAreaWindowRef.current = { x, y, w, h };
    });
  };

  useEffect(() => {
    // Orientation/ekran boyutu değişince ölçümü yenile
    requestAnimationFrame(measurePanAreaInWindow);
    return () => {
      if (rafDragRef.current) {
        cancelAnimationFrame(rafDragRef.current);
        rafDragRef.current = null;
      }
    };
  }, [gameW, gameH]);

  const getLocalPointer = (evt, gestureState) => {
    const win = panAreaWindowRef.current;

    const pageX =
      (gestureState && typeof gestureState.moveX === 'number' ? gestureState.moveX : undefined) ??
      (evt?.nativeEvent && typeof evt.nativeEvent.pageX === 'number' ? evt.nativeEvent.pageX : undefined);
    const pageY =
      (gestureState && typeof gestureState.moveY === 'number' ? gestureState.moveY : undefined) ??
      (evt?.nativeEvent && typeof evt.nativeEvent.pageY === 'number' ? evt.nativeEvent.pageY : undefined);

    if (typeof pageX === 'number' && typeof pageY === 'number') {
      return { x: pageX - win.x, y: pageY - win.y };
    }

    // Fallback: zaten lokal gelen event'ler
    const { locationX, locationY } = evt?.nativeEvent || {};
    return {
      x: typeof locationX === 'number' ? locationX : SLING_CONFIG.anchorX,
      y: typeof locationY === 'number' ? locationY : SLING_CONFIG.anchorY,
    };
  };

  const launchFromPoint = (point) => {
    if (!point) return false;
    const { currentType } = stateRef.current;

    let dx = point.x - SLING_CONFIG.anchorX;
    let dy = point.y - SLING_CONFIG.anchorY;

    const dist = Math.hypot(dx, dy);
    if (dist < 10) return false;
    if (dist > SLING_CONFIG.maxDrag) {
      const ratio = SLING_CONFIG.maxDrag / dist;
      dx *= ratio;
      dy *= ratio;
    }

    const vx = -dx * SLING_CONFIG.powerScale;
    const vy = -dy * SLING_CONFIG.powerScale;

    setProjectile({
      x: SLING_CONFIG.anchorX,
      y: SLING_CONFIG.anchorY,
      vx,
      vy,
      type: currentType,
      active: true,
    });
    setCurrentType(TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)]);
    setDragStart(null);
    setDragCurrent(null);
    pendingDragPointRef.current = null;
    return true;
  };

  const getClampedDrag = (evt, gestureState) => {
    const { x: localX, y: localY } = getLocalPointer(evt, gestureState);

    let dx = localX - SLING_CONFIG.anchorX;
    let dy = localY - SLING_CONFIG.anchorY;

    const dist = Math.hypot(dx, dy);
    if (dist > SLING_CONFIG.maxDrag) {
      const ratio = SLING_CONFIG.maxDrag / dist;
      dx *= ratio;
      dy *= ratio;
    }

    return {
      dx,
      dy,
      dist,
      point: {
        x: SLING_CONFIG.anchorX + dx,
        y: SLING_CONFIG.anchorY + dy,
      },
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const { phase, projectile } = stateRef.current;
        return phase === "RUNNING" && !projectile;
      },
      onMoveShouldSetPanResponder: () => {
        const { phase, projectile } = stateRef.current;
        return phase === "RUNNING" && !projectile;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt, gestureState) => {
        measurePanAreaInWindow();
        const { point } = getClampedDrag(evt, gestureState);
        setDragStart({ x: SLING_CONFIG.anchorX, y: SLING_CONFIG.anchorY });
        setDragCurrent(point);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { point } = getClampedDrag(evt, gestureState);
        pendingDragPointRef.current = point;

        // Her move event'inde state set etmek yerine 60fps'e throttle et (kasıyı azaltır)
        if (!rafDragRef.current) {
          rafDragRef.current = requestAnimationFrame(() => {
            rafDragRef.current = null;
            if (pendingDragPointRef.current) setDragCurrent(pendingDragPointRef.current);
          });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (rafDragRef.current) {
          cancelAnimationFrame(rafDragRef.current);
          rafDragRef.current = null;
        }

        const { point } = getClampedDrag(evt, gestureState);
        const latestPoint = pendingDragPointRef.current || point || dragCurrent;
        const didLaunch = launchFromPoint(latestPoint);
        if (!didLaunch) {
          setDragStart(null);
          setDragCurrent(null);
          pendingDragPointRef.current = null;
        }
      },
      onPanResponderTerminate: () => {
        // iOS bazen pointer'ı cancel/terminate eder; drag başladıysa throw yap.
        const latestPoint = pendingDragPointRef.current || dragCurrent;
        const didLaunch = launchFromPoint(latestPoint);
        if (!didLaunch) {
          setDragStart(null);
          setDragCurrent(null);
          pendingDragPointRef.current = null;
        }
      }
    })
  ).current;

  useEffect(() => {
    if (phase === "TUTORIAL") return;
    if (phase !== "RUNNING") return;

    let raf;
    let lastT = 0;
    
    const loop = (t) => {
      if (!lastT) { lastT = t; }
      const dt = Math.min((t - lastT)/1000, 0.05);
      lastT = t;

      const { projectile: p, lives: l, phase: currentPhase, level: currentLevel } = stateRef.current;

      if (currentPhase !== "RUNNING") {
        cancelAnimationFrame(raf);
        return;
      }

      if (p && p.active) {
        let { x, y, vx, vy } = p;
        
        vy += SLING_CONFIG.gravity * dt;
        x += vx * dt;
        y += vy * dt;

        let hit = false;
        let newScore = 0;
        let lifeLost = false;

        // Zemin Çarpışması (Top yere düşerse)
        if (y > gameH - GROUND_LEVEL - 20) {
            setProjectile(null);
            // Yere düşerse ceza verilebilir veya sadece tur biter
            // lifeLost = true; // İsterseniz açabilirsiniz
            return;
        }

        const baseRadius = 45;
        const hitRadius = Math.max(25, baseRadius - (currentLevel - 1) * 4);

        for (let bin of BINS) {
          // Kova ile çarpışma
          if (Math.hypot(x - bin.x, y - bin.y) < (hitRadius + BIN_HIT_PADDING)) {
            if (vy > 0) { // Sadece düşerken girsin
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
            setHits((h) => {
              const next = h + 1;
              if (next % 4 === 0) {
                setLevel((lvl) => lvl + 1);
              }
              return next;
            });
            soundManager.playScore();
          }
          if (lifeLost) {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setPhase("ENDED");
              }
              return newLives;
            });
            soundManager.playDamage();
          }
          setProjectile(null);
        } else if (x > gameW + 50 || x < -50) {
           setProjectile(null);
        } else {
           setProjectile({ ...p, x, y, vx, vy });
        }
      }

      setTime(prev => {
        const speed = 1 + (currentLevel - 1) * 0.05;
        const n = prev - dt * speed;
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
  }, [phase, gameW, gameH]);
  
  const containerStyle = { flex: 1 };

  const renderTrajectory = () => {
    if (!dragCurrent) return null;
    
    const dx = dragCurrent.x - SLING_CONFIG.anchorX;
    const dy = dragCurrent.y - SLING_CONFIG.anchorY;

    const aimX = -dx;
    const aimY = -dy;

    const dist = Math.hypot(aimX, aimY);
    const powerRatio = Math.min(dist / SLING_CONFIG.maxDrag, 1.0);

    const hue = 120 - powerRatio * 120;
    const color = `hsl(${hue}, 100%, 50%)`; // Neon renkler

    const vx = aimX * SLING_CONFIG.powerScale;
    const vy = aimY * SLING_CONFIG.powerScale;
    const dots = [];

    let prevPoint = null;
    let lastPoint = null;
    const dotCount = 10;
    for (let i = 1; i <= dotCount; i++) {
      const t = i * 0.13;
      const tx = SLING_CONFIG.anchorX + vx * t;
      const ty = SLING_CONFIG.anchorY + vy * t + 0.5 * SLING_CONFIG.gravity * t * t;

      prevPoint = lastPoint;
      lastPoint = { x: tx, y: ty };

      dots.push(
        <View
          key={`dot-${i}`}
          style={{
            position: 'absolute',
            left: tx - 4,
            top: ty - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            opacity: 0.25 + (i / dotCount) * 0.55,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 6,
            zIndex: 20,
          }}
        />
      );
    }

    const headSize = 14;
    const headAngle = prevPoint && lastPoint
      ? Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x)
      : Math.atan2(vy, vx);

    return (
      <>
        {dots}
        {!!lastPoint && (
          <View
            style={{
              position: 'absolute',
              left: lastPoint.x - headSize / 2,
              top: lastPoint.y - headSize / 2,
              width: headSize,
              height: headSize,
              transform: [{ rotate: `${headAngle}rad` }],
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: headSize * 0.15,
                top: headSize * 0.15,
                width: 0,
                height: 0,
                borderTopWidth: headSize * 0.35,
                borderBottomWidth: headSize * 0.35,
                borderLeftWidth: headSize * 0.55,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: color,
                shadowColor: color,
                shadowOpacity: 0.9,
                shadowRadius: 8,
              }}
            />
          </View>
        )}
      </>
    );
  };

  const backgroundEl = useMemo(() => <FuturisticDesertBackground />, [gameW, gameH, stars]);

  return (
    <View style={{ flex: 1, backgroundColor: '#100818' }} onLayout={onGameLayout}>
      {backgroundEl}
      <View style={containerStyle}>
        {phase === "TUTORIAL" && (
            <TutorialModal 
            title="Neon Çöl Basketi"
            instructions={[
              "🏀 Atıkları sürükle ve fırlat",
              "🎯 Doğru renkli kovayı tuttur",
              "🏜️ Fütüristik çölde temizlik yap",
              "❤️ 3 canın var, dikkatli nişan al!",
              "📱 Telefonu yatay tut"
            ]}
            onStart={() => setPhase("RUNNING")}
          />
        )}
        <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
        {/* Seviye etiketi */}
        <View style={{ position: 'absolute', top: 50, alignSelf: 'center', padding: 6, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Seviye {level}</Text>
        </View>
        
        <View
          ref={panAreaRef}
          collapsable={false}
          onLayout={measurePanAreaInWindow}
          style={{ flex: 1, ...(Platform.OS === 'web' ? { touchAction: 'none' } : {}) }}
          {...panResponder.panHandlers}
        >
          {/* Kovalar */}
          {BINS.map((bin, i) => (
            <View key={i} style={{ position: 'absolute', left: bin.x - BIN_SIZE / 2, top: bin.y - BIN_SIZE / 2 }}>
              <Bin3D type={bin.type} style={{ width: BIN_SIZE, height: BIN_SIZE }} />
            </View>
          ))}

          {renderTrajectory()}

          {/* Sapan Gövdesi - Fütüristik Metalik */}
          <View style={{ 
            position: 'absolute', 
            left: SLING_CONFIG.anchorX - 4, top: SLING_CONFIG.anchorY, 
            width: 8, height: 80, backgroundColor: '#718096',
            borderRadius: 4,
            borderWidth: 1, borderColor: '#fff'
          }} />
          
          {/* Lastikler - Enerji Hüzmesi Gibi */}
          {dragCurrent && (
            <View style={{
              position: 'absolute', left: SLING_CONFIG.anchorX, top: SLING_CONFIG.anchorY,
              width: Math.hypot(dragCurrent.x - SLING_CONFIG.anchorX, dragCurrent.y - SLING_CONFIG.anchorY),
              height: 3, backgroundColor: '#00ff9d',
              shadowColor: '#00ff9d', shadowOpacity: 1, shadowRadius: 5,
              transformOrigin: 'left center',
              transform: [{ rotate: `${Math.atan2(dragCurrent.y - SLING_CONFIG.anchorY, dragCurrent.x - SLING_CONFIG.anchorX)}rad` }]
            }} />
          )}

          {/* Top (Sapan ucunda veya havada) */}
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
               setLevel(1);
               setHits(0);
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});