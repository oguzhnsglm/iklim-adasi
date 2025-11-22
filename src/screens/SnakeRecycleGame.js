import React, { useEffect, useRef, useState } from "react";
import { View, Platform, useWindowDimensions, Text } from "react-native";
import soundManager from '../utils/sounds';
import {
  COLORS,
  TutorialModal,
  GameHUD,
  GameOverModal
} from './GameComponents';

export default function SnakeRecycleGame({ onBack }) {
  const { width, height } = useWindowDimensions();
  const GRID_SIZE = 25;
  const TILE_COUNT = 16;
  const GAME_SPEED = 250;

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(120);
  const [phase, setPhase] = useState("TUTORIAL");
  const [snake, setSnake] = useState([{ x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }]);
  const [direction, setDirection] = useState({ dx: 1, dy: 0 });
  const [nextDirection, setNextDirection] = useState({ dx: 1, dy: 0 });
  const [goodWaste, setGoodWaste] = useState({ x: 10, y: 8, icon: '🍎' });
  const [hazards, setHazards] = useState([]);
  const [isDamaged, setIsDamaged] = useState(false);

  const stateRef = useRef({ phase, snake, direction: nextDirection, goodWaste, hazards, lives, score });
  const lastTimeRef = useRef(null);
  const hazardTimerRef = useRef(0);
  const moveIntervalRef = useRef(null);

  useEffect(() => {
    stateRef.current = { phase, snake, direction: nextDirection, goodWaste, hazards, lives, score };
  }, [phase, snake, nextDirection, goodWaste, hazards, lives, score]);

  const GOOD_ICONS = ['🍎', '🍌', '🍉', '🍇', '🥕'];
  const BAD_ICONS = ['🔋', '🥤', '💊', '🧴', '🛢️', '🧪', '⚡', '☢️', '🔥', '💀', '🚬', '🧨'];

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
    setTimeout(() => {
      setHazards(prev => prev.filter(h => h.id !== hazard.id));
    }, 12000); // 15 saniyeden 12 saniyeye düşürüldü
  };

  useEffect(() => {
    if (phase === "TUTORIAL") return;
    if (phase !== "RUNNING") return;

    const moveSnake = () => {
      const { snake: currentSnake, direction: dir, goodWaste: gw, hazards: hz, lives: lv, score: sc } = stateRef.current;

      setDirection(dir);
      const head = { x: currentSnake[0].x + dir.dx, y: currentSnake[0].y + dir.dy };

      if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        setPhase("ENDED");
        return;
      }

      if (currentSnake.some(s => s.x === head.x && s.y === head.y)) {
        setPhase("ENDED");
        return;
      }

      const newSnake = [head, ...currentSnake];

      if (gw && head.x === gw.x && head.y === gw.y) {
        setScore(sc + 1);
        soundManager.playScore();
        spawnGoodWaste();
      } else {
        newSnake.pop();
      }

      let hitHazard = false;
      const newHazards = hz.filter(h => {
        if (h.x === head.x && h.y === head.y) {
          hitHazard = true;
          setLives(prev => prev - 1);
          soundManager.playDamage();
          setIsDamaged(true);
          setTimeout(() => setIsDamaged(false), 1000);
          return false;
        }
        return true;
      });

      if (hitHazard) {
        setHazards(newHazards);
        if (newSnake.length > 3) {
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

    // Oyun başında bir zehirli ürün spawn et
    setTimeout(() => spawnHazard(), 3000);

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

    const hazardInterval = setInterval(() => {
      spawnHazard();
    }, 12000); // Zehirli spawn aralığı

    return () => {
      clearInterval(moveIntervalRef.current);
      clearInterval(timeInterval);
      clearInterval(hazardInterval);
    };
  }, [phase]);

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
    <View style={{ flex: 1 }}>
      {phase === "TUTORIAL" && (
        <TutorialModal 
          title="Yılan Oyunu"
          instructions={[
            Platform.OS === 'web' ? "🐍 Ok tuşları ile yönü kontrol et" : "👆 Ekrana dokun - yukarı/aşağı/sol/sağ",
            "🍎 İyi atıkları topla (+1 puan)",
            "☠️ Zehirli atıklardan kaç (-1 can)",
            "⏱️ 2 dakika içinde maksimum puan topla",
            "❤️ 3 canın var - dikkatli ol"
          ]}
          onStart={() => setPhase("RUNNING")}
        />
      )}
      <GameHUD score={score} time={time} lives={lives} onBack={onBack} />
      
      <View 
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgDeep }}
        onStartShouldSetResponder={() => Platform.OS !== 'web' && phase === "RUNNING"}
        onResponderRelease={(e) => {
          if (Platform.OS === 'web' || phase !== "RUNNING") return;
          
          const { locationX, locationY } = e.nativeEvent;
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
        <View style={{ 
          width: TILE_COUNT * GRID_SIZE, 
          height: TILE_COUNT * GRID_SIZE,
          backgroundColor: isDamaged ? '#8B0000' : '#795548',
          position: 'relative',
          borderWidth: 3,
          borderColor: isDamaged ? '#FF0000' : '#5D4037',
          transition: 'background-color 0.1s, border-color 0.1s'
        }}>
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
                backgroundColor: (row + col) % 2 === 0 ? '#8D6E63' : '#795548'
              }} />
            );
          })}

          {snake.map((segment, i) => {
            const isHead = i === 0;
            
            let segmentStyle = {
              position: 'absolute',
              backgroundColor: isHead ? '#4285F4' : '#5C9EF5',
            };
            
            if (isHead) {
              segmentStyle = {
                ...segmentStyle,
                left: segment.x * GRID_SIZE + 3,
                top: segment.y * GRID_SIZE + 3,
                width: GRID_SIZE - 6,
                height: GRID_SIZE - 6,
                borderRadius: (GRID_SIZE - 6) / 2,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#1967D2'
              };
            } else {
              segmentStyle = {
                ...segmentStyle,
                left: segment.x * GRID_SIZE + 5,
                top: segment.y * GRID_SIZE + 5,
                width: GRID_SIZE - 10,
                height: GRID_SIZE - 10,
                borderRadius: 3
              };
            }
            
            return (
              <View key={`snake-${i}`} style={segmentStyle}>
                {isHead && <Text style={{ fontSize: 10 }}>👀</Text>}
              </View>
            );
          })}

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
      </View>
      
      {phase === "ENDED" && (
        <GameOverModal
          score={score}
          onRestart={() => {
            setScore(0);
            setLives(3);
            setTime(120);
            setPhase("RUNNING");
            setSnake([{ x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }]);
            setDirection({ dx: 1, dy: 0 });
            setNextDirection({ dx: 1, dy: 0 });
            setGoodWaste({ x: 10, y: 8, icon: '🍎' });
            setHazards([]);
          }}
          onMenu={onBack}
        />
      )}
    </View>
  );
}
