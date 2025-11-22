import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput } from 'react-native';

const BINS = [
  { id: 'glass', icon: '🍾', label: 'CAM', color: '#4ade80' },
  { id: 'plastic', icon: '🥤', label: 'PLASTİK', color: '#fbbf24' },
  { id: 'paper', icon: '📄', label: 'KAĞIT', color: '#38bdf8' }
];

const OPERATIONS = [
  { value: 2, text: '+2' },
  { value: 5, text: '+5' },
  { value: -3, text: '-3' },
  { value: 3, text: '+3' },
  { value: -2, text: '-2' },
  { value: 1, text: '+1' },
  { value: -1, text: '-1' },
];

export default function MathGame({ onBack }) {
  const [phase, setPhase] = useState("TUTORIAL");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentBinIndex, setCurrentBinIndex] = useState(0);
  const [operations, setOperations] = useState([]);
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [itemsInBin, setItemsInBin] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0); // Doğru cevap sayacı
  const [difficulty, setDifficulty] = useState(3); // Başlangıç işlem sayısı
  const [roundKey, setRoundKey] = useState(0); // Her tur için benzersiz key

  // Yeni tur başlat
  const startNewRound = () => {
    const numOperations = difficulty;
    const newOps = [];
    let total = 0;

    // İlk işlemi pozitif yap
    const positiveOps = OPERATIONS.filter(op => op.value > 0);
    const firstOp = positiveOps[Math.floor(Math.random() * positiveOps.length)];
    newOps.push(firstOp);
    total += firstOp.value;

    // Geri kalan işlemleri ekle
    for (let i = 1; i < numOperations; i++) {
      const op = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      newOps.push(op);
      total += op.value;
    }

    // Eğer hala negatif ise, son negatif işlemi pozitife çevir
    if (total <= 0) {
      for (let i = newOps.length - 1; i >= 0; i--) {
        if (newOps[i].value < 0) {
          const positiveValue = Math.abs(newOps[i].value);
          newOps[i] = { value: positiveValue, text: `+${positiveValue}` };
          total += positiveValue * 2; // Eski değeri çıkar, yeniyi ekle
          break;
        }
      }
    }

    // Yine de sıfır veya negatifse, son işleme ekstra puan ekle
    if (total <= 0) {
      const extra = Math.abs(total) + 2;
      newOps[newOps.length - 1] = { value: extra, text: `+${extra}` };
      total = newOps.reduce((sum, op) => sum + op.value, 0);
    }

    setOperations(newOps);
    setCorrectAnswer(total);
    setAnswer('');
    setShowResult(false);
    setRoundKey(prev => prev + 1); // Yeni tur için key güncelle
  };

  useEffect(() => {
    if (phase === "RUNNING") {
      startNewRound();
    }
  }, [phase, currentBinIndex]);

  const checkAnswer = () => {
    const userAnswer = parseInt(answer, 10);
    
    if (isNaN(userAnswer)) {
      return;
    }

    setShowResult(true);

    if (userAnswer === correctAnswer) {
      const earnedPoints = difficulty * 10; // İşlem sayısı × 10 puan
      setScore(s => s + earnedPoints);
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      
      // Her 3 doğru cevaptan sonra zorluk artır
      if (newCorrectCount % 3 === 0) {
        setDifficulty(d => d + 1);
      }
      
      setTimeout(() => {
        // Sonraki kovaya geç
        if (currentBinIndex < BINS.length - 1) {
          setCurrentBinIndex(i => i + 1);
        } else {
          setCurrentBinIndex(0);
        }
      }, 1500);
    } else {
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setTimeout(() => setPhase("ENDED"), 1500);
        } else {
          setTimeout(() => {
            startNewRound();
          }, 1500);
        }
        return newLives;
      });
    }
  };

  const AnimatedItem = ({ operation, index, delay }) => {
    const animY = useRef(new Animated.Value(-100)).current;
    const animOpacity = useRef(new Animated.Value(0)).current;
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
      if (!hasAnimatedRef.current && !showResult) {
        hasAnimatedRef.current = true;
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(animY, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            })
          ])
        ]).start();
      }
    }, []);

    return (
      <Animated.View
        style={[
          styles.operationItem,
          {
            backgroundColor: BINS[currentBinIndex].color + '33',
            opacity: animOpacity,
            transform: [{ translateY: animY }]
          }
        ]}
      >
        <Text style={styles.operationIcon}>{BINS[currentBinIndex].icon}</Text>
        <Text style={styles.operationText}>{operation.text}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tutorial */}
      {phase === "TUTORIAL" && (
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>🧮 MATEMATİK OYUNU</Text>
            <View style={styles.tutorialInstructions}>
              <Text style={styles.tutorialText}>🗑️ Kovaya atıklar düşer</Text>
              <Text style={styles.tutorialText}>➕ Her atıkta işlem görürsün (+2, -3, vb.)</Text>
              <Text style={styles.tutorialText}>🧮 Kovada toplam kaç atık olduğunu hesapla</Text>
              <Text style={styles.tutorialText}>✅ Doğru cevap = İşlem sayısı × 10 puan</Text>
              <Text style={styles.tutorialText}>❌ Yanlış cevap -1 can</Text>
              <Text style={styles.tutorialText}>🎯 Her 3 doğru cevap +1 işlem artışı!</Text>
            </View>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => setPhase("RUNNING")}
            >
              <Text style={styles.startButtonText}>▶ Başla</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Game Over */}
      {phase === "ENDED" && (
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>🎮 OYUN BİTTİ</Text>
            <Text style={styles.scoreText}>Toplam Puan: {score}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.restartButton}
                onPress={() => {
                  setScore(0);
                  setLives(3);
                  setCurrentBinIndex(0);
                  setCorrectCount(0);
                  setDifficulty(3);
                  setPhase("RUNNING");
                }}
              >
                <Text style={styles.buttonText}>🔄 Tekrar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={onBack}
              >
                <Text style={styles.buttonText}>🏠 Menü</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Matematik Oyunu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Puan</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Can</Text>
          <Text style={styles.statValue}>{'❤️'.repeat(lives)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>İşlem</Text>
          <Text style={styles.statValue}>{difficulty}</Text>
        </View>
      </View>

      {/* Current Bin */}
      {phase === "RUNNING" && (
        <View style={styles.gameArea}>
          <Text style={styles.binTitle}>
            {BINS[currentBinIndex].icon} {BINS[currentBinIndex].label} KOVASI
          </Text>

          {/* Bin Container */}
          <View style={[styles.bin, { borderColor: BINS[currentBinIndex].color }]}>
            <Text style={styles.binIcon}>{BINS[currentBinIndex].icon}</Text>
          </View>

          {/* Operations */}
          <View style={styles.operationsContainer}>
            {operations.map((op, index) => (
              <AnimatedItem 
                key={`${roundKey}-${index}`}
                operation={op} 
                index={index}
                delay={index * 600}
              />
            ))}
          </View>

          {/* Answer Input */}
          {!showResult && operations.length > 0 && (
            <View style={styles.answerSection}>
              <Text style={styles.questionText}>Kovada toplam kaç atık var?</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="?"
                  placeholderTextColor="#999"
                  onSubmitEditing={checkAnswer}
                />
                <TouchableOpacity 
                  style={styles.checkButton}
                  onPress={checkAnswer}
                >
                  <Text style={styles.checkButtonText}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Result */}
          {showResult && (
            <View style={styles.resultSection}>
              {parseInt(answer, 10) === correctAnswer ? (
                <>
                  <Text style={styles.resultCorrect}>✅ DOĞRU!</Text>
                  <Text style={styles.resultText}>Cevap: {correctAnswer}</Text>
                  <Text style={styles.resultText}>+{difficulty * 10} Puan</Text>
                </>
              ) : (
                <>
                  <Text style={styles.resultWrong}>❌ YANLIŞ!</Text>
                  <Text style={styles.resultText}>Doğru Cevap: {correctAnswer}</Text>
                  <Text style={styles.resultText}>Senin Cevabın: {answer}</Text>
                  <Text style={styles.resultText}>-1 Can</Text>
                </>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a4d2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#2d5f3f',
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 60,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 15,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  statLabel: {
    fontSize: 12,
    color: '#a5d6a7',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  binTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  bin: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  binIcon: {
    fontSize: 60,
  },
  operationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  operationItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  operationIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  operationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a4d2e',
  },
  answerSection: {
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    backgroundColor: '#fff',
    width: 120,
    height: 60,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkButton: {
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  resultCorrect: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  resultWrong: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f87171',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 5,
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  tutorialCard: {
    backgroundColor: '#2d5f3f',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  tutorialInstructions: {
    marginBottom: 20,
  },
  tutorialText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 8,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 20,
    color: '#ffd700',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  restartButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuButton: {
    flex: 1,
    backgroundColor: '#666',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
