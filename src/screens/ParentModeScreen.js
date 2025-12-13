import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import KeyboardScrollView from '../components/KeyboardScrollView';
import { useParentSettings } from '../ParentSettingsContext';
import { THEME } from '../theme';

export default function ParentModeScreen({ onBack }) {
  const { settings, saveSettings, usage } = useParentSettings();
  const [age, setAge] = useState('');
  const [limitMinutes, setLimitMinutes] = useState('');
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (settings) {
      setAge(settings.childAge ? String(settings.childAge) : '');
      setLimitMinutes(settings.dailyLimitMinutes ? String(settings.dailyLimitMinutes) : '');
      setPin('');
      setUnlocked(false);
    }
  }, [settings]);

  const handleFirstSave = () => {
    const ageNum = parseInt(age, 10) || 0;
    const limitNum = parseInt(limitMinutes, 10) || 0;
    if (!pin || pin.length < 4) {
      Alert.alert('Hata', 'En az 4 haneli bir ebeveyn kodu belirleyin.');
      return;
    }
    const next = {
      childAge: ageNum,
      dailyLimitMinutes: limitNum,
      pin,
    };
    saveSettings(next);
    Alert.alert('Kaydedildi', 'Ebeveyn ayarları kaydedildi.');
  };

  const handleUnlock = () => {
    if (!settings?.pin) {
      setUnlocked(true);
      return;
    }
    if (pinInput === settings.pin) {
      setUnlocked(true);
    } else {
      Alert.alert('Hatalı Kod', 'Ebeveyn kodu yanlış, tekrar deneyin.');
    }
  };

  const handleUpdate = () => {
    const ageNum = parseInt(age, 10) || 0;
    const limitNum = parseInt(limitMinutes, 10) || 0;
    const next = {
      childAge: ageNum,
      dailyLimitMinutes: limitNum,
      pin: settings?.pin || pin,
    };
    saveSettings(next);
    Alert.alert('Güncellendi', 'Ebeveyn ayarları güncellendi.');
  };

  const hasSettings = !!settings;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👨‍👩‍👧 Ebeveyn Modu</Text>
        <View style={{ width: 60 }} />
      </View>

      {!hasSettings && (
        <KeyboardScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>İlk Kurulum</Text>
          <Text style={styles.infoText}>
            Çocuğun yaşını, günlük oyun süresini ve ebeveyn kodunu belirleyin.
          </Text>

          <Text style={styles.label}>Çocuğun Yaşı</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="Örn: 8"
          />

          <Text style={styles.label}>Günlük Oyun Süresi (dakika)</Text>
          <TextInput
            style={styles.input}
            value={limitMinutes}
            onChangeText={setLimitMinutes}
            keyboardType="number-pad"
            placeholder="Örn: 30"
          />

          <Text style={styles.label}>Ebeveyn Kodu (en az 4 hane)</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="****"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleFirstSave}>
            <Text style={styles.primaryBtnText}>Kaydet</Text>
          </TouchableOpacity>
        </KeyboardScrollView>
      )}

      {hasSettings && !unlocked && (
        <View style={styles.unlockContainer}>
          <Text style={styles.sectionTitle}>Ebeveyn Kodunu Gir</Text>
          <TextInput
            style={styles.input}
            value={pinInput}
            onChangeText={setPinInput}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="****"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleUnlock}>
            <Text style={styles.primaryBtnText}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasSettings && unlocked && (
        <KeyboardScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <Text style={styles.infoText}>
            Çocuğun yaşına ve günlük oyun süresine göre sınırları düzenleyebilirsiniz.
          </Text>

          <Text style={styles.label}>Çocuğun Yaşı</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Günlük Oyun Süresi (dakika)</Text>
          <TextInput
            style={styles.input}
            value={limitMinutes}
            onChangeText={setLimitMinutes}
            keyboardType="number-pad"
          />

          <View style={styles.usageBox}>
            <Text style={styles.usageTitle}>Bugünkü Kullanım</Text>
            <Text style={styles.usageText}>{usage.minutesUsed} dk kullanıldı</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdate}>
            <Text style={styles.primaryBtnText}>Güncelle</Text>
          </TouchableOpacity>
        </KeyboardScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.deepSea,
  },
  backBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
  },
  backText: {
    color: '#fff',
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.deepSea,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: THEME.textDark,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.deepSea,
  },
  input: {
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: THEME.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: THEME.textLight,
    fontWeight: '800',
    fontSize: 16,
  },
  unlockContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  usageBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.5)',
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.deepSea,
  },
  usageText: {
    marginTop: 4,
    fontSize: 13,
    color: THEME.textDark,
  },
});
