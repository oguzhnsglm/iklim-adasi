import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MODERN_THEME } from "../theme";
import { TreePlantingCard } from "./TreePlantingCard";

const { width, height } = Dimensions.get("window");

export const ModernSplashScreen = ({ onStartGame, onClose }) => {
  // Animasyonlar
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardSlideAnim = useRef(new Animated.Value(100)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Giriş animasyonu
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Kart animasyonu (gecikmeyle)
    setTimeout(() => {
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, []);

  const handlePlayPress = () => {
    // Scale animasyonu
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Çıkış animasyonu
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onStartGame) {
        onStartGame();
      }
    });
  };

  // Parallax efekti için scroll listener
  const parallaxOffset = useRef(new Animated.Value(0)).current;

  const FloatingElements = () => (
    <View style={styles.floatingElements}>
      {/* Yukarı sağda büyük yaprak */}
      <Animated.View
        style={[
          styles.floatingElement,
          {
            top: "10%",
            right: "5%",
            opacity: fadeInAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            }),
          },
        ]}
      >
        <Text style={styles.largeEmoji}>🍃</Text>
      </Animated.View>

      {/* Sol tarafta küçük çiçek */}
      <Animated.View
        style={[
          styles.floatingElement,
          {
            bottom: "20%",
            left: "8%",
            opacity: fadeInAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      >
        <Text style={styles.smallEmoji}>🌼</Text>
      </Animated.View>

      {/* Sağ tarafta küçük kuş */}
      <Animated.View
        style={[
          styles.floatingElement,
          {
            bottom: "30%",
            right: "10%",
            opacity: fadeInAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.25],
            }),
          },
        ]}
      >
        <Text style={styles.tinyEmoji}>🐦</Text>
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Arka Planı */}
      <LinearGradient
        colors={MODERN_THEME.gradients.soft}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Dekoratif Floating Elements */}
      <FloatingElements />

      {/* Ana İçerik */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeInAnim,
            transform: [
              { translateY: slideUpAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Header Bölümü */}
        <View style={styles.headerSection}>
          {/* Emoji Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌍</Text>
            <Text style={styles.logoEmoji2}>♻️</Text>
          </View>

          {/* Başlık */}
          <Text style={styles.mainTitle}>Doğayı Koru</Text>

          {/* Alt başlık */}
          <Text style={styles.subtitle}>
            Oyna, öğren, dünyayı iyileştir
          </Text>

          {/* Dekoratif çizgi */}
          <View style={styles.decorLine} />
        </View>

        {/* Ağaç Dikme Kartı */}
        <Animated.View
          style={[
            styles.cardSection,
            {
              transform: [{ translateY: cardSlideAnim }],
              opacity: cardSlideAnim.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <TreePlantingCard onTreePlanted={() => {}} />
        </Animated.View>

        {/* Oyun Başlama Butonu */}
        <Animated.View
          style={[
            styles.playButtonContainer,
            {
              transform: [{ scale: buttonScaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePlayPress}
            style={styles.playButton}
          >
            {/* Glassmorphism Efekti */}
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.25)",
                "rgba(255, 255, 255, 0.1)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.playButtonEmoji}>🎮</Text>
              <Text style={styles.playButtonText}>OYUNA BAŞLA</Text>
            </LinearGradient>

            {/* Glow Efekti */}
            <View style={styles.buttonGlow} />
          </TouchableOpacity>
        </Animated.View>

        {/* Alt Bilgi Metni */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Her oyun oynayarak doğayı daha iyi yapabilirsin ✨
          </Text>
        </View>
      </Animated.View>

      {/* Kapanış Butonu (opsiyonel) */}
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.6}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_THEME.backgrounds.primary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingElements: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  floatingElement: {
    position: "absolute",
  },
  largeEmoji: {
    fontSize: 80,
    opacity: 0.3,
  },
  smallEmoji: {
    fontSize: 50,
    opacity: 0.25,
  },
  tinyEmoji: {
    fontSize: 40,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 40,
    zIndex: 10,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 60,
    marginHorizontal: 8,
  },
  logoEmoji2: {
    fontSize: 60,
    marginHorizontal: 8,
  },
  mainTitle: {
    fontSize: 44,
    fontWeight: "800",
    color: MODERN_THEME.text.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: MODERN_THEME.text.secondary,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  decorLine: {
    width: 40,
    height: 3,
    backgroundColor: MODERN_THEME.accents.primary,
    borderRadius: 2,
    marginTop: 16,
    opacity: 0.5,
  },
  cardSection: {
    marginVertical: 20,
  },
  playButtonContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  playButton: {
    width: width - 40,
    maxWidth: 300,
    position: "relative",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(20px)",
  },
  buttonGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    backgroundColor: MODERN_THEME.accents.primary,
    opacity: 0.1,
    zIndex: -1,
  },
  playButtonEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_THEME.text.primary,
    letterSpacing: 0.8,
  },
  infoSection: {
    alignItems: "center",
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: MODERN_THEME.text.secondary,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_THEME.glass.medium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: MODERN_THEME.text.primary,
    fontWeight: "600",
  },
});
