import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeProgress } from "../../ThemeProgressContext";
import { useThemeWorldsProgress } from "../../ThemeWorldsProgressContext";

export default function ThemeWorldsScreen({ onOpenTheme }) {
  const { activeTheme } = useThemeProgress();
  const { themes, getThemeProgress, isThemeUnlocked } = useThemeWorldsProgress();

  const palette = activeTheme?.palette;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {themes.map((t) => {
          const p = getThemeProgress(t.id);
          const unlocked = isThemeUnlocked(t.id);
          const badgeCount = Array.isArray(p.badges) ? p.badges.length : 0;
          const levelCount = p.levelCount || 0;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.9}
              onPress={() => onOpenTheme && onOpenTheme(t.id)}
              style={[
                styles.card,
                {
                  borderColor: palette?.accent || "rgba(74,222,128,0.6)",
                  backgroundColor: "rgba(255,255,255,0.10)",
                },
                !unlocked && styles.cardLocked,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.icon}>{t.icon}</Text>
                {!unlocked && <Text style={styles.lock}>🔒</Text>}
              </View>
              <Text style={[styles.name, { color: palette?.textLight || "#E5E7EB" }]}>{t.name}</Text>
              <Text style={styles.progress}>
                {p.completedLevels || 0}/{levelCount} seviye • {badgeCount} rozet
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    overflow: "hidden",
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: 28,
  },
  lock: {
    fontSize: 16,
    opacity: 0.9,
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "900",
  },
  progress: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "700",
  },
});
