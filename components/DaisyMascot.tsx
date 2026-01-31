import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Ellipse,
} from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const MOOD = {
  idle: 0,
  happy: 1,
  thinking: 2,
  surprised: 3,
  laugh: 4,
  sleepy: 5,
  sad: 6,
  celebrate: 7,
  greet: 8,
} as const;

type DaisyMascotMood = keyof typeof MOOD;

type DaisyMascotProps = {
  size?: number;
  mood?: DaisyMascotMood;
  idleAfterMs?: number;
  activityKey?: string | number;
  onTap?: () => void;
};

export default function DaisyMascot({
  size = 64,
  mood = "idle",
  idleAfterMs = 60000,
  activityKey,
  onTap,
}: DaisyMascotProps) {
  const [sleepActive, setSleepActive] = useState(false);
  const [interactionTick, setInteractionTick] = useState(0);
  const [greetPlaying, setGreetPlaying] = useState(false);
  const currentMood: DaisyMascotMood = sleepActive ? "sleepy" : greetPlaying ? "greet" : mood;

  const blink = useRef(new Animated.Value(1)).current;
  const leftBlink = useRef(new Animated.Value(1)).current;
  const rightBlink = useRef(new Animated.Value(1)).current;
  const moodValue = useRef(new Animated.Value(MOOD.idle)).current;
  const baseEyeX = useRef(new Animated.Value(0)).current;
  const baseEyeY = useRef(new Animated.Value(0)).current;
  const osc = useRef(new Animated.Value(0)).current;
  const oscAmp = useRef(new Animated.Value(1)).current;
  const eyeScale = useRef(new Animated.Value(1)).current;
  const smileScale = useRef(new Animated.Value(1)).current;

  const headBob = useRef(new Animated.Value(0)).current;
  const headScale = useRef(new Animated.Value(1)).current;
  const headRotate = useRef(new Animated.Value(0)).current;
  const blushOpacity = useRef(new Animated.Value(0.09)).current;

  const moodRef = useRef<DaisyMascotMood>(currentMood);
  const lastMoodRef = useRef<DaisyMascotMood>(mood);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const laughLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const sleepyLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const wakeInProgressRef = useRef(false);

  useEffect(() => {
    moodRef.current = currentMood;
  }, [currentMood]);

  useEffect(() => {
    setSleepActive(false);
    blink.setValue(1);
    leftBlink.setValue(1);
    rightBlink.setValue(1);
  }, [blink, leftBlink, rightBlink]);

  const triggerWakeUp = () => {
    if (wakeInProgressRef.current) return;
    wakeInProgressRef.current = true;

    if (sleepyLoopRef.current) {
      sleepyLoopRef.current.stop();
      sleepyLoopRef.current = null;
    }

    Animated.parallel([
      Animated.timing(eyeScale, { toValue: 1, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(oscAmp, { toValue: 0.2, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(baseEyeY, { toValue: 0, duration: 180, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]).start();

    const startle = Animated.sequence([
      Animated.timing(headBob, { toValue: -3, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(headBob, { toValue: 0, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);

    const wakeBlinks = Animated.sequence([
      Animated.timing(blink, { toValue: 0.08, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(blink, { toValue: 1, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(blink, { toValue: 0.08, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(blink, { toValue: 1, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);

    const refocus = Animated.sequence([
      Animated.timing(baseEyeX, { toValue: 4, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(baseEyeX, { toValue: -2, duration: 140, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(baseEyeX, { toValue: 0, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);

    const softSmile = Animated.sequence([
      Animated.timing(smileScale, { toValue: 1.08, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(smileScale, { toValue: 1, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);

    Animated.sequence([
      startle,
      Animated.parallel([wakeBlinks, refocus, softSmile]),
    ]).start(() => {
      setSleepActive(false);
      wakeInProgressRef.current = false;
    });
  };

  const triggerGreet = () => {
    if (greetPlaying) return;
    setGreetPlaying(true);

    const softSmile = Animated.sequence([
      Animated.timing(smileScale, { toValue: 1.15, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(smileScale, { toValue: 1, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);

    const isLeft = Math.random() < 0.5;
    const targetBlink = isLeft ? leftBlink : rightBlink;
    const wink = Animated.sequence([
      Animated.timing(targetBlink, { toValue: 0.05, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(targetBlink, { toValue: 1, duration: 120, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);

    const microBob = Animated.sequence([
      Animated.timing(headBob, { toValue: 2, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(headBob, { toValue: 0, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);

    Animated.sequence([
      softSmile,
      wink,
      microBob,
    ]).start(() => {
      setGreetPlaying(false);
    });
  };

  useEffect(() => {
    if (mood === "greet" && lastMoodRef.current !== "greet") {
      triggerGreet();
    }
    if (mood !== "greet") {
      lastMoodRef.current = mood;
    } else {
      lastMoodRef.current = "greet";
    }
  }, [mood]);

  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (mood !== "idle") {
      setSleepActive(false);
      return;
    }
    idleTimerRef.current = setTimeout(() => {
      if (moodRef.current === "idle") setSleepActive(true);
    }, idleAfterMs);
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [mood, idleAfterMs, activityKey, interactionTick]);

  useEffect(() => {
    if (activityKey !== undefined) {
      if (sleepActive) {
        triggerWakeUp();
      } else {
        setSleepActive(false);
      }
    }
  }, [activityKey]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(osc, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(osc, {
          toValue: -1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [osc]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const blinkOnce = () => {
      const closeDuration = 110 + Math.random() * 60;
      const openDuration = 170 + Math.random() * 110;
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
      const delay = 2600 + Math.random() * 3100;
      timer = setTimeout(() => {
        if (moodRef.current === "sleepy") {
          Animated.timing(blink, {
            toValue: 0.2,
            duration: 520,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }).start();
        } else if (moodRef.current !== "greet") {
          const isDouble = Math.random() < 0.14;
          if (isDouble) {
            Animated.sequence([blinkOnce(), Animated.delay(120), blinkOnce()]).start();
          } else {
            blinkOnce().start();
          }
        }
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [blink]);

  useEffect(() => {
    const target = MOOD[currentMood] ?? MOOD.idle;

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
    let blush = 0.09;

    if (currentMood === "happy") {
      amp = 0.35;
      eyeS = 0.92;
      smileS = 1.12;
    } else if (currentMood === "thinking") {
      tx = 5;
      ty = -4;
      amp = 0.18;
      eyeS = 1;
      smileS = 0.82;
    } else if (currentMood === "surprised") {
      amp = 0.12;
      eyeS = 1.12;
      smileS = 0.92;
    } else if (currentMood === "laugh") {
      amp = 0.25;
      eyeS = 0.9;
      smileS = 1.25;
    } else if (currentMood === "sleepy") {
      tx = 0;
      ty = 4;
      amp = 0.08;
      eyeS = 0.5;
      smileS = 0.85;
    } else if (currentMood === "sad") {
      tx = 0;
      ty = 5;
      amp = 0.12;
      eyeS = 0.92;
      smileS = 0.9;
      blush = 0.04;
    } else if (currentMood === "celebrate") {
      amp = 0.2;
      eyeS = 1.1;
      smileS = 1.12;
    } else if (currentMood === "greet") {
      amp = 0.18;
      eyeS = 1.0;
      smileS = 1.0;
    }

    Animated.parallel([
      Animated.timing(baseEyeX, { toValue: tx, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(baseEyeY, { toValue: ty, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(oscAmp, { toValue: amp, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(eyeScale, { toValue: eyeS, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(smileScale, { toValue: smileS, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(blushOpacity, { toValue: blush, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]).start();

    if (currentMood !== "sleepy") {
      Animated.timing(blink, {
        toValue: 1,
        duration: 160,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [currentMood, baseEyeX, baseEyeY, oscAmp, eyeScale, smileScale, moodValue, blushOpacity, blink]);

  useEffect(() => {
    if (laughLoopRef.current) {
      laughLoopRef.current.stop();
      laughLoopRef.current = null;
    }
    if (currentMood !== "laugh") return;

    headBob.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(headBob, {
          toValue: -3,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(headBob, {
          toValue: 0,
          duration: 360,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(headBob, {
          toValue: -2,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(headBob, {
          toValue: 0,
          duration: 360,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    laughLoopRef.current = loop;

    return () => {
      if (laughLoopRef.current) {
        laughLoopRef.current.stop();
        laughLoopRef.current = null;
      }
    };
  }, [currentMood, headBob]);

  useEffect(() => {
    if (sleepyLoopRef.current) {
      sleepyLoopRef.current.stop();
      sleepyLoopRef.current = null;
    }
    if (currentMood !== "sleepy") {
      headRotate.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(headRotate, {
          toValue: -2,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(headRotate, {
          toValue: 2,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    sleepyLoopRef.current = loop;

    return () => {
      if (sleepyLoopRef.current) {
        sleepyLoopRef.current.stop();
        sleepyLoopRef.current = null;
      }
    };
  }, [currentMood, headRotate]);

  useEffect(() => {
    if (currentMood !== "celebrate") return;

    headScale.setValue(1);
    headBob.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(headScale, { toValue: 1.08, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(headBob, { toValue: -6, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(headScale, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(headBob, { toValue: 0, duration: 320, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ]),
    ]).start();
  }, [currentMood, headScale, headBob]);

  const eyeOffsetX = useMemo(() => Animated.add(baseEyeX, Animated.multiply(osc, oscAmp)), [baseEyeX, osc, oscAmp]);
  const eyeOffsetY = useMemo(
    () => Animated.add(baseEyeY, Animated.multiply(osc, Animated.multiply(oscAmp, -0.32))),
    [baseEyeY, osc, oscAmp]
  );

  const leftEyeScaleY = useMemo(
    () => Animated.multiply(eyeScale, Animated.multiply(blink, leftBlink)),
    [eyeScale, blink, leftBlink]
  );
  const rightEyeScaleY = useMemo(
    () => Animated.multiply(eyeScale, Animated.multiply(blink, rightBlink)),
    [eyeScale, blink, rightBlink]
  );

  const smileOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    outputRange: [1, 1, 0, 0, 1, 0, 0, 1, 1],
  });
  const flatOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    outputRange: [0, 0, 1, 0, 0, 0, 0, 0, 0],
  });
  const oOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    outputRange: [0, 0, 0, 1, 0, 0, 0, 0, 0],
  });
  const uOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    outputRange: [0, 0, 0, 0, 0, 1, 0, 0, 0],
  });
  const frownOpacity = moodValue.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    outputRange: [0, 0, 0, 0, 0, 0, 1, 0, 0],
  });

  // Puffy petals via Ellipse: no outlines, no "rosette teeth" look.
  const petals = useMemo(() => {
    const count = 16;
    const items: React.ReactNode[] = [];
    for (let i = 0; i < count; i += 1) {
      const rotate = (i / count) * 360;

      // gentle organic variation (keeps premium, not messy)
      const lenJ = [1.0, 1.03, 0.98, 1.02][i % 4];
      const widJ = [1.0, 0.98, 1.02, 0.99][i % 4];

      // Petal placed above center then rotated around
      items.push(
        <G key={`pet-${i}`} rotation={rotate} origin="100,100">
          {/* soft shadow at petal base */}
          <Ellipse
            cx="100"
            cy={34}
            rx={16 * widJ}
            ry={30 * lenJ}
            fill="url(#petalShade)"
            opacity={0.22}
          />
          {/* main petal */}
          <Ellipse
            cx="100"
            cy={32}
            rx={16.8 * widJ}
            ry={31.5 * lenJ}
            fill="url(#petalMain)"
          />
          {/* soft highlight strip */}
          <Ellipse
            cx="98.8"
            cy={23}
            rx={8.6 * widJ}
            ry={16.5 * lenJ}
            fill="#FFFFFF"
            opacity={0.10}
          />
        </G>
      );
    }
    return items;
  }, []);

  const headRotation = headRotate.interpolate({
    inputRange: [-5, 0, 5],
    outputRange: ["-5deg", "0deg", "5deg"],
  });

  return (
    <Pressable
      onPress={() => {
        onTap?.();
        if (currentMood === "sleepy") {
          triggerWakeUp();
        } else {
          setInteractionTick((v) => v + 1);
        }
      }}
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            {/* Face */}
            <RadialGradient id="faceGrad" cx="46%" cy="34%" r="66%">
              <Stop offset="0" stopColor="#FFE8A8" />
              <Stop offset="0.6" stopColor="#F4C857" />
              <Stop offset="1" stopColor="#E2A038" />
            </RadialGradient>
            <LinearGradient id="faceShadow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#6D3F10" stopOpacity="0.18" />
            </LinearGradient>

            {/* Petals */}
            <LinearGradient id="petalMain" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFF6D9" />
              <Stop offset="1" stopColor="#F3E3B0" />
            </LinearGradient>
            <LinearGradient id="petalShade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0.0" />
              <Stop offset="1" stopColor="#4B2E10" stopOpacity="0.22" />
            </LinearGradient>

            {/* Eyes */}
            <RadialGradient id="irisGrad" cx="50%" cy="38%" r="70%">
              <Stop offset="0" stopColor="#3A2A24" />
              <Stop offset="0.6" stopColor="#2A1C18" />
              <Stop offset="1" stopColor="#18110F" />
            </RadialGradient>
            <RadialGradient id="irisDepth" cx="50%" cy="80%" r="85%">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.25" />
            </RadialGradient>

            {/* blush */}
            <RadialGradient id="blush" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#E79A72" stopOpacity="0.09" />
              <Stop offset="1" stopColor="#E79A72" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <AnimatedG
            style={{
              transform: [
                { translateY: headBob },
                { scale: headScale },
                { rotate: headRotation },
              ],
            }}
          >
            {petals}

            {/* Face */}
            <Circle cx="100" cy="100" r="71" fill="url(#faceGrad)" />
            {/* face highlight */}
            <Path
              d="M64 52 C78 34 126 34 142 56 C124 46 98 44 74 50 Z"
              fill="#FFFFFF"
              opacity="0.12"
            />
            {/* contact shadow (soft band) */}
            <Path
              d="M42 128 C62 160 138 160 158 128 C150 158 126 172 100 174 C74 172 50 158 42 128 Z"
              fill="url(#faceShadow)"
              opacity={0.24}
            />

            {/* Blush */}
            <AnimatedCircle cx="76" cy="123" r="18" fill="url(#blush)" style={{ opacity: blushOpacity }} />
            <AnimatedCircle cx="124" cy="123" r="18" fill="url(#blush)" style={{ opacity: blushOpacity }} />

            {/* Eyes group (move + blink via scaleY, no translate blink) */}
            <AnimatedG style={{ transform: [{ translateX: eyeOffsetX }, { translateY: eyeOffsetY }] }}>
              <AnimatedG
                style={{
                  transform: [
                    { translateY: 92 },
                    { scaleY: leftEyeScaleY },
                    { translateY: -92 },
                  ],
                }}
              >
                <Circle cx="79" cy="92" r="19" fill="#F8F3E9" />
                <AnimatedCircle cx="79" cy="92" r="13.2" fill="url(#irisGrad)" />
                <AnimatedCircle cx="79" cy="92" r="13.2" fill="url(#irisDepth)" />
                <Ellipse cx="76.8" cy="86.6" rx="7.3" ry="9.8" fill="#FFFFFF" opacity={0.07} />
                <Circle cx="73.8" cy="86.6" r="4.4" fill="#FFFFFF" opacity={0.58} />
                <Circle cx="77.2" cy="95.0" r="2.0" fill="#FFFFFF" opacity={0.36} />
                <Path d="M64.5 103 C71 107 87 107 93.5 103 C87 110 71 110 64.5 103 Z" fill="#6C513B" opacity={0.11} />
              </AnimatedG>

              <AnimatedG
                style={{
                  transform: [
                    { translateY: 92 },
                    { scaleY: rightEyeScaleY },
                    { translateY: -92 },
                  ],
                }}
              >
                <Circle cx="121" cy="92" r="19" fill="#F8F3E9" />
                <AnimatedCircle cx="121" cy="92" r="13.2" fill="url(#irisGrad)" />
                <AnimatedCircle cx="121" cy="92" r="13.2" fill="url(#irisDepth)" />
                <Ellipse cx="118.8" cy="86.6" rx="7.3" ry="9.8" fill="#FFFFFF" opacity={0.07} />
                <Circle cx="119.8" cy="86.6" r="4.4" fill="#FFFFFF" opacity={0.58} />
                <Circle cx="123.2" cy="95.0" r="2.0" fill="#FFFFFF" opacity={0.36} />
                <Path d="M106.5 103 C113 107 129 107 135.5 103 C129 110 113 110 106.5 103 Z" fill="#6C513B" opacity={0.11} />
              </AnimatedG>
            </AnimatedG>

            {/* Smile / Mouth */}
            <AnimatedG
              style={{
                transform: [{ translateX: 0 }, { translateY: 14 }, { scale: smileScale }],
                opacity: smileOpacity,
              }}
            >
              <AnimatedPath
                d="M75 113 C86 127 114 127 125 113"
                stroke="#2A1F1A"
                strokeWidth="4.6"
                strokeLinecap="round"
                fill="none"
              />
              <Path d="M90 118 C94 126 106 126 110 118 C106 122 94 122 90 118 Z" fill="#C76659" opacity={0.95} />
            </AnimatedG>

            {/* Thinking flat mouth */}
            <AnimatedPath
              d="M86 119 L114 119"
              stroke="#2A1F1A"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
              style={{ opacity: flatOpacity }}
            />

            {/* Sleepy U mouth */}
            <AnimatedPath
              d="M90 118 C96 124 104 124 110 118"
              stroke="#2A1F1A"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
              style={{ opacity: uOpacity }}
            />

            {/* Sad frown */}
            <AnimatedPath
              d="M88 128 C96 120 104 120 112 128"
              stroke="#2A1F1A"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
              style={{ opacity: frownOpacity }}
            />

            {/* Surprised O mouth */}
            <AnimatedCircle cx="100" cy="122" r="8.8" fill="#2A1F1A" style={{ opacity: oOpacity }} />
            <AnimatedCircle cx="100" cy="122" r="4.8" fill="#C76659" style={{ opacity: oOpacity }} />
          </AnimatedG>
        </Svg>
      </View>
    </Pressable>
  );
}
