import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TreePlantingContext = createContext(null);

const STORAGE_KEY = "treePlantingData";

export const TreePlantingProvider = ({ children }) => {
  const [trees, setTrees] = useState([]);
  const [totalTreesPlanted, setTotalTreesPlanted] = useState(0);
  const [loading, setLoading] = useState(true);

  // Başlangıçta ağaç verilerini yükle
  useEffect(() => {
    loadTrees();
  }, []);

  // AsyncStorage'den ağaçları yükle
  const loadTrees = async () => {
    try {
      const storedTrees = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTrees) {
        const parsed = JSON.parse(storedTrees);
        setTrees(parsed);
        setTotalTreesPlanted(parsed.length);
      }
    } catch (error) {
      console.log("Ağaç verisi yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  // Yeni ağaç dik
  const plantTree = async (treeData) => {
    try {
      const newTree = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        stage: 0, // 0: toprak, 1: filiz, 2: fidan, 3: ağaç
        emoji: treeData.emoji || "🌱",
        name: treeData.name || "Ağacım",
        ...treeData,
      };

      const updatedTrees = [...trees, newTree];
      setTrees(updatedTrees);
      setTotalTreesPlanted(updatedTrees.length);

      // AsyncStorage'a kaydet
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrees));

      return newTree;
    } catch (error) {
      console.log("Ağaç dikme hatası:", error);
      return null;
    }
  };

  // Ağacın aşamasını güncelle (animasyon için)
  const updateTreeStage = async (treeId, stage) => {
    try {
      const updatedTrees = trees.map((tree) =>
        tree.id === treeId ? { ...tree, stage: Math.min(stage, 3) } : tree
      );
      setTrees(updatedTrees);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrees));
    } catch (error) {
      console.log("Ağaç güncelleme hatası:", error);
    }
  };

  // Tüm ağaçları sil (temizle/sıfırla)
  const clearAllTrees = async () => {
    try {
      setTrees([]);
      setTotalTreesPlanted(0);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.log("Ağaçlar temizleme hatası:", error);
    }
  };

  // Son dikilen ağacı getir
  const getLastPlantedTree = () => {
    return trees.length > 0 ? trees[trees.length - 1] : null;
  };

  const value = {
    trees,
    totalTreesPlanted,
    loading,
    plantTree,
    updateTreeStage,
    clearAllTrees,
    getLastPlantedTree,
  };

  return (
    <TreePlantingContext.Provider value={value}>
      {children}
    </TreePlantingContext.Provider>
  );
};

export const useTreePlanting = () => {
  const context = useContext(TreePlantingContext);
  if (!context) {
    throw new Error("useTreePlanting must be used within TreePlantingProvider");
  }
  return context;
};
