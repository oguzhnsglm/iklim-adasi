import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import soundManager from "../../utils/sounds";
import { useThemeProgress } from "../../ThemeProgressContext";
import { useThemeWorldsProgress } from "../../ThemeWorldsProgressContext";
import RainforestDecisionGame from "./games/RainforestDecisionGame";
import PacificOceanActionGame from "./games/PacificOceanActionGame";
import SaharaSurvivalGame from "./games/SaharaSurvivalGame";
import AntarcticaPuzzleGame from "./games/AntarcticaPuzzleGame";

const DID_YOU_KNOW = {
  rainforest: [
    "Yağmur ormanları dünyanın karasal biyoçeşitliliğinin büyük kısmını barındırır.",
    "Ormansızlaşma, CO₂ salımını artırarak iklimi hızlandırır.",
    "Yangınlar sonrası toprak erozyonu hızlanır ve su döngüsü bozulur.",
  ],
  pacific: [
    "Mikroplastikler, planktondan balıklara kadar tüm zincire karışabilir.",
    "Plastik atıklar denizde sadece kirlilik değil, boğulma riskidir.",
    "Temiz bir deniz, oksijen üretimi ve iklim dengesi için kritiktir.",
  ],
  sahara: [
    "Çöl ekosistemleri kırılgandır; küçük bir su kaybı bile yaşamı etkiler.",
    "Su yönetimi; dayanıklılık, planlama ve enerji tasarrufu ister.",
    "Aşırı sıcaklarda yanlış kararlar su ihtiyacını artırır.",
  ],
  antarctica: [
    "Buzullar eridikçe güneş ışığı daha az yansır (albedo azalır) ve ısınma artar.",
    "Yenilenebilir enerji arttıkça emisyon düşer ve buz kaybı yavaşlar.",
    "Ulaşım ve sanayi kaynaklı emisyonlar iklim üzerinde doğrudan etkilidir.",
  ],
};

const THEME_MASTER_BADGE = {
  rainforest: { icon: "🌿", title: "Orman Muhafızı Rozeti" },
  pacific: { icon: "🌊", title: "Okyanus Koruyucusu Rozeti" },
  sahara: { icon: "🏜️", title: "Çöl Rehberi Rozeti" },
  antarctica: { icon: "🧊", title: "Buzul Bilgesi Rozeti" },
};

