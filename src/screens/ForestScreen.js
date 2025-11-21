import React, { useState, useEffect, useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, Modal, Animated, Image } from "react-native";
import KeyboardScrollView from '../components/KeyboardScrollView';
import { THEME } from "../theme";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Rozetler (Başarılar ile aynı)
const BADGES = [
  { id: 'tree_1', icon: '🌱', title: 'İlk Adım', requirement: 1, reward: 200 },
  { id: 'tree_3', icon: '🌿', title: 'Yeşil Parmak', requirement: 3, reward: 500 },
  { id: 'tree_5', icon: '🪴', title: 'Ağaç Dostu', requirement: 5, reward: 1000 },
  { id: 'tree_10', icon: '🌳', title: 'Ağaç Sever', requirement: 10, reward: 2000 },
  { id: 'tree_15', icon: '🌲', title: 'Orman Koruyucusu', requirement: 15, reward: 3000 },
  { id: 'tree_25', icon: '🏞️', title: 'Doğa Kahramanı', requirement: 25, reward: 5000 },
  { id: 'tree_35', icon: '🌴', title: 'Orman Efendisi', requirement: 35, reward: 8000 },
  { id: 'tree_49', icon: '🎋', title: 'Yeşil Efsane', requirement: 49, reward: 15000 },
];

