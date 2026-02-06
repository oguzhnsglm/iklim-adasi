import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Maskot from '../components/Maskot';

const { width, height } = Dimensions.get('window');

// Ev odaları ve içlerindeki objeler
const ROOMS = [
  {
    id: 1,
    name: "Oturma Odası",
    objects: [
      { id: "lamp1", type: "lamp", x: 20, y: 50, width: 40, height: 60, isWaste: true, name: "Lamba" },
      { id: "tv1", type: "tv", x: 140, y: 60, width: 80, height: 50, isWaste: true, name: "Televizyon" },
      { id: "sofa", type: "sofa", x: 200, y: 190, width: 100, height: 60, isWaste: false, name: "Koltuk" },
      { id: "plant", type: "plant", x: 280, y: 50, width: 35, height: 50, isWaste: false, name: "Bitki" },
      { id: "table", type: "table", x: 20, y: 180, width: 60, height: 40, isWaste: false, name: "Sehpa" },
      { id: "fan", type: "fan", x: 240, y: 130, width: 40, height: 40, isWaste: true, name: "Vantilatör" },
      { id: "frame", type: "frame", x: 100, y: 130, width: 50, height: 40, isWaste: false, name: "Tablo" },
    ]
  },
  {
    id: 2,
    name: "Yatak Odası",
    objects: [
      { id: "lamp2", type: "lamp", x: 20, y: 50, width: 35, height: 55, isWaste: true, name: "Lamba" },
      { id: "bed", type: "bed", x: 180, y: 140, width: 120, height: 90, isWaste: false, name: "Yatak" },
      { id: "nightstand", type: "nightstand", x: 100, y: 50, width: 50, height: 45, isWaste: false, name: "Komodin" },
      { id: "charger", type: "charger", x: 20, y: 180, width: 30, height: 25, isWaste: true, name: "Şarj Aleti" },
      { id: "wardrobe", type: "wardrobe", x: 260, y: 70, width: 60, height: 120, isWaste: false, name: "Dolap" },
      { id: "ac", type: "ac", x: 180, y: 50, width: 50, height: 35, isWaste: true, name: "Klima" },
    ]
  },
  {
    id: 3,
    name: "Mutfak",
    objects: [
      { id: "light", type: "lamp", x: 140, y: 50, width: 50, height: 40, isWaste: true, name: "Tavan Lambası" },
      { id: "fridge", type: "fridge", x: 250, y: 120, width: 60, height: 100, isWaste: false, name: "Buzdolabı" },
      { id: "stove", type: "stove", x: 20, y: 130, width: 70, height: 60, isWaste: true, name: "Ocak" },
      { id: "microwave", type: "microwave", x: 110, y: 110, width: 55, height: 40, isWaste: true, name: "Mikrodalga" },
      { id: "sink", type: "sink", x: 180, y: 180, width: 50, height: 45, isWaste: false, name: "Lavabo" },
      { id: "dishwasher", type: "dishwasher", x: 90, y: 180, width: 50, height: 55, isWaste: false, name: "Bulaşık Makinesi" },
    ]
  },
  {
    id: 4,
    name: "Banyo",
    objects: [
      { id: "mirror_light", type: "lamp", x: 110, y: 50, width: 60, height: 30, isWaste: true, name: "Ayna Lambası" },
      { id: "shower", type: "shower", x: 250, y: 140, width: 70, height: 90, isWaste: false, name: "Duş" },
      { id: "sink2", type: "sink", x: 110, y: 110, width: 55, height: 40, isWaste: false, name: "Lavabo" },
      { id: "heater", type: "heater", x: 20, y: 90, width: 45, height: 70, isWaste: true, name: "Isıtıcı" },
      { id: "toilet", type: "toilet", x: 80, y: 180, width: 40, height: 50, isWaste: false, name: "Tuvalet" },
      { id: "hair_dryer", type: "hairdryer", x: 200, y: 50, width: 30, height: 30, isWaste: true, name: "Saç Kurutma" },
    ]
  },
  {
    id: 5,
    name: "Çocuk Odası",
    objects: [
      { id: "desk_lamp", type: "lamp", x: 20, y: 90, width: 30, height: 50, isWaste: true, name: "Masa Lambası" },
      { id: "computer", type: "computer", x: 70, y: 90, width: 50, height: 45, isWaste: true, name: "Bilgisayar" },
      { id: "desk", type: "desk", x: 20, y: 150, width: 90, height: 50, isWaste: false, name: "Çalışma Masası" },
      { id: "bed2", type: "bed", x: 200, y: 140, width: 90, height: 80, isWaste: false, name: "Yatak" },
      { id: "toy_box", type: "toybox", x: 140, y: 50, width: 55, height: 45, isWaste: false, name: "Oyuncak Kutusu" },
      { id: "game_console", type: "console", x: 220, y: 60, width: 40, height: 30, isWaste: true, name: "Oyun Konsolu" },
    ]
  },
  {
    id: 6,
    name: "Çalışma Odası",
    objects: [
      { id: "ceiling_light", type: "lamp", x: 140, y: 50, width: 45, height: 35, isWaste: true, name: "Tavan Lambası" },
      { id: "monitor", type: "monitor", x: 70, y: 100, width: 60, height: 50, isWaste: true, name: "Monitör" },
      { id: "printer", type: "printer", x: 190, y: 100, width: 50, height: 40, isWaste: true, name: "Yazıcı" },
      { id: "office_desk", type: "desk", x: 60, y: 160, width: 100, height: 60, isWaste: false, name: "Masa" },
      { id: "chair", type: "chair", x: 20, y: 180, width: 40, height: 50, isWaste: false, name: "Sandalye" },
      { id: "bookshelf", type: "shelf", x: 260, y: 80, width: 50, height: 110, isWaste: false, name: "Kitaplık" },
    ]
  },
];

