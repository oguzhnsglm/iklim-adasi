import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { useThemeProgress } from "../ThemeProgressContext";

// Tema geçişlerinde kullanılacak Lottie tabanlı overlay
export default function ThemeTransitionOverlay({
  visible,
  targetThemeId,
  onFinished,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const { activeTheme, themes } = useThemeProgress();

  const targetTheme = themes.find((t) => t.id === targetThemeId);

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinished) onFinished();
    });
  }, [visible]);

  if (!visible || !targetTheme) return null;

  const fromName = activeTheme?.name || "";
  const toName = targetTheme.name;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}> 
      <View style={styles.card}>
        {Platform.OS !== "web" ? (
          <LottieView
            source={require("../../assets/lottie/theme-transition-forest-to-sea.json")}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        ) : (
          <View style={styles.fallbackCircle} />
        )}

        <Text style={styles.title}>Tema Değiştiriliyor</Text>
        <Text style={styles.subtitle}>
          {fromName} ➜ {toName}
        </Text>
        <Text style={styles.helper}>Çevreyi temizledikçe yeni dünyalar açılıyor!</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    width: "80%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(15,23,42,0.95)",
    alignItems: "center",
  },
  lottie: {
    width: 220,
    height: 220,
    marginBottom: 12,
  },
  fallbackCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#4DD0E1",
    backgroundColor: "rgba(33,150,243,0.25)",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E0F2F1",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B2EBF2",
    marginTop: 4,
  },
  helper: {
    fontSize: 13,
    color: "#80CBC4",
    marginTop: 10,
    textAlign: "center",
  },
});
