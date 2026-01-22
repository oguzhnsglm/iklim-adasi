import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MODERN_THEME } from "../theme";
import { useUserProgress, BADGES_CATALOG } from "../UserProgressContext";

const { width } = Dimensions.get("window");

export const BadgesScreen = ({ onClose }) => {
  const { userProgress, getBadgeInfo } = useUserProgress();
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const BadgeCard = ({ badge, isUnlocked }) => {
    const scaleAnim = useRef(new Animated.Value(isUnlocked ? 1 : 0.9)).current;

    useEffect(() => {
      if (isUnlocked) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }, [isUnlocked]);

    return (
      <TouchableOpacity activeOpacity={0.8} disabled={!isUnlocked}>
        <Animated.View
          style={[
            styles.badgeCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: isUnlocked ? 1 : 0.4,
            },
          ]}
        >
          <LinearGradient
            colors={
              isUnlocked
                ? [badge.color + "33", badge.color + "11"]
                : ["#80808033", "#80808011"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badgeGradient}
          >
            <View style={styles.badgeContent}>
              {/* Başlık - Emoji ve Ad */}
              <Text style={styles.badgeTitle}>{badge.title}</Text>

              {/* Rozet Emoji */}
              <View style={styles.badgeEmojiContainer}>
                <Text style={styles.badgeEmoji}>
                  {badge.id === "sprout" && "🌱"}
                  {badge.id === "planter" && "🌿"}
                  {badge.id === "forest" && "🌳"}
                  {badge.id === "guardian" && "🛡️"}
                  {badge.id === "hero" && "⭐"}
                </Text>
                {isUnlocked && (
                  <View
                    style={[
                      styles.checkmark,
                      { backgroundColor: badge.color },
                    ]}
                  >
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>

              {/* Gereksinim */}
              <Text style={styles.badgeRequirement}>
                {badge.requirementTrees} ağaç dik
              </Text>

              {!isUnlocked && (
                <Text style={styles.badgeProgress}>
                  {userProgress.treesPlanted} / {badge.requirementTrees}
                </Text>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={MODERN_THEME.gradients.soft}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeInAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Rozetlerim</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Kazanılan</Text>
            <Text style={styles.statValue}>{userProgress.badges.length}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Toplam</Text>
            <Text style={styles.statValue}>{BADGES_CATALOG.length}</Text>
          </View>
        </View>

        {/* Badges Grid */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.badgesGrid}>
          {BADGES_CATALOG.map((badge) => {
            const isUnlocked = userProgress.badges.includes(badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isUnlocked={isUnlocked}
              />
            );
          })}
        </ScrollView>
      </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_THEME.glass.medium,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: "600",
    color: MODERN_THEME.text.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: MODERN_THEME.text.primary,
    letterSpacing: -0.5,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: MODERN_THEME.glass.medium,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: MODERN_THEME.text.secondary,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: MODERN_THEME.text.primary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  badgesGrid: {
    flex: 1,
  },
  badgeCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  badgeGradient: {
    padding: 16,
  },
  badgeContent: {
    alignItems: "center",
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_THEME.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  badgeEmojiContainer: {
    position: "relative",
    marginBottom: 12,
  },
  badgeEmoji: {
    fontSize: 48,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  badgeRequirement: {
    fontSize: 12,
    color: MODERN_THEME.text.secondary,
    fontWeight: "500",
  },
  badgeProgress: {
    fontSize: 11,
    color: MODERN_THEME.text.tertiary,
    marginTop: 4,
    fontStyle: "italic",
  },
});
