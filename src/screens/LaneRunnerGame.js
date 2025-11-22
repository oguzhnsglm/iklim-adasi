import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Platform, PanResponder } from "react-native";
import soundManager from '../utils/sounds';

const { width, height } = Dimensions.get('window');

export default function LaneRunnerGame({ onBack }) {
  const [phase, setPhase] = useState("TUTORIAL");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(100);
  const [playerLane, setPlayerLane] = useState(0); // 0 = sol, 1 = sağ
  const [items, setItems] = useState([]);
  
  const stateRef = useRef({ phase, playerLane, items, lives, score });
  const gameLoop = useRef(null);
  const itemSpawnTimer = useRef(null);

  // Swipe gesture için PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => Platform.OS !== 'web' && phase === "RUNNING",
      onMoveShouldSetPanResponder: () => Platform.OS !== 'web' && phase === "RUNNING",
      onPanResponderRelease: (evt, gestureState) => {
        if (Platform.OS === 'web' || phase !== "RUNNING") return;
        
        const { dx } = gestureState;
        const minSwipeDistance = 30;
        
        // Sadece yatay kaydırma (sağ/sol)
        if (Math.abs(dx) > minSwipeDistance) {
          if (dx > 0) {
            // Sağa kaydırma
            setPlayerLane(1);
          } else {
            // Sola kaydırma
            setPlayerLane(0);
          }
        }
      }
    })
  ).current;

  useEffect(() => {
    stateRef.current = { phase, playerLane, items, lives, score };
  }, [phase, playerLane, items, lives, score]);

  const GOOD_ITEMS = [
    { icon: '🍎', name: 'Apple' },
    { icon: '🍌', name: 'Banana' },
    { icon: '🥕', name: 'Carrot' },
    { icon: '🌿', name: 'Leaf' },
    { icon: '🌳', name: 'Tree' }
  ];

  const BAD_ITEMS = [
    { icon: '🥤', name: 'Plastic' },
    { icon: '📄', name: 'Paper' },
    { icon: '🍾', name: 'Glass' },
    { icon: '🧴', name: 'Bottle' },
    { icon: '🛢️', name: 'Oil' }
  ];

  const spawnItem = () => {
    if (stateRef.current.phase !== "RUNNING") return;
    
    const lane = Math.random() > 0.5 ? 1 : 0;
    const isGood = Math.random() > 0.5;
    const itemList = isGood ? GOOD_ITEMS : BAD_ITEMS;
    const item = itemList[Math.floor(Math.random() * itemList.length)];
    
    const newItem = {
      id: Date.now() + Math.random(),
      lane: lane,
      y: -50,
      icon: item.icon,
      isGood: isGood
    };
    
    setItems(prev => [...prev, newItem]);
  };

  useEffect(() => {
    if (phase !== "RUNNING") return;

    // Süre sayacı
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

    // Item spawn
    itemSpawnTimer.current = setInterval(() => {
      spawnItem();
    }, 2000);

    // Oyun döngüsü - itemleri hareket ettir
    gameLoop.current = setInterval(() => {
      const { items: currentItems, playerLane: pLane, lives: lv, score: sc } = stateRef.current;
      
      const newItems = currentItems.map(item => ({
        ...item,
        y: item.y + 5 // Aşağıya doğru hareket
      }));

      // Oyuncuyla çarpışma kontrolü
      newItems.forEach(item => {
        if (item.y > 300 && item.y < 400 && item.lane === pLane && !item.collected) {
          item.collected = true;
          
          if (item.isGood) {
            setScore(sc + 10);
            soundManager.playScore();
          } else {
            setLives(lv - 1);
            soundManager.playDamage();
            if (lv - 1 <= 0) {
              setPhase("ENDED");
            }
          }
        }
      });

      // Ekranın altından geçen itemleri ve toplanan itemleri kaldır
      const filteredItems = newItems.filter(item => item.y < height + 50 && !item.collected);
      setItems(filteredItems);
    }, 1000 / 60);

    return () => {
      clearInterval(timeInterval);
      clearInterval(itemSpawnTimer.current);
      clearInterval(gameLoop.current);
    };
  }, [phase]);

  // Klavye kontrolü
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleKeyPress = (e) => {
      if (phase !== "RUNNING") return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPlayerLane(0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPlayerLane(1);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [phase]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setTime(100);
    setPlayerLane(0);
    setItems([]);
    setPhase("RUNNING");
  };

  const getRank = () => {
    if (score >= 200) return { text: "Mükemmel!", color: "#FFD700" };
    if (score >= 150) return { text: "Çok İyi!", color: "#C0C0C0" };
    if (score >= 100) return { text: "İyi!", color: "#CD7F32" };
    return { text: "Daha İyi Olabilir!", color: "#888" };
  };

  return (
    <View style={styles.container}>
      {/* Tutorial */}
      {phase === "TUTORIAL" && (
        <View style={styles.overlay}>
          <View style={styles.tutorialBox}>
            <Text style={styles.tutorialTitle}>🏃 Yol Koşusu</Text>
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>🎮 NASIL OYNANIR?</Text>
              <Text style={styles.infoText}>• ← → Ok tuşları ile şerit değiştir</Text>
              <Text style={styles.infoText}>• Sağlıklı itemleri topla (+10 puan)</Text>
              <Text style={styles.infoText}>• Çöp itemlerinden kaçın (-1 can)</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>✅ SAĞLIKLI İTEMLER</Text>
              <Text style={styles.infoText}>🍎 🍌 🥕 🌿 🌳</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>❌ ÇÖP İTEMLER</Text>
              <Text style={styles.infoText}>🥤 📄 🍾 🧴 🛢️</Text>
            </View>
            <View style={styles.startButton} onStartShouldSetResponder={() => true} onResponderRelease={() => setPhase("RUNNING")}>
              <Text style={styles.startButtonText}>BAŞLA</Text>
            </View>
          </View>
        </View>
      )}

      {/* Oyun ekranı */}
      {phase === "RUNNING" && (
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
          {/* HUD */}
          <View style={styles.hud}>
            <Text style={styles.hudText}>❤️ {lives}</Text>
            <Text style={styles.hudText}>⏱️ {time}s</Text>
            <Text style={styles.hudText}>⭐ {score}</Text>
          </View>

          {/* Yol */}
          <View style={styles.road}>
            {/* Sol şerit */}
            <View style={[styles.lane, styles.leftLane]}>
              <View style={styles.laneMarker} />
            </View>
            
            {/* Sağ şerit */}
            <View style={[styles.lane, styles.rightLane]}>
              <View style={styles.laneMarker} />
            </View>

            {/* Oyuncu */}
            <View style={[styles.player, { left: playerLane === 0 ? '25%' : '75%' }]}>
              <Text style={styles.playerIcon}>🏃</Text>
            </View>

            {/* İtemler */}
            {items.map(item => (
              <View 
                key={item.id}
                style={[
                  styles.item,
                  { 
                    left: item.lane === 0 ? '25%' : '75%',
                    top: item.y
                  }
                ]}
              >
                <Text style={styles.itemIcon}>{item.icon}</Text>
              </View>
            ))}
          </View>

          {/* Geri butonu */}
          <View style={styles.backButton} onStartShouldSetResponder={() => true} onResponderRelease={onBack}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </View>
        </View>
      )}

      {/* Game Over */}
      {phase === "ENDED" && (
        <View style={styles.overlay}>
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverTitle}>OYUN BİTTİ!</Text>
            
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, { color: getRank().color }]}>
                {getRank().text}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statLabel}>Toplam Puan</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={styles.statLabel}>Kalan Can</Text>
                <Text style={styles.statValue}>{lives}</Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.retryButton} onStartShouldSetResponder={() => true} onResponderRelease={resetGame}>
                <Text style={styles.buttonText}>🔄 Tekrar Dene</Text>
              </View>
              <View style={styles.menuButton} onStartShouldSetResponder={() => true} onResponderRelease={onBack}>
                <Text style={styles.buttonText}>🏠 Ana Menü</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tutorialBox: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 450,
    maxHeight: '85%',
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  tutorialTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c5f2d',
    marginBottom: 20,
  },
  infoSection: {
    width: '100%',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c5f2d',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2c5f2d',
    marginTop: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hudText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  road: {
    flex: 1,
    backgroundColor: '#555',
    position: 'relative',
  },
  lane: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRightWidth: 2,
    borderColor: '#fff',
  },
  leftLane: {
    left: 0,
    backgroundColor: '#666',
  },
  rightLane: {
    right: 0,
    backgroundColor: '#666',
  },
  laneMarker: {
    position: 'absolute',
    width: 4,
    height: 40,
    backgroundColor: '#fff',
    left: '50%',
    marginLeft: -2,
  },
  player: {
    position: 'absolute',
    top: 350,
    marginLeft: -25,
    zIndex: 10,
  },
  playerIcon: {
    fontSize: 50,
  },
  item: {
    position: 'absolute',
    marginLeft: -20,
    zIndex: 5,
  },
  itemIcon: {
    fontSize: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 100, 100, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameOverBox: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 420,
    borderWidth: 4,
    borderColor: '#FF5722',
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 15,
  },
  rankContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5f2d',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E65100',
  },
  menuButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0D47A1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
