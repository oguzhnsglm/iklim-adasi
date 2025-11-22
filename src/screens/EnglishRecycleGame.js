import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// Çöp nesneleri ve İngilizce karşılıkları
const ITEMS = [
  { id: 1, icon: '🍾', english: 'bottle', turkish: 'şişe', type: 'plastic' },
  { id: 2, icon: '📄', english: 'paper', turkish: 'kağıt', type: 'paper' },
  { id: 3, icon: '🥫', english: 'can', turkish: 'teneke kutu', type: 'metal' },
  { id: 4, icon: '🍷', english: 'glass', turkish: 'cam', type: 'glass' },
  { id: 5, icon: '📰', english: 'newspaper', turkish: 'gazete', type: 'paper' },
  { id: 6, icon: '🥤', english: 'cup', turkish: 'bardak', type: 'plastic' },
  { id: 7, icon: '📦', english: 'box', turkish: 'kutu', type: 'cardboard' },
  { id: 8, icon: '🍶', english: 'jar', turkish: 'kavanoz', type: 'glass' },
  { id: 9, icon: '🗞️', english: 'magazine', turkish: 'dergi', type: 'paper' },
  { id: 10, icon: '🧃', english: 'carton', turkish: 'karton kutu', type: 'cardboard' },
];

export default function EnglishRecycleGame({ onBack }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(100);
  const [currentItem, setCurrentItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState(''); // 'time' veya 'lives'
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [phase, setPhase] = useState('TUTORIAL'); // TUTORIAL | PLAYING

  useEffect(() => {
    if (phase === 'PLAYING') {
      startNewRound();
    }
  }, [phase]);

  // Süre sayacı
  useEffect(() => {
    if (gameOver || showVocabulary || phase === 'TUTORIAL') return;

    const timer = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          setGameOver(true);
          setGameOverReason('time');
          setTimeout(() => {
            setShowVocabulary(true);
          }, 1500);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, showVocabulary, phase]);

  const startNewRound = () => {
    // Rastgele bir çöp seç
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    setCurrentItem(randomItem);

    // Doğru cevabı içeren 4 seçenek oluştur
    const wrongOptions = ITEMS.filter(item => item.id !== randomItem.id);
    const shuffled = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    const allOptions = [...shuffled, randomItem].sort(() => 0.5 - Math.random());
    
    setOptions(allOptions);
    setFeedback('');
  };

  const handleChoice = (selectedItem) => {
    if (gameOver || feedback !== '') return; // Feedback varsa tıklamayı engelle

    if (selectedItem.id === currentItem.id) {
      // Doğru cevap
      setFeedback('✅ Recycled! / Geri Dönüştürüldü! +10p');
      setScore(prev => prev + 10);
      
      setTimeout(() => {
        startNewRound();
      }, 1500);
    } else {
      // Yanlış cevap - can azalt ama oyuna devam et
      setFeedback('❌ Try again!');
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setGameOver(true);
        setGameOverReason('lives');
        // 2.5 saniye sonra kelime listesini göster
        setTimeout(() => {
          setShowVocabulary(true);
        }, 2500);
      } else {
        // Can kaldıysa 1 saniye sonra feedback'i temizle ve devam et
        setTimeout(() => {
          setFeedback('');
        }, 1000);
      }
    }
  };

  const restartGame = () => {
    setScore(0);
    setLives(3);
    setTime(100);
    setGameOver(false);
    setGameOverReason('');
    setShowVocabulary(false);
    setPhase('PLAYING');
    startNewRound();
  };

  // Tutorial Ekranı
  if (phase === 'TUTORIAL') {
    return (
      <View style={styles.container}>
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>📚 English Recycle Game</Text>
            
            <View style={styles.tutorialInstructions}>
              <Text style={styles.tutorialText}>🎯 Doğru İngilizce kelimeyi seç</Text>
              <Text style={styles.tutorialText}>⏰ 100 saniye süren var</Text>
              <Text style={styles.tutorialText}>❤️ 3 canın var</Text>
              <Text style={styles.tutorialText}>✅ Doğru cevap = +10 puan</Text>
              <Text style={styles.tutorialText}>❌ Yanlış cevap = -1 can</Text>
              <Text style={styles.tutorialText}>📖 Oyun sonunda kelime listesi</Text>
            </View>

            <TouchableOpacity 
              style={styles.startGameButton}
              onPress={() => setPhase('PLAYING')}
            >
              <Text style={styles.startGameText}>▶ Başla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showVocabulary) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📚 Vocabulary</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.vocabularyContainer}>
          <Text style={styles.vocabularyTitle}>🌍 English - Turkish</Text>
          <Text style={styles.vocabularySubtitle}>Learn these recycling words!</Text>

          {gameOver && (
            <View style={styles.finalScoreBox}>
              <Text style={styles.finalScoreLabel}>Final Score</Text>
              <Text style={styles.finalScoreValue}>{score} points</Text>
            </View>
          )}

          <View style={styles.vocabularyList}>
            {ITEMS.map(item => (
              <View key={item.id} style={styles.vocabularyItem}>
                <Text style={styles.vocabularyIcon}>{item.icon}</Text>
                <View style={styles.vocabularyTextContainer}>
                  <Text style={styles.vocabularyEnglish}>{item.english}</Text>
                  <Text style={styles.vocabularyTurkish}>= {item.turkish}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.playAgainBtn} onPress={() => {
            setShowVocabulary(false);
            if (gameOver) {
              restartGame();
            }
          }}>
            <Text style={styles.playAgainText}>
              {gameOver ? '🔄 Play Again' : '🎮 Back to Game'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>♻️ English Recycle</Text>
        <TouchableOpacity style={styles.vocabBtn} onPress={() => setShowVocabulary(true)}>
          <Text style={styles.vocabBtnText}>📚</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{time}s</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Lives</Text>
          <Text style={styles.statValue}>{'❤️'.repeat(lives)}</Text>
        </View>
      </View>

      {/* Game Area - ScrollView eklendi */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.gameArea}
        showsVerticalScrollIndicator={true}
      >
        {/* Feedback */}
        {feedback && (
          <View style={styles.feedbackContainer}>
            <Text style={[
              styles.feedbackText,
              feedback.includes('Recycled') && styles.feedbackSuccess,
              feedback.includes('Try again') && styles.feedbackError,
              feedback.includes('Game Over') && styles.feedbackGameOver
            ]}>
              {feedback}
            </Text>
          </View>
        )}

        {/* Current Item */}
        {currentItem && !gameOver && (
          <View style={styles.itemContainer}>
            <Text style={styles.instruction}>What is this in English?</Text>
            <View style={styles.itemDisplay}>
              <Text style={styles.itemIcon}>{currentItem.icon}</Text>
              <Text style={styles.itemTurkish}>({currentItem.turkish})</Text>
            </View>
          </View>
        )}

        {/* Options */}
        {!gameOver && options.length > 0 && (
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() => handleChoice(option)}
                disabled={feedback !== ''}
              >
                <Text style={styles.optionText}>{option.english}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Game Over */}
        {gameOver && (
          <View style={styles.gameOverContainer}>
            {gameOverReason === 'time' ? (
              <>
                <Text style={styles.gameOverTitle}>⏰ Time's Up!</Text>
                <Text style={styles.gameOverSubtitle}>Süre Doldu!</Text>
              </>
            ) : (
              <>
                <Text style={styles.gameOverTitle}>💔 No Lives Left!</Text>
                <Text style={styles.gameOverSubtitle}>Canın Kalmadı!</Text>
              </>
            )}
            <Text style={styles.gameOverScore}>Final Score / Son Puan: {score}</Text>
            <Text style={styles.gameOverMessage}>Redirecting to vocabulary...</Text>
            <Text style={styles.gameOverMessage}>Kelime listesine yönlendiriliyorsunuz...</Text>
          </View>
        )}

        {/* Instructions */}
        {!gameOver && (
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionText}>
              🎯 Choose the correct English word!
            </Text>
            <Text style={styles.instructionText}>
              ✅ Correct = +10 points
            </Text>
            <Text style={styles.instructionText}>
              ❌ Wrong = -1 life
            </Text>
          </View>
        )}
      </ScrollView>
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
  vocabBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    width: 60,
    alignItems: 'center',
  },
  vocabBtnText: {
    fontSize: 20,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameArea: {
    padding: 20,
    paddingBottom: 40,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedbackSuccess: {
    color: '#4CAF50',
  },
  feedbackError: {
    color: '#f87171',
  },
  feedbackGameOver: {
    color: '#ff6b6b',
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instruction: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  itemDisplay: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 200,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  itemIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  itemTurkish: {
    fontSize: 16,
    color: '#a5d6a7',
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#a5d6a7',
    textAlign: 'center',
  },
  gameOverContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 5,
  },
  gameOverSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#a5d6a7',
    marginBottom: 15,
  },
  gameOverScore: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 15,
  },
  gameOverMessage: {
    fontSize: 14,
    color: '#a5d6a7',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 5,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
  },
  restartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vocabButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
  },
  vocabButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vocabularyContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  vocabularyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  vocabularySubtitle: {
    fontSize: 16,
    color: '#a5d6a7',
    textAlign: 'center',
    marginBottom: 20,
  },
  finalScoreBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
    marginBottom: 20,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: '#a5d6a7',
    marginBottom: 5,
  },
  finalScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  vocabularyList: {
    gap: 12,
    marginBottom: 20,
  },
  vocabularyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  vocabularyIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  vocabularyTextContainer: {
    flex: 1,
  },
  vocabularyEnglish: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  vocabularyTurkish: {
    fontSize: 16,
    color: '#a5d6a7',
  },
  playAgainBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  startGameButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  startGameText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
