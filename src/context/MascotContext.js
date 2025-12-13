import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useThemeProgress } from '../ThemeProgressContext';
import { THEME } from '../theme';

// Maskot görselleri: proje kökünde assets/mascots klasörüne yerleştirilmelidir.
//  - flower.png
//  - fish.png
//  - penguin.png
//  - cactus.png

const MASCOT_IMAGES = {
  rainforest: require('../../assets/mascots/flower.png'),
  pacific: require('../../assets/mascots/fish.png'),
  antarctica: require('../../assets/mascots/penguin.png'),
  sahara: require('../../assets/mascots/cactus.png'),
};

const DEFAULT_MESSAGES = {
  default: [
    'Bravo! 👏',
    'Tebrikler! 🎉',
    'Harikasın! ✨',
    'Süpersin! 💫',
    'Aferin! 🌟',
    'Çok iyi! 👍',
    'Mükemmel! 🎊',
    'Devam et! 💪',
  ],
  questCompleted: [
    'Görev tamamlandı! 🏆',
    'Harika iş! 🎖️',
    'Hepsini bitirdin! 🎉',
    'Müthişsin! 💎',
  ],
  correctAnswer: [
    'Doğru cevap! 🎯',
    'Tam isabet! ✅',
    'İşte bu! 🙌',
  ],
};

const MascotContext = createContext({
  celebrate: (type) => {},
});

export const useMascot = () => useContext(MascotContext);

export function MascotProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [mode, setMode] = useState('idle'); // 'idle' | 'celebrate'
  const hideTimerRef = useRef(null);

  const celebrate = useCallback((type = 'default') => {
    const list = DEFAULT_MESSAGES[type] || DEFAULT_MESSAGES.default;
    const text = list[Math.floor(Math.random() * list.length)];
    setMessage(text);
    setMode('celebrate');
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setMode('idle');
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <MascotContext.Provider value={{ celebrate }}>
      {children}
      <MascotFloating mode={mode} message={message} />
    </MascotContext.Provider>
  );
}

function MascotFloating({ mode, message }) {
  const { activeTheme } = useThemeProgress();
  const mascotSource = MASCOT_IMAGES[activeTheme.id];

  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Idle animasyonu
  useEffect(() => {
    const idle = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    idle.start();
    return () => idle.stop();
  }, [floatAnim]);

  // Kutlama animasyonu
  useEffect(() => {
    if (mode !== 'celebrate') return;
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 250,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [mode, rotateAnim, scaleAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const hasMessage = !!message;

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.inner}>
        {hasMessage && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        )}
        <Animated.View
          style={[
            styles.mascotCircle,
            {
              transform: [
                { translateY: floatAnim },
                { scale: scaleAnim },
                { rotate: rotation },
              ],
            },
          ]}
        >
          {mascotSource ? (
            <Image source={mascotSource} style={styles.mascotImage} resizeMode="contain" />
          ) : (
            <Text style={styles.mascotFallback}>{activeTheme.icon}</Text>
          )}
        </Animated.View>
        {mode === 'celebrate' && <Confetti />}
      </View>
    </View>
  );
}

function Confetti() {
  const pieces = useMemo(() => [0, 1, 2, 3, 4], []);
  return (
    <View pointerEvents="none" style={styles.confettiContainer}>
      {pieces.map((i) => (
        <View key={i} style={[styles.confetti, { left: 6 + i * 10 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 140,
    alignItems: 'flex-end',
  },
  inner: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: 200,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.9)',
    marginBottom: 8,
  },
  bubbleText: {
    fontSize: 12,
    color: '#f9fafb',
  },
  mascotCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(248,250,252,0.98)',
    borderWidth: 2,
    borderColor: 'rgba(251,191,36,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: '90%',
    height: '90%',
  },
  mascotFallback: {
    fontSize: 28,
  },
  confettiContainer: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    width: 70,
    height: 40,
    flexDirection: 'row',
  },
  confetti: {
    position: 'absolute',
    width: 6,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
});
