import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import KeyboardScrollView from '../components/KeyboardScrollView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

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

// Seviye sistemi - puan bazlı
const LEVELS = [
  { level: 1, minScore: 0, maxScore: 99, title: 'Çevre Acemi', icon: '🌱', color: '#90EE90' },
  { level: 2, minScore: 100, maxScore: 299, title: 'Doğa Öğrencisi', icon: '🌿', color: '#7CFC00' },
  { level: 3, minScore: 300, maxScore: 599, title: 'Yeşil Savaşçı', icon: '🍀', color: '#32CD32' },
  { level: 4, minScore: 600, maxScore: 999, title: 'Eko Koruyucu', icon: '🪴', color: '#228B22' },
  { level: 5, minScore: 1000, maxScore: 1599, title: 'Orman Dostu', icon: '🌳', color: '#006400' },
  { level: 6, minScore: 1600, maxScore: 2499, title: 'Çevre Kahramanı', icon: '🌲', color: '#4CAF50' },
  { level: 7, minScore: 2500, maxScore: 3999, title: 'Doğa Muhafızı', icon: '🏞️', color: '#388E3C' },
  { level: 8, minScore: 4000, maxScore: 5999, title: 'Eko Usta', icon: '🌴', color: '#2E7D32' },
  { level: 9, minScore: 6000, maxScore: 8999, title: 'Yeşil Efendi', icon: '🎋', color: '#1B5E20' },
  { level: 10, minScore: 9000, maxScore: 12999, title: 'Orman Kralı', icon: '👑', color: '#FFD700' },
  { level: 11, minScore: 13000, maxScore: 17999, title: 'Gezegen Koruyucusu', icon: '🌍', color: '#00BCD4' },
  { level: 12, minScore: 18000, maxScore: 24999, title: 'Doğa Efsanesi', icon: '⭐', color: '#FFC107' },
  { level: 13, minScore: 25000, maxScore: 34999, title: 'Eko Tanrısı', icon: '✨', color: '#9C27B0' },
  { level: 14, minScore: 35000, maxScore: 49999, title: 'Yeşil Mitoloji', icon: '🌟', color: '#E91E63' },
  { level: 15, minScore: 50000, maxScore: 99999999, title: 'Doğanın Efendisi', icon: '🏆', color: '#FF5722' },
];

