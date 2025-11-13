import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import CleanupGame from "./src/screens/CleanupGame";
import { THEME } from "./src/theme";

// Ekran durumları: Ana Sayfa veya Oyun
const SCREENS = {
  HOME: "HOME",
  GAME: "GAME",
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {screen === SCREENS.HOME ? (
          <HomeScreen onPlay={() => setScreen(SCREENS.GAME)} />
        ) : (
          <CleanupGame onExit={() => setScreen(SCREENS.HOME)} />
        )}
      </View>
    </SafeAreaView>
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