// Animasyonlu Ağaç Componenti
const AnimatedTree = ({ tree }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ağaç dikildiğinde animasyon başlat
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image 
        source={{ uri: tree.imageUrl }} 
        style={{ width: 50, height: 50 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

// Ağaç türleri - nadirlik ve ihtişama göre sıralı
const TREE_TYPES = {
  cam: { 
    id: 'cam', 
    name: 'Çam Ağacı', 
    imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f332.svg',
    cost: 5000,
    rarity: 'Yaygın',
    description: 'Sağlam ve dayanıklı bir çam ağacı'
  },
  kayın: { 
    id: 'kayın', 
    name: 'Kayın Ağacı', 
    imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f333.svg',
    cost: 8000,
    rarity: 'Yaygın',
    description: 'Geniş yapraklı kayın ağacı'
  },
  palmiye: { 
    id: 'palmiye', 
    name: 'Palmiye Ağacı', 
    imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f334.svg',
    cost: 12000,
    rarity: 'Nadir',
    description: 'Egzotik ve şık palmiye ağacı'
  },
  cinar: { 
    id: 'cinar', 
    name: 'Çınar Ağacı', 
    imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f332.svg',
    cost: 18000,
    rarity: 'Nadir',
    description: 'Heybetli çam ağacı'
  },
  altin: { 
    id: 'altin', 
    name: 'Mistik Orman', 
    imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f33f.svg',
    cost: 25000,
    rarity: 'Çok Nadir',
    description: 'Nadir bulunan mistik ağaç'
  },
  sakura: { 
    id: 'sakura', 
    name: 'Kiraz Çiçeği Ağacı', 
    imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f338.svg',
    cost: 35000,
    rarity: 'Efsanevi',
    description: 'Pembe çiçeklerle süslü muhteşem ağaç'
  },
  noel: { 
    id: 'noel', 
    name: 'Noel Ağacı', 
    imageUrl: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f384.svg',
    cost: 50000,
    rarity: 'Efsanevi',
    description: 'En değerli ve süslü noel çamı'
  }
};

// Alan genişletme seviyeleri
const EXPANSION_LEVELS = [
  { id: 0, gridSize: 9, cost: 0 }, // 3x3 - Başlangıç (ücretsiz)
  { id: 1, gridSize: 16, cost: 15000 }, // 4x4
  { id: 2, gridSize: 25, cost: 30000 }, // 5x5
  { id: 3, gridSize: 36, cost: 50000 }, // 6x6
  { id: 4, gridSize: 49, cost: 75000 }, // 7x7
];

export default function ForestScreen({ totalScore, onBack }) {
  const [trees, setTrees] = useState([]); // { position: number, type: string }
  const [expansionLevel, setExpansionLevel] = useState(0);
  const [selectedTree, setSelectedTree] = useState(null);
  const [currentScore, setCurrentScore] = useState(totalScore);
  const [showShop, setShowShop] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null); // Seçili grid pozisyonu
  const [showExpandConfirm, setShowExpandConfirm] = useState(false); // Genişletme onay modalı
  const [badgeNotification, setBadgeNotification] = useState(null); // Rozet bildirimi { badges: [], totalReward: number }

  const currentExpansion = EXPANSION_LEVELS[expansionLevel];
  const nextExpansion = EXPANSION_LEVELS[expansionLevel + 1];
  const gridSize = Math.sqrt(currentExpansion.gridSize);

  // Veri yükleme
  useEffect(() => {
    loadForestData();
  }, []);

  // Veri kaydetme
  useEffect(() => {
    saveForestData();
  }, [trees, expansionLevel]);

  const loadForestData = async () => {
    try {
      const data = await AsyncStorage.getItem('forestData');
      if (data) {
        const { trees: savedTrees, expansionLevel: savedLevel } = JSON.parse(data);
        setTrees(savedTrees || []);
        setExpansionLevel(savedLevel || 0);
      }
    } catch (error) {
      console.log('Forest data load error:', error);
    }
  };

  const saveForestData = async () => {
    try {
      await AsyncStorage.setItem('forestData', JSON.stringify({ trees, expansionLevel }));
    } catch (error) {
      console.log('Forest data save error:', error);
    }
  };

  const updateTotalScore = async (newScore) => {
    try {
      await AsyncStorage.setItem('totalScore', newScore.toString());
      setCurrentScore(newScore);
    } catch (error) {
      console.log('Score update error:', error);
    }
  };

  const checkBadgeProgress = async (treeCount, currentScoreValue) => {
    try {
      // Mevcut rozetleri yükle
      const savedBadges = await AsyncStorage.getItem('earnedBadges');
      const earnedBadges = savedBadges ? JSON.parse(savedBadges) : [];
      
      // Yeni kazanılan rozetleri bul
      const newlyEarnedBadges = [];
      let totalReward = 0;

      for (let badge of BADGES) {
        if (treeCount >= badge.requirement && !earnedBadges.includes(badge.id)) {
          newlyEarnedBadges.push(badge);
          earnedBadges.push(badge.id);
          totalReward += badge.reward;
        }
      }

      // Eğer yeni rozet kazanıldıysa
      if (newlyEarnedBadges.length > 0) {
        // Rozetleri kaydet
        await AsyncStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
        
        // Bonus puanı ekle
        const updatedScore = currentScoreValue + totalReward;
        await updateTotalScore(updatedScore);

        // Bildirim göster
        setBadgeNotification({ badges: newlyEarnedBadges, totalReward });
      }
    } catch (error) {
      console.log('Badge check error:', error);
    }
  };

  const plantTree = (position) => {
    // Zaten ağaç var mı kontrol et
    if (trees.some(t => t.position === position)) {
      Alert.alert("Dolu", "Bu alana zaten ağaç dikilmiş!");
      return;
    }

    // Pozisyonu seç ve mağazayı aç
    setSelectedPosition(position);
    setShowShop(true);
  };

  const confirmPlantTree = async () => {
    if (!selectedTree || selectedPosition === null) return;

    const treeType = TREE_TYPES[selectedTree];
    
    if (currentScore < treeType.cost) {
      Alert.alert("Yetersiz Puan", `${treeType.name} dikmek için ${treeType.cost} puana ihtiyacınız var!`);
      return;
    }

    // Ağacı dik
    const newTrees = [...trees, { position: selectedPosition, type: selectedTree }];
    setTrees(newTrees);
    const newScore = currentScore - treeType.cost;
    updateTotalScore(newScore);
    
    // Seçimleri sıfırla
    setSelectedTree(null);
    setSelectedPosition(null);
    setShowShop(false);
    
    // Rozet kontrolü yap
    await checkBadgeProgress(newTrees.length, newScore);
  };

  const expandForest = () => {
    if (!nextExpansion) {
      Alert.alert("Maksimum", "Ormanınız maksimum boyuta ulaştı!");
      return;
    }

    if (currentScore < nextExpansion.cost) {
      Alert.alert("Yetersiz Puan", `Alan genişletmek için ${nextExpansion.cost} puana ihtiyacınız var!`);
      return;
    }

    setShowExpandConfirm(true);
  };

  const confirmExpand = () => {
    setExpansionLevel(expansionLevel + 1);
    const newScore = currentScore - nextExpansion.cost;
    updateTotalScore(newScore);
    setShowExpandConfirm(false);
    Alert.alert("Başarılı!", "Orman alanı genişletildi! 🌲");
  };

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < currentExpansion.gridSize; i++) {
      const tree = trees.find(t => t.position === i);
      const isLocked = false; // Şu an için tüm grid açık

      cells.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.gridCell,
            isLocked && styles.lockedCell,
            tree && styles.plantedCell
          ]}
          onPress={() => !isLocked && !tree && plantTree(i)}
          disabled={isLocked}
        >
          {tree ? (
            <AnimatedTree tree={TREE_TYPES[tree.type]} />
          ) : isLocked ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : (
            <Text style={styles.emptyIcon}>➕</Text>
          )}
        </TouchableOpacity>
      );
    }
    return cells;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🌲 ORMANIM 🌲</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>⭐ {currentScore}</Text>
        </View>
      </View>

      <KeyboardScrollView 
        style={styles.content}
      >
        {/* Orman Grid */}
        <View style={styles.forestSection}>
          <Text style={styles.sectionTitle}>Orman Alanı ({gridSize}x{gridSize})</Text>
          <View style={[styles.grid, { width: gridSize * 60 }]}>
            {renderGrid()}
          </View>
        </View>

        {/* Genişletme */}
        {nextExpansion && (
          <TouchableOpacity style={styles.expandBtn} onPress={expandForest}>
            <Text style={styles.expandBtnText}>
              🔓 Alan Genişlet ({Math.sqrt(nextExpansion.gridSize)}x{Math.sqrt(nextExpansion.gridSize)})
            </Text>
            <Text style={styles.expandCost}>💰 {nextExpansion.cost} Puan</Text>
          </TouchableOpacity>
        )}

        {/* İstatistikler */}
        <View style={styles.stats}>
          <Text style={styles.sectionTitle}>İstatistikler</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Dikilen Ağaç:</Text>
            <Text style={styles.statValue}>{trees.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Orman Seviyesi:</Text>
            <Text style={styles.statValue}>{expansionLevel + 1} / {EXPANSION_LEVELS.length}</Text>
          </View>
          <TouchableOpacity style={styles.shopButton} onPress={() => setShowShop(true)}>
            <Text style={styles.shopButtonText}>🏪 Ağaç Mağazası</Text>
          </TouchableOpacity>
        </View>
      </KeyboardScrollView>

      {/* Ağaç Mağazası Modal */}
      <Modal
        visible={showShop}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowShop(false);
          setSelectedTree(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shopModal}>
            <View style={styles.shopHeader}>
              <Text style={styles.shopTitle}>🏪 Ağaç Mağazası</Text>
              <TouchableOpacity onPress={() => {
                setShowShop(false);
                setSelectedTree(null);
              }} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.shopScoreBox}>
              <Text style={styles.shopScoreLabel}>Mevcut Puanınız</Text>
              <Text style={styles.shopScoreValue}>⭐ {currentScore}</Text>
            </View>

            <KeyboardScrollView 
              style={styles.shopContent}
            >
              {Object.values(TREE_TYPES).map(tree => {
                const canAfford = currentScore >= tree.cost;
                const rarityColor = 
                  tree.rarity === 'Efsanevi' ? '#fbbf24' :
                  tree.rarity === 'Çok Nadir' ? '#a855f7' :
                  tree.rarity === 'Nadir' ? '#3b82f6' : '#10b981';

                return (
                  <TouchableOpacity
                    key={tree.id}
                    style={[
                      styles.shopTreeCard,
                      !canAfford && styles.shopTreeCardDisabled,
                      selectedTree === tree.id && styles.shopTreeCardSelected
                    ]}
                    onPress={() => {
                      if (canAfford) {
                        setSelectedTree(tree.id);
                      } else {
                        Alert.alert("Yetersiz Puan", `Bu ağaç için ${tree.cost} puana ihtiyacınız var!`);
                      }
                    }}
                    disabled={!canAfford}
                  >
                    <View style={styles.shopTreeLeft}>
                      <Image 
                        source={{ uri: tree.imageUrl }} 
                        style={styles.shopTreeIconLarge}
                        resizeMode="contain"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.shopTreeName}>{tree.name}</Text>
                        <Text style={styles.shopTreeDesc}>{tree.description}</Text>
                        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                          <Text style={styles.rarityText}>{tree.rarity}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.shopTreeCost, !canAfford && styles.shopTreeCostDisabled]}>
                      <Text style={[styles.shopCostText, !canAfford && { opacity: 0.5 }]}>
                        ⭐ {tree.cost}
                      </Text>
                      {canAfford && selectedTree === tree.id && (
                        <Text style={styles.selectedMark}>✓ Seçildi</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </KeyboardScrollView>

            {/* Ağacı Dik Butonu */}
            {selectedTree && (
              <View style={styles.shopFooter}>
                <TouchableOpacity 
                  style={styles.plantTreeButton}
                  onPress={confirmPlantTree}
                >
                  <Text style={styles.plantTreeButtonText}>
                    🌱 Ağacı Dik ({TREE_TYPES[selectedTree].cost} Puan)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Alan Genişletme Onay Modal */}
      <Modal
        visible={showExpandConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowExpandConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Alan Genişlet</Text>
            <Text style={styles.confirmText}>
              Orman alanını {Math.sqrt(nextExpansion?.gridSize || 0)}x{Math.sqrt(nextExpansion?.gridSize || 0)} boyutuna genişletmek için
            </Text>
            <Text style={styles.confirmCost}>
              ⭐ {nextExpansion?.cost || 0} puan harcanacak
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowExpandConfirm(false)}
              >
                <Text style={styles.confirmButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.okButton]}
                onPress={confirmExpand}
              >
                <Text style={styles.confirmButtonText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Badge Notification Modal */}
      {badgeNotification && (
        <Modal transparent visible animationType="fade">
          <View style={styles.badgeNotificationOverlay}>
            <View style={styles.badgeNotificationCard}>
              {/* Close Button */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setBadgeNotification(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Title */}
              <Text style={styles.badgeNotificationTitle}>🎉 ROZET KAZANILDI! 🎉</Text>

              {/* Badges */}
              <View style={styles.badgesList}>
                {badgeNotification.badges.map((badge, index) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <Text style={styles.badgeItemIcon}>{badge.icon}</Text>
                    <View style={styles.badgeItemInfo}>
                      <Text style={styles.badgeItemTitle}>{badge.title}</Text>
                      <Text style={styles.badgeItemDesc}>{badge.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Reward */}
              <View style={styles.rewardSection}>
                <Text style={styles.rewardLabel}>Bonus Puan Kazandınız!</Text>
                <Text style={styles.rewardValue}>+{badgeNotification.totalReward} ⭐</Text>
              </View>

              {/* Confetti Effect */}
              <Text style={styles.confetti}>🎊 🎉 ✨ 🌟 ⭐</Text>
            </View>
          </View>
        </Modal>
      )}
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
    borderBottomWidth: 2,
    borderBottomColor: '#4a7c59',
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreBox: {
    backgroundColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  scoreText: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  forestSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#2d5f3f',
    padding: 10,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#4a7c59',
  },
  gridCell: {
    width: 50,
    height: 50,
    margin: 5,
    backgroundColor: '#3d6f4f',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#5a9f7a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCell: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  plantedCell: {
    backgroundColor: '#4a9f6a',
    borderColor: '#6fbf8f',
  },
  treePlanted: {
    fontSize: 30,
  },
  lockIcon: {
    fontSize: 20,
  },
  emptyIcon: {
    fontSize: 25,
    color: '#7fc99f',
    opacity: 0.5,
  },
  expandBtn: {
    backgroundColor: '#ffa500',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  expandBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandCost: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  stats: {
    backgroundColor: '#2d5f3f',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statLabel: {
    color: '#ccc',
    fontSize: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopButton: {
    backgroundColor: '#fbbf24',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#1a4d2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopModal: {
    backgroundColor: '#1a4d2e',
    borderRadius: 25,
    maxHeight: '85%',
    maxWidth: 500,
    width: '90%',
    borderWidth: 3,
    borderColor: '#4a7c59',
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4a7c59',
  },
  shopTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  shopScoreBox: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    padding: 15,
    margin: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
  },
  shopScoreLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  shopScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  shopContent: {
    padding: 15,
  },
  shopTreeCard: {
    backgroundColor: '#2d5f3f',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4a7c59',
  },
  shopTreeCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#1a3a2a',
  },
  shopTreeCardSelected: {
    borderColor: '#ffd700',
    borderWidth: 3,
    backgroundColor: '#3d6f4f',
  },
  shopTreeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopTreeIcon: {
    fontSize: 50,
    marginRight: 15,
  },
  shopTreeIconLarge: {
    width: 64,
    height: 64,
    marginRight: 15,
  },
  shopTreeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  shopTreeDesc: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 8,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  shopTreeCost: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  shopTreeCostDisabled: {
    backgroundColor: 'rgba(100,100,100,0.2)',
  },
  shopCostText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  selectedMark: {
    fontSize: 12,
    color: '#4ade80',
    marginTop: 5,
    fontWeight: 'bold',
  },
  shopFooter: {
    padding: 15,
    borderTopWidth: 2,
    borderTopColor: '#4a7c59',
    backgroundColor: '#2d5f3f',
  },
  plantTreeButton: {
    backgroundColor: '#4ade80',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  plantTreeButtonText: {
    color: '#1a4d2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Onay modal stilleri
  confirmModal: {
    backgroundColor: '#1a4d2e',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    borderWidth: 3,
    borderColor: '#4a7c59',
    maxWidth: 400,
    width: '90%',
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmCost: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffd700',
    marginVertical: 15,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  okButton: {
    backgroundColor: '#4ade80',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Badge notification styles
  badgeNotificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNotificationCard: {
    backgroundColor: '#1a4d2e',
    borderRadius: 24,
    padding: 30,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    borderWidth: 4,
    borderColor: '#ffd700',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  badgeNotificationTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  badgesList: {
    gap: 15,
    marginBottom: 20,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    gap: 15,
  },
  badgeItemIcon: {
    fontSize: 48,
  },
  badgeItemInfo: {
    flex: 1,
  },
  badgeItemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  badgeItemDesc: {
    fontSize: 14,
    color: '#a5d6a7',
  },
  rewardSection: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
    marginBottom: 15,
  },
  rewardLabel: {
    fontSize: 16,
    color: '#a5d6a7',
    marginBottom: 8,
  },
  rewardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  confetti: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
  },
});
