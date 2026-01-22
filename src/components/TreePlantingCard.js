import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { MODERN_THEME } from "../theme";
import { useTreePlanting } from "../TreePlantingContext";
import { useUserProgress } from "../UserProgressContext";
import soundManager from "../utils/sounds";

const { width } = Dimensions.get("window");

const TreeStages = {
  0: { emoji: "🌍", label: "Toprak" },
  1: { emoji: "🌱", label: "Filiz" },
  2: { emoji: "🌿", label: "Fidan" },
  3: { emoji: "🌳", label: "Ağaç" },
};

export const TreePlantingCard = ({ onTreePlanted }) => {
  const { plantTree, getLastPlantedTree } = useTreePlanting();
  const { userProgress, plantTree: plantTreeWithProgress, getPointsToNextTree, getProgressPercentage, TREE_COST } = useUserProgress();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const stageAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const lastTree = getLastPlantedTree();

  useEffect(() => {
    if (lastTree && lastTree.stage < 3) {
      setCurrentStage(lastTree.stage);
    }
  }, [lastTree]);

  const playTreeSound = () => {
    soundManager.play("tap");
  };

  const animateTreeGrowth = async () => {
    if (isAnimating) return;
    
    // Puan kontrolü
    if (userProgress.ecoPoints < TREE_COST) {
      Alert.alert(
        "Yetersiz EkoPuan",
        `Bir ağaç dikmek için ${TREE_COST} EkoPuan gerekli.\nSeni ${getPointsToNextTree()} puan kaldı.`,
        [{ text: "Tamam", style: "default" }]
      );
      return;
    }

    setIsAnimating(true);

    try {
      playTreeSound();

      // Yeni ağaçları dik
      const plantResult = await plantTreeWithProgress();
      
      if (!plantResult.success) {
        Alert.alert("Hata", "Ağaç dikilirken hata oluştu");
        setIsAnimating(false);
        return;
      }

      // Ağacı büyütme animasyonu
      for (let stage = 0; stage <= 3; stage++) {
        await new Promise((resolve) => {
          Animated.parallel([
            Animated.sequence([
              Animated.timing(glowAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(glowAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(stageAnim, {
              toValue: stage,
              duration: 400,
              useNativeDriver: false,
            }),
          ]).start(() => {
            setCurrentStage(stage);
            resolve();
          });
        });

        if (stage < 3) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }

      if (onTreePlanted) {
        onTreePlanted();
      }
    } catch (error) {
      console.log("Ağaç dikme animasyonu hatası:", error);
    } finally {
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacityAnim]);

  const handlePress = () => {
    if (!isAnimating) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      animateTreeGrowth();
    }
  };

  const stage = TreeStages[currentStage];
  const progressPercentage = getProgressPercentage();
  const pointsToNext = getPointsToNextTree();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={isAnimating}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Glow Arka Planı */}
        <Animated.View
          style={[
            styles.glowBackdrop,
            {
              opacity: glowAnim,
            },
          ]}
        />

        {/* Glassmorphism Kart */}
        <View style={styles.glassCard}>
          {/* Sol: Ağaç Display */}
          <View style={styles.treeContainer}>
            <Text style={styles.treeEmoji}>{stage.emoji}</Text>
            <Text style={styles.stageLabel}>{stage.label}</Text>
          </View>

          {/* Sağ: İçerik */}
          <View style={styles.content}>
            {/* Başlık */}
            <Text style={styles.title}>🌱 Ağaç Dik</Text>

            {/* EkoPuan Display */}
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>EkoPuan:</Text>
              <Text style={styles.pointsValue}>{userProgress.ecoPoints}</Text>
              <Text style={styles.pointsPerTree}>/ {TREE_COST}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {pointsToNext > 0 ? `${pointsToNext} puan kaldı` : "Ağaç dikmek için hazır!"}
              </Text>
            </View>

            {/* CTA */}
            <Text style={[styles.cta, isAnimating && styles.ctaAnimating]}>
              {isAnimating ? "Büyüyor..." : userProgress.ecoPoints >= TREE_COST ? "Dokunarak dik" : "Puan bekliyor"}
            </Text>
          </View>

          {/* Dekoratif Öğeler */}
          <View style={styles.decorElements}>
            <Text style={styles.decorIcon}>✨</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  glowBackdrop: {
    position: "absolute",
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
    borderRadius: 24,
    backgroundColor: MODERN_THEME.effects.strongGlow,
  },
  glassCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_THEME.glass.medium,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
    shadowColor: MODERN_THEME.effects.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  treeContainer: {
    alignItems: "center",
    marginRight: 12,
    minWidth: 56,
  },
  treeEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  stageLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: MODERN_THEME.text.secondary,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: MODERN_THEME.text.primary,
    marginBottom: 6,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  pointsLabel: {
    fontSize: 12,
    color: MODERN_THEME.text.secondary,
    fontWeight: "500",
    marginRight: 4,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_THEME.accents.primary,
  },
  pointsPerTree: {
    fontSize: 11,
    color: MODERN_THEME.text.tertiary,
    marginLeft: 2,
  },
  progressBarContainer: {
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: MODERN_THEME.accents.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: MODERN_THEME.text.tertiary,
    fontWeight: "500",
  },
  cta: {
    fontSize: 11,
    fontWeight: "700",
    color: MODERN_THEME.accents.primary,
    letterSpacing: 0.3,
  },
  ctaAnimating: {
    color: MODERN_THEME.text.secondary,
  },
  decorElements: {
    position: "absolute",
    top: 8,
    right: 12,
  },
  decorIcon: {
    fontSize: 18,
  },
});
