import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { BlurView } from "expo-blur";
import { MODERN_THEME } from "../theme";

/**
 * Glassmorphism Effect Component
 * iOS 26 stilinde cam görünümü efekti sağlar
 */
export const GlassmorphismCard = ({
  intensity = 60,
  style,
  children,
  containerStyle,
}) => {
  return (
    <BlurView intensity={intensity} style={containerStyle}>
      <View
        style={[
          styles.glassContainer,
          {
            backgroundColor: MODERN_THEME.glass.medium,
            borderColor: "rgba(255, 255, 255, 0.3)",
          },
          style,
        ]}
      >
        {children}
      </View>
    </BlurView>
  );
};

/**
 * Soft Glow Background
 * Kartlar veya bölümler için yumuşak ışık efekti
 */
export const SoftGlow = ({ intensity = 0.2, style, children }) => {
  return (
    <View
      style={[
        styles.glowContainer,
        {
          backgroundColor: MODERN_THEME.effects.softGlow,
          opacity: intensity,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/**
 * Modern Button Component
 * iOS 26 stilinde modern buton
 */
export const ModernButton = ({
  onPress,
  title,
  emoji,
  style,
  disabled = false,
  loading = false,
  variant = "primary", // primary | secondary | outline
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      primary: {
        backgroundColor: MODERN_THEME.accents.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: MODERN_THEME.glass.medium,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: MODERN_THEME.accents.primary,
      },
    };
    return baseStyle[variant] || baseStyle.primary;
  };

  const getTextColor = () => {
    if (variant === "outline") return MODERN_THEME.accents.primary;
    return MODERN_THEME.text.inverse;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.button, getButtonStyle(), style]}
    >
      {emoji && <Text style={styles.buttonEmoji}>{emoji}</Text>}
      <Text style={[styles.buttonText, { color: getTextColor() }]}>
        {loading ? "Yükleniyor..." : title}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Animated Background with Nature Elements
 * Doğa temalı animasyonlu arka plan
 */
export const NatureAnimatedBackground = ({ themeId = "rainforest" }) => {
  const getEmojis = () => {
    const themes = {
      rainforest: ["🌳", "🌿", "🍃", "🦋", "🐦"],
      ocean: ["🌊", "🐠", "🐚", "🦀", "🐙"],
      desert: ["🌵", "🐪", "🌞", "🦂", "🏜"],
      arctic: ["❄️", "🐧", "🦭", "🐻‍❄️", "🧊"],
    };
    return themes[themeId] || themes.rainforest;
  };

  const emojis = getEmojis();

  return (
    <View style={styles.animatedBgContainer}>
      {emojis.map((emoji, index) => (
        <View
          key={`${emoji}-${index}`}
          style={[
            styles.floatingEmoji,
            {
              left: `${(index * 20) % 100}%`,
              top: `${(index * 15) % 100}%`,
              opacity: 0.15,
            },
          ]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: MODERN_THEME.effects.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  glowContainer: {
    borderRadius: 20,
    padding: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
  },
  buttonEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  animatedBgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    pointerEvents: "none",
  },
  floatingEmoji: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 60,
  },
});

export default {
  GlassmorphismCard,
  SoftGlow,
  ModernButton,
  NatureAnimatedBackground,
};
