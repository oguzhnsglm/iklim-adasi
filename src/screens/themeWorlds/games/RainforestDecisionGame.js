import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SCENARIOS = [
  {
    title: "Orman Yönetimi",
    prompt: "Bölgedeki ağaç kesimi artıyor. İlk adım olarak ne yaparsın?",
    options: [
      {
        text: "Koruma alanı ilan edip denetimi artırırım",
        success: true,
        consequence: "Kesim azaldı, habitat korundu. Yerel halk için sürdürülebilir gelir programı başlatıldı.",
        learned: [
          "Koruma alanları biyoçeşitliliği korur",
          "Denetim, kaçak kesimi azaltır",
          "Sürdürülebilir gelir, korumayı destekler",
        ],
      },
      {
        text: "Kesimi tamamen serbest bırakırım",
        success: false,
        consequence: "Orman parçalandı, türler azaldı. Sel ve erozyon riski arttı.",
        learned: [
          "Orman kaybı erozyonu artırır",
          "Habitat parçalanması türleri azaltır",
          "Kısa vadeli kazanç uzun vadeli kayıptır",
        ],
      },
      {
        text: "Sadece yeni fidan dikimi yaparım (kesim devam eder)",
        success: false,
        consequence: "Fidanlar dikildi ama kesim hızla devam ettiği için net kayıp oluştu.",
        learned: [
          "Fidan dikimi tek başına yetmez",
          "Kesim azaltılmadan net kazanç sağlanmaz",
          "Planlama ve denetim birlikte gerekir",
        ],
      },
    ],
  },
  {
    title: "Yangın Riski",
    prompt: "Hava çok kuru ve yangın riski yükseldi. Ne yaparsın?",
    options: [
      {
        text: "Erken uyarı + yangın şeritleri + eğitim kampanyası",
        success: true,
        consequence: "Yangın çıkmadan risk düşürüldü; küçük bir kıvılcım kontrol altına alındı.",
        learned: [
          "Önleme, müdahaleden daha etkilidir",
          "Yangın şeritleri yayılımı yavaşlatır",
          "Toplum eğitimi riski azaltır",
        ],
      },
      {
        text: "Hiçbir şey yapmam, şansımıza güvenirim",
        success: false,
        consequence: "Büyük bir yangın başladı ve geniş alanlar zarar gördü.",
        learned: [
          "İhmal, felaket riskini büyütür",
          "Kuru havada yangın hızla yayılır",
          "Önlem almak kritik önemdedir",
        ],
      },
      {
        text: "Sadece itfaiyeyi hazır tutarım",
        success: false,
        consequence: "Müdahale edildi ama önleme olmadığı için yangın büyüdü; maliyet arttı.",
        learned: [
          "Hazırlık önemlidir ama tek başına yeterli değil",
          "Önleme maliyeti düşürür",
          "Risk yönetimi çok adımlıdır",
        ],
      },
    ],
  },
];

export default function RainforestDecisionGame({ levelIndex, onFinished }) {
  const scenario = useMemo(() => SCENARIOS[levelIndex % SCENARIOS.length], [levelIndex]);
  const [picked, setPicked] = useState(null);

  const choose = (opt) => {
    setPicked(opt.text);
    onFinished?.({
      success: opt.success,
      consequenceText: opt.consequence,
      learned: opt.learned,
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>🌿 {scenario.title}</Text>
        <Text style={styles.prompt}>{scenario.prompt}</Text>
        <View style={{ marginTop: 10 }}>
          {scenario.options.map((opt) => (
            <TouchableOpacity
              key={opt.text}
              disabled={picked !== null}
              style={[styles.option, picked === opt.text && styles.optionPicked, picked !== null && styles.optionDisabled]}
              onPress={() => choose(opt)}
            >
              <Text style={styles.optionText}>{opt.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>Doğru seçim: koruma + denetim + sürdürülebilirlik.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderWidth: 2,
    borderColor: "rgba(74,222,128,0.45)",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#E8F5E9",
  },
  prompt: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.86)",
    fontWeight: "700",
  },
  option: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  optionPicked: {
    backgroundColor: "rgba(34,197,94,0.25)",
    borderColor: "rgba(34,197,94,0.45)",
  },
  optionDisabled: {
    opacity: 0.85,
  },
  optionText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 12,
  },
  hint: {
    marginTop: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    fontSize: 11,
  },
});
