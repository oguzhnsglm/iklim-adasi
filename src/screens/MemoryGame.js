import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

// Gökyüzü Arka Plan Bileşeni
const SkyBackground = () => {
  const { width, height } = Dimensions.get('window');
  
  // Sabit bulutlar (hareket yok, sadece bulut)
  const clouds = [...Array(8)].map(() => ({
    left: Math.random() * width,
    top: Math.random() * height * 0.5,
    size: Math.random() * 30 + 20,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {clouds.map((cloud, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: cloud.size,
            left: cloud.left,
            top: cloud.top,
          }}
        >
          ☁️
        </Text>
      ))}
    </View>
  );
};

const ITEMS = [
  { id: 'plastic', icon: '🥤', label: 'Plastik' },
  { id: 'paper', icon: '📄', label: 'Kağıt' },
  { id: 'glass', icon: '🍾', label: 'Cam' },
  { id: 'metal', icon: '⚙️', label: 'Metal' },
  { id: 'organic', icon: '🍂', label: 'Organik' },
  { id: 'battery', icon: '🔋', label: 'Pil' },
  { id: 'newspaper', icon: '📰', label: 'Gazete' },
  { id: 'magazine', icon: '📕', label: 'Dergi' },
  { id: 'cardboard', icon: '📦', label: 'Karton' },
  { id: 'petbottle', icon: '🧴', label: 'Pet Şişe' },
  { id: 'plasticbox', icon: '🥡', label: 'Plastik Kap' },
  { id: 'glassbottle', icon: '🍶', label: 'Cam Şişe' },
  { id: 'sodabottle', icon: '🥤', label: 'Gazoz' },
  { id: 'can', icon: '🥫', label: 'Teneke' },
  { id: 'bag', icon: '🛍️', label: 'Poşet' },
  { id: 'textile', icon: '👕', label: 'Tekstil' },
  { id: 'electronic', icon: '📱', label: 'Elektronik' },
  { id: 'tire', icon: '🛞', label: 'Lastik' },
];

const { width } = Dimensions.get('window');

export default function MemoryGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(8);
  const [time, setTime] = useState(100);
  const [phase, setPhase] = useState("TUTORIAL"); // TUTORIAL | RUNNING | ENDED
  const timerRef = useRef(null);

  // Seviye 1: 6 kart (3 çift, 1 satır = 3 kart)
  // Her seviyede +3 çift (6 kart) eklenir → her seviye için 1 satır daha eklenmiş olur.
  const getTotalCards = (lvl) => {
    const total = 6 * lvl; // 3 kart x 2 (çift) x seviye
    return Math.min(total, ITEMS.length * 2);
  };

  const totalCards = getTotalCards(level);
  const pairsCount = Math.floor(totalCards / 2);
  const previewDuration = 2000 + level * 500; // Seviye arttıkça daha uzun önizleme

  useEffect(() => {
    initializeGame();
  }, [level]);

  // Önizleme süresi
  useEffect(() => {
    if (showPreview) {
      const timer = setTimeout(() => {
        setShowPreview(false);
      }, previewDuration);
      return () => clearTimeout(timer);
    }
  }, [showPreview]);

  useEffect(() => {
    if (phase !== "RUNNING") return;

    timerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setPhase("ENDED");
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  const initializeGame = () => {
    // Rastgele kartlar seç
    const selectedItems = ITEMS.slice(0, pairsCount);
    const pairs = [...selectedItems, ...selectedItems];
    
    // Kartları karıştır
    const shuffled = pairs
      .map((item, index) => ({ ...item, uniqueId: index, matched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsChecking(false);
    
    // İlk seviye için başlangıç değerleri
    if (level === 1) {
      setLives(8);
      setTime(100);
      setScore(0);
      setPhase("TUTORIAL");
    }
    // Seviye atlama için direkt devam et
    else {
      setPhase("RUNNING");
    }
    
    // Önce tüm kartları göster
    setShowPreview(true);
  };

  const handleCardPress = (index) => {
    if (
      isChecking ||
      showPreview ||
      phase !== "RUNNING" ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].id)
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.id === secondCard.id) {
        // Eşleşme var!
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.id]);
          setFlippedIndices([]);
          setIsChecking(false);
          setScore(score + (100 * level));

          // Tüm çiftler eşleşti mi?
          if (matchedPairs.length + 1 === pairsCount) {
            setTimeout(() => {
              setLevel(level + 1);
            }, 1000);
          }
        }, 600);
      } else {
        // Eşleşme yok, kartları geri çevir ve can azalt
        setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setPhase("ENDED");
            }
            return newLives;
          });
        }, 1000);
      }
    }
  };

  const isCardFlipped = (index) => {
    return showPreview || flippedIndices.includes(index) || matchedPairs.includes(cards[index].id);
  };

  // Her satırda tam 3 kart olacak şekilde, ekrana orantılı kart boyutu
  const columns = 3;
  const horizontalPadding = 40; // sol/sağ boşluk toplamı
  const gridWidth = width - horizontalPadding;
  const columnWidth = gridWidth / columns;

  // Seviye arttıkça kartları kademeli küçült (ör: 110, 102, 94, ... en az 70)
  const levelShrink = Math.max(0, level - 1);
  const maxSizeByLevel = 110 - levelShrink * 8;

  // Kart yüzü, sütun genişliğinden çok az küçük kare olsun (kartlar birbirine daha yakın)
  const maxSizeByColumn = columnWidth - 4;
  const cardSize = Math.max(70, Math.min(maxSizeByColumn, maxSizeByLevel));

  return (
    <View style={styles.container}>
      <SkyBackground />
      {/* Tutorial Modal */}
      {phase === "TUTORIAL" && (
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>🧩 HAFIZA OYUNU</Text>
            <View style={styles.tutorialInstructions}>
              <Text style={styles.tutorialText}>🎯 Aynı kartları eşleştir</Text>
              <Text style={styles.tutorialText}>⏱️ 100 saniye içinde bitir</Text>
              <Text style={styles.tutorialText}>❤️ 8 hakkın var</Text>
              <Text style={styles.tutorialText}>🌟 Yanlış eşleştirme can kaybettirir</Text>
              <Text style={styles.tutorialText}>🏆 Seviye atladıkça daha fazla kart!</Text>
            </View>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => {
                setPhase("RUNNING");
                setShowPreview(true);
              }}
            >
              <Text style={styles.startButtonText}>▶ Başla</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Game Over Modal */}
      {phase === "ENDED" && (
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>
              {lives <= 0 ? "💔 OYUN BİTTİ" : "⏰ SÜRE BİTTİ"}
            </Text>
            <View style={styles.tutorialInstructions}>
              <Text style={styles.gameOverText}>Seviye: {level}</Text>
              <Text style={styles.gameOverText}>Toplam Puan: {score}</Text>
              <Text style={styles.gameOverText}>Hamle: {moves}</Text>
            </View>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => setLevel(1)}
            >
              <Text style={styles.startButtonText}>🔄 Yeniden Başla</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: '#2d5f3f', marginTop: 10 }]}
              onPress={onBack}
            >
              <Text style={styles.startButtonText}>← Geri</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧩 HAFıZA OYUNU</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>❤️ Can</Text>
          <Text style={styles.statValue}>{lives}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>⏱️ Süre</Text>
          <Text style={styles.statValue}>{time}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Seviye</Text>
          <Text style={styles.statValue}>{level}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Puan</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
      </View>

      {/* Preview Message */}
      {showPreview && phase === "RUNNING" && (
        <View style={styles.previewMessage}>
          <Text style={styles.previewText}>🧠 Hafızanda Tut! 💪</Text>
        </View>
      )}

      {/* Cards Grid */}
      <View style={[styles.grid, { width: width - 40 }]}>
        {cards.map((card, index) => (
          <Card
            key={card.uniqueId}
            card={card}
            isFlipped={isCardFlipped(index)}
            onPress={() => handleCardPress(index)}
            size={cardSize}
            columnWidth={columnWidth}
          />
        ))}
      </View>
    </View>
  );
}

