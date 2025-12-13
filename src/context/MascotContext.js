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

// Tema bazlı kutlama mesajları (konuşma balonu için)
const THEME_DEFAULT_MESSAGES = {
  rainforest: [
    'Tebrikler! 🎉',
    'Harikasın! ✨',
    'Bravo! 👏',
    'Devam et! 💪',
  ],
  pacific: [
    'Harikasın! ✨',
    'Mükemmelsin! 🎊',
    'Süpersin! 💫',
  ],
  antarctica: [
    'Çok iyi! 👍',
    'Aferin! 🌟',
    'Görev tamamlandı! 🏆',
  ],
  sahara: [
    'Süpersin! 💫',
    'Devam et! 💪',
    'You did it! 🌟',
  ],
};

const DEFAULT_MESSAGES = {
  default: [
    'Bravo! 👏',
    'Tebrikler! 🎉',
    'Harikasın! ✨',
    'Süpersin! 💫',
    'Aferin! 🌟',
    'Çok iyi! 👍',
    'Mükemmelsin! 🎊',
    'Devam et! 💪',
  ],
  questCompleted: [
    'Görev tamamlandı! 🏆',
    'Başardın! 🏆',
    'Harika iş! 🎖️',
    'Hepsini bitirdin! 🎉',
    'Müthişsin! 💎',
  ],
  correctAnswer: [
    'Doğru cevap! 🎯',
    'Tam isabet! ✅',
    'İşte bu! 🙌',
    'Harikasın! 🎉',
    'Bravo! 👏',
    'İyi iş! 💪',
  ],
  wrongAnswer: [
    'Olmadı, tekrar deneyelim! 🙂',
    'Hiç sorun değil, bir daha dene! 💪',
    'Az kalsın oluyordu! Tekrar deneyebilirsin. 🔁',
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
  const { activeTheme } = useThemeProgress();

  const celebrate = useCallback(
    (type = 'default') => {
      const themeId = activeTheme?.id || 'rainforest';

      let list;
      if (type === 'default') {
        list = THEME_DEFAULT_MESSAGES[themeId] || DEFAULT_MESSAGES.default;
      } else {
        list = DEFAULT_MESSAGES[type] || THEME_DEFAULT_MESSAGES[themeId] || DEFAULT_MESSAGES.default;
      }

      const text = list[Math.floor(Math.random() * list.length)];
      setMessage(text);
      setMode('celebrate');
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setMode('idle');
      }, 2600);
    },
    [activeTheme?.id],
  );

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
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const antennaAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const swimAnim = useRef(new Animated.Value(0)).current;

  // Idle animasyonu
  useEffect(() => {
    const isPacific = activeTheme.id === 'pacific';
    const idle = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: isPacific ? 0 : -6,
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
  }, [floatAnim, activeTheme.id]);

  // Nefes alma (breathe) efekti
  useEffect(() => {
    const isAntarctica = activeTheme.id === 'antarctica';
    const isSahara = activeTheme.id === 'sahara';
    const targetScale = isAntarctica ? 1.08 : 1.05;
    const duration = isSahara ? 2600 : 2000;

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: targetScale,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    breathe.start();
    return () => breathe.stop();
  }, [breatheAnim, activeTheme.id]);

  // Göz kırpma efekti (tüm karakterde hafif dikey sıkışma)
  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(5000),
        Animated.timing(blinkAnim, {
          toValue: 0.85,
          duration: 80,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 120,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    blinkLoop.start();
    return () => blinkLoop.stop();
  }, [blinkAnim]);

  // Anten hoppama animasyonu (hafif yukarı-aşağı)
  useEffect(() => {
    const antennaLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(antennaAnim, {
          toValue: -4,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(antennaAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    antennaLoop.start();
    return () => antennaLoop.stop();
  }, [antennaAnim]);

  // Pasifik temasında hafif sağa-sola yüzme efekti
  useEffect(() => {
    if (activeTheme.id !== 'pacific') {
      swimAnim.setValue(0);
      return;
    }

    const swim = Animated.loop(
      Animated.sequence([
        Animated.timing(swimAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(swimAnim, {
          toValue: -1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    swim.start();
    return () => swim.stop();
  }, [activeTheme.id, swimAnim]);

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

  const idleRotation = useMemo(() => {
    if (activeTheme.id === 'sahara') {
      return rotateAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-3deg', '0deg', '3deg'],
      });
    }
    return rotation;
  }, [activeTheme.id, rotateAnim, rotation]);

  const swimTranslateX = swimAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-4, 0, 4],
  });

  const hasMessage = !!message;

  // Tema bazlı arka plan ve çerçeve renkleri (temaya uygun, sade görünüm)
  const themedCircleStyle = useMemo(() => {
    switch (activeTheme.id) {
      case 'rainforest':
        return {
          backgroundColor: 'rgba(220,252,231,0.98)', // yumuşak yağmur ormanı yeşili
          borderColor: 'rgba(22,101,52,0.9)',
        };
      case 'pacific':
        return {
          backgroundColor: 'rgba(224,242,254,0.98)', // okyanus mavisi tonları
          borderColor: 'rgba(3,105,161,0.9)',
        };
      case 'antarctica':
        return {
          backgroundColor: 'rgba(239,246,255,0.98)', // buzlu mavi-beyaz
          borderColor: 'rgba(59,130,246,0.9)',
        };
      case 'sahara':
        return {
          backgroundColor: 'rgba(255,247,237,0.98)', // sıcak kum rengi
          borderColor: 'rgba(194,65,12,0.9)',
        };
      default:
        return null;
    }
  }, [activeTheme.id]);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.inner}>
        {hasMessage && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        )}
        {/* Anten */}
        <Animated.View
          style={[
            styles.antennaWrapper,
            {
              transform: [{ translateY: antennaAnim }],
            },
          ]}
        >
          <View style={styles.antennaStem} />
          <View style={styles.antennaTip} />
        </Animated.View>
        <Animated.View
          style={[
            styles.mascotOuter,
            {
              transform: [
                { translateX: swimTranslateX },
                { translateY: floatAnim },
                { scale: breatheAnim },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.mascotCircle,
              themedCircleStyle,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: idleRotation },
                  { scaleY: blinkAnim },
                ],
              },
            ]}
          >
            {/* Pembe yanaklar */}
            <View style={styles.cheekLeft} />
            <View style={styles.cheekRight} />
            {mascotSource ? (
              <Image source={mascotSource} style={styles.mascotImage} resizeMode="contain" />
            ) : (
              <Text style={styles.mascotFallback}>{activeTheme.icon}</Text>
            )}
          </Animated.View>
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
        <ConfettiPiece index={i} key={i} />
      ))}
    </View>
  );
}

function ConfettiPiece({ index }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const distance = 40 + index * 10;
    const duration = 600 + index * 80;
    const delay = index * 50;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -distance,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index, opacity, translateY]);

  const colors = ['#f97316', '#22c55e', '#3b82f6', '#e11d48', '#facc15'];
  const backgroundColor = colors[index % colors.length];

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: 6 + index * 10,
          backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
  mascotOuter: {
    alignItems: 'center',
    justifyContent: 'center',
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
  antennaWrapper: {
    position: 'absolute',
    right: 34,
    bottom: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  antennaStem: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#fb7185',
  },
  antennaTip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f97316',
    marginTop: -3,
  },
  mascotImage: {
    width: '90%',
    height: '90%',
  },
  mascotFallback: {
    fontSize: 28,
  },
  cheekLeft: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(248, 113, 113, 0.8)',
  },
  cheekRight: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(248, 113, 113, 0.8)',
  },
  confettiContainer: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    width: 80,
    height: 80,
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
