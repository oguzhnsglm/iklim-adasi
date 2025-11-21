import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../theme';

const BADGES = [
  { id: 'tree_1', icon: '🌱', title: 'İlk Adım', requirement: 1 },
  { id: 'tree_3', icon: '🌿', title: 'Yeşil Parmak', requirement: 3 },
  { id: 'tree_5', icon: '🪴', title: 'Ağaç Dostu', requirement: 5 },
  { id: 'tree_10', icon: '🌳', title: 'Ağaç Sever', requirement: 10 },
  { id: 'tree_15', icon: '🌲', title: 'Orman Koruyucusu', requirement: 15 },
  { id: 'tree_25', icon: '🏞️', title: 'Doğa Kahramanı', requirement: 25 },
  { id: 'tree_35', icon: '🌴', title: 'Orman Efendisi', requirement: 35 },
  { id: 'tree_49', icon: '🎋', title: 'Yeşil Efsane', requirement: 49 },
];

export default function ProfileScreen({ onBack }) {
  const [totalScore, setTotalScore] = useState(0);
  const [totalTrees, setTotalTrees] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [environmentHelp, setEnvironmentHelp] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const score = await AsyncStorage.getItem('totalScore');
      const forestData = await AsyncStorage.getItem('forestData');
      const badges = await AsyncStorage.getItem('earnedBadges');

      if (score) {
        setTotalScore(parseInt(score));
      }

      if (forestData) {
        const data = JSON.parse(forestData);
        const treeCount = data.trees ? data.trees.length : 0;
        setTotalTrees(treeCount);
        
        // Her ağaç ortalama 22kg CO2 emer (yıllık)
        // Her ağaç = %0.1 doğaya katkı olarak hesaplayalım
        const helpPercentage = Math.min((treeCount * 0.1), 100);
        setEnvironmentHelp(helpPercentage.toFixed(1));
      }

      if (badges) {
        setEarnedBadges(JSON.parse(badges));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const earnedBadgesList = BADGES.filter(b => earnedBadges.includes(b.id));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👤 PROFİLİM</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>🌳</Text>
          </View>
          <Text style={styles.username}>Doğa Kahramanı</Text>
          <Text style={styles.level}>Seviye {earnedBadges.length + 1}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{totalScore}</Text>
            <Text style={styles.statLabel}>Toplam Puan</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌲</Text>
            <Text style={styles.statValue}>{totalTrees}</Text>
            <Text style={styles.statLabel}>Dikilen Ağaç</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Kazanılan Rozet</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌍</Text>
            <Text style={styles.statValue}>%{environmentHelp}</Text>
            <Text style={styles.statLabel}>Doğaya Katkı</Text>
          </View>
        </View>

        {/* Environment Impact */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>🌱 Doğaya Etkisi</Text>
          <Text style={styles.impactDesc}>
            {totalTrees} ağaç dikerek doğayı %{environmentHelp} oranında korudunuz!
          </Text>
          <View style={styles.impactBar}>
            <View style={[styles.impactFill, { width: `${Math.min(environmentHelp, 100)}%` }]} />
          </View>
          <Text style={styles.impactFootnote}>
            Her ağaç yılda ortalama 22kg CO₂ emer 🍃
          </Text>
        </View>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>🏆 Rozetlerim ({earnedBadges.length}/{BADGES.length})</Text>
          
          {earnedBadgesList.length > 0 ? (
            <View style={styles.badgesGrid}>
              {earnedBadgesList.map((badge) => (
                <View key={badge.id} style={styles.badgeMini}>
                  <Text style={styles.badgeMiniIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeMiniTitle}>{badge.title}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>Henüz rozet kazanmadınız</Text>
              <Text style={styles.emptyDesc}>Ağaç dikerek rozetler kazanın!</Text>
            </View>
          )}
        </View>

        {/* Achievements Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>📊 İlerleme</Text>
          
          {BADGES.slice(0, 5).map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            const progress = Math.min((totalTrees / badge.requirement) * 100, 100);

            return (
              <View key={badge.id} style={styles.progressItem}>
                <Text style={styles.progressIcon}>{earned ? badge.icon : '🔒'}</Text>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>{badge.title}</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFillSmall, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {totalTrees} / {badge.requirement} ağaç
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  avatarIcon: {
    fontSize: 50,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  level: {
    fontSize: 16,
    color: '#a5d6a7',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a5d6a7',
  },
  impactCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  impactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  impactDesc: {
    fontSize: 14,
    color: '#a5d6a7',
    textAlign: 'center',
    marginBottom: 15,
  },
  impactBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  impactFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  impactFootnote: {
    fontSize: 12,
    color: '#a5d6a7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  badgesSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeMini: {
    width: '30%',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badgeMiniIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  badgeMiniTitle: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#a5d6a7',
  },
  progressSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  progressIcon: {
    fontSize: 32,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBarSmall: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 3,
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 11,
    color: '#a5d6a7',
  },
});