export default function EnerjiAvcisiGame({ onBack }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [energySaved, setEnergySaved] = useState(0);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [foundWastes, setFoundWastes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [totalWastes, setTotalWastes] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-50)).current;
  const toastScale = useRef(new Animated.Value(0.8)).current;
  const maskotRef = useRef(null);

  useEffect(() => {
    // Toplam israf sayısını hesapla
    const total = ROOMS.reduce((sum, room) => 
      sum + room.objects.filter(obj => obj.isWaste).length, 0
    );
    setTotalWastes(total);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameOver]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    
    // Animasyon: Yukarıdan aşağı slide + fade in + scale
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(toastTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(toastScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2 saniye sonra kaybolma animasyonu
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastScale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToastVisible(false);
        toastTranslateY.setValue(-50);
        toastScale.setValue(0.8);
      });
    }, 2000);
  };

  const handleObjectPress = (object) => {
    const objectKey = `${currentRoomIndex}-${object.id}`;
    
    if (foundWastes.includes(objectKey)) {
      return; // Zaten bulunmuş
    }

    if (object.isWaste) {
      // Doğru! İsraf bulundu
      const points = 100;
      const energy = 50;
      const newFoundWastes = [...foundWastes, objectKey];
      setScore(score + points);
      setEnergySaved(energySaved + energy);
      setFoundWastes(newFoundWastes);
      
      const congratsMessages = [
        "Harika! ⚡",
        "Tebrikler! 🌟",
        "Süper! 💫",
        "Mükemmel! ✨",
        "Bravo! 🎉",
      ];
      const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
      maskotRef.current?.showMessage(`${randomMessage}\n+${energy} enerji tasarrufu!`);

      // Tüm israflar bulundu mu kontrol et
      if (newFoundWastes.length === totalWastes) {
        setTimeout(() => {
          maskotRef.current?.showMessage("🎊 Tebrikler! Tüm israfları buldun!");
          setTimeout(() => {
            endGame(true); // true = süreden önce bitti
          }, 3500);
        }, 2500); // İlk mesaj görünsün diye kısa bekleme
      }
    } else {
      // Yanlış nesne
      maskotRef.current?.showMessage(`💡 ${object.name} israf yapmıyor`);
    }
  };

  const nextRoom = () => {
    if (currentRoomIndex < ROOMS.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    } else {
      // Son oda tamamlandı
      endGame();
    }
  };

  const endGame = async (earlyFinish = false) => {
    setGameOver(true);
    
    if (earlyFinish) {
      // Süreden önce tamamlandı, bonus puan ekle
      const timeBonus = timeLeft * 10;
      const totalScoreWithBonus = score + timeBonus;
      
      // Skoru kaydet
      try {
        const currentScore = await AsyncStorage.getItem('totalScore');
        const newScore = (parseInt(currentScore) || 0) + totalScoreWithBonus;
        await AsyncStorage.setItem('totalScore', newScore.toString());
      } catch (error) {
        console.error('Skor kaydedilemedi:', error);
      }
    } else {
      // Normal bitiş
      try {
        const currentScore = await AsyncStorage.getItem('totalScore');
        const newScore = (parseInt(currentScore) || 0) + score;
        await AsyncStorage.setItem('totalScore', newScore.toString());
      } catch (error) {
        console.error('Skor kaydedilemedi:', error);
      }
    }
  };

  const getObjectEmoji = (type) => {
    switch(type) {
      case "lamp": return "💡";
      case "tv": return "📺";
      case "sofa": return "🛋️";
      case "plant": return "🪴";
      case "table": return "📋";
      case "fan": return "🌀";
      case "frame": return "🖼️";
      case "bed": return "🛌";
      case "nightstand": return "🗄️";
      case "charger": return "🔌";
      case "wardrobe": return "🚪";
      case "ac": return "❄️";
      case "fridge": return "🧊";
      case "stove": return "🔥";
      case "microwave": return "📦";
      case "sink": return "🚰";
      case "dishwasher": return "🧼";
      case "shower": return "🚿";
      case "heater": return "🔥";
      case "toilet": return "🚽";
      case "hairdryer": return "💨";
      case "computer": return "💻";
      case "desk": return "🪑";
      case "toybox": return "🧸";
      case "console": return "🎮";
      case "monitor": return "🖥️";
      case "printer": return "🖨️";
      case "chair": return "🪑";
      case "shelf": return "📚";
      default: return "⬜";
    }
  };

  const restartGame = () => {
    setTimeLeft(60);
    setScore(0);
    setEnergySaved(0);
    setCurrentRoomIndex(0);
    setFoundWastes([]);
    setGameOver(false);
  };

  const currentRoom = ROOMS[currentRoomIndex];
  const roomWastes = currentRoom.objects.filter(obj => obj.isWaste);
  const roomFoundWastes = foundWastes.filter(key => key.startsWith(`${currentRoomIndex}-`));
  const roomCompleted = roomWastes.length === roomFoundWastes.length && roomWastes.length > 0;

  if (gameOver) {
    const timeBonus = timeLeft > 0 ? timeLeft * 10 : 0;
    const finalScore = score + timeBonus;
    
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Ionicons name="trophy" size={80} color="#FFD700" />
          {timeBonus > 0 && (
            <View style={styles.bonusBadge}>
              <Ionicons name="flash" size={20} color="#FFD700" />
              <Text style={styles.bonusText}>Hızlı Bitiş Bonusu!</Text>
            </View>
          )}
          <Text style={styles.resultTitle}>
            {timeBonus > 0 ? 'Tebrikler! Mükemmel!' : 'Oyun Bitti!'}
          </Text>
          
          <View style={styles.scoreBreakdown}>
            <Text style={styles.baseScoreText}>Oyun Puanı: {score}</Text>
            {timeBonus > 0 && (
              <Text style={styles.bonusScoreText}>Zaman Bonusu: +{timeBonus}</Text>
            )}
            <View style={styles.divider} />
            <Text style={styles.resultText}>Toplam Puan: {finalScore}</Text>
          </View>
          
          <Text style={styles.energyText}>⚡ {energySaved} birim enerji tasarrufu</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.playAgainButton} onPress={restartGame}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.playAgainButtonText}>Tekrar Oyna</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.homeButton} onPress={onBack}>
              <Ionicons name="home" size={20} color="#FFFFFF" />
              <Text style={styles.homeButtonText}>Ana Sayfa</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.messageText}>
            Küçük bir tık, büyük bir fark yaratır. Enerjiyi koru, geleceği koru! 🌍
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Enerji Avcısı</Text>
          <Text style={styles.roomTitle}>{currentRoom.name}</Text>
        </View>
        <View style={styles.timerBox}>
          <Ionicons name="time" size={18} color="#F59E0B" />
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="flash" size={20} color="#FFD700" />
          <Text style={styles.statText}>{energySaved} birim</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color="#8B5CF6" />
          <Text style={styles.statText}>{score} puan</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.progressText}>
            {foundWastes.length}/{totalWastes} bulundu
          </Text>
        </View>
      </View>

      {/* Game Area - Oda */}
      <View style={styles.gameArea}>
        <Text style={styles.instructionText}>
          Enerji israfı yapan nesnelere dokun ve kapat!
        </Text>
        
        <View style={styles.room}>
          {currentRoom.objects.map((object) => {
            const objectKey = `${currentRoomIndex}-${object.id}`;
            const isFound = foundWastes.includes(objectKey);
            
            return (
              <View
                key={object.id}
                style={[
                  styles.objectContainer,
                  {
                    left: object.x,
                    top: object.y,
                    width: object.width,
                    height: object.height,
                  }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleObjectPress(object)}
                  disabled={isFound}
                  style={[
                    styles.objectButton,
                    { 
                      width: object.width,
                      height: object.height,
                      opacity: isFound ? 0.4 : 1,
                    }
                  ]}
                >
                  <Text style={styles.emojiText}>{getObjectEmoji(object.type)}</Text>
                  {isFound && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.objectLabel}>{object.name}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Next Room Button */}
      {roomCompleted && currentRoomIndex < ROOMS.length - 1 && (
        <TouchableOpacity style={styles.nextRoomButton} onPress={nextRoom}>
          <Text style={styles.nextRoomText}>Sonraki Oda</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Progress Indicator */}
      <View style={styles.roomProgress}>
        {ROOMS.map((room, index) => (
          <View
            key={room.id}
            style={[
              styles.progressDot,
              {
                backgroundColor: index === currentRoomIndex 
                  ? '#8B5CF6' 
                  : index < currentRoomIndex 
                    ? '#10B981' 
                    : '#1A1F3A'
              }
            ]}
          />
        ))}
      </View>

      {/* Animated Toast Notification */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastOpacity,
              transform: [
                { translateY: toastTranslateY },
                { scale: toastScale },
              ],
            },
          ]}
        >
          <View style={styles.toastContent}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* Maskot - Oyun içinde */}
      <Maskot ref={maskotRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1F3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  roomTitle: {
    fontSize: 14,
    color: '#8B92A7',
    marginTop: 2,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1A1F3A',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#8B92A7',
    textAlign: 'center',
    marginBottom: 20,
  },
  room: {
    flex: 1,
    backgroundColor: '#1A1F3A',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  objectContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  objectButton: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: 'transparent',
  },
  emojiText: {
    fontSize: 36,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },
  nextRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  nextRoomText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roomProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  energyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 16,
  },
  impactText: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 14,
    color: '#8B92A7',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
  },
  playAgainButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  toastContent: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginTop: 16,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreBreakdown: {
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    marginVertical: 16,
    minWidth: 280,
    alignItems: 'center',
  },
  baseScoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B92A7',
    marginBottom: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#2A2F4A',
    marginVertical: 12,
  },
  bonusScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 8,
  },
});