// Seviye hesaplama fonksiyonu
const calculateLevel = (score) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export default function ProfileScreen({ onBack }) {
  const [totalScore, setTotalScore] = useState(0);
  const [totalTrees, setTotalTrees] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [environmentHelp, setEnvironmentHelp] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(LEVELS[0]);
  const [nextLevel, setNextLevel] = useState(LEVELS[1]);
  const [levelProgress, setLevelProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [treesData, setTreesData] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadProfile();
    checkUser();
  }, []);

  const loadProfile = async () => {
    try {
      const score = await AsyncStorage.getItem('totalScore');
      const forestData = await AsyncStorage.getItem('forestData');
      const badges = await AsyncStorage.getItem('earnedBadges');

      let currentScore = 0;
      if (score) {
        currentScore = parseInt(score);
        setTotalScore(currentScore);
      }

      // Ağaçları yükle
      if (forestData) {
        try {
          const data = JSON.parse(forestData);
          setTotalTrees(data.trees?.length || 0);
          setTreesData(data.trees || []);
        } catch (e) {
          console.log('Forest data parse error:', e);
        }
      }

      // Seviye hesapla
      const level = calculateLevel(currentScore);
      setCurrentLevel(level);

      // Bir sonraki seviyeyi bul
      const nextLvl = LEVELS.find(l => l.level === level.level + 1);
      if (nextLvl) {
        setNextLevel(nextLvl);
        // İlerleme yüzdesini hesapla
        const currentLevelScore = currentScore - level.minScore;
        const requiredScore = nextLvl.minScore - level.minScore;
        const progress = Math.min((currentLevelScore / requiredScore) * 100, 100);
        setLevelProgress(progress);
      } else {
        // Maksimum seviyedeyse
        setNextLevel(null);
        setLevelProgress(100);
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

  const checkUser = async () => {
    try {
      const user = await AsyncStorage.getItem("currentUser");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (error) {
      console.log("User check error:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      `${currentUser?.email} hesabından çıkış yapmak istiyor musun?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet, Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("currentUser");
              setCurrentUser(null);
              Alert.alert("Başarılı", "Hesaptan çıkış yapıldı");
            } catch (error) {
              Alert.alert("Hata", "Çıkış yapılırken hata oluştu");
            }
          },
        },
      ]
    );
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
        {currentUser && (
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutBtnText}>🚪</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        {/* Login / User Info Section */}
        {!currentUser ? (
          <View style={styles.authBox}>
            <Text style={styles.authBoxTitle}>🔐 Giriş Yap</Text>
            <Text style={styles.authBoxSubtitle}>
              İlerlemenizi kaydetmek için giriş yapınız
            </Text>
            <TouchableOpacity 
              style={styles.authButton}
              onPress={() => {
                // App'e geri dönüp splash'te giriş yap
                onBack?.();
              }}
            >
              <Text style={styles.authButtonText}>Giriş Yapın / Kaydolun</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userInfoBox}>
            <Text style={styles.userInfoTitle}>👤 Hesap Bilgileri</Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { borderColor: currentLevel.color }]}>
            <Text style={styles.avatarIcon}>{currentLevel.icon}</Text>
          </View>
          <Text style={styles.username}>{currentLevel.title}</Text>
          <Text style={styles.level}>Seviye {currentLevel.level}</Text>
          
          {/* Seviye İlerleme Barı */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <View 
                style={[
                  styles.levelProgressFill, 
                  { width: `${levelProgress}%`, backgroundColor: currentLevel.color }
                ]} 
              />
            </View>
            <View style={styles.levelProgressInfo}>
              <Text style={styles.levelProgressText}>
                {totalScore} / {nextLevel ? nextLevel.minScore : '∞'} XP
              </Text>
              {nextLevel && (
                <Text style={styles.nextLevelText}>
                  Sonraki: {nextLevel.title} {nextLevel.icon}
                </Text>
              )}
              {!nextLevel && (
                <Text style={styles.maxLevelText}>
                  ✨ Maksimum Seviye! ✨
                </Text>
              )}
            </View>
          </View>
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

        {/* Ağaçlar Bölümü */}
        {totalTrees > 0 && (
          <View style={styles.treesSection}>
            <View style={styles.treesSectionHeader}>
              <Text style={styles.sectionTitle}>🌳 Dikilmiş Ağaçlarım ({totalTrees})</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.treesScrollView}
              contentContainerStyle={styles.treesContainer}
            >
              {treesData.map((tree, index) => (
                <View key={index} style={styles.treeCard}>
                  <Text style={styles.treeEmoji}>🌳</Text>
                  <Text style={styles.treeNumber}>#{index + 1}</Text>
                  <LinearGradient
                    colors={['#4CAF50', '#2E7D32']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.treeCardBg}
                  />
                </View>
              ))}
            </ScrollView>
            
            <Text style={styles.treeContribution}>
              🌍 {totalTrees} ağaç = {(totalTrees * 22).toLocaleString('tr-TR')} kg CO₂ emilimi / yıl
            </Text>
          </View>
        )}

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
      </KeyboardScrollView>
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
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,80,80,0.3)',
    borderRadius: 8,
  },
  logoutBtnText: {
    fontSize: 18,
  },
  authBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
    alignItems: 'center',
  },
  authBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  authBoxSubtitle: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 14,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userInfoBox: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.5)',
  },
  userInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 13,
    color: '#fff',
  },
  treesSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  treesSectionHeader: {
    marginBottom: 12,
  },
  treesScrollView: {
    marginBottom: 12,
  },
  treesContainer: {
    paddingRight: 16,
    gap: 10,
  },
  treeCard: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(76,175,80,0.3)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76,175,80,0.6)',
    position: 'relative',
    overflow: 'hidden',
  },
  treeCardBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  treeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  treeNumber: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  treeContribution: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  progressSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  badgeGray: {
    opacity: 0.4,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#a5d6a7',
    textAlign: 'center',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressIcon: {
    fontSize: 28,
    marginRight: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
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
  profileCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  avatarIcon: {
    fontSize: 50,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  level: {
    fontSize: 14,
    color: '#a5d6a7',
    marginBottom: 16,
  },
  levelProgressContainer: {
    width: '100%',
    marginTop: 10,
  },
  levelProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
  },
  levelProgressInfo: {
    alignItems: 'center',
  },
  levelProgressText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  nextLevelText: {
    fontSize: 10,
    color: '#a5d6a7',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 10,
    color: '#a5d6a7',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  badgesSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,80,80,0.3)',
    borderRadius: 8,
  },
  logoutBtnText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  avatarIcon: {
    fontSize: 50,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  level: {
    fontSize: 14,
    color: '#a5d6a7',
    marginBottom: 16,
  },
  levelProgressContainer: {
    width: '100%',
    marginTop: 10,
  },
  levelProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
  },
  levelProgressInfo: {
    alignItems: 'center',
  },
  levelProgressText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  nextLevelText: {
    fontSize: 10,
    color: '#a5d6a7',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 10,
    color: '#a5d6a7',
    marginTop: 4,
  },
  authBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
    alignItems: 'center',
  },
  authBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  authBoxSubtitle: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 14,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userInfoBox: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.5)',
  },
  userInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 13,
    color: '#fff',
  },
  badgesSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  badgeGray: {
    opacity: 0.4,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#a5d6a7',
    textAlign: 'center',
  },
  treesSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  treesSectionHeader: {
    marginBottom: 12,
  },
  treesScrollView: {
    marginBottom: 12,
  },
  treesContainer: {
    paddingRight: 16,
    gap: 10,
  },
  treeCard: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(76,175,80,0.3)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76,175,80,0.6)',
    position: 'relative',
    overflow: 'hidden',
  },
  treeCardBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  treeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  treeNumber: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  treeContribution: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  progressSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressIcon: {
    fontSize: 28,
    marginRight: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
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
