import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const STORAGE_SETTINGS_KEY = "parentSettings";
const STORAGE_USAGE_KEY = "parentUsage"; // { date: 'YYYY-MM-DD', minutesUsed: number }

const ParentSettingsContext = createContext(null);

export const ParentSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [usage, setUsage] = useState({ date: null, minutesUsed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(STORAGE_SETTINGS_KEY);
        const storedUsage = await AsyncStorage.getItem(STORAGE_USAGE_KEY);

        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }

        if (storedUsage) {
          setUsage(JSON.parse(storedUsage));
        }
      } catch (e) {
        console.log("Parent settings load error", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const saveSettings = async (nextSettings) => {
    setSettings(nextSettings);
    try {
      await AsyncStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(nextSettings));
    } catch (e) {
      console.log("Parent settings persist error", e);
    }
  };

  const saveUsage = async (nextUsage) => {
    setUsage(nextUsage);
    try {
      await AsyncStorage.setItem(STORAGE_USAGE_KEY, JSON.stringify(nextUsage));
    } catch (e) {
      console.log("Parent usage persist error", e);
    }
  };

  const resetIfNewDay = (current) => {
    const today = new Date().toISOString().slice(0, 10);
    if (!current.date || current.date !== today) {
      return { date: today, minutesUsed: 0 };
    }
    return current;
  };

  const checkCanPlay = () => {
    if (!settings || !settings.dailyLimitMinutes) {
      return true; // sınırlama yok
    }
    const current = resetIfNewDay(usage);
    const remaining = settings.dailyLimitMinutes - current.minutesUsed;
    return remaining > 0;
  };

  const ensureCanPlayOrAlert = () => {
    if (checkCanPlay()) return true;
    Alert.alert(
      "Oyun Süresi Doldu",
      "Bugünkü oyun süresi sınırına ulaşıldı. Ebeveyn modu ile süreyi güncelleyebilirsiniz.",
    );
    return false;
  };

  const recordSessionMinutes = (minutes) => {
    if (!minutes || minutes <= 0) return;
    const current = resetIfNewDay(usage);
    const next = {
      date: current.date || new Date().toISOString().slice(0, 10),
      minutesUsed: current.minutesUsed + minutes,
    };
    saveUsage(next);
  };

  return (
    <ParentSettingsContext.Provider
      value={{
        loading,
        settings,
        usage: resetIfNewDay(usage),
        saveSettings,
        checkCanPlay,
        ensureCanPlayOrAlert,
        recordSessionMinutes,
      }}
    >
      {children}
    </ParentSettingsContext.Provider>
  );
};

export const useParentSettings = () => {
  const ctx = useContext(ParentSettingsContext);
  if (!ctx) {
    throw new Error("useParentSettings must be used within ParentSettingsProvider");
  }
  return ctx;
};