export default function ThemeWorldGameScreen({
  themeId,
  levelIndex,
  levelGlobalIndex,
  onExitToMap,
  onNextLevel,
}) {
  const {
    themes,
    totalLevels,
    resolveGlobalLevel,
    resolveThemeLevel,
    getGlobalProgress,
    getThemeProgress,
    completeLevel,
    awardThemeBadgeIfCompleted,
  } = useThemeWorldsProgress();
  const { setActiveTheme } = useThemeProgress();

  const meta = useMemo(() => {
    if (typeof levelGlobalIndex === "number") return resolveGlobalLevel?.(levelGlobalIndex);
    if (themeId && typeof levelIndex === "number") return resolveThemeLevel?.(themeId, levelIndex);
    return resolveGlobalLevel?.(0);
  }, [levelGlobalIndex, levelIndex, themeId, resolveGlobalLevel, resolveThemeLevel]);

  const effectiveThemeId = meta?.themeId || themeId || "rainforest";
  const effectiveLevelIndex = typeof meta?.themeLevelIndex === "number" ? meta.themeLevelIndex : (levelIndex || 0);
  const effectiveGlobalIndex = typeof meta?.globalIndex === "number" ? meta.globalIndex : 0;

  const def = themes?.find((t) => t.id === effectiveThemeId);
  const globalProgress = getGlobalProgress?.() || { completedGlobal: 0, totalLevels: totalLevels || 0 };
  const completedGlobal = globalProgress.completedGlobal || 0;

  const [stage, setStage] = useState("LEARN"); // LEARN -> DECIDE -> CONSEQUENCE -> REWARD
  const [result, setResult] = useState(null);

  const didYouKnowText = useMemo(() => {
    const pool = DID_YOU_KNOW[effectiveThemeId] || ["Doğayı korumak hepimizin sorumluluğu."];
    return pool[effectiveLevelIndex % pool.length];
  }, [effectiveThemeId, effectiveLevelIndex]);

  useEffect(() => {
    soundManager.init?.();
    if (soundManager.playThemeMusic) {
      soundManager.playThemeMusic(effectiveThemeId);
    } else {
      soundManager.setMusicEnabled?.(true);
    }
    return () => {
      soundManager.stopThemeMusic?.();
    };
  }, [effectiveThemeId]);

  useEffect(() => {
    setStage("LEARN");
    setResult(null);
  }, [effectiveThemeId, effectiveGlobalIndex]);

  const onFinished = async (res) => {
    setResult(res);
    setStage("CONSEQUENCE");

    if (res?.success) {
      await completeLevel({
        themeId: effectiveThemeId,
        levelIndex: effectiveLevelIndex,
        levelGlobalIndex: effectiveGlobalIndex,
        levelId: meta?.id,
        stars: 3,
        learned: res.learned || [],
        success: true,
      });

      // If the theme segment is completed, award the theme badge.
      const tp = getThemeProgress?.(effectiveThemeId);
      if (tp && (tp.completedLevels || 0) >= (tp.levelCount || 0) && (tp.levelCount || 0) > 0) {
        await awardThemeBadgeIfCompleted(effectiveThemeId);
        setActiveTheme?.(effectiveThemeId);
      }
    } else {
      // Store 0 stars for failed attempts (no progression).
      await completeLevel({
        themeId: effectiveThemeId,
        levelIndex: effectiveLevelIndex,
        levelGlobalIndex: effectiveGlobalIndex,
        levelId: meta?.id,
        stars: 0,
        learned: res?.learned || [],
        success: false,
      });
    }
  };

  const renderGame = () => {
    switch (effectiveThemeId) {
      case "rainforest":
        return <RainforestDecisionGame levelIndex={effectiveLevelIndex} onFinished={onFinished} />;
      case "pacific":
        return <PacificOceanActionGame levelIndex={effectiveLevelIndex} onFinished={onFinished} />;
      case "sahara":
        return <SaharaSurvivalGame levelIndex={effectiveLevelIndex} onFinished={onFinished} />;
      case "antarctica":
        return <AntarcticaPuzzleGame levelIndex={effectiveLevelIndex} onFinished={onFinished} />;
      default:
        return <RainforestDecisionGame levelIndex={effectiveLevelIndex} onFinished={onFinished} />;
    }
  };

  const nextGlobalIndex = Math.min((totalLevels || 1) - 1, effectiveGlobalIndex + 1);
  const canGoNext = (completedGlobal || 0) > effectiveGlobalIndex;

  const masterBadge = THEME_MASTER_BADGE[effectiveThemeId];
  const tp = getThemeProgress?.(effectiveThemeId);
  const isThemeCompleted = tp && (tp.completedLevels || 0) >= (tp.levelCount || 0) && (tp.levelCount || 0) > 0;

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => onExitToMap?.(effectiveThemeId)} style={styles.topBtn}>
          <Text style={styles.topBtnTxt}>← Harita</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {def?.icon || "🌍"} {def?.name || "Tema"}
          </Text>
          <Text style={styles.topSubtitle}>Seviye {(meta?.globalNumber || (effectiveGlobalIndex + 1))}/{totalLevels || 0}</Text>
        </View>
        <View style={styles.topRight} />
      </View>

      {stage === "LEARN" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Biliyor muydun?</Text>
          <Text style={styles.cardBody}>{didYouKnowText}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStage("DECIDE")}>
            <Text style={styles.primaryTxt}>Devam</Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === "DECIDE" && <View style={{ flex: 1 }}>{renderGame()}</View>}

      {stage === "CONSEQUENCE" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Sonuç</Text>
          <Text style={styles.cardBody}>{result?.consequenceText || ""}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStage("REWARD")}>
            <Text style={styles.primaryTxt}>Ödülü Gör</Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === "REWARD" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 Ödül</Text>
          <Text style={styles.cardBody}>Bu bölümde şunları öğrendin:</Text>
          {(result?.learned || []).slice(0, 5).map((line, idx) => (
            <Text key={`l-${idx}`} style={styles.learnedLine}>• {line}</Text>
          ))}

          {result?.success ? (
            <Text style={styles.success}>✅ Seviye başarıyla tamamlandı!</Text>
          ) : (
            <Text style={styles.fail}>❌ Bu seviye tamamlanamadı. Tekrar dene!</Text>
          )}

          {isThemeCompleted && masterBadge && (
            <View style={styles.masterBadge}>
              <Text style={styles.masterIcon}>{masterBadge.icon}</Text>
              <Text style={styles.masterText}>{masterBadge.title} kazanıldı!</Text>
            </View>
          )}

          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => onExitToMap?.(effectiveThemeId)}>
              <Text style={styles.secondaryTxt}>Haritaya Dön</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, !canGoNext && styles.primaryBtnDisabled]}
              disabled={!canGoNext}
              onPress={() => {
                const nextMeta = resolveGlobalLevel?.(nextGlobalIndex);
                onNextLevel?.(nextGlobalIndex, nextMeta?.themeId || effectiveThemeId);
              }}
            >
              <Text style={styles.primaryTxt}>Sonraki</Text>
            </TouchableOpacity>
          </View>

          {!result?.success && (
            <TouchableOpacity style={styles.retryBtn} onPress={() => setStage("DECIDE")}>
              <Text style={styles.retryTxt}>🔄 Tekrar Dene</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 10,
  },
  topBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  topBtnTxt: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 12,
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  topTitle: {
    color: "#E5E7EB",
    fontWeight: "900",
    fontSize: 13,
  },
  topSubtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "700",
    fontSize: 11,
  },
  topRight: {
    width: 70,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderWidth: 2,
    borderColor: "rgba(74,222,128,0.45)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#E8F5E9",
  },
  cardBody: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  learnedLine: {
    marginTop: 6,
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontWeight: "700",
  },
  primaryBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.9)",
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryTxt: {
    color: "#0b2a14",
    fontWeight: "900",
    fontSize: 13,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  secondaryTxt: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  success: {
    marginTop: 12,
    color: "#86efac",
    fontWeight: "900",
  },
  fail: {
    marginTop: 12,
    color: "#fca5a5",
    fontWeight: "900",
  },
  retryBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  retryTxt: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "900",
    fontSize: 12,
  },
  masterBadge: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(56,189,248,0.14)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  masterIcon: {
    fontSize: 20,
  },
  masterText: {
    flex: 1,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 12,
  },
});
