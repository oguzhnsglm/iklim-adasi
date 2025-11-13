import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THEME } from "../theme";

// Ana sayfa: Başlık, açıklama ve Oyna butonu
export default function HomeScreen({ onPlay }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Su Koruyucuları</Text>
      <Text style={styles.subtitle}>
        Cam ve plastik atıkları doğru kovaya bırakarak denizi temizle. Parmağınla ağı sürükleyip doğru ayrışımlar yap!
      </Text>
      <TouchableOpacity style={styles.cta} onPress={onPlay}>
        <Text style={styles.ctaText}>Oyna</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.background,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: THEME.deepSea,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    color: THEME.textDark,
    lineHeight: 22,
    marginBottom: 24,
    fontSize: 16,
  },
  cta: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: THEME.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  ctaText: {
    color: THEME.textLight,
    fontWeight: "700",
    fontSize: 18,
  },
});
