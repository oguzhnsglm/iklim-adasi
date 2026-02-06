import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Maskot = forwardRef((props, ref) => {
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [mascotName, setMascotName] = useState('Mimo');
  
  // Animasyon değerleri
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const messageScale = useRef(new Animated.Value(0.8)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const eyeLookX = useRef(new Animated.Value(0)).current;
  const eyeLookY = useRef(new Animated.Value(0)).current;
  const mouthScale = useRef(new Animated.Value(1)).current;

  const messages = [
    `Merhaba! Ben Mimo, senin iklim arkadaşınım!`,
    "Harika gidiyorsun! Devam et!",
    "Her oyun bir ağaç, her puan bir tohum!",
    "Dünyayı korumak için küçük adımlar büyük fark yaratır!",
    "Enerji tasarrufu süper güçtür!",
    "Geri dönüşüm kahramanı!",
    "Doğa seninle gurur duyuyor!",
    "Oynarken öğren, öğrenerek koru!",
  ];

  // Dışardan mesaj gösterme fonksiyonunu açığa çıkar
  useImperativeHandle(ref, () => ({
    showMessage: (message) => {
      setCurrentMessage(message);
      setShowMessage(true);

      // Ağız animasyonu
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthScale, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(mouthScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 8 }
      ).start();

      // Mesaj açılma animasyonu
      Animated.parallel([
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(messageScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // 3 saniye sonra mesajı kapat
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(messageOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(messageScale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowMessage(false);
          messageScale.setValue(0.8);
        });
      }, 3000);
    }
  }));

  useEffect(() => {
    // Sürekli zıplama animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    // Rastgele sallanma
    const shakeInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 8000);

    // Göz kırpma animasyonu
    const blinkInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    // Etrafa bakma animasyonu
    const lookAroundInterval = setInterval(() => {
      const randomX = Math.random() > 0.5 ? 3 : -3;
      const randomY = Math.random() > 0.5 ? 2 : -2;
      
      Animated.sequence([
        Animated.parallel([
          Animated.timing(eyeLookX, {
            toValue: randomX,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(eyeLookY, {
            toValue: randomY,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(eyeLookX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(eyeLookY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 5000);

    return () => {
      clearInterval(shakeInterval);
      clearInterval(blinkInterval);
      clearInterval(lookAroundInterval);
    };
  }, []);

  const showRandomMessage = () => {
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const messageWithName = randomMsg.replace('{name}', mascotName);
    setCurrentMessage(messageWithName);
    setShowMessage(true);

    // Ağız hareketi - konuşurken
    Animated.loop(
      Animated.sequence([
        Animated.timing(mouthScale, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(mouthScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 8 }
    ).start();

    // Mesaj açılma animasyonu
    Animated.parallel([
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(messageScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 4 saniye sonra mesajı kapat
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(messageScale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowMessage(false);
        messageScale.setValue(0.8);
      });
    }, 4000);
  };

  const handlePress = () => {
    showRandomMessage();
    
    // Tıklama animasyonu
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 0,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Mesaj Balonu */}
      {showMessage && (
        <Animated.View
          style={[
            styles.messageBubble,
            {
              opacity: messageOpacity,
              transform: [{ scale: messageScale }],
            },
          ]}
        >
          <View style={styles.bubbleContent}>
            <Text style={styles.messageText}>{currentMessage}</Text>
          </View>
          <View style={styles.bubbleTail} />
        </Animated.View>
      )}

      {/* Maskot */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.maskot,
            {
              transform: [
                { translateY: bounceAnim },
                { rotate: shakeAnim.interpolate({
                  inputRange: [-10, 10],
                  outputRange: ['-8deg', '8deg'],
                })},
              ],
            },
          ]}
        >
          <View style={styles.maskotCircle}>
            <Ionicons name="earth" size={50} color="#10B981" />
            <View style={styles.faceOverlay}>
              <View style={styles.eyesContainer}>
                <Animated.View 
                  style={[
                    styles.eye,
                    {
                      transform: [
                        { scaleY: blinkAnim },
                        { translateX: eyeLookX },
                        { translateY: eyeLookY },
                      ],
                    },
                  ]} 
                />
                <Animated.View 
                  style={[
                    styles.eye,
                    {
                      transform: [
                        { scaleY: blinkAnim },
                        { translateX: eyeLookX },
                        { translateY: eyeLookY },
                      ],
                    },
                  ]} 
                />
              </View>
              <Animated.View 
                style={[
                  styles.mouth,
                  {
                    transform: [{ scaleX: mouthScale }],
                  },
                ]} 
              />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>


    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  maskot: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskotCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  faceOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  eye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A0E27',
  },
  mouth: {
    width: 16,
    height: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#0A0E27',
    marginTop: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  messageBubble: {
    maxWidth: 220,
    marginBottom: 15,
    marginRight: 10,
  },
  bubbleContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    right: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#10B981',
  },
  messageText: {
    fontSize: 14,
    color: '#0A0E27',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Maskot;
