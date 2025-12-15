import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const QUIZ = [
  {
    q: "Denize atılan plastikler zamanla neye dönüşebilir?",
    a: ["Mikroplastik", "Sadece kum", "Sadece yosun"],
    correct: 0,
    learned: "Plastikler parçalanarak mikroplastiğe dönüşebilir.",
  },
  {
    q: "Balıklar mikroplastikleri nasıl alır?",
    a: ["Yem sanarak", "Sadece soluyarak", "Hiç alamaz"],
    correct: 0,
    learned: "Canlılar mikroplastikleri yiyecek sanarak tüketebilir.",
  },
  {
    q: "En etkili çözüm hangisi?",
    a: ["Kaynakta azaltmak", "Sadece yakmak", "Sadece denize ağ atmak"],
    correct: 0,
    learned: "Atığı kaynağında azaltmak en kalıcı çözümdür.",
  },
];

export default function PacificOceanActionGame({ levelIndex, onFinished }) {
  const { width } = Dimensions.get("window");
  const gameWidth = Math.min(width - 24, 520);

  const [phase, setPhase] = useState("ACTION"); // ACTION -> QUIZ
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [trash, setTrash] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [wrong, setWrong] = useState(0);

  const idRef = useRef(1);
  const intervalRef = useRef(null);

  const quiz = useMemo(() => QUIZ[(levelIndex + quizIndex) % QUIZ.length], [levelIndex, quizIndex]);

  useEffect(() => {
    if (phase !== "ACTION") return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
      setTrash((cur) => {
        const next = cur.map((x) => ({ ...x, y: x.y + 14 })).filter((x) => x.y < 240);
        // spawn
        if (Math.random() < 0.7) {
          const id = idRef.current++;
          const x = 10 + Math.random() * (gameWidth - 40);
          next.push({ id, x, y: -10 });
        }
        return next;
      });
    }, 250);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [phase, gameWidth]);

  useEffect(() => {
    if (phase !== "ACTION") return;
    if (timeLeft <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setPhase("QUIZ");
    }
  }, [phase, timeLeft]);

  const tapTrash = (id) => {
    setTrash((cur) => cur.filter((x) => x.id !== id));
    setScore((s) => s + 1);
  };

  const answer = (idx) => {
    if (idx === quiz.correct) {
      if (quizIndex >= 2) {
        const success = score >= 10 && wrong <= 1;
        const learned = [
          "Denize atılan plastikler mikroplastiğe dönüşür",
          "Atığı kaynağında azaltmak en etkili çözümdür",
          quiz.learned,
        ];
        onFinished?.({
          success,
          consequenceText: success
            ? "Temizleme başarısı yüksek! Deniz canlıları için risk azaldı."
            : "Temizleme yetersiz kaldı. Daha hızlı toplamalı ve doğru cevaplamalısın.",
          learned,
        });
      } else {
        setQuizIndex((q) => q + 1);
      }
    } else {
      setWrong((w) => w + 1);
      if (quizIndex >= 2) {
        const success = false;
        onFinished?.({
          success,
          consequenceText: "Yanlış cevaplar arttı. Mikroplastik bilgini güçlendir ve tekrar dene.",
          learned: ["Mikroplastik bilgisi çevre kararlarını güçlendir"],
        });
      } else {
        setQuizIndex((q) => q + 1);
      }
    }
  };

  return (
    <View style={styles.root}>
      {phase === "ACTION" ? (
        <View style={styles.card}>
          <Text style={styles.title}>🌊 Pasifik Temizliği</Text>
          <Text style={styles.sub}>Çöplere dokun ve topla. Hedef: 10+</Text>

          <View style={[styles.playfield, { width: gameWidth }]}>
            {trash.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.trash, { left: t.x, top: t.y }]}
                onPress={() => tapTrash(t.id)}
              >
                <Text style={styles.trashTxt}>🧴</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.hud}>
            <Text style={styles.hudTxt}>Skor: {score}</Text>
            <Text style={styles.hudTxt}>Süre: {timeLeft}s</Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>🧠 Mini Quiz</Text>
          <Text style={styles.sub}>{quiz.q}</Text>
          {quiz.a.map((choice, idx) => (
            <TouchableOpacity key={choice} style={styles.option} onPress={() => answer(idx)}>
              <Text style={styles.optionTxt}>{choice}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.hint}>Başarı: Skor ≥ 10 ve yanlış ≤ 1</Text>
        </View>
      )}
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
    borderColor: "rgba(56,189,248,0.45)",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#E0F2FE",
  },
  sub: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.86)",
    fontWeight: "700",
  },
  playfield: {
    marginTop: 14,
    height: 220,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  trash: {
    position: "absolute",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  trashTxt: {
    fontSize: 18,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  hudTxt: {
    color: "rgba(255,255,255,0.86)",
    fontWeight: "900",
    fontSize: 12,
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
