import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MODERN_THEME } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export const AuthModal = ({ onAuthSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bgScaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    // Giriş animasyonu
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(bgScaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleAuth = async () => {
    // Validasyon
    if (!email.trim()) {
      Alert.alert("Hata", "Email adresi giriniz");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Hata", "Geçerli bir email adresi giriniz");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Hata", "Şifre giriniz");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır");
      return;
    }

    if (!isLogin && password !== passwordConfirm) {
      Alert.alert("Hata", "Şifreler eşleşmiyor");
      return;
    }

    setIsLoading(true);

    try {
      // Basit authStorage sistemi (gerçek uygulamada backend olacak)
      const usersJson = await AsyncStorage.getItem("appUsers");
      const users = usersJson ? JSON.parse(usersJson) : [];

      const userExists = users.find((u) => u.email === email);

      if (isLogin) {
        // Giriş yapma
        if (!userExists) {
          Alert.alert("Hata", "Bu email hesabı bulunamadı");
          setIsLoading(false);
          return;
        }

        if (userExists.password !== password) {
          Alert.alert("Hata", "Email veya şifre yanlış");
          setIsLoading(false);
          return;
        }

        // Giriş başarılı
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify({ email: userExists.email, id: userExists.id })
        );
        
        Alert.alert("Başarılı", `Hoş geldin ${userExists.email}!`);
      } else {
        // Kaydol
        if (userExists) {
          Alert.alert("Hata", "Bu email ile zaten bir hesap var");
          setIsLoading(false);
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          email,
          password, // Gerçek uygulamada hash yapılmalı
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        await AsyncStorage.setItem("appUsers", JSON.stringify(users));
        await AsyncStorage.setItem(
          "currentUser",
          JSON.stringify({ email: newUser.email, id: newUser.id })
        );

        Alert.alert("Başarılı", "Kaydolunuz tamamlandı!");
      }

      // Kapatıp başarı callback'i çağır
      setTimeout(() => {
        onAuthSuccess?.();
      }, 500);
    } catch (error) {
      Alert.alert("Hata", "İşlem sırasında bir hata oluştu");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlayTouch}
        onPress={handleClose}
      />

      <Animated.View
        style={[
          styles.modal,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Kapat Butonu */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerEmoji}>
                {isLogin ? "🔐" : "✨"}
              </Text>
              <Text style={styles.headerTitle}>
                {isLogin ? "Giriş Yap" : "Kaydol"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isLogin
                  ? "Hesabınıza giriş yaparak devam edin"
                  : "Yeni bir hesap oluşturun"}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📧 Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={MODERN_THEME.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🔑 Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="En az 6 karakter"
                  placeholderTextColor={MODERN_THEME.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                  secureTextEntry
                />
              </View>

              {/* Şifre Tekrar (Kaydol için) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>🔑 Şifreyi Onayla</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Şifreyi tekrar girin"
                    placeholderTextColor={MODERN_THEME.text.tertiary}
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    editable={!isLoading}
                    secureTextEntry
                  />
                </View>
              )}
            </View>

            {/* Auth Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAuth}
              disabled={isLoading}
              style={styles.authBtnWrapper}
            >
              <LinearGradient
                colors={[
                  MODERN_THEME.accents.primary,
                  MODERN_THEME.accents.secondary,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.authBtn}
              >
                <Text style={styles.authBtnText}>
                  {isLoading
                    ? "Bekleyiniz..."
                    : isLogin
                    ? "GİRİŞ YAP"
                    : "KAYDOL"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Hesabınız yok mu? "
                  : "Zaten hesabınız var mı? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  setPassword("");
                  setPasswordConfirm("");
                }}
                disabled={isLoading}
              >
                <Text style={styles.toggleBtn}>
                  {isLogin ? "Kaydol" : "Giriş Yap"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Deneme amaçlı {"\n"}test@email.com / 123456 kullanabilirsiniz
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 999,
  },
  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    backgroundColor: MODERN_THEME.backgrounds.secondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.85,
    shadowColor: MODERN_THEME.effects.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -8,
    marginTop: 8,
  },
  closeBtnText: {
    fontSize: 24,
    color: MODERN_THEME.text.secondary,
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: MODERN_THEME.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: MODERN_THEME.text.secondary,
    textAlign: "center",
  },
  form: {
    marginVertical: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_THEME.text.primary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: MODERN_THEME.text.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    fontFamily: "Menlo",
  },
  authBtnWrapper: {
    marginVertical: 20,
  },
  authBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: MODERN_THEME.effects.shadowMedium,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  authBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
  },
  toggleText: {
    fontSize: 13,
    color: MODERN_THEME.text.secondary,
  },
  toggleBtn: {
    fontSize: 13,
    fontWeight: "700",
    color: MODERN_THEME.accents.primary,
    marginLeft: 4,
  },
  infoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: MODERN_THEME.accents.primary,
    marginTop: 16,
  },
  infoText: {
    fontSize: 11,
    color: MODERN_THEME.text.secondary,
    lineHeight: 16,
  },
});
