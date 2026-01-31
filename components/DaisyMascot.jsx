import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const MOOD = {
  idle: 0,
  happy: 1,
  thinking: 2,
  surprised: 3,
};

export default function DaisyMascot({ size = 64, mood = "idle" }) {
  const blink = useRef(new Animated.Value(1)).current;
  const moodValue = useRef(new Animated.Value(MOOD.idle)).current;
  const baseEyeX = useRef(new Animated.Value(0)).current;
  const baseEyeY = useRef(new Animated.Value(0)).current;
  const osc = useRef(new Animated.Value(0)).current;
  const oscAmp = useRef(new Animated.Value(1)).current;
  const eyeScale = useRef(new Animated.Value(1)).current;
  const smileScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(osc, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(osc, {
          toValue: -1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [osc]);

  useEffect(() => {
    let timer;
    const blinkOnce = () => {
      const closeDuration = 120 + Math.random() * 60;
      const openDuration = 160 + Math.random() * 100;
      return Animated.sequence([
        Animated.timing(blink, {
          toValue: 0.05,
          duration: closeDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: openDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]);
    };
    const schedule = () => {
      const delay = 2800 + Math.random() * 2700;
      timer = setTimeout(() => {
        const isDouble = Math.random() < 0.15;
        if (isDouble) {
          Animated.sequence([
            blinkOnce(),
            Animated.delay(120),
            blinkOnce(),
          ]).start();
        } else {
          blinkOnce().start();
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [blink]);

  useEffect(() => {
    const target = MOOD[mood] ?? MOOD.idle;
    Animated.timing(moodValue, {
      toValue: target,
      duration: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    let tx = 0;
    let ty = 0;
    let amp = 1;
    let eyeS = 1;
    let smileS = 1;

    if (mood === "happy") {
      amp = 0.4;
      eyeS = 0.92;
      smileS = 1.2;
    } else if (mood === "thinking") {
      tx = 6;
      ty = -4;
      amp = 0.2;
      eyeS = 1;
      smileS = 0.8;
    } else if (mood === "surprised") {
      tx = 0;
      ty = 0;
      amp = 0.1;
      eyeS = 1.12;
      smileS = 0.9;
    }

    Animated.parallel([
      Animated.timing(baseEyeX, {
        toValue: tx,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(baseEyeY, {
        toValue: ty,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(oscAmp, {
        toValue: amp,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(eyeScale, {
        toValue: eyeS,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(smileScale, {
        toValue: smileS,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [mood, baseEyeX, baseEyeY, oscAmp, eyeScale, smileScale, moodValue]);

  const eyeOffsetX = useMemo(
    () => Animated.add(baseEyeX, Animated.multiply(osc, oscAmp)),
    [baseEyeX, osc, oscAmp]
  );
  const eyeOffsetY = useMemo(
    () => Animated.add(baseEyeY, Animated.multiply(osc, Animated.multiply(oscAmp, -0.35))),
    [baseEyeY, osc, oscAmp]
  );

  const eyeScaleY = useMemo(() => Animated.multiply(eyeScale, blink), [eyeScale, blink]);

  const smileOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 1, 0, 0],
  });
  const flatOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 0, 1, 0],
  });
  const oOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 0, 0, 1],
  });

  const petals = useMemo(() => {
    const items = [];
    const count = 16;
    const scaleJitter = [1, 1.02, 0.985, 1.015, 0.99, 1.025, 0.98, 1.01];
    const rotateJitter = [0, 1.4, -1.2, 0.8, -0.6, 1.8, -1.6, 0.5];
    const PETAL_LONG = "M100 8 C118 18 134 46 132 72 C130 98 106 108 100 108 C94 108 70 98 68 72 C66 46 82 18 100 8 Z";
    const PETAL_MED = "M100 12 C116 22 130 46 128 70 C126 94 105 102 100 102 C95 102 74 94 72 70 C70 46 84 22 100 12 Z";
    const PETAL_SHORT = "M100 16 C114 26 126 46 124 66 C122 86 104 94 100 94 C96 94 78 86 76 66 C74 46 86 26 100 16 Z";
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const rotate = (angle * 180) / Math.PI + rotateJitter[i % rotateJitter.length];
      const s = scaleJitter[i % scaleJitter.length];
      const petalPath = i % 3 === 0 ? PETAL_LONG : i % 3 === 1 ? PETAL_MED : PETAL_SHORT;
      items.push(
        <G key={`p-${i}`} rotation={rotate} origin="100,100" scale={s}>
          <Path
            d={petalPath}
            fill="url(#petalGrad)"
          />
          <Path
            d={petalPath}
            fill="url(#petalInner)"
            opacity="0.55"
          />
          <Path
            d="M100 64 C108 74 112 86 106 98 C104 102 100 104 100 104 C100 104 106 102 108 98 C118 86 112 74 100 64 Z"
            fill="#9E7A3B"
            opacity="0.08"
          />
          <Path
            d="M92 20 C100 24 108 34 112 46 C106 40 98 34 92 32 Z"
            fill="#FFFFFF"
            opacity="0.07"
          />
        </G>
      );
    }
    return items;
  }, []);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id="faceGrad" cx="48%" cy="36%" r="62%">
            <Stop offset="0" stopColor="#FFE4A2" />
            <Stop offset="0.65" stopColor="#F2C257" />
            <Stop offset="1" stopColor="#DFA34A" />
          </RadialGradient>
          <LinearGradient id="faceShadow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#6E4A14" stopOpacity="0.18" />
          </LinearGradient>
          <LinearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF6D9" />
            <Stop offset="1" stopColor="#F3E3B0" />
          </LinearGradient>
          <LinearGradient id="petalInner" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFDF2" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#E8D6A4" stopOpacity="0.4" />
          </LinearGradient>
          <RadialGradient id="eyeIris" cx="50%" cy="38%" r="70%">
            <Stop offset="0" stopColor="#3A2A24" />
            <Stop offset="0.6" stopColor="#2A1C18" />
            <Stop offset="1" stopColor="#1B1512" />
          </RadialGradient>
          <RadialGradient id="eyeDepth" cx="50%" cy="70%" r="80%">
            <Stop offset="0" stopColor="#0B0A0A" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.25" />
          </RadialGradient>
          <RadialGradient id="blush" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#E79A72" stopOpacity="0.09" />
            <Stop offset="1" stopColor="#E79A72" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {petals}

        <Circle cx="100" cy="100" r="71" fill="url(#faceGrad)" />
        <Path
          d="M44 126 C60 156 140 156 156 126 C148 156 126 170 100 172 C74 170 52 156 44 126 Z"
          fill="url(#faceShadow)"
          opacity="0.22"
        />
        <Path
          d="M60 48 C78 30 124 28 140 50 C124 44 98 42 70 48 Z"
          fill="#FFFFFF"
          opacity="0.12"
        />
        <Circle cx="78" cy="122" r="18" fill="url(#blush)" />
        <Circle cx="124" cy="122" r="18" fill="url(#blush)" />

        <AnimatedG
          style={{
            transform: [
              { translateX: eyeOffsetX },
              { translateY: eyeOffsetY },
            ],
          }}
        >
          <AnimatedG
            style={{
              transform: [
                { translateY: 92 },
                { scaleY: eyeScaleY },
                { translateY: -92 },
              ],
            }}
          >
            <Circle cx="79" cy="92" r="19" fill="#F8F3E9" />
            <Circle cx="121" cy="92" r="19" fill="#F8F3E9" />
            <AnimatedCircle cx="79" cy="92" r="13.2" fill="url(#eyeIris)" />
            <AnimatedCircle cx="121" cy="92" r="13.2" fill="url(#eyeIris)" />
            <AnimatedCircle cx="79" cy="92" r="13.2" fill="url(#eyeDepth)" />
            <AnimatedCircle cx="121" cy="92" r="13.2" fill="url(#eyeDepth)" />
            <Path
              d="M70 86 C78 80 90 82 94 88 C86 86 78 86 70 86 Z"
              fill="#FFFFFF"
              opacity="0.08"
            />
            <Path
              d="M106 86 C114 80 126 82 130 88 C122 86 114 86 106 86 Z"
              fill="#FFFFFF"
              opacity="0.08"
            />
            <Circle cx="74.5" cy="86.5" r="4.6" fill="#FFFFFF" opacity="0.55" />
            <Circle cx="119.5" cy="86.5" r="4.6" fill="#FFFFFF" opacity="0.55" />
            <Circle cx="77" cy="95.5" r="2.0" fill="#FFFFFF" opacity="0.35" />
            <Circle cx="123" cy="95.5" r="2.0" fill="#FFFFFF" opacity="0.35" />
            <Path d="M66 104 C72 108 86 108 92 104 C86 110 72 110 66 104 Z" fill="#8A6B49" opacity="0.11" />
            <Path d="M108 104 C114 108 128 108 134 104 C128 110 114 110 108 104 Z" fill="#8A6B49" opacity="0.11" />
          </AnimatedG>
        </AnimatedG>

        <AnimatedG
          style={{
            transform: [{ translateX: 0 }, { translateY: 15 }, { scale: smileScale }],
            opacity: smileOpacity,
          }}
        >
          <AnimatedPath
            d="M76 115 C88 125 112 125 124 115"
            stroke="#2A1F1A"
            strokeWidth="4.6"
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M90 119 C94 125 106 125 110 119" fill="#C76659" />
        </AnimatedG>

        <AnimatedPath
          d="M84 120 L116 120"
          stroke="#2A1F1A"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          style={{ opacity: flatOpacity }}
        />

        <AnimatedCircle
          cx="100"
          cy="122"
          r="9"
          fill="#2A1F1A"
          style={{ opacity: oOpacity }}
        />
        <AnimatedCircle
          cx="100"
          cy="122"
          r="5"
          fill="#C76659"
          style={{ opacity: oOpacity }}
        />
      </Svg>
    </View>
  );
}
