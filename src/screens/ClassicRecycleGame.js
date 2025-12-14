import React, { useEffect, useRef, useState } from "react";
import { View, Platform, useWindowDimensions, Animated, Text, StyleSheet, Easing } from "react-native";
import soundManager from '../utils/sounds';
import {
  TRASH_TYPES,
  TRASH_CONFIG,
  Bin3D,
  TutorialModal,
  GameHUD,
  GameOverModal
} from './GameComponents';
import { useMascot } from '../context/MascotContext';

// --- TEKİL BALIK BİLEŞENİ (Kendi döngüsü var) ---
const SwimmingFish = ({ width, height }) => {
  // Animasyon değerleri
  const animVal = useRef(new Animated.Value(0)).current; // 0'dan 1'e hareket
  
  // Balığın o anki özellikleri (Ref içinde tutuyoruz ki re-render olmasın, performans artsın)
  const fishProps = useRef({
    y: Math.random() * (height * 0.6) + (height * 0.15),
    type: ['🐠', '🐟', '🐡', '🦑'][Math.floor(Math.random() * 4)],
    direction: Math.random() > 0.5 ? 1 : -1,
    size: Math.random() * 20 + 25
  });

  // Bu state sadece balık tipini/yönünü görsel olarak güncellemek için (animasyon bitince)
  const [seed, setSeed] = useState(0);

  const startCycle = () => {
    // 1. Pozisyonu ve özellikleri sıfırla/yenile
    animVal.setValue(0);
    
    fishProps.current = {
      y: Math.random() * (height * 0.6) + (height * 0.15), // Yüksekliği değiştir
      type: ['🐠', '🐟', '🐡', '🦑'][Math.floor(Math.random() * 4)], // Tipi değiştir
      direction: Math.random() > 0.5 ? 1 : -1, // Yönü değiştir
      size: Math.random() * 20 + 25
    };
    
    // Görsel güncellemeyi tetikle
    setSeed(prev => prev + 1);

    // 2. Rastgele bekleme süresi (Az az gelmesi için)
    const delay = Math.random() * 5000 + 2000; // 2sn ile 7sn arası bekle
    const duration = Math.random() * 8000 + 6000; // 6sn ile 14sn arası yüzme süresi

    // 3. Animasyonu başlat
    Animated.sequence([
      Animated.delay(delay), // Önce bekle
      Animated.timing(animVal, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      // 4. Animasyon bittiğinde (finished true ise) döngüyü tekrar başlat
      if (finished) {
        startCycle();
      }
    });
  };

  useEffect(() => {
    startCycle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { y, type, direction, size } = fishProps.current;
  
  // Yön ayarı: 1 ise (Sağa) soldan başla, -1 ise (Sola) sağdan başla
  const startX = direction === 1 ? -100 : width + 100;
  const endX = direction === 1 ? width + 100 : -100;

  const translateX = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, endX]
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        transform: [
          { translateX },
          { scaleX: direction === 1 ? -1 : 1 } // Yönüne göre çevir
        ],
        opacity: 0.9
      }}
    >
      <Text style={{ fontSize: size }}>{type}</Text>
    </Animated.View>
  );
};

