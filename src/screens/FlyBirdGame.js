import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BIRD_SIZE = 40;
const OBSTACLE_WIDTH = 80;
const GAP_SIZE = 200;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -8;
const OBSTACLE_SPEED = 2.5;
const POINTS_PER_OBSTACLE = 10;

export default function FlyBirdGame({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const hasSeenTutorial = useRef(false);
  
  const birdY = useRef(new Animated.Value(SCREEN_HEIGHT / 2 - 100)).current;
  const birdVelocity = useRef(0);
  const [obstacles, setObstacles] = useState([]);
  const gameLoop = useRef(null);
  const obstacleTimer = useRef(null);

  // Klavye desteği
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyPress = (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      startGame();
    }
    return () => {
      if (gameLoop.current) clearInterval(gameLoop.current);
      if (obstacleTimer.current) clearInterval(obstacleTimer.current);
    };
  }, [gameStarted, gameOver]);

  const startGame = () => {
    // İlk engelleri ekle - çöp yığınları
    setObstacles([
      { 
        x: SCREEN_WIDTH, 
        height: Math.random() * 250 + 200, 
        type: Math.floor(Math.random() * 3), 
        passed: false,
        id: Date.now() 
      },
    ]);

    // Engel oluşturma zamanlayıcısı
    obstacleTimer.current = setInterval(() => {
      setObstacles(prevObstacles => [
        ...prevObstacles,
        { 
          x: SCREEN_WIDTH, 
          height: Math.random() * 250 + 200, 
          type: Math.floor(Math.random() * 3), 
          passed: false,
          id: Date.now() + Math.random()
        }
      ]);
    }, 2500);

    // Ana oyun döngüsü
    gameLoop.current = setInterval(() => {
      // Yer çekimi uygula
      birdVelocity.current += GRAVITY;
      const newBirdY = birdY._value + birdVelocity.current;

      // Kuşu güncelle
      birdY.setValue(newBirdY);

      // Yere çarpma kontrolü
      if (newBirdY > SCREEN_HEIGHT - BIRD_SIZE - 80 || newBirdY < 0) {
        endGame();
        return;
      }

      // Engelleri hareket ettir
      setObstacles(prevObstacles => {
        const newObstacles = prevObstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - OBSTACLE_SPEED
        })).filter(obstacle => obstacle.x > -OBSTACLE_WIDTH);

        // Çarpışma kontrolü
        newObstacles.forEach(obstacle => {
          const birdX = 50;
          const birdLeft = birdX;
          const birdRight = birdX + BIRD_SIZE;
          const birdTop = newBirdY;
          const birdBottom = newBirdY + BIRD_SIZE;
          
          const obstacleLeft = obstacle.x;
          const obstacleRight = obstacle.x + OBSTACLE_WIDTH;
          const obstacleTop = SCREEN_HEIGHT - 80 - obstacle.height;
          const obstacleBottom = SCREEN_HEIGHT - 80;

          // Kuş engelin X pozisyonunda mı? (daha hassas kontrol)
          if (birdRight > obstacleLeft + 10 && birdLeft < obstacleRight - 10) {
            // Çöp yığınına çarptı mı? (daha hassas Y kontrolü)
            if (birdBottom > obstacleTop + 10) {
              endGame();
            }
          }

          // Skoru artır (engel geçildiğinde)
          if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < birdX) {
            obstacle.passed = true;
            setScore(s => s + 1);
          }
        });

        return newObstacles;
      });
    }, 1000 / 60); // 60 FPS
  };

  const jump = () => {
    if (showTutorial) {
      setShowTutorial(false);
      hasSeenTutorial.current = true;
      setGameStarted(true); // Tutorial kapanınca direkt oyunu başlat
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    if (gameOver) return;
    
    birdVelocity.current = JUMP_VELOCITY;
  };

  const endGame = () => {
    setGameOver(true);
    if (gameLoop.current) clearInterval(gameLoop.current);
    if (obstacleTimer.current) clearInterval(obstacleTimer.current);
  };

  const resetGame = () => {
    birdY.setValue(SCREEN_HEIGHT / 2 - 100);
    birdVelocity.current = 0;
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    // Tutorial sadece ilk girişte göster
    if (!hasSeenTutorial.current) {
      setShowTutorial(true);
    }
  };

  const calculateFinalScore = () => {
    return score * POINTS_PER_OBSTACLE;
  };

  return (
    <View style={styles.container}>
      {/* Arka plan - Gökyüzü */}
      <View style={styles.sky} />
      
      {/* Kuş */}
      <Animated.View 
        style={[
          styles.bird, 
          { 
            top: birdY,
          }
        ]}
      >
        <Text style={styles.birdEmoji}>🐤</Text>
      </Animated.View>

      {/* Çöp Yığınları */}
      {obstacles.map((obstacle, index) => {
        // Çöp türlerine göre emojiler
        const trashTypes = {
          0: ['🥤', '🧴', '🛍️'], // Plastik
          1: ['📄', '📰', '📦'], // Kağıt
          2: ['🍾', '🫙', '🥂'], // Cam
        };
        const emojis = trashTypes[obstacle.type];
        const itemCount = Math.floor(obstacle.height / 35);
        
        // Her engel için sabit pozisyonlar oluştur (seed olarak obstacle.id kullan)
        const getItemPosition = (i) => {
          const seed = (obstacle.id + i) % 1000;
          return {
            left: (i % 2) * 25 + (seed % 15),
            bottom: i * 30,
          };
        };
        
        return (
          <View 
            key={obstacle.id || index}
            style={[
              styles.trashPile,
              { 
                left: obstacle.x, 
                height: obstacle.height,
                bottom: 80,
              }
            ]}
          >
            {/* Çöp emojileri - yığın halinde */}
            {[...Array(itemCount)].map((_, i) => (
              <Text 
                key={i} 
                style={[
                  styles.trashItem,
                  { 
                    position: 'absolute',
                    ...getItemPosition(i),
                  }
                ]}
              >
                {emojis[i % 3]}
              </Text>
            ))}
          </View>
        );
      })}

      {/* Zemin */}
      <View style={styles.ground} />

      {/* Skor */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Geçilen Engel</Text>
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      {/* Tutorial Ekranı - Sadece ilk girişte */}
      {showTutorial && (
        <View style={styles.overlay}>
          <View style={styles.tutorialBox}>
            <Text style={styles.tutorialTitle}>🐤 UÇAN KUŞ</Text>
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>🎮 NASIL OYNANIR?</Text>
              <Text style={styles.infoText}>• BOŞLUK tuşuna basarak kuşu yukarı zıplat</Text>
              <Text style={styles.infoText}>• Çöp yığınlarına çarpmadan uç</Text>
              <Text style={styles.infoText}>• Her geçilen engel = 10 puan</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>♻️ ÇÖPLER</Text>
              <Text style={styles.infoText}>🥤 Plastik atıklar</Text>
              <Text style={styles.infoText}>📄 Kağıt atıklar</Text>
              <Text style={styles.infoText}>🍾 Cam atıklar</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>⚠️ UYARI</Text>
              <Text style={styles.infoText}>• Tek canın var!</Text>
              <Text style={styles.infoText}>• Yere düşersen oyun biter</Text>
            </View>
            <TouchableOpacity style={styles.startButton} onPress={jump}>
              <Text style={styles.startButtonText}>BAŞLA</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Başlangıç Ekranı - Tutorial sonrası */}
      {!gameStarted && !showTutorial && (
        <TouchableOpacity style={styles.overlay} onPress={jump} activeOpacity={1}>
          <View style={styles.messageBox}>
            <Text style={styles.title}>🐤 Hazır mısın?</Text>
            <Text style={styles.tap}>BOŞLUK TUŞU: Başla</Text>
            <TouchableOpacity style={styles.startButton} onPress={jump}>
              <Text style={styles.startButtonText}>BAŞLA</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {gameOver && (
        <View style={styles.overlay}>
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverTitle}>🚫 OYUN BİTTİ</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🏆</Text>
                <Text style={styles.statLabel}>Geçilen Engel</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statLabel}>Kazanılan Puan</Text>
                <Text style={styles.statValueBig}>{calculateFinalScore()}</Text>
              </View>
            </View>

            <View style={styles.messageContainer}>
              <Text style={styles.messageIcon}>🌍</Text>
              <Text style={styles.messageText}>
                Atıkları doğru ayrıştırarak{'\n'}
                çevreyi temiz tutalım!
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                <Text style={styles.buttonText}>🔄 Tekrar Dene</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.buttonText}>🏠 Ana Menü</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Geri Butonu */}
      {!gameOver && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
      )}

      {/* Dokunmatik kontrol (mobil için) */}
      {gameStarted && !gameOver && (
        <TouchableOpacity 
          style={styles.touchControl} 
          onPress={jump}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT - 80,
    backgroundColor: '#87CEEB',
  },
  bird: {
    position: 'absolute',
    left: 50,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birdEmoji: {
    fontSize: 40,
    transform: [{ scaleX: -1 }],
  },
  trashPile: {
    position: 'absolute',
    width: OBSTACLE_WIDTH,
  },
  trashItem: {
    fontSize: 32,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#8B7355',
    borderTopWidth: 3,
    borderTopColor: '#654321',
  },
  scoreContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
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
    padding: 20,
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
  gameOverBox: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 420,
    maxHeight: '80%',
    borderWidth: 4,
    borderColor: '#FF5722',
  },
  gameOverTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    gap: 15,
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
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5f2d',
  },
  statValueBig: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  messageIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  messageBox: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 320,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c5f2d',
    marginBottom: 20,
    textAlign: 'center',
  },
  tap: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2c5f2d',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E65100',
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0D47A1',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  touchControl: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 80,
  },
});
