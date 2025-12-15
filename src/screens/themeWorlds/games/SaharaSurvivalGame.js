import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EVENTS = [
  {
    title: "Sıcak Dalga",
    prompt: "Sıcaklık yükseliyor. Hangi kararı alırsın?",
    choices: [
      {
        text: "Gölge bul, tempoyu düşür, suyu küçük yudumlarla iç",
        delta: { water: -8, energy: -10, heat: -10 },
        successHint: true,
        learned: "Sıcakta tempoyu düşürmek ve gölge, suyu korur.",
      },
      {
        text: "Hızlı koş, hemen varış noktasına ulaş",
        delta: { water: -20, energy: -25, heat: +15 },
        successHint: false,
        learned: "Aşırı efor su ihtiyacını artırır ve ısı stresini yükseltir.",
      },
      {
        text: "Su içmeyi azalt, aynı hızda devam et",
        delta: { water: -5, energy: -15, heat: +10 },
        successHint: false,
        learned: "Su kısıtlamak ısı stresini artırabilir; denge şarttır.",
      },
    ],
  },
  {
    title: "Rota Seçimi",
    prompt: "İki rota var: kısa ama güneş altında / uzun ama gölgeli. Ne seçersin?",
    choices: [
      {
        text: "Uzun ama gölgeli rota",
        delta: { water: -10, energy: -10, heat: -5 },
        successHint: true,
        learned: "Gölge ısı stresini azaltır, sürdürülebilir ilerlemeyi sağlar.",
      },
      {
        text: "Kısa ama güneş altında rota",
        delta: { water: -18, energy: -12, heat: +12 },
        successHint: false,
        learned: "Kısalık cazip olsa da güneş altında risk büyür.",
      },
    ],
  },
];

export default function SaharaSurvivalGame({ levelIndex, onFinished }) {
  const event = useMemo(() => EVENTS[levelIndex % EVENTS.length], [levelIndex]);

  const [water, setWater] = useState(60);
  const [energy, setEnergy] = useState(60);
  const [heat, setHeat] = useState(40);
  const [picked, setPicked] = useState(null);

  const applyChoice = (c) => {
    if (picked) return;
    setPicked(c.text);

    const nextWater = Math.max(0, Math.min(100, water + c.delta.water));
    const nextEnergy = Math.max(0, Math.min(100, energy + c.delta.energy));
    const nextHeat = Math.max(0, Math.min(100, heat + c.delta.heat));

    const success = nextWater >= 35 && nextEnergy >= 30 && nextHeat <= 60;

    onFinished?.({
      success,
      consequenceText: success
        ? "Kaynaklarını iyi yönettin. Zorlu koşullarda sürdürülebilir ilerledin."
        : "Kaynak yönetimi zayıf kaldı. Su/enerji düştü veya ısı stresi arttı.",
      learned: [
        "Kaynak yönetimi: su + enerji + ısı dengesi",
        c.learned,
        "Sürdürülebilir tempo hayatta kalmayı artırır",
      ],
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>🏜️ Sahara Hayatta Kalma</Text>
        <Text style={styles.sub}>{event.title}</Text>
        <Text style={styles.prompt}>{event.prompt}</Text>

        <View style={styles.stats}>
          <Text style={styles.stat}>Su: {water}</Text>
          <Text style={styles.stat}>Enerji: {energy}</Text>
          <Text style={styles.stat}>Isı: {heat}</Text>
        </View>

        {event.choices.map((c) => (
          <TouchableOpacity
            key={c.text}
            style={[styles.choice, picked === c.text && styles.choicePicked, picked && styles.choiceDisabled]}
            onPress={() => applyChoice(c)}
            disabled={!!picked}
          >
            <Text style={styles.choiceTxt}>{c.text}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.hint}>Başarı: Su ≥ 35, Enerji ≥ 30, Isı ≤ 60</Text>
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
    borderColor: "rgba(251,191,36,0.45)",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FEF3C7",
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
  stats: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    color: "rgba(255,255,255,0.88)",
    fontWeight: "900",
    fontSize: 12,
  },
  choice: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  choicePicked: {
    backgroundColor: "rgba(251,191,36,0.20)",
    borderColor: "rgba(251,191,36,0.45)",
  },
  choiceDisabled: {
    opacity: 0.85,
  },
  choiceTxt: {
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
