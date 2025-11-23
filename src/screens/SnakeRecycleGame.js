/**
 * SnakeRecycleGame.js - Nature Recovery Snake Game
 * 
 * THEME: Climate change awareness through environmental cleanup
 * - Player collects harmful waste to heal the planet
 * - Environment transitions from polluted/dark → vibrant/green
 * - No visible grid, smooth animations, natural aesthetic
 * 
 * KEY FEATURES:
 * 1. WRAP-AROUND WORLD: Toroidal movement (no wall deaths) - see wrapPosition()
 * 2. SELF-COLLISION ONLY: Only dying condition is hitting own body
 * 3. PROGRESSIVE SPEED: Game speed increases with each eaten item - see moveSnake()
 * 4. ENVIRONMENTAL HEALING: Background transitions based on cleanup meter - see getEnvironmentState()
 * 5. SMOOTH ANIMATIONS: Interpolated movement between grid cells
 * 6. NATURE EMERGENCE: Flowers, butterflies appear as world heals - see renderNatureElements()
 */

import React, { useEffect, useRef, useState } from "react";
import { View, Platform, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import soundManager from '../utils/sounds';
import { TutorialModal, NatureBackground } from './GameComponents';

const GLOBAL_GRID_SIZE = 18;

export default function SnakeRecycleGame({ onBack }) {
  // ============================================================================
  // GAME CONSTANTS
  // ============================================================================
  const TILE_COUNT = 22; // Grid size (hidden grid for logic)
  const GRID_SIZE = GLOBAL_GRID_SIZE; // Pixel size per tile
  const BASE_SPEED = 150; // Starting move interval (ms)
  const SPEED_DECAY = 0.94; // How quickly movement interval shrinks as snake grows
  const MIN_DYNAMIC_SPEED = 18; // Hard floor so animations stay stable
  
  // ============================================================================
  // HARMFUL WASTE ITEMS (What the snake collects to clean the planet)
  // ============================================================================
  const WASTE_ITEMS = [
    { icon: '🍾', name: 'Plastic Bottle', points: 10, cleanupValue: 8 },
    { icon: '🛢️', name: 'Oil Barrel', points: 15, cleanupValue: 12 },
    { icon: '🗑️', name: 'Trash Bag', points: 10, cleanupValue: 8 },
    { icon: '🏭', name: 'Factory Smoke', points: 12, cleanupValue: 10 },
    { icon: '🚗', name: 'Car Emissions', points: 10, cleanupValue: 8 },
    { icon: '🧴', name: 'Chemical Bottle', points: 10, cleanupValue: 8 },
    { icon: '🛞', name: 'Old Tire', icon: '⚫', points: 12, cleanupValue: 10 },
    { icon: '💨', name: 'Air Pollution', points: 10, cleanupValue: 8 },
    { icon: '🔋', name: 'Dead Battery', points: 12, cleanupValue: 10 },
    { icon: '⚠️', name: 'Toxic Waste', points: 20, cleanupValue: 15 },
  ];

  const SPECIAL_FOOD_TYPES = [
    { type: 'MEGA_FOOD', icon: '🍎', label: 'Enerji Elması', effectKey: 'megaFood', color: '#f87171' },
    { type: 'MINI_SNAKE', icon: '🥒', label: 'Narin Yaprak', effectKey: 'miniSnake', color: '#34d399' },
    { type: 'SHIELD', icon: '🛡️', label: 'Koruma Kalkanı', effectKey: 'shield', color: '#38bdf8' }
  ];
  const SPECIAL_EFFECT_DURATION = 10000;

  // ============================================================================
  // CLIMATE MESSAGES (Educational tips)
  // ============================================================================
  const CLIMATE_MESSAGES = [
    "🌍 Her plastik parçası 450 yıl doğada kalır",
    "♻️ Geri dönüşüm enerji tasarrufu sağlar",
    "🌳 Ağaçlar havadaki CO₂'yi emer",
    "🚴 Bisiklet kullanmak hava kirliliğini azaltır",
    "💧 Temiz su tüm canlılar için hayati önem taşır",
    "🌱 Küçük değişiklikler büyük farklar yaratır",
    "🌸 Doğayı korumak hepimizin sorumluluğu",
  ];

  const shuffleSpecialTypes = () => {
    const pool = [...SPECIAL_FOOD_TYPES];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  };


  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [phase, setPhase] = useState("TUTORIAL"); // TUTORIAL | RUNNING | PAUSED | ENDED
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [cleanupMeter, setCleanupMeter] = useState(0); // 0-100: cleanup progress
  const [currentSpeed, setCurrentSpeed] = useState(BASE_SPEED);
  
  // Snake state
  const [snake, setSnake] = useState([
    { x: 11, y: 11 },
    { x: 10, y: 11 },
    { x: 9, y: 11 }
  ]);
  const [direction, setDirection] = useState({ dx: 1, dy: 0 });
  const [nextDirection, setNextDirection] = useState({ dx: 1, dy: 0 });
  
  // Items & effects
  const [wasteItem, setWasteItem] = useState(null);
  const [particles, setParticles] = useState([]);
  const [climateMessage, setClimateMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [specialFood, setSpecialFood] = useState(null);
  const [activeEffects, setActiveEffects] = useState({
    megaFood: false,
    miniSnake: false,
    shield: false
  });
  
  // Refs for stable access in intervals
  const stateRef = useRef({ snake, direction, wasteItem, cleanupMeter, currentSpeed, specialFood, activeEffects, phase });
  const moveIntervalRef = useRef(null);
  const messageTimeoutRef = useRef(null);
  const effectTimeoutsRef = useRef({});
  const specialOrderRef = useRef(shuffleSpecialTypes());
  const specialOrderIndexRef = useRef(0);
  const regularFoodCounterRef = useRef(0);
  const pendingSpecialRef = useRef(0);
  
  // Animations
  const snakePositions = useRef(snake.map(seg => new Animated.ValueXY({ x: seg.x * GRID_SIZE, y: seg.y * GRID_SIZE })));
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const gameOverOpacity = useRef(new Animated.Value(0)).current;

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * WRAP-AROUND LOGIC: Implements toroidal world
   * When snake goes off an edge, it appears on the opposite side
   */
  const wrapPosition = (pos) => {
    return {
      x: ((pos.x % TILE_COUNT) + TILE_COUNT) % TILE_COUNT,
      y: ((pos.y % TILE_COUNT) + TILE_COUNT) % TILE_COUNT
    };
  };

  const getRandomPos = () => ({
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT)
  });

  const isOccupied = (pos, snake) => {
    return snake.some(seg => seg.x === pos.x && seg.y === pos.y);
  };

  /**
   * ENVIRONMENT STATE: Returns background style based on cleanup progress
   * 0-25: Dark, polluted
   * 25-50: Clearing up
   * 50-75: Getting healthy
   * 75-100: Vibrant, lush
   */
  const getEnvironmentState = () => {
    if (cleanupMeter < 25) {
      return {
        background: 'linear-gradient(135deg, #2f3438 0%, #3b4146 50%, #2f3438 100%)',
        bgColor: '#2f3438',
        backdrop: '#1f252b',
        tint: 'rgba(90, 110, 120, 0.35)',
        lightBeams: false,
        saturation: 0.3,
        brightness: 0.6,
        stage: 'polluted'
      };
    } else if (cleanupMeter < 50) {
      return {
        background: 'linear-gradient(135deg, #38493f 0%, #4a5e4f 50%, #38493f 100%)',
        bgColor: '#394d40',
        backdrop: '#1d2a23',
        tint: 'rgba(90, 130, 110, 0.25)',
        lightBeams: true,
        saturation: 0.5,
        brightness: 0.7,
        stage: 'recovering'
      };
    } else if (cleanupMeter < 75) {
      return {
        background: 'linear-gradient(135deg, #265a3c 0%, #2f7448 50%, #265a3c 100%)',
        bgColor: '#2a6a40',
        backdrop: '#142c1c',
        tint: 'rgba(110, 200, 150, 0.15)',
        lightBeams: true,
        saturation: 0.8,
        brightness: 0.85,
        stage: 'healthy'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #1d6d2d 0%, #1f8c3d 50%, #1d6d2d 100%)',
        bgColor: '#1e8d3b',
        backdrop: '#0d2413',
        tint: 'rgba(160, 255, 200, 0.1)',
        lightBeams: true,
        saturation: 1.0,
        brightness: 1.0,
        stage: 'vibrant'
      };
    }
  };

  /**
   * Determines snake appearance + speed adjustments based on length.
   */
  const getSnakeStage = (length) => {
    if (length >= 24) {
      return {
        headColor: '#b91c1c',
        bodyColor: '#ef4444',
        borderColor: '#fecaca',
        glowColor: '#f87171',
        speedBoost: 12,
      };
    } else if (length >= 16) {
      return {
        headColor: '#6d28d9',
        bodyColor: '#a855f7',
        borderColor: '#ddd6fe',
        glowColor: '#c084fc',
        speedBoost: 8,
      };
    } else if (length >= 10) {
      return {
        headColor: '#1d4ed8',
        bodyColor: '#3b82f6',
        borderColor: '#bfdbfe',
        glowColor: '#60a5fa',
        speedBoost: 4,
      };
    }

    return {
      headColor: '#1c7d3a',
      bodyColor: '#34d399',
      borderColor: '#86efac',
      glowColor: '#22c55e',
      speedBoost: 0,
    };
  };

  const computeSpeedForLength = (length, stageSpeedBoost = 0) => {
    const growthSteps = Math.max(0, length - 3);
    const exponentialSpeed = BASE_SPEED * Math.pow(SPEED_DECAY, growthSteps / 2);
    return Math.max(MIN_DYNAMIC_SPEED, exponentialSpeed - stageSpeedBoost);
  };

  // ============================================================================
  // GAME LOGIC FUNCTIONS
  // ============================================================================

  const spawnWasteItem = () => {
    let pos;
    do { 
      pos = getRandomPos(); 
    } while (isOccupied(pos, stateRef.current.snake));
    
    const item = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)];
    setWasteItem({ ...pos, ...item });
  };

  const getNextSpecialType = () => {
    const queue = specialOrderRef.current;
    const index = specialOrderIndexRef.current;
    const type = queue[index];
    let nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      specialOrderRef.current = shuffleSpecialTypes();
      nextIndex = 0;
    }
    specialOrderIndexRef.current = nextIndex;
    return type;
  };

  const spawnSpecialFood = () => {
    const snapshot = stateRef.current;
    if (snapshot.phase !== 'RUNNING') return;
    if (snapshot.specialFood) return;
    let pos;
    let attempts = 0;
    const currentSnake = snapshot.snake;
    const currentWaste = snapshot.wasteItem;
    do {
      pos = getRandomPos();
      attempts += 1;
    } while (
      attempts < 200 &&
      (isOccupied(pos, currentSnake) ||
        (currentWaste && currentWaste.x === pos.x && currentWaste.y === pos.y))
    );
    if (attempts >= 200) return;
    const type = getNextSpecialType();
    setSpecialFood({ ...pos, ...type });
  };

  const triggerSpecialSpawn = () => {
    if (stateRef.current.specialFood) {
      pendingSpecialRef.current += 1;
    } else {
      spawnSpecialFood();
    }
  };

  const activateSpecialEffect = (effectKey) => {
    if (!effectKey) return;
    setActiveEffects(prev => ({ ...prev, [effectKey]: true }));
    if (effectTimeoutsRef.current[effectKey]) {
      clearTimeout(effectTimeoutsRef.current[effectKey]);
    }
    effectTimeoutsRef.current[effectKey] = setTimeout(() => {
      setActiveEffects(prev => ({ ...prev, [effectKey]: false }));
      effectTimeoutsRef.current[effectKey] = null;
    }, SPECIAL_EFFECT_DURATION);
  };

  const resetSpecialEffects = () => {
    Object.keys(effectTimeoutsRef.current).forEach(key => {
      if (effectTimeoutsRef.current[key]) {
        clearTimeout(effectTimeoutsRef.current[key]);
      }
    });
    effectTimeoutsRef.current = {};
    setActiveEffects({ megaFood: false, miniSnake: false, shield: false });
  };

  const handleSpecialFoodEaten = (food) => {
    if (!food) return;
    activateSpecialEffect(food.effectKey);
    setSpecialFood(null);
    if (pendingSpecialRef.current > 0) {
      pendingSpecialRef.current -= 1;
      spawnSpecialFood();
    }
  };

  const createParticles = (x, y) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        angle: (Math.PI * 2 * i) / 8,
        speed: 2 + Math.random() * 2,
        life: 1.0,
        color: '#4ade80' // Green particles for cleanup
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const showClimateMessage = () => {
    const message = CLIMATE_MESSAGES[Math.floor(Math.random() * CLIMATE_MESSAGES.length)];
    setClimateMessage(message);
    setShowMessage(true);
    
    Animated.sequence([
      Animated.timing(messageOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(messageOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => setShowMessage(false));
  };

  /**
   * MAIN GAME LOOP: Moves snake and handles game logic
   * - Includes wrap-around logic
   * - Speed increases with each eaten item
   * - Only self-collision ends game
   */
  const moveSnake = () => {
    const {
      snake: currentSnake,
      direction: currentDir,
      wasteItem: currentItem,
      cleanupMeter: currentCleanup,
      currentSpeed: speed,
      specialFood: currentSpecial,
      activeEffects: effects
    } = stateRef.current;
    
    // Calculate new head position (may be outside grid)
    const rawHead = {
      x: currentSnake[0].x + currentDir.dx,
      y: currentSnake[0].y + currentDir.dy
    };
    
    // WRAP-AROUND LOGIC: Apply toroidal wrapping
    const head = wrapPosition(rawHead);
    
    // SELF-COLLISION CHECK: Only check against body (not head)
    const hitSelf = currentSnake.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
    
    if (hitSelf && !effects.shield) {
      endGame();
      return;
    }
    
    let newSnake = [head, ...currentSnake];
    let newScore = score;
    let newCleanup = currentCleanup;
    let newSpeed = speed;
    let ateItem = false;
    

    // Check if ate waste item
    if (currentItem && head.x === currentItem.x && head.y === currentItem.y) {
      ateItem = true;
      newScore += currentItem.points;
      newCleanup = Math.min(100, currentCleanup + currentItem.cleanupValue);
      
      // SPEED INCREASE: Get faster with each item plus stage bonus
      const stageForSpeed = getSnakeStage(newSnake.length);
      newSpeed = computeSpeedForLength(newSnake.length, stageForSpeed.speedBoost);
      
      setScore(newScore);
      setCleanupMeter(newCleanup);
      setCurrentSpeed(newSpeed);
      
      createParticles(head.x, head.y);
      
      // Play sound
      if (soundManager.playScore) {
        soundManager.playScore();
      }
      
      // Show message every 50 points
      if (newScore % 50 === 0 && newScore > 0) {
        showClimateMessage();
      }
      
      spawnWasteItem();
      regularFoodCounterRef.current += 1;
      if (regularFoodCounterRef.current >= 4) {
        regularFoodCounterRef.current = 0;
        triggerSpecialSpawn();
      }
    } else {
      if (currentSpecial && head.x === currentSpecial.x && head.y === currentSpecial.y) {
        handleSpecialFoodEaten(currentSpecial);
      }
      newSnake.pop(); // Remove tail if didn't eat regular item
    }
    
    setSnake(newSnake);
    
    // Smooth animation to new positions
    newSnake.forEach((seg, i) => {
      if (snakePositions.current[i]) {
        Animated.timing(snakePositions.current[i], {
          toValue: { x: seg.x * GRID_SIZE, y: seg.y * GRID_SIZE },
          duration: Math.min(newSpeed * 0.8, 120),
          useNativeDriver: false
        }).start();
      }
    });
    
    // Ensure we have animated values for all segments
    while (snakePositions.current.length < newSnake.length) {
      const lastSeg = newSnake[snakePositions.current.length];
      snakePositions.current.push(
        new Animated.ValueXY({ x: lastSeg.x * GRID_SIZE, y: lastSeg.y * GRID_SIZE })
      );
    }
    
    // Restart interval with new speed if ate item
    if (ateItem && moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = setInterval(moveSnake, newSpeed);
    }
  };

  const endGame = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    setSpecialFood(null);
    resetSpecialEffects();
    regularFoodCounterRef.current = 0;
    pendingSpecialRef.current = 0;
    
    setPhase("ENDED");
    
    // Save best score
    if (score > bestScore) {
      setBestScore(score);
      AsyncStorage.setItem('snakeCleanupBest', score.toString()).catch(() => {});
    }
    
    // Animate game over
    Animated.timing(gameOverOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    if (soundManager.playDamage) {
      soundManager.playDamage();
    }
  };

  // ============================================================================
  // DIRECTION CONTROL
  // ============================================================================
  
  /**
   * ROBUST DIRECTION HANDLING
   * - Prevents 180-degree turns (can't go directly backwards)
   * - Ignores impossible moves
   * - Handles quick key combinations safely
   */
  const handleDirectionChange = (newDir) => {
    const { dx: curDx, dy: curDy } = stateRef.current.direction;
    
    // Prevent 180-degree turn (going directly backwards into body)
    if (newDir.dx === -curDx && newDir.dy === -curDy) {
      return;
    }
    
    // Prevent changing to same direction
    if (newDir.dx === curDx && newDir.dy === curDy) {
      return;
    }
    
    setNextDirection(newDir);
  };

  // Keyboard controls
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleKeyPress = (e) => {
      if (phase !== "RUNNING") return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleDirectionChange({ dx: 0, dy: -1 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleDirectionChange({ dx: 0, dy: 1 });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleDirectionChange({ dx: -1, dy: 0 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleDirectionChange({ dx: 1, dy: 0 });
          break;
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [phase]);

  // ============================================================================
  // GAME LIFECYCLE
  // ============================================================================

  // Update refs
  useEffect(() => {
    stateRef.current = { snake, direction, wasteItem, cleanupMeter, currentSpeed, specialFood, activeEffects, phase };
  }, [snake, direction, wasteItem, cleanupMeter, currentSpeed, specialFood, activeEffects, phase]);

  // Update direction from queued next direction
  useEffect(() => {
    if (phase === "RUNNING") {
      setDirection(nextDirection);
    }
  }, [nextDirection, phase]);

  // Load best score
  useEffect(() => {
    AsyncStorage.getItem('snakeCleanupBest').then(val => {
      if (val) setBestScore(parseInt(val));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
        Object.keys(effectTimeoutsRef.current).forEach(key => {
        if (effectTimeoutsRef.current[key]) {
          clearTimeout(effectTimeoutsRef.current[key]);
        }
      });
    };
  }, []);

  // Start game loop
  useEffect(() => {
    if (phase === "RUNNING") {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
      moveIntervalRef.current = setInterval(moveSnake, currentSpeed);
      
      return () => {
        if (moveIntervalRef.current) {
          clearInterval(moveIntervalRef.current);
          moveIntervalRef.current = null;
        }
      };
    }
  }, [phase, currentSpeed]);

  // Particle animation
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({
          ...p,
          x: p.x + Math.cos(p.angle) * p.speed,
          y: p.y + Math.sin(p.angle) * p.speed,
          life: p.life - 0.05
        })).filter(p => p.life > 0)
      );
    }, 16);
    
    return () => clearInterval(interval);
  }, [particles.length]);


  // ============================================================================
  // RENDER HELPER: Nature Elements
  // ============================================================================
  
  /**
   * NATURE EMERGENCE: Renders background nature elements based on cleanup progress
   * More elements appear as cleanupMeter increases
   */

  /**
   * LIGHT BEAMS: Renders diagonal light beams for healthy environments
   */
  const renderLightBeams = () => {
    const env = getEnvironmentState();
    if (!env.lightBeams) return null;
    
    const beamCount = 4;
    const beams = [];
    
    for (let i = 0; i < beamCount; i++) {
      beams.push(
        <View
          key={`beam-${i}`}
          style={{
            position: 'absolute',
            left: i * 100 - 50,
            top: -50,
            width: 80,
            height: TILE_COUNT * GRID_SIZE + 100,
            backgroundColor: 'rgba(255, 255, 200, 0.05)',
            transform: [{ rotate: '15deg' }],
            pointerEvents: 'none'
          }}
        />
      );
    }
    
    return beams;
  };

  // ============================================================================
  // RESTART FUNCTION
  // ============================================================================
  
  const restartGame = () => {
    setScore(0);
    setCleanupMeter(0);
    setCurrentSpeed(BASE_SPEED);
    setSnake([
      { x: 11, y: 11 },
      { x: 10, y: 11 },
      { x: 9, y: 11 }
    ]);
    setDirection({ dx: 1, dy: 0 });
    setNextDirection({ dx: 1, dy: 0 });
    setParticles([]);
    setClimateMessage(null);
    setShowMessage(false);
    setSpecialFood(null);
    resetSpecialEffects();
    regularFoodCounterRef.current = 0;
    pendingSpecialRef.current = 0;
    specialOrderRef.current = shuffleSpecialTypes();
    specialOrderIndexRef.current = 0;
    gameOverOpacity.setValue(0);
    
    // Reset animated positions
    snakePositions.current = [
      new Animated.ValueXY({ x: 11 * GRID_SIZE, y: 11 * GRID_SIZE }),
      new Animated.ValueXY({ x: 10 * GRID_SIZE, y: 11 * GRID_SIZE }),
      new Animated.ValueXY({ x: 9 * GRID_SIZE, y: 11 * GRID_SIZE })
    ];
    
    setPhase("RUNNING");
    spawnWasteItem();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const env = getEnvironmentState();
  const playAreaSize = TILE_COUNT * GRID_SIZE;
  const snakeStage = getSnakeStage(snake.length);
  const containerBackground = env.backdrop || '#1a1a1a';
  const foodSizeMultiplier = activeEffects.megaFood ? 1.3 : 1;
  const snakeScale = activeEffects.miniSnake ? 0.8 : 1;
  const shieldActive = activeEffects.shield;
  const wasteSize = GRID_SIZE * foodSizeMultiplier;
  const wasteOffset = (wasteSize - GRID_SIZE) / 2;

  return (
    <View style={[styles.container, { backgroundColor: containerBackground }]}>
      <NatureBackground
        intensity={Math.min(1, cleanupMeter / 100)}
        baseColor={containerBackground}
        midColor={env.bgColor}
      />

      {/* TUTORIAL */}
      {phase === "TUTORIAL" && (
        <TutorialModal 
          title="🌍 Doğa Kurtarma"
          instructions={[
            Platform.OS === 'web' ? "⌨️ Ok tuşları ile hareket et" : "🎮 Alt kontrolleri kullan",
            "♻️ Zararlı atıkları topla ve doğayı temizle",
            "🌱 Temizledikçe doğa canlanır, çiçekler açar",
            "🚀 Her atık hızını artırır - dikkatli ol!",
            "🌍 Duvarlar yok - dünya sarmalanır",
            "⚠️ Sadece kendine çarpma oyunu bitirir",
            "🍎 Özel güç besinleri her 4 atıktan sonra rastgele görünür"
          ]}
          onStart={() => {
            setPhase("RUNNING");
            spawnWasteItem();
          }}
        />
      )}

      {/* HUD */}
      {phase !== "TUTORIAL" && (
        <View style={styles.hud}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Çıkış</Text>
          </TouchableOpacity>
          
          <View style={styles.hudPanel}>
            <Text style={styles.hudLabel}>SKOR</Text>
            <Text style={styles.hudValue}>{score}</Text>
          </View>
          
          <View style={styles.hudPanel}>
            <Text style={styles.hudLabel}>EN İYİ</Text>
            <Text style={styles.hudValue}>{bestScore}</Text>
          </View>
          
          {/* Cleanup Meter */}
          <View style={styles.cleanupMeterPanel}>
            <Text style={styles.cleanupLabel}>🌱 TEMİZLİK</Text>
            <View style={styles.meterContainer}>
              <View 
                style={[
                  styles.meterFill,
                  {
                    width: `${cleanupMeter}%`,
                    backgroundColor: 
                      cleanupMeter < 25 ? '#8b4513' : // Brown (polluted)
                      cleanupMeter < 50 ? '#ca8a04' : // Yellow (recovering)
                      cleanupMeter < 75 ? '#84cc16' : // Light green (healthy)
                      '#22c55e' // Vibrant green (vibrant)
                  }
                ]}
              />
            </View>
            <Text style={styles.meterValue}>
              {cleanupMeter < 25 ? '☠️ Kirli' : 
               cleanupMeter < 50 ? '🌤️ İyileşiyor' : 
               cleanupMeter < 75 ? '🌱 Sağlıklı' : '🌳 Canlı'}
            </Text>
          </View>
        </View>
      )}

      {phase !== "TUTORIAL" && (
        <View style={styles.powerUpRow}>
          {SPECIAL_FOOD_TYPES.map(type => {
            const active = activeEffects[type.effectKey];
            return (
              <View
                key={type.type}
                style={[
                  styles.powerUpBadge,
                  active && { borderColor: type.color, backgroundColor: 'rgba(255,255,255,0.1)' }
                ]}
              >
                <Text style={styles.powerUpIcon}>{type.icon}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* GAME AREA */}
      <View style={styles.gameArea}>
        <View style={[
          styles.playfieldWrapper,
          {
            width: playAreaSize,
            height: playAreaSize
          }
        ]}>
          {/* Background with environment transition */}
          <View style={[
            styles.playfield,
            {
              width: playAreaSize,
              height: playAreaSize,
              backgroundColor: env.bgColor
            }
          ]}>
            {/* Light beams */}
            {renderLightBeams()}

            {/* Tint overlay */}
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: env.tint,
              pointerEvents: 'none'
            }} />

            {/* Snake - smooth animated rendering */}
            {snake.map((segment, i) => {
              const isHead = i === 0;
              const animatedPos = snakePositions.current[i] || new Animated.ValueXY({ 
                x: segment.x * GRID_SIZE, 
                y: segment.y * GRID_SIZE 
              });
              
              return (
                <Animated.View
                  key={`snake-${i}`}
                  style={[
                    styles.snakeSegment,
                    {
                      left: animatedPos.x,
                      top: animatedPos.y,
                      width: GRID_SIZE - 2,
                      height: GRID_SIZE - 2,
                      backgroundColor: isHead ? snakeStage.headColor : snakeStage.bodyColor,
                      borderRadius: isHead ? (GRID_SIZE - 2) / 2 : Math.max(3, 4 * snakeScale),
                      borderWidth: shieldActive && isHead ? 2 : 1,
                      borderColor: shieldActive && isHead ? '#fde047' : (isHead ? snakeStage.borderColor : snakeStage.glowColor),
                      shadowColor: shieldActive && isHead ? '#fde047' : snakeStage.glowColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: isHead ? 0.85 : 0.4,
                      shadowRadius: (isHead ? 9 : 5) * snakeScale,
                      transform: snakeScale !== 1 ? [
                        { translateX: ((GRID_SIZE - 2) * (1 - snakeScale)) / 2 },
                        { translateY: ((GRID_SIZE - 2) * (1 - snakeScale)) / 2 },
                        { scale: snakeScale }
                      ] : []
                    }
                  ]}
                >
                  {isHead && (
                    <View style={styles.snakeEyes}>
                      <View style={styles.eye} />
                      <View style={styles.eye} />
                    </View>
                  )}
                </Animated.View>
              );
            })}

            {/* Waste item */}
            {wasteItem && (
              <View style={[
                styles.wasteItem,
                {
                  left: wasteItem.x * GRID_SIZE - wasteOffset,
                  top: wasteItem.y * GRID_SIZE - wasteOffset,
                  width: wasteSize,
                  height: wasteSize,
                  transform: activeEffects.megaFood ? [{ rotate: '5deg' }] : []
                }
              ]}>
                <Text style={[styles.wasteIcon, { fontSize: 16 * foodSizeMultiplier }]}>{wasteItem.icon}</Text>
              </View>
            )}

            {specialFood && (
              <View style={[
                styles.specialFood,
                {
                  left: specialFood.x * GRID_SIZE,
                  top: specialFood.y * GRID_SIZE,
                  width: GRID_SIZE,
                  height: GRID_SIZE,
                  borderColor: specialFood.color,
                  shadowColor: specialFood.color
                }
              ]}>
                <Text style={styles.specialIcon}>{specialFood.icon}</Text>
              </View>
            )}

            {/* Particles */}
            {particles.map(p => (
              <View
                key={p.id}
                style={[
                  styles.particle,
                  {
                    left: p.x,
                    top: p.y,
                    backgroundColor: p.color,
                    opacity: p.life
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Climate Message Overlay */}
      {showMessage && (
        <Animated.View style={[styles.messageOverlay, { opacity: messageOpacity }]}>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{climateMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* Touch Controls (Mobile) */}
      {Platform.OS !== 'web' && phase === "RUNNING" && (
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => handleDirectionChange({ dx: 0, dy: -1 })}>
              <Text style={styles.controlText}>▲</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => handleDirectionChange({ dx: -1, dy: 0 })}>
              <Text style={styles.controlText}>◄</Text>
            </TouchableOpacity>
            <View style={styles.controlSpacer} />
            <TouchableOpacity style={styles.controlButton} onPress={() => handleDirectionChange({ dx: 1, dy: 0 })}>
              <Text style={styles.controlText}>►</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => handleDirectionChange({ dx: 0, dy: 1 })}>
              <Text style={styles.controlText}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Game Over */}
      {phase === "ENDED" && (
        <Animated.View style={[styles.gameOverOverlay, { opacity: gameOverOpacity }]}>
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverTitle}>🌍 Oyun Bitti</Text>
            <Text style={styles.gameOverScore}>Skor: {score}</Text>
            <Text style={styles.gameOverBest}>En İyi: {bestScore}</Text>
            
            <View style={styles.impactSummary}>
              <Text style={styles.impactTitle}>🌱 Doğa Etkisi</Text>
              <Text style={[
                styles.impactText,
                { color: cleanupMeter < 30 ? '#ef4444' : cleanupMeter < 60 ? '#eab308' : '#22c55e' }
              ]}>
                {cleanupMeter < 25 ? '☠️ Çok az temizlik yapıldı' :
                 cleanupMeter < 50 ? '🌤️ İyi başlangıç! Devam et!' :
                 cleanupMeter < 75 ? '🌱 Harika! Doğa iyileşiyor!' :
                 '🌳 Mükemmel! Gezegen tertemiz!'}
              </Text>
              <Text style={styles.impactSubtext}>
                {score > 100 ? `${Math.floor(cleanupMeter / 10)} adet atık topladın! 🎉` :
                 'Daha fazla pratik yap! 💪'}
              </Text>
            </View>
            
            <View style={styles.gameOverButtons}>
              <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
                <Text style={styles.buttonText}>🔄 Tekrar Oyna</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuButton} onPress={onBack}>
                <Text style={styles.buttonText}>📋 Menü</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playfieldWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  playfield: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
    maxWidth: 500,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  backText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '600',
  },
  hudPanel: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
  },
  hudLabel: {
    fontSize: 10,
    color: '#86efac',
    fontWeight: '700',
    marginBottom: 2,
  },
  hudValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  cleanupMeterPanel: {
    flex: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  powerUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  powerUpBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  powerUpIcon: {
    fontSize: 16,
  },
  cleanupLabel: {
    fontSize: 10,
    color: '#86efac',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  meterContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  meterValue: {
    fontSize: 9,
    color: '#d1d5db',
    textAlign: 'center',
  },
  snakeSegment: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snakeEyes: {
    flexDirection: 'row',
    gap: 3,
  },
  eye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#000',
  },
  wasteItem: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wasteIcon: {
    fontSize: 16,
  },
  specialFood: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: GLOBAL_GRID_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  specialIcon: {
    fontSize: 18,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  messageOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  messageBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  controlSpacer: {
    width: 60,
  },
  controlText: {
    color: '#86efac',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverBox: {
    backgroundColor: 'rgba(29, 109, 45, 0.95)',
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.6)',
    alignItems: 'center',
    minWidth: 300,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  gameOverScore: {
    fontSize: 20,
    color: '#86efac',
    marginBottom: 8,
  },
  gameOverBest: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 20,
  },
  impactSummary: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86efac',
    marginBottom: 8,
    textAlign: 'center',
  },
  impactText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  impactSubtext: {
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  restartButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  menuButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
