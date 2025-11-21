import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../theme';

// Rozetler ve görevleri (Maksimum 49 ağaç dikilebilir)
const BADGES = [
  { id: 'tree_1', icon: '🌱', title: 'İlk Adım', desc: '1 Ağaç Dik', requirement: 1, reward: 200 },
  { id: 'tree_3', icon: '🌿', title: 'Yeşil Parmak', desc: '3 Ağaç Dik', requirement: 3, reward: 500 },
  { id: 'tree_5', icon: '🪴', title: 'Ağaç Dostu', desc: '5 Ağaç Dik', requirement: 5, reward: 1000 },
  { id: 'tree_10', icon: '🌳', title: 'Ağaç Sever', desc: '10 Ağaç Dik', requirement: 10, reward: 2000 },
  { id: 'tree_15', icon: '🌲', title: 'Orman Koruyucusu', desc: '15 Ağaç Dik', requirement: 15, reward: 3000 },
  { id: 'tree_25', icon: '🏞️', title: 'Doğa Kahramanı', desc: '25 Ağaç Dik', requirement: 25, reward: 5000 },
  { id: 'tree_35', icon: '🌴', title: 'Orman Efendisi', desc: '35 Ağaç Dik', requirement: 35, reward: 8000 },
  { id: 'tree_49', icon: '🎋', title: 'Yeşil Efsane', desc: '49 Ağaç Dik', requirement: 49, reward: 15000 },
];

export default function AchievementsScreen({ onBack }) {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [totalTrees, setTotalTrees] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const forest = await AsyncStorage.getItem('forest');
      const score = await AsyncStorage.getItem('totalScore');
      const badges = await AsyncStorage.getItem('earnedBadges');

      if (forest) {
        const trees = JSON.parse(forest);
        setTotalTrees(trees.length);
        
        // Yeni rozetleri kontrol et
        await checkAndAwardBadges(trees.length, badges ? JSON.parse(badges) : []);
      }

      if (score) {
        setTotalScore(parseInt(score));
      }

      if (badges) {
        setEarnedBadges(JSON.parse(badges));
      }
    } catch (error) {
      console.log('Error loading achievements:', error);
    }
  };

  const checkAndAwardBadges = async (treeCount, currentBadges) => {
    let newBadges = [...currentBadges];
    let bonusPoints = 0;

    for (let badge of BADGES) {
      if (treeCount >= badge.requirement && !currentBadges.includes(badge.id)) {
        newBadges.push(badge.id);
        bonusPoints += badge.reward;
      }
    }

    if (newBadges.length > currentBadges.length) {
      // Yeni rozet kazanıldı!
      await AsyncStorage.setItem('earnedBadges', JSON.stringify(newBadges));
      setEarnedBadges(newBadges);

      // Bonus puanı ekle
      const currentScore = await AsyncStorage.getItem('totalScore');
      const newScore = parseInt(currentScore || '0') + bonusPoints;
      await AsyncStorage.setItem('totalScore', newScore.toString());
      setTotalScore(newScore);
    }
  };

  const isBadgeEarned = (badgeId) => earnedBadges.includes(badgeId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 BAŞARILARIM</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{earnedBadges.length}</Text>
          <Text style={styles.statLabel}>Rozet</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalTrees}</Text>
          <Text style={styles.statLabel}>Ağaç</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalScore}</Text>
          <Text style={styles.statLabel}>Puan</Text>
        </View>
      </View>

      {/* Badges Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.badgesGrid}>
        {BADGES.map((badge) => {
          const earned = isBadgeEarned(badge.id);
          const progress = Math.min((totalTrees / badge.requirement) * 100, 100);

          return (
            <View 
              key={badge.id} 
              style={[
                styles.badgeCard,
                earned && styles.badgeCardEarned
              ]}
            >
              <Text style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                {earned ? badge.icon : '🔒'}
              </Text>
              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text style={styles.badgeDesc}>{badge.desc}</Text>
              
              {!earned && (
                <>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {totalTrees} / {badge.requirement}
                  </Text>
                </>
              )}
              
              {earned && (
                <View style={styles.rewardBox}>
                  <Text style={styles.rewardText}>+{badge.reward} ⭐</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a4d2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#2d5f3f',
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 60,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  statLabel: {
    fontSize: 14,
    color: '#a5d6a7',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  badgesGrid: {
    padding: 15,
    gap: 15,
  },
  badgeCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeCardEarned: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  badgeIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
  },
  badgeIconLocked: {
    opacity: 0.3,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 14,
    color: '#a5d6a7',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#a5d6a7',
    textAlign: 'center',
    marginTop: 4,
  },
  rewardBox: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd700',
  },
});
