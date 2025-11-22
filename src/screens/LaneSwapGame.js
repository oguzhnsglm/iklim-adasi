import React, { useEffect, useRef, useState } from "react";
import { View, Platform, useWindowDimensions, StyleSheet, Text, Animated, Easing } from "react-native";
import soundManager from '../utils/sounds';
import {
  TRASH_TYPES,
  TRASH_CONFIG,
  Bin3D,
  TutorialModal,
  GameHUD,
  GameOverModal
} from './GameComponents';

// --- TEKİL BALIK BİLEŞENİ (Kendi döngüsü var) ---
const SwimmingFish = ({ width, height }) => {
  const animVal = useRef(new Animated.Value(0)).current;
  
  const fishProps = useRef({
    y: Math.random() * (height * 0.6) + (height * 0.15),
    type: ['🐠', '🐟', '🐡', '🦑'][Math.floor(Math.random() * 4)],
    direction: Math.random() > 0.5 ? 1 : -1,
    size: Math.random() * 20 + 25
  });

  const [seed, setSeed] = useState(0);

  const startCycle = () => {
    animVal.setValue(0);
    
    fishProps.current = {
      y: Math.random() * (height * 0.6) + (height * 0.15),
      type: ['🐠', '🐟', '🐡', '🦑'][Math.floor(Math.random() * 4)],
      direction: Math.random() > 0.5 ? 1 : -1,
      size: Math.random() * 20 + 25
    };
    
    setSeed(prev => prev + 1);

    const delay = Math.random() * 5000 + 2000; 
    const duration = Math.random() * 8000 + 6000; 

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

  const { y, type, direction, size } = fishProps.current;
  
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
          { scaleX: direction === 1 ? -1 : 1 }
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
  
  const bubbleProps = useRef({
    x: Math.random() * width,
    size: Math.random() * 30 + 30,
  });

  const [seed, setSeed] = useState(0);

  const startCycle = () => {
    animVal.setValue(0);

    bubbleProps.current = {
      x: Math.random() * width,
      size: Math.random() * 30 + 30
    };
    setSeed(prev => prev + 1);

    const delay = Math.random() * 8000 + 1000;
    const duration = Math.random() * 6000 + 4000;

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
    outputRange: [0, -height - 100]
  });

  const opacity = animVal.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.6, 0.6, 0]
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

// --- ANA ARKA PLAN BİLEŞENİ ---
const OceanBackground = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#001e36', overflow: 'hidden' }]}>
      
      {/* KATMAN 1: STATİK ARKA PLAN */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#001e36' }} />
      
      <View style={{
        position: 'absolute', top: -height * 0.3, left: -width * 0.1,
        width: width * 1.2, height: width * 1.2, borderRadius: width,
        backgroundColor: '#006994', opacity: 0.3, transform: [{ scaleX: 1.5 }]
      }} />

      <View style={{
        position: 'absolute', top: -50, left: width * 0.3,
        width: 80, height: height, backgroundColor: 'rgba(255,255,255,0.03)',
        transform: [{ rotate: '15deg' }]
      }} />
      <View style={{
        position: 'absolute', top: -50, left: width * 0.6,
        width: 100, height: height, backgroundColor: 'rgba(255,255,255,0.02)',
        transform: [{ rotate: '25deg' }]
      }} />

      {/* KATMAN 2: BAĞIMSIZ BALONCUKLAR */}
      {[...Array(8)].map((_, i) => (
        <RisingBubble key={`bubble-${i}`} width={width} height={height} />
      ))}

      {/* KATMAN 3: BAĞIMSIZ BALIKLAR */}
      {[...Array(5)].map((_, i) => (
        <SwimmingFish key={`fish-${i}`} width={width} height={height} />
      ))}

      {/* KATMAN 4: DENİZ TABANI */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end',
        paddingBottom: 5, opacity: 0.8
      }}>
        <Text style={{ fontSize: 40 }}>🪸</Text>
        <Text style={{ fontSize: 30 }}>🌿</Text>
        <Text style={{ fontSize: 45 }}>🪸</Text>
        <Text style={{ fontSize: 35 }}>🌿</Text>
        <Text style={{ fontSize: 25 }}>🐚</Text>
      </View>
    </View>
  );
};