// --- TEKİL BALONCUK BİLEŞENİ (Kendi döngüsü var) ---
const RisingBubble = ({ width, height }) => {
  const animVal = useRef(new Animated.Value(0)).current;
  
  // Baloncuk özellikleri
  const bubbleProps = useRef({
    x: Math.random() * width,
    size: Math.random() * 30 + 30, // Büyük boyut
  });

  const [seed, setSeed] = useState(0);

  const startCycle = () => {
    animVal.setValue(0);

    // Yeni konum belirle
    bubbleProps.current = {
      x: Math.random() * width,
      size: Math.random() * 30 + 30
    };
    setSeed(prev => prev + 1);

    // Rastgele bekleme (Seyrek gelmesi için)
    const delay = Math.random() * 8000 + 1000; // 1sn ile 9sn arası bekle
    const duration = Math.random() * 6000 + 4000; // Yavaşça çıksın

    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animVal, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      if (finished) {
        startCycle();
      }
    });
  };

  useEffect(() => {
    startCycle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { x, size } = bubbleProps.current;

  const translateY = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height - 100] // Aşağıdan (relative 0) yukarı ekran dışına
  });

  const opacity = animVal.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.6, 0.6, 0] // Yavaşça görün, sonra kaybol
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        bottom: -80,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        transform: [{ translateY }],
        opacity: opacity
      }}
    >
      {/* Baloncuk içi parlama efekti */}
      <View style={{
        position: 'absolute',
        top: size * 0.2,
        left: size * 0.2,
        width: size * 0.25,
        height: size * 0.15,
        borderRadius: size,
        backgroundColor: 'rgba(255,255,255,0.4)',
        transform: [{ rotate: '-45deg' }]
      }} />
    </Animated.View>
  );
};

// --- ANA ARKA PLAN BİLEŞENİ (Gerçekçi çöl teması) ---
const OceanBackground = () => {
  const { width, height } = useWindowDimensions();

  const skyHeight = height * 0.55;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#f4c583', overflow: 'hidden' }]}>
      {/* Gökyüzü gradyanı (basit iki tonlu) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: skyHeight,
          backgroundColor: '#87CEEB',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: skyHeight * 0.4,
          left: 0,
          right: 0,
          height: skyHeight * 0.8,
          backgroundColor: '#FDB77A',
          opacity: 0.6,
        }}
      />

      {/* Uzak kum tepeleri (arka plan katmanı) */}
      <View
        style={{
          position: 'absolute',
          bottom: height * 0.2,
          left: -width * 0.3,
          width: width * 1.6,
          height: height * 0.35,
          backgroundColor: '#F3BF86',
          borderTopLeftRadius: width,
          borderTopRightRadius: width,
        }}
      />

      {/* Orta mesafe kum tepesi */}
      <View
        style={{
          position: 'absolute',
          bottom: height * 0.1,
          left: -width * 0.2,
          width: width * 1.4,
          height: height * 0.3,
          backgroundColor: '#E6AD6A',
          borderTopLeftRadius: width,
          borderTopRightRadius: width,
        }}
      />

      {/* Ön plan kum zemini */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: -width * 0.1,
          width: width * 1.2,
          height: height * 0.25,
          backgroundColor: '#D89A50',
          borderTopLeftRadius: width,
          borderTopRightRadius: width,
        }}
      />

      {/* Minimal dekor (performans dostu, dikkat dağıtmayan) */}
      <View
        style={{
          position: 'absolute',
          bottom: height * 0.18,
          right: width * 0.15,
          opacity: 0.7,
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}
      >
        <Text style={{ fontSize: 32 }}>🌵</Text>
        <Text style={{ fontSize: 20, marginLeft: 6 }}>🌵</Text>
      </View>
    </View>
  );
};