const Card = ({ card, isFlipped, onPress, size, columnWidth }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 1 : 0,
      friction: 10,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Kart açıldığında hafif büyüme, kapanırken normale dönüş (iOS tarzı yumuşak animasyon)
    Animated.spring(scaleAnim, {
      toValue: isFlipped ? 1.04 : 1,
      friction: 8,
      tension: 30,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const handlePress = () => {
    // Dokunmada küçük bir "tap" efekti
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: isFlipped ? 1.04 : 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.cardContainer, { width: columnWidth, height: size }]}
    >
      {/* Card Back (Kapalı Yüz) */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardBack,
          {
            width: size,
            height: size,
            opacity: frontOpacity,
            transform: [
              { scale: scaleAnim },
              { rotateY: frontInterpolate },
            ],
          },
        ]}
      >
        <Text style={[styles.cardBackIcon, { fontSize: size * 0.4 }]}>🌱</Text>
      </Animated.View>

      {/* Card Front (Açık Yüz) */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFront,
          {
            width: size,
            height: size,
            opacity: backOpacity,
            transform: [
              { scale: scaleAnim },
              { rotateY: backInterpolate },
            ],
          },
        ]}
      >
        <Text style={[styles.cardIcon, { fontSize: size * 0.5 }]}>{card.icon}</Text>
        <Text style={[styles.cardLabel, { fontSize: size * 0.12 }]}>{card.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Soft pastel arka plan (iOS tarzı)
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)', // Hafif şeffaf beyaz (glass effect hissi)
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(15,23,42,0.06)',
    borderRadius: 999,
  },
  backText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  placeholder: {
    width: 60,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  previewMessage: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 0,
    paddingVertical: 8,
  },
  cardContainer: {
    margin: 0,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24, // Daha yumuşak, iOS tarzı yuvarlatılmış köşeler
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: 'rgba(148,163,184,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  cardFront: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardBackIcon: {
    opacity: 0.4,
  },
  cardIcon: {
    marginBottom: 5,
  },
  cardLabel: {
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  restartBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 20,
  },
  restartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tutorialCard: {
    backgroundColor: '#2d5f3f',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 20,
  },
  tutorialInstructions: {
    gap: 12,
    marginBottom: 25,
  },
  tutorialText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  gameOverText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
