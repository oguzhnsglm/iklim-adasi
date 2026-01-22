import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { MODERN_THEME } from "../theme";
import soundManager from "../utils/sounds";

const { height } = Dimensions.get("window");

export const BadgeUnlockNotification = ({ badge, onDismiss }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!badge) return;

    // Giriş animasyonu
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: 2,
      }
    ).start();

    // Badge unlock sesi
    soundManager.play("levelup");

    // 3 saniye sonra kapat
    const dismissTimer = setTimeout(() => {
      dismissNotification();
    }, 3000);

    return () => clearTimeout(dismissTimer);
  }, [badge]);

  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  if (!badge) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Arka plan ışık */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            opacity: sparkleAnim,
          },
        ]}
      />

      {/* Kart */}
      <View style={styles.card}>
        {/* İkon */}
        <View style={styles.iconContainer}>
          <Text style={styles.badgeIcon}>{badge.icon}</Text>
          
          {/* Sparkle efektleri */}
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={`sparkle-${index}`}
              style={[
                styles.sparkle,
                {
                  transform: [
                    {
                      translateX: Animated.multiply(
                        sparkleAnim,
                        Math.cos((index * Math.PI * 2) / 3) * 30
                      ),
                    },
                    {
                      translateY: Animated.multiply(
                        sparkleAnim,
                        Math.sin((index * Math.PI * 2) / 3) * 30
                      ),
                    },
                  ],
                  opacity: sparkleAnim,
                },
              ]}
            >
              <Text style={styles.sparkleIcon}>✨</Text>
            </Animated.View>
          ))}
        </View>

        {/* Metin */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Rozet Açıldı!</Text>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  glowBackground: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 20,
    backgroundColor: MODERN_THEME.effects.strongGlow,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_THEME.glass.strong,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: MODERN_THEME.effects.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    minWidth: 56,
    height: 56,
  },
  badgeIcon: {
    fontSize: 42,
  },
  sparkle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleIcon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: MODERN_THEME.accents.primary,
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_THEME.text.primary,
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: 12,
    color: MODERN_THEME.text.secondary,
    lineHeight: 16,
  },
});