export default function ClassicRecycleGame({ onBack }) {
  const { width, height } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(120);
  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState("TUTORIAL");
  const { celebrate } = useMascot();

  const lastTimeRef = useRef(null);
  const spawnTimerRef = useRef(0);
  const rafIdRef = useRef(null);

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
              setLives(l => Math.max(0, l - 1));
              soundManager.playDamage();
            }
          }
          return nextItems;
        });
        
        if (lives <= 0) setPhase("ENDED");
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = null;
    };
  }, [phase, score, lives, width, height]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f4c583' }}>
      <OceanBackground />
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
      
      <View style={{ flex: 1, position: 'relative' }} pointerEvents="box-none">
        {items.map((item, index) => (
          <DraggableItem 
            key={item.id} 
            item={item}
            baseZIndex={index}
            width={width}
            height={height}
            onDrop={(mouseX, mouseY, type, id) => {
              const binWidth = width / 5;
              const proximityRange = 75;
              
              for (let binIndex = 0; binIndex < 5; binIndex++) {
                const binCenterX = (binIndex * binWidth) + (binWidth / 2);
                const binCenterY = height - 100;
                const distance = Math.hypot(mouseX - binCenterX, mouseY - binCenterY);
                
                if (distance <= proximityRange) {
                  const targetType = TRASH_TYPES[binIndex];
                  if (targetType === type) {
                    setScore(s => s + 10);
                    soundManager.playScore();
                    setItems(prev => prev.filter(i => i.id !== id));
                    // Doğru ayrıştırmada maskot kutlaması
                    celebrate('correctAnswer');
                    return 'success';
                  } else {
                    setLives(l => l - 1);
                    soundManager.playDamage();
                    setItems(prev => prev.filter(i => i.id !== id));
                    // Yanlış kutuya atıldığında maskot tepkisi
                    celebrate('wrongAnswer');
                    return 'fail';
                  }
                }
              }
              return 'miss';
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 24, paddingHorizontal: 16 }}>
        {TRASH_TYPES.map(type => (
          <Bin3D key={type} type={type} style={{ width: width / 5.5 }} />
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
const DraggableItem = ({ item, baseZIndex, width, height, onDrop }) => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: item.x, y: item.y });
  const originalPos = useRef({ x: item.x, y: item.y });
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const ITEM_SIZE = Math.min(70, width * 0.18);

  useEffect(() => {
    if (!dragging) {
      setPosition({ x: item.x, y: item.y });
      originalPos.current = { x: item.x, y: item.y };
    }
  }, [item.x, item.y, dragging]);

  const startDragAt = (pageX, pageY) => {
    setDragging(true);
    setPosition({
      x: pageX - ITEM_SIZE / 2,
      y: pageY - ITEM_SIZE / 2,
    });
    Animated.spring(scale, {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();
  };

  const finishDragAt = (pageX, pageY) => {
    if (!dragging) return;

    const dropX = pageX;
    const dropY = pageY;

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
        }),
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
        }),
      ]).start();
      setPosition(originalPos.current);
    } else {
      setPosition(originalPos.current);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    startDragAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
  };

  const handleMouseUp = (e) => {
    finishDragAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
  };

  useEffect(() => {
    if (Platform.OS === 'web' && dragging) {
      const handleGlobalMouseMove = (e) => {
        setPosition({ 
          x: e.pageX - ITEM_SIZE / 2, 
          y: e.pageY - ITEM_SIZE / 2 
        });
      };
      const handleGlobalMouseUp = (e) => {
        finishDragAt(e.pageX, e.pageY);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [dragging, item.type, item.id, onDrop]);

  const cfg = TRASH_CONFIG[item.type];

  const handleResponderGrant = (e) => {
    const { pageX, pageY } = e.nativeEvent;
    startDragAt(pageX, pageY);
  };

  const handleResponderMove = (e) => {
    if (!dragging) return;
    const { pageX, pageY } = e.nativeEvent;
    setPosition({
      x: pageX - ITEM_SIZE / 2,
      y: pageY - ITEM_SIZE / 2,
    });
  };

  const handleResponderRelease = (e) => {
    const { pageX, pageY } = e.nativeEvent;
    finishDragAt(pageX, pageY);
  };

  return (
    <Animated.View
      onMouseDown={Platform.OS === 'web' ? handleMouseDown : undefined}
      onMouseUp={Platform.OS === 'web' ? handleMouseUp : undefined}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleResponderGrant}
      onResponderMove={handleResponderMove}
      onResponderRelease={handleResponderRelease}
      onResponderTerminate={handleResponderRelease}
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
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: ITEM_SIZE,
          height: ITEM_SIZE,
        }}
      >
        <Text style={{ fontSize: ITEM_SIZE * 0.7 }}>{cfg.icon}</Text>
      </View>
    </Animated.View>
  );
};