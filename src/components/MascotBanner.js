import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../theme';

// NOT: Bu dosya, görselleri kullanmak için hazırdır.
// Aşağıdaki require satırlarının çalışması için, proje kökünde
//  assets/mascots klasörüne ilgili PNG dosyalarını koymalısın:
//   - flower.png (çiçek)
//   - fish.png (balık)
//   - penguin.png (penguen)
//   - cactus.png (kaktüs)
// Örn: c:\Users\\...\\iklim-adasi\\assets\\mascots\\flower.png

const MASCOT_IMAGES = {
  rainforest: require('../../assets/mascots/flower.png'),
  pacific: require('../../assets/mascots/fish.png'),
  antarctica: require('../../assets/mascots/penguin.png'),
  sahara: require('../../assets/mascots/cactus.png'),
};

const MASCOT_DESCRIPTIONS = {
  rainforest: {
    title: 'Yağmur Ormanı Maskotu',
    role: 'Çiçek, sana doğayı koruma görevlerini hatırlatır.',
  },
  pacific: {
    title: 'Pasifik Okyanusu Maskotu',
    role: 'Balık, deniz altındaki canlıları koruman için seni yönlendirir.',
  },
  antarctica: {
    title: 'Antarktika Buzul Maskotu',
    role: 'Penguen, buzullarda hayatta kalma ve keşif görevlerinde yanındadır.',
  },
  sahara: {
    title: 'Sahra Çölü Maskotu',
    role: 'Kaktüs, çöl sıcaklığında suyu ve enerjini korumana yardım eder.',
  },
};

export default function MascotBanner({ themeId, lives, maxLives, currentTaskTitle }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    floatAnim.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [floatAnim, themeId]);

  const mascotSource = MASCOT_IMAGES[themeId];
  const meta = MASCOT_DESCRIPTIONS[themeId] || MASCOT_DESCRIPTIONS.rainforest;

  const livesWarning = useMemo(() => {
    if (lives <= 1) return 'Dikkat! Son canın kaldı, çok dikkatli olmalısın.';
    if (lives === 2) return 'Canların azalıyor, görevleri daha dikkatli oyna.';
    return 'Hazırsın! Görevleri tamamlayıp bir sonraki temaya geçebilirsin.';
  }, [lives]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.mascotImageWrapper,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {mascotSource && (
          <Image source={mascotSource} style={styles.mascotImage} resizeMode="contain" />
        )}
      </Animated.View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{meta.title}</Text>
        <Text style={styles.role}>{meta.role}</Text>
        {!!currentTaskTitle && (
          <Text style={styles.task} numberOfLines={2}>
            Aktif görev: {currentTaskTitle}
          </Text>
        )}
        <Text style={styles.lives}>
          Canların: {lives}/{maxLives}
        </Text>
        <Text style={styles.warning}>{livesWarning}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(249,250,251,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 8,
  },
  mascotImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textDark,
  },
  role: {
    marginTop: 2,
    fontSize: 11,
    color: '#4b5563',
  },
  task: {
    marginTop: 4,
    fontSize: 11,
    color: '#111827',
  },
  lives: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  warning: {
    marginTop: 2,
    fontSize: 10,
    color: '#6b7280',
  },
});
