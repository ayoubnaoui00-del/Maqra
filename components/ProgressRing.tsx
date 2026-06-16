/**
 * components/ProgressRing.tsx
 * Animated SVG progress ring using react-native-reanimated (MAQ-19).
 * Shows yearly reading goal progress.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, ANIMATION_DURATION } from '../constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  completed: number;
  goal: number;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  completed,
  goal,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: ANIMATION_DURATION.slow,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.surface}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          // Rotate to start from top
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.percentText}>{percentage}%</Text>
        <Text style={styles.label}>
          {completed}/{goal}
        </Text>
        <Text style={styles.sublabel}>كتاب</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  sublabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});
