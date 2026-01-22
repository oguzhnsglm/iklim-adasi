import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MODERN_THEME, THEME } from "../theme";
import { TreePlantingCard } from "../components/TreePlantingCard";
import { BadgeUnlockNotification } from "../components/BadgeUnlockNotification";
import { AuthModal } from "./AuthModal";
import { useTreePlanting } from "../TreePlantingContext";
import { useUserProgress } from "../UserProgressContext";

const { width, height } = Dimensions.get("window");

/**
 * Ana giriş ekranı (Splash Screen)
 * Uygulamanın ilk açılışında görünen ekran
 * Ağaç dikme ve oyuna başlama seçenekleri sunuyor
 */
export const SplashScreenWithTreePlanting = ({ onStartGame, onClose }) => {
  const { totalTreesPlanted } = useTreePlanting();
  const { userProgress } = useUserProgress();
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Animasyonlar
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardSlideAnim = useRef(new Animated.Value(100)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Kullanıcı bilgisini kontrol et
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AsyncStorage.getItem("currentUser");
        if (user) {
          setCurrentUser(JSON.parse(user));
        }
      } catch (error) {
        console.error("User check error:", error);
      }
    };
    checkUser();
  }, [showAuthModal]);

  // Badge unlock durumunu takip et
  useEffect(() => {
    if (userProgress?.newBadgeUnlocked) {
      // newBadgeUnlocked benzeri bir prop varsa burada handle et
      // Şimdilik mock olarak
    }
  }, [userProgress]);

  useEffect(() => {
    // Giriş animasyonu - fade in + slide up + scale
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

    // Kart animasyonu (gecikmeyle başla)
    setTimeout(() => {
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, []);

  const handlePlayPress = () => {
    // Buton scale animasyonu
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

  // Floating dekoratif elemanlar
  const FloatingDecorations = () => (
    <View style={styles.decorationsContainer}>
      {/* Üst sağda büyük yaprak */}
      <Animated.View
        style={[
          styles.floatingItem,
          {
            top: "8%",
            right: "5%",
            opacity: fadeInAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            }),
          },
        ]}
      >
        <Text style={styles.decorEmojiLarge}>🍃</Text>
      </Animated.View>

      {/* Sol tarafta çiçek */}
      <Animated.View
        style={[
          styles.floatingItem,
          {
            bottom: "25%",
            left: "8%",
            opacity: fadeInAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      >
        <Text style={styles.decorEmojiSmall}>🌼</Text>
      </Animated.View>

      {/* Sağ tarafta kuş */}
      <Animated.View
        style={[
          styles.floatingItem,
          {
            bottom: "35%",
            right: "12%",
            opacity: fadeInAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.25],
            }),
          },
        ]}
      >
        <Text style={styles.decorEmojiTiny}>🐦</Text>
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={true} />
      
      {/* Gradient Arka Planı */}
      <LinearGradient
        colors={MODERN_THEME.gradients.soft}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      {/* Dekoratif Elemanlar */}
      <FloatingDecorations />

      {/* Badge Unlock Notification */}
      {unlockedBadge && (
        <BadgeUnlockNotification
          badge={unlockedBadge}
          onDismiss={() => setUnlockedBadge(null)}
        />
      )}

      {/* Ana İçerik */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeInAnim,
            transform: [
              { translateY: slideUpAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Header / Logo Bölümü */}
        <View style={styles.headerSection}>
          {/* Emoji Logolar */}
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>🌍</Text>
            <Text style={styles.logoEmoji}>♻️</Text>
          </View>

          {/* Başlık */}
          <Text style={styles.titleMain}>Doğayı Koru</Text>

          {/* Alt başlık */}
          <Text style={styles.subtitleText}>
            Oyna, öğren, dünyayı iyileştir
          </Text>

          {/* Dekoratif çizgi */}
          <View style={styles.decorLine} />
        </View>

        {/* Ağaç Dikme Kartı Section */}
        <Animated.View
          style={[
            styles.treeCardSection,
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

        {/* Giriş Yap Butonu (üst) */}
        {!currentUser && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowAuthModal(true)}
            style={styles.loginBtnWrapper}
          >
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.15)",
                "rgba(255, 255, 255, 0.05)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginBtn}
            >
              <Text style={styles.loginBtnEmoji}>🔐</Text>
              <Text style={styles.loginBtnText}>GİRİŞ YAP</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Kullanıcı İnfo */}
        {currentUser && (
          <View style={styles.userInfoBox}>
            <Text style={styles.userInfoText}>
              👤 Giriş yapan: {currentUser.email}
            </Text>
          </View>
        )}

        {/* Oyun Başla Butonu */}
        <Animated.View
          style={[
            styles.playButtonWrapper,
            {
              transform: [{ scale: buttonScaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePlayPress}
            style={styles.playBtn}
          >
            {/* Glassmorphism arka plan */}
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.25)",
                "rgba(255, 255, 255, 0.1)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnEmoji}>🎮</Text>
              <Text style={styles.btnTitle}>OYUNA BAŞLA</Text>
            </LinearGradient>

            {/* Glow efekti */}
            <View style={styles.btnGlow} />
          </TouchableOpacity>
        </Animated.View>

        {/* Alt bilgi metni */}
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>
            Her oyun oynayarak doğayı kurtarabilirsin ✨
          </Text>
          <Text style={styles.statsText}>
            🌳 Bugün dikildi: {totalTreesPlanted} ağaç
          </Text>
        </View>
      </Animated.View>

      {/* Kapat butonu */}
      {onClose && (
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.6}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={() => setShowAuthModal(false)}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_THEME.backgrounds.primary,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  decorationsContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
    zIndex: 1,
  },
  floatingItem: {
    position: "absolute",
  },
  decorEmojiLarge: {
    fontSize: 80,
    opacity: 0.3,
  },
  decorEmojiSmall: {
    fontSize: 50,
    opacity: 0.25,
  },
  decorEmojiTiny: {
    fontSize: 40,
    opacity: 0.2,
  },
  mainContent: {
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
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 60,
    marginHorizontal: 8,
  },
  titleMain: {
    fontSize: 44,
    fontWeight: "800",
    color: MODERN_THEME.text.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
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
  treeCardSection: {
    marginVertical: 20,
  },
  loginBtnWrapper: {
    alignItems: "center",
    marginVertical: 12,
  },
  loginBtn: {
    width: width - 40,
    maxWidth: 300,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  loginBtnEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  loginBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: MODERN_THEME.text.primary,
    letterSpacing: 0.4,
  },
  userInfoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  userInfoText: {
    fontSize: 12,
    color: MODERN_THEME.text.secondary,
    fontWeight: "500",
  },
  playButtonWrapper: {
    alignItems: "center",
    marginVertical: 16,
  },
  playBtn: {
    width: width - 40,
    maxWidth: 300,
    position: "relative",
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  btnGlow: {
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
  btnEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  btnTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_THEME.text.primary,
    letterSpacing: 0.8,
  },
  bottomInfo: {
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: MODERN_THEME.text.secondary,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
    color: MODERN_THEME.text.tertiary,
    fontWeight: "600",
  },
  closeBtn: {
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
  closeBtnText: {
    fontSize: 20,
    color: MODERN_THEME.text.primary,
    fontWeight: "600",
  },
});

export default SplashScreenWithTreePlanting;
