import React, { useEffect, useRef, useState } from "react";
import { View, PanResponder, useWindowDimensions, StyleSheet, Text } from "react-native";
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
  
  // Oyunun yatay oynanacağını varsayıyoruz
  const isPortrait = height > width;
  const gameW = isPortrait ? height : width;
  const gameH = isPortrait ? width : height;

  // --- FÜTÜRİSTİK ÇÖL ARKA PLANI ---
  const FuturisticDesertBackground = () => {
    
    // Yardımcı: Neon Dağlar (CSS Üçgenleri ile)
    const Mountain = ({ size, color, left, bottom }) => (
      <View style={{
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
        opacity: 0.8
      }} />
    );

    // Yardımcı: Neon Kaktüs
    const NeonCactus = ({ scale = 1, left, bottom }) => {
      const cactusColor = '#0f172a'; // Koyu gövde
      const glowColor = '#00ff9d';   // Neon yeşil kenar
      
      return (
        <View style={{ position: 'absolute', left, bottom, transform: [{ scale }] }}>
          {/* Ana Gövde */}
          <View style={{
            width: 20, height: 70, backgroundColor: cactusColor,
            borderWidth: 2, borderColor: glowColor, borderRadius: 10,
            shadowColor: glowColor, shadowOpacity: 0.8, shadowRadius: 10
          }} />
          {/* Sol Kol */}
          <View style={{
            position: 'absolute', top: 25, left: -12,
            width: 15, height: 10, borderBottomWidth: 2, borderLeftWidth: 2,
            borderColor: glowColor, borderBottomLeftRadius: 10, backgroundColor: cactusColor
          }} />
          <View style={{
            position: 'absolute', top: 15, left: -12,
            width: 15, height: 12, borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2,
            borderColor: glowColor, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: cactusColor
          }} />
          {/* Sağ Kol */}
          <View style={{
            position: 'absolute', top: 20, right: -12,
            width: 15, height: 10, borderBottomWidth: 2, borderRightWidth: 2,
            borderColor: glowColor, borderBottomRightRadius: 10, backgroundColor: cactusColor
          }} />
          <View style={{
            position: 'absolute', top: 10, right: -12,
            width: 15, height: 12, borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2,
            borderColor: glowColor, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: cactusColor
          }} />
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
          <View style={{ position: 'absolute', top: 0, width: '100%', height: '40%', backgroundColor: '#1a0524' }} />
          <View style={{ position: 'absolute', top: '40%', width: '100%', height: '30%', backgroundColor: '#2d1b4e' }} />
          <View style={{ position: 'absolute', top: '70%', width: '100%', height: '30%', backgroundColor: '#4a2b5e' }} />
        </View>

        {/* 2. YILDIZLAR (Basit noktalar) */}
        {[...Array(15)].map((_, i) => (
          <View key={i} style={{
            position: 'absolute',
            top: Math.random() * (gameH * 0.6),
            left: Math.random() * gameW,
            width: Math.random() * 3, height: Math.random() * 3,
            backgroundColor: '#fff', borderRadius: 2, opacity: Math.random()
          }} />
        ))}

        {/* 3. FÜTÜRİSTİK GÜNEŞ (Synthwave Sun) */}
        <View style={{
          position: 'absolute',
          bottom: GROUND_HEIGHT + 20, // Ufuk çizgisinin hemen üstü
          alignSelf: 'center',
          width: 200, height: 200,
          borderRadius: 100,
          backgroundColor: '#ff2a6d', // Neon Pembe/Kırmızı
          shadowColor: "#ff2a6d", shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6, shadowRadius: 40,
        }}>
          {/* Güneş içindeki çizgiler (Retro hissi için) */}
          <View style={{ position: 'absolute', bottom: 40, width: '100%', height: 6, backgroundColor: '#240b36', opacity: 0.3 }} />
          <View style={{ position: 'absolute', bottom: 25, width: '100%', height: 8, backgroundColor: '#240b36', opacity: 0.3 }} />
          <View style={{ position: 'absolute', bottom: 10, width: '100%', height: 10, backgroundColor: '#240b36', opacity: 0.3 }} />
        </View>

        {/* 4. SİLÜET DAĞLAR (Arka Plan) */}
        <Mountain size={100} color="#371a46" left={-50} bottom={GROUND_HEIGHT} />
        <Mountain size={140} color="#2d1238" left={gameW * 0.2} bottom={GROUND_HEIGHT} />
        <Mountain size={90} color="#371a46" left={gameW * 0.5} bottom={GROUND_HEIGHT} />
        <Mountain size={180} color="#2d1238" left={gameW * 0.7} bottom={GROUND_HEIGHT} />

        {/* 5. ZEMİN (Düz ve Modern) */}
        <View style={{
          position: 'absolute', bottom: 0, width: '100%', height: GROUND_HEIGHT,
          backgroundColor: '#100818', // Çok koyu mor/siyah zemin
          borderTopWidth: 2, borderTopColor: '#05d9e8', // Neon Mavi Ufuk Çizgisi
          shadowColor: "#05d9e8", shadowOpacity: 0.8, shadowRadius: 15, // Ufuk parlaması
        }}>
          {/* Zemin üzerindeki ızgara çizgisi (Grid) efekti - Perspektif hissi */}
          <View style={{ position: 'absolute', left: '10%', bottom: 0, width: 2, height: '100%', backgroundColor: '#05d9e8', opacity: 0.1 }} />
          <View style={{ position: 'absolute', left: '30%', bottom: 0, width: 2, height: '100%', backgroundColor: '#05d9e8', opacity: 0.1 }} />
          <View style={{ position: 'absolute', left: '50%', bottom: 0, width: 2, height: '100%', backgroundColor: '#05d9e8', opacity: 0.1 }} />
          <View style={{ position: 'absolute', left: '70%', bottom: 0, width: 2, height: '100%', backgroundColor: '#05d9e8', opacity: 0.1 }} />
          <View style={{ position: 'absolute', left: '90%', bottom: 0, width: 2, height: '100%', backgroundColor: '#05d9e8', opacity: 0.1 }} />
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
  
  const SLING_CONFIG = {
    maxDrag: 150,
    powerScale: 12,
    gravity: 1200,
    anchorX: 120,
    anchorY: gameH - GROUND_LEVEL - 80 // Sapanı zeminin biraz üstüne koy
  };

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(120);
  const [phase, setPhase] = useState("TUTORIAL");
  
  const [projectile, setProjectile] = useState(null);
  const [currentType, setCurrentType] = useState(TRASH_TYPES[0]);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  const lastTimeRef = useRef(null);
  const stateRef = useRef({ phase, projectile, currentType, isPortrait, lives });
  useEffect(() => {
    stateRef.current = { phase, projectile, currentType, isPortrait, lives };
  }, [phase, projectile, currentType, isPortrait, lives]);

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
        if (dist < 20) {
          setDragStart(null); setDragCurrent(null);
          return;
        }

        if (dist > SLING_CONFIG.maxDrag) {
          const r = SLING_CONFIG.maxDrag/dist; dx*=r; dy*=r;
        }

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

  useEffect(() => {
    if (phase === "TUTORIAL") return;
    if (phase !== "RUNNING") return;

    let raf;
    let lastT = 0;
    
    const loop = (t) => {
      if (!lastT) { lastT = t; }
      const dt = Math.min((t - lastT)/1000, 0.05);
      lastT = t;

      const { projectile: p, lives: l, phase: currentPhase } = stateRef.current;

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

        for (let bin of BINS) {
          // Kova ile çarpışma
          if (Math.hypot(x - bin.x, y - bin.y) < 45) {
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
  }, [phase, gameW, gameH]);

  const containerStyle = isPortrait ? {
    width: gameW, height: gameH,
    position: 'absolute',
    top: (height - gameH) / 2, left: (width - gameW) / 2,
    transform: [{ rotate: '90deg' }]
  } : { width: gameW, height: gameH };

  const renderTrajectory = () => {
    if (!dragCurrent) return null;
    
    const dx = dragCurrent.x - SLING_CONFIG.anchorX;
    const dy = dragCurrent.y - SLING_CONFIG.anchorY;
    
    const aimX = -dx;
    const aimY = -dy;
    
    const dist = Math.hypot(aimX, aimY);
    const powerRatio = Math.min(dist / SLING_CONFIG.maxDrag, 1.0);
    
    const hue = 120 - (powerRatio * 120);
    const color = `hsl(${hue}, 100%, 50%)`; // Neon renkler
    
    const angle = Math.atan2(aimY, aimX) * 180 / Math.PI;
    const arrowLen = 40 + (powerRatio * 100);

    const dots = [];
    const vx = aimX * SLING_CONFIG.powerScale;
    const vy = aimY * SLING_CONFIG.powerScale;
    
    for(let i=1; i<=8; i++) {
      const t = i * 0.15;
      const tx = SLING_CONFIG.anchorX + vx * t;
      const ty = SLING_CONFIG.anchorY + vy * t + 0.5 * SLING_CONFIG.gravity * t * t;
      
      dots.push(
        <View key={`dot-${i}`} style={{
          position: 'absolute', left: tx - 4, top: ty - 4,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: color, // İzler de renkli olsun
          opacity: 0.7,
          shadowColor: color, shadowOpacity: 1, shadowRadius: 5
        }} />
      );
    }

    return (
      <>
        <View style={{
          position: 'absolute',
          left: SLING_CONFIG.anchorX, top: SLING_CONFIG.anchorY,
          width: arrowLen, height: 0,
          transform: [{ rotate: `${angle}deg` }, { translateX: 0 }]
        }}>
           {/* Neon Ok */}
           <View style={{
             position: 'absolute', left: 0, top: -3,
             width: arrowLen, height: 6,
             backgroundColor: color, borderRadius: 3,
             opacity: 1,
             shadowColor: color, shadowOpacity: 1, shadowRadius: 10
           }} />
           <View style={{
             position: 'absolute', right: -5, top: -8,
             width: 0, height: 0,
             borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 14,
             borderTopColor: 'transparent', borderBottomColor: 'transparent',
             borderLeftColor: color
           }} />
        </View>
        {dots}
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#100818' }}>
      <FuturisticDesertBackground />
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
        
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
          {/* Kovalar */}
          {BINS.map((bin, i) => (
            <View key={i} style={{ position: 'absolute', left: bin.x - 35, top: bin.y - 35 }}>
              <Bin3D type={bin.type} style={{ width: 70, height: 70 }} />
            </View>
          ))}

          {renderTrajectory()}

          {/* Sapan Gövdesi - Fütüristik Metalik */}
          <View style={{ 
            position: 'absolute', 
            left: SLING_CONFIG.anchorX - 4, top: SLING_CONFIG.anchorY, 
            width: 8, height: 80, backgroundColor: '#718096', // Metalik Gri
            borderRadius: 4,
            borderWidth: 1, borderColor: '#fff'
          }} />
          
          {/* Lastikler - Enerji Hüzmesi Gibi */}
          {dragCurrent && (
            <View style={{
              position: 'absolute', left: SLING_CONFIG.anchorX, top: SLING_CONFIG.anchorY,
              width: Math.hypot(dragCurrent.x - SLING_CONFIG.anchorX, dragCurrent.y - SLING_CONFIG.anchorY),
              height: 3, backgroundColor: '#00ff9d', // Neon Yeşil Lastik
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