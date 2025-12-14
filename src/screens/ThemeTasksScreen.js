import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import KeyboardScrollView from '../components/KeyboardScrollView';
import { THEME } from '../theme';
import { useThemeProgress } from '../ThemeProgressContext';

const THEME_TASKS = {
  rainforest: [
    { id: 'rainforest-1', title: 'Ağaç dik ve ormanı büyüt' },
    { id: 'rainforest-2', title: 'Ormandaki çöpleri temizle' },
    { id: 'rainforest-3', title: 'Hayvanların yuvalarını koru' },
  ],
  pacific: [
    { id: 'pacific-1', title: 'Dalgaların getirdiği atıkları topla' },
    { id: 'pacific-2', title: 'Mercan resiflerini onar ve koru' },
    { id: 'pacific-3', title: 'Deniz canlılarına güvenli alan yarat' },
  ],
  antarctica: [
    { id: 'antarctica-1', title: 'Buzullardaki çatlakları işaretle' },
    { id: 'antarctica-2', title: 'Kutup hayvanlarını korumak için bariyer kur' },
  ],
};

export default function ThemeTasksScreen({ onBack }) {
  const { themes, activeTheme } = useThemeProgress();

  const palette = useMemo(() => {
    const base = activeTheme?.palette || {};
    return {
      background: base.background || THEME.background,
      primary: base.primary || THEME.deepSea,
      accent: base.accent || THEME.accent,
      textDark: base.textDark || THEME.textDark,
      wave: base.wave || THEME.wave,
    };
  }, [activeTheme]);

  const sections = useMemo(
    () =>
      themes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        icon: theme.icon,
        progressText: `Seviye ${theme.completedLevels}/${theme.maxLevels} ¶ú Rozet ${theme.badges.length}`,
        tasks: THEME_TASKS[theme.id] || [],
      })),
    [themes]
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>ƒÅ? Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>§Y?î Tema Görevleri</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={[styles.activeBanner, { backgroundColor: 'rgba(255,255,255,0.85)' }]}>
        <Text style={[styles.activeLabel, { color: palette.wave }]}>Aktif Tema</Text>
        <Text style={[styles.activeThemeName, { color: palette.primary }]}>{activeTheme.icon} {activeTheme.name}</Text>
        <Text style={[styles.activeProgress, { color: palette.textDark }]}>
          Seviye {activeTheme.completedLevels}/{activeTheme.maxLevels} ¶ú Rozet {activeTheme.badges.length}
        </Text>
      </View>

      <KeyboardScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.infoText, { color: palette.textDark }]}>
          Her tema için doğayı korumaya yönelik küçük görevler var. Görevleri tamamladıkça rozetler kazanır ve yeni
          temaların kilidini açarsın.
        </Text>

        {sections.map((section) => (
          <View
            key={section.id}
            style={[
              styles.card,
              section.id === activeTheme.id && styles.cardActive,
              section.id === activeTheme.id && { borderColor: palette.accent, shadowColor: palette.accent },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.primary }]}>{section.icon} {section.name}</Text>
            <Text style={[styles.cardSubtitle, { color: palette.textDark }]}>{section.progressText}</Text>
            <View style={styles.taskList}>
              {section.tasks.map((task) => (
                <Text key={task.id} style={[styles.taskItem, { color: palette.textDark }]}>ƒ?½ {task.title}</Text>
              ))}
            </View>
          </View>
        ))}
      </KeyboardScrollView>
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
  activeBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.wave,
  },
  activeThemeName: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800',
    color: THEME.deepSea,
  },
  activeProgress: {
    marginTop: 2,
    fontSize: 12,
    color: THEME.textDark,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: THEME.textDark,
    marginBottom: 4,
  },
  card: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cardActive: {
    borderColor: THEME.accent,
    shadowColor: THEME.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.deepSea,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: THEME.textDark,
  },
  taskList: {
    marginTop: 8,
    gap: 4,
  },
  taskItem: {
    fontSize: 12,
    color: THEME.textDark,
  },
});
