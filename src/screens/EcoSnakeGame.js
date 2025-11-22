import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from "react-native";

const GRID_SIZE = 25;
const TILE_COUNT = 16;
const GAME_SPEED = 250;

const COLORS = {
  boardLight: '#8D6E63',
  boardDark: '#795548',
  snakeBody: '#4674E9',
  snakeHead: '#1967D2',
};

const GOOD_ICONS = ['🍎', '🍌', '🍉', '🍇', '🥕'];
const BAD_ICONS = ['🔋', '🥤', '💊', '🧴', '🛢️'];

export default function EcoSnakeGame({ onBack }) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState("RUNNING"); // RUNNING, ENDED
  const [snake, setSnake] = useState([
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
    { x: 2, y: 10 }
  ]);
  const [direction, setDirection] = useState({ dx: 1, dy: 0 });
  const [nextDirection, setNextDirection] = useState({ dx: 1, dy: 0 });
  const [goodWaste, setGoodWaste] = useState({ x: 12, y: 10, icon: '🍎' });
  const [hazards, setHazards] = useState([]);
  const [isDamaged, setIsDamaged] = useState(false);

  const stateRef = useRef({ phase, snake, direction: nextDirection, goodWaste, hazards, lives, score });
  const moveIntervalRef = useRef(null);
  const hazardTimeoutsRef = useRef([]);

  useEffect(() => {
    stateRef.current = { phase, snake, direction: nextDirection, goodWaste, hazards, lives, score };
  }, [phase, snake, nextDirection, goodWaste, hazards, lives, score]);

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
    
    const timeout = setTimeout(() => {
      setHazards(prev => prev.filter(h => h.id !== hazard.id));
    }, 15000);
    hazardTimeoutsRef.current.push(timeout);
  };

  // Interval tabanlı hareket sistemi
  useEffect(() => {
    if (phase !== "RUNNING") return;

    const moveSnake = () => {
      const { snake: currentSnake, direction: dir, goodWaste: gw, hazards: hz, lives: lv, score: sc } = stateRef.current;

      setDirection(dir);
      const head = { x: currentSnake[0].x + dir.dx, y: currentSnake[0].y + dir.dy };

      // Duvar kontrolü
      if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        setPhase("ENDED");
        return;
      }

      // Kendine çarpma
      if (currentSnake.some(s => s.x === head.x && s.y === head.y)) {
        setPhase("ENDED");
        return;
      }

      const newSnake = [head, ...currentSnake];

      // İyi atık
      if (gw && head.x === gw.x && head.y === gw.y) {
        setScore(sc + 1);
        if (sc + 1 > stateRef.current.highScore) {
          setHighScore(sc + 1);
        }
        spawnGoodWaste();
      } else {
        newSnake.pop();
      }

      // Zararlı atık
      let hitHazard = false;
      const newHazards = hz.filter(h => {
        if (h.x === head.x && h.y === head.y) {
          hitHazard = true;
          setLives(prev => prev - 1);
          setIsDamaged(true);
          setTimeout(() => setIsDamaged(false), 500);
          return false;
        }
        return true;
      });

      if (hitHazard) {
        setHazards(newHazards);
        // Boyu kısalt
        if (newSnake.length > 2) {
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

    // Hazard spawn
    const hazardInterval = setInterval(() => {
      spawnHazard();
    }, 15000);

    return () => {
      clearInterval(moveIntervalRef.current);
      clearInterval(hazardInterval);
      hazardTimeoutsRef.current.forEach(t => clearTimeout(t));
      hazardTimeoutsRef.current = [];
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

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [phase]);

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>↩</Text>
        </TouchableOpacity>
        <View style={styles.statGroup}>
          <Text style={styles.icon}>🍎</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statGroup}>
          <Text style={styles.icon}>🏆</Text>
          <Text style={styles.statLabel}>En İyi:</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
        <View style={[styles.statGroup, { marginLeft: 'auto' }]}>
          <Text style={styles.icon}>❤️</Text>
          <Text style={styles.statValue}>{lives}</Text>
        </View>
      </View>

      {/* Game Area */}
      <View 
        style={styles.gameArea}
        onStartShouldSetResponder={() => Platform.OS !== 'web' && phase === "RUNNING"}
        onResponderRelease={(e) => {
          if (Platform.OS === 'web' || phase !== "RUNNING") return;
          
          const { locationX, locationY } = e.nativeEvent;
          const { width, height } = Dimensions.get('window');
          const centerX = width / 2;
          const centerY = height / 2;
          
          const dx = locationX - centerX;
          const dy = locationY - centerY;
          
          const { dx: curDx, dy: curDy } = stateRef.current.direction;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && curDx === 0) {
              setNextDirection({ dx: 1, dy: 0 });
            } else if (dx < 0 && curDx === 0) {
              setNextDirection({ dx: -1, dy: 0 });
            }
          } else {
            if (dy > 0 && curDy === 0) {
              setNextDirection({ dx: 0, dy: 1 });
            } else if (dy < 0 && curDy === 0) {
              setNextDirection({ dx: 0, dy: -1 });
            }
          }
        }}
      >
        <View style={[
          styles.gameBoard,
          isDamaged && styles.damageEffect
        ]}>
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
                backgroundColor: (row + col) % 2 === 0 ? COLORS.boardLight : COLORS.boardDark
              }} />
            );
          })}

          {/* Snake */}
          {snake.map((segment, i) => {
            const isHead = i === 0;
            return (
              <View
                key={`snake-${i}`}
                style={{
                  position: 'absolute',
                  left: segment.x * GRID_SIZE + (isHead ? 3 : 5),
                  top: segment.y * GRID_SIZE + (isHead ? 3 : 5),
                  width: GRID_SIZE - (isHead ? 6 : 10),
                  height: GRID_SIZE - (isHead ? 6 : 10),
                  borderRadius: (isHead ? GRID_SIZE - 6 : 3) / 2,
                  backgroundColor: isHead ? COLORS.snakeHead : COLORS.snakeBody,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: isHead ? 2 : 0,
                  borderColor: '#1967D2'
                }}
              >
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

        {/* Controls Hint */}
        <View style={styles.controlsHint}>
          <Text style={styles.hintText}>
            Yön Tuşları ile oyna | 🍌 = İyi | 🔋 = Kötü
          </Text>
        </View>
      </View>

      {/* Game Over Modal */}
      {phase === "ENDED" && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>OYUN BİTTİ</Text>
            <Text style={styles.popupText}>Skorun: {score}</Text>
            <TouchableOpacity style={styles.button} onPress={() => {
              setScore(0);
              setLives(3);
              setPhase("RUNNING");
              setSnake([
                { x: 5, y: 10 },
                { x: 4, y: 10 },
                { x: 3, y: 10 },
                { x: 2, y: 10 }
              ]);
              setDirection({ dx: 1, dy: 0 });
              setNextDirection({ dx: 1, dy: 0 });
              setGoodWaste({ x: 12, y: 10, icon: '🍎' });
              setHazards([]);
              setIsDamaged(false);
            }}>
              <Text style={styles.buttonText}>🔄 Yeniden Oyna</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onBack}>
              <Text style={styles.buttonText}>Ana Menü</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3e2723',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    backgroundColor: '#3e2723',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#281a16',
    width: '100%',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#bcaaa4',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameBoard: {
    width: TILE_COUNT * GRID_SIZE,
    height: TILE_COUNT * GRID_SIZE,
    backgroundColor: '#5d4037',
    position: 'relative',
    borderWidth: 5,
    borderColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },
  damageEffect: {
    borderColor: '#ff3333',
    shadowColor: '#ff0000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  controlsHint: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#3e2723',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#281a16',
  },
  hintText: {
    fontSize: 14,
    color: '#d7ccc8',
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  popup: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  popupTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 15,
  },
  popupText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 10,
    width: 200,
    alignItems: 'center',
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