export default function LaneSwapGame({ onBack }) {
  const { width, height } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(100);
  const [phase, setPhase] = useState("TUTORIAL");
  
  const [binOrder, setBinOrder] = useState([...TRASH_TYPES]);
  const [selectedBin, setSelectedBin] = useState(null);
  
  const [items, setItems] = useState([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  
  const spawnTimerRef = useRef(0);
  const lastTimeRef = useRef(null);

  const spawnItem = () => {
    const type = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
    
    let randomLane;
    do {
      randomLane = Math.floor(Math.random() * 5);
    } while (binOrder[randomLane] === type);
    
    const newItem = {
      id: `${Date.now()}`,
      type,
      lane: randomLane,
      y: -60,
      speed: (height + 60) / 2.5
    };
    
    setItems(prev => [...prev, newItem]);
  };

  const handleBinClick = (index) => {
    if (selectedBin === null) {
      setSelectedBin(index);
      soundManager.playScore();
    } else if (selectedBin === index) {
      setSelectedBin(null);
    } else {
      const newOrder = [...binOrder];
      [newOrder[selectedBin], newOrder[index]] = [newOrder[index], newOrder[selectedBin]];
      setBinOrder(newOrder);
      setSelectedBin(null);
      soundManager.playScore();
    }
  };

  useEffect(() => {
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
          spawnTimerRef.current = 2.5;
        }

        setItems(prev => {
          const next = [];
          let itemRemoved = false;
          
          for (let i = 0; i < prev.length; i++) {
            const item = { ...prev[i] };
            item.y += item.speed * dt;
            
            if (item.y > height - 150) {
              if (binOrder[item.lane] === item.type) {
                setScore(s => s + 10);
                soundManager.playScore();
              } else {
                setLives(l => l - 1);
                soundManager.playDamage();
              }
              
              if (i === 0) {
                itemRemoved = true;
              }
            } else {
              next.push(item);
            }
          }
          
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
    // Arka plan rengi okyanus mavisi ile uyumlu olacak şekilde güncellendi
    <View style={{ flex: 1, backgroundColor: '#001e36' }}>
      <OceanBackground />
      <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
      
      {phase === "TUTORIAL" && (
        <TutorialModal 
          title="Şerit Değiştir"
          instructions={[
            "🗑️ Kovaları tıklayarak yerlerini değiştir",
            "📦 Düşen atığı doğru kovaya yönlendir",
            "✅ Doğru kova → +10 Puan",
            "❌ Yanlış kova → -1 Can",
            "⏱️ 100 saniye içinde maksimum puan!"
          ]}
          onStart={() => setPhase("RUNNING")}
        />
      )}
      
      {/* Şerit Çizgileri (Arka planın önünde, itemlerin arkasında) */}
      <View style={{ flexDirection: 'row', flex: 1, opacity: 0.3 }}>
        {[0,1,2,3,4].map(i => (
          <View key={i} style={{ flex: 1, borderRightWidth: i<4?1:0, borderColor: 'rgba(255,255,255,0.2)' }} />
        ))}
      </View>

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

      <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', height: 100, alignItems: 'flex-end' }}>
        {binOrder.map((type, i) => (
          <View key={i} style={{ flex: 1, padding: 2 }}>
            <Bin3D 
              type={type}
              style={{ width: '100%' }}
              onClick={() => handleBinClick(i)}
              isSelected={selectedBin === i}
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
        setBinOrder([...TRASH_TYPES]);
        setSelectedBin(null);
        spawnTimerRef.current = 0;
        lastTimeRef.current = null;
        setPhase("TUTORIAL");
      }} onMenu={onBack} />}
    </View>
  );
}