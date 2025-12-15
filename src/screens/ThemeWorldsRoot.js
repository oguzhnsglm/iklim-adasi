import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NatureBackground } from "./GameComponents";
import { useThemeProgress } from "../ThemeProgressContext";
import ThemeWorldsScreen from "./themeWorlds/ThemeWorldsScreen";
import ThemeWorldDetailScreen from "./themeWorlds/ThemeWorldDetailScreen";
import ThemeWorldGameScreen from "./themeWorlds/ThemeWorldGameScreen";

export default function ThemeWorldsRoot({ onBack }) {
  const { activeTheme } = useThemeProgress();

  const [route, setRoute] = useState({ name: "LIST" });

  const palette = activeTheme?.palette;

  const goBack = () => {
    if (route.name === "LIST") {
      if (onBack) onBack();
      return;
    }
    if (route.name === "DETAIL") {
      setRoute({ name: "LIST" });
      return;
    }
    if (route.name === "GAME") {
      setRoute({ name: "DETAIL", themeId: route.themeId });
      return;
    }
    setRoute({ name: "LIST" });
  };

  const headerTitle = useMemo(() => {
    if (route.name === "LIST") return "Tema Dünyaları";
    if (route.name === "DETAIL") return "Tema Haritası";
    if (route.name === "GAME") return "Tema Oyunu";
    return "Tema Dünyaları";
  }, [route.name]);

  return (
    <View style={styles.root}>
      <NatureBackground
        key={activeTheme?.id}
        themeId={activeTheme?.id}
        palette={palette}
        intensity={1}
      />

      <View style={[styles.header, { backgroundColor: palette?.background || "rgba(255,255,255,0.9)" }]}
      >
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette?.primary || "#111" }]} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.body, route.name === "DETAIL" && styles.bodyMap]}>
        {route.name === "LIST" && (
          <ThemeWorldsScreen
            onOpenTheme={(themeId) => setRoute({ name: "DETAIL", themeId })}
          />
        )}
        {route.name === "DETAIL" && (
          <ThemeWorldDetailScreen
            themeId={route.themeId}
            onStartLevel={(levelGlobalIndex) =>
              setRoute({ name: "GAME", themeId: route.themeId, levelGlobalIndex })
            }
          />
        )}
        {route.name === "GAME" && (
          <ThemeWorldGameScreen
            themeId={route.themeId}
            levelGlobalIndex={route.levelGlobalIndex}
            onExitToMap={(returnThemeId) =>
              setRoute({ name: "DETAIL", themeId: returnThemeId || route.themeId })
            }
            onNextLevel={(nextLevelGlobalIndex, nextThemeId) =>
              setRoute({ name: "GAME", themeId: nextThemeId || route.themeId, levelGlobalIndex: nextLevelGlobalIndex })
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 54,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backTxt: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  headerRight: {
    width: 44,
    height: 44,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  bodyMap: {
    padding: 0,
  },
});
