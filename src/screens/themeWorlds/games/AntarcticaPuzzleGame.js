import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PUZZLES = [
  {
    title: "Dengeyi Kur",
    prompt: "Emisyonu düşürürken enerji ihtiyacını da karşılamalısın. Hangi kombinasyonu seçersin?",
    options: [
      {
        text: "Yenilenebilir + verimlilik + toplu taşıma",
        success: true,
        consequence: "Emisyon düştü, enerji açığı oluşmadı. Buz kaybı yavaşladı.",
        learned: [
          "Verimlilik enerji ihtiyacını azaltır",
          "Yenilenebilir emisyonu düşürür",
          "Ulaşım dönüşümü iklimi destekler",
        ],
      },
      {
        text: "Kömür + daha fazla üretim",
        success: false,
        consequence: "Emisyon arttı, ısınma hızlandı. Buz erimesi hız kazandı.",
        learned: [
          "Fosil yakıtlar emisyonu artırır",
          "Albedo azalması ısınmayı hızlandırır",
          "Kısa vadeli üretim uzun vadeli risk doğurur",
        ],
      },
      {
        text: "Yalnızca ağaç dikimi (enerji sistemi değişmeden)",
        success: false,
        consequence: "Yararlı ama yetersiz kaldı. Enerji kaynaklı emisyonlar devam etti.",
        learned: [
          "Doğa temelli çözümler tek başına yetmez",
          "Enerji sistemi dönüşümü gerekir",
          "Çoklu çözüm yaklaşımı daha etkilidir",
        ],
      },
    ],
  },
  {
    title: "Krizi Önle",
    prompt: "Buz tabakası hassas. Hangi politika paketi daha etkili?",
    options: [
      {
        text: "Karbon azaltımı + yenilenebilir teşvik + enerji verimliliği",
        success: true,
        consequence: "Emisyonlar azaldı; buz kaybı yavaşladı ve ekosistem daha kararlı kaldı.",
        learned: [
          "Teşvikler dönüşümü hızlandırır",
          "Karbon azaltımı temel hedeftir",
          "Verimlilik hızlı kazanım sağlar",
        ],
      },
      {
        text: "Sorunu ertele, sonra çöz",
        success: false,
        consequence: "Gecikme maliyeti arttı; geri dönüşsüz eşikler yaklaşmış olabilir.",
        learned: [
          "Gecikme riski büyütür",
          "Eşikler geri dönüşsüz olabilir",
          "Erken aksiyon daha ucuzdur",
        ],
      },
    ],
  },
];

export default function AntarcticaPuzzleGame({ levelIndex, onFinished }) {
  const puzzle = useMemo(() => PUZZLES[levelIndex % PUZZLES.length], [levelIndex]);
  const [picked, setPicked] = useState(null);

  const pick = (opt) => {
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
        <Text style={styles.title}>🧊 Antarktika Bulmaca</Text>
        <Text style={styles.sub}>{puzzle.title}</Text>
        <Text style={styles.prompt}>{puzzle.prompt}</Text>

        {puzzle.options.map((opt) => (
          <TouchableOpacity
            key={opt.text}
            disabled={picked !== null}
            style={[styles.option, picked === opt.text && styles.optionPicked, picked !== null && styles.optionDisabled]}
            onPress={() => pick(opt)}
          >
            <Text style={styles.optionTxt}>{opt.text}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.hint}>En iyi sonuç: çoklu çözüm + emisyon azaltımı.</Text>
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
    borderColor: "rgba(167,139,250,0.45)",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#EDE9FE",
  },
  sub: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
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
    backgroundColor: "rgba(167,139,250,0.20)",
    borderColor: "rgba(167,139,250,0.45)",
  },
  optionDisabled: {
    opacity: 0.85,
  },
  optionTxt: {
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
