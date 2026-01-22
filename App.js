import React, { useRef, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import CleanupGame from "./src/screens/CleanupGame";
import { THEME } from "./src/theme";
import { ThemeProgressProvider } from "./src/ThemeProgressContext";
import { ThemeWorldsProgressProvider } from "./src/ThemeWorldsProgressContext";
import { ParentSettingsProvider, useParentSettings } from "./src/ParentSettingsContext";
import { MascotProvider } from "./src/context/MascotContext";
import { TreePlantingProvider } from "./src/TreePlantingContext";
import { UserProgressProvider } from "./src/UserProgressContext";
import { SplashScreenWithTreePlanting } from "./src/screens/SplashScreenWithTreePlanting";

function AppInner() {
  const sessionStartRef = useRef(null);
  const { ensureCanPlayOrAlert, recordSessionMinutes } = useParentSettings();
  const [showSplash, setShowSplash] = useState(true);

  const handleSessionStart = () => {
    if (!ensureCanPlayOrAlert()) return false;
    if (!sessionStartRef.current) {
      sessionStartRef.current = Date.now();
    }
    return true;
  };

  const handleSessionEnd = () => {
    if (sessionStartRef.current) {
      const diffMs = Date.now() - sessionStartRef.current;
      const minutes = diffMs / 60000;
      recordSessionMinutes(Math.round(minutes));
      sessionStartRef.current = null;
    }
  };

  const handleStartGame = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <SplashScreenWithTreePlanting 
        onStartGame={handleStartGame}
        onClose={handleStartGame}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <CleanupGame
          onRequestSessionStart={handleSessionStart}
          onSessionEnd={handleSessionEnd}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProgressProvider>
      <ThemeWorldsProgressProvider>
        <ParentSettingsProvider>
          <MascotProvider>
            <TreePlantingProvider>
              <UserProgressProvider>
                <AppInner />
              </UserProgressProvider>
            </TreePlantingProvider>
          </MascotProvider>
        </ParentSettingsProvider>
      </ThemeWorldsProgressProvider>
    </ThemeProgressProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
});
