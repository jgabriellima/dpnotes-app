/**
 * Custom Waveform Component
 * 
 * Waveform visualization using SVG - Compatible with Expo Go
 * No native dependencies required
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface CustomWaveformProps {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel?: number;
  height?: number;
  barCount?: number;
  barColor?: string;
  barWidth?: number;
  barGap?: number;
}

export const CustomWaveform: React.FC<CustomWaveformProps> = ({
  isRecording,
  isPaused,
  audioLevel = 0,
  height = 96,
  barCount = 20,
  barColor = '#8B5CF6', // primary color
  barWidth = 3,
  barGap = 4,
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);
  
  const svgWidth = barCount * (barWidth + barGap);
  const minBarHeight = 4;
  const maxBarHeight = height - 8;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={svgWidth} height={height}>
        {bars.map((_, index) => (
          <WaveformBar
            key={index}
            index={index}
            x={index * (barWidth + barGap)}
            width={barWidth}
            height={height}
            minHeight={minBarHeight}
            maxHeight={maxBarHeight}
            isRecording={isRecording}
            isPaused={isPaused}
            audioLevel={audioLevel}
            color={barColor}
            totalBars={barCount}
          />
        ))}
      </Svg>
    </View>
  );
};

interface WaveformBarProps {
  index: number;
  x: number;
  width: number;
  height: number;
  minHeight: number;
  maxHeight: number;
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  color: string;
  totalBars: number;
}

const WaveformBar: React.FC<WaveformBarProps> = ({
  index,
  x,
  width,
  height,
  minHeight,
  maxHeight,
  isRecording,
  isPaused,
  audioLevel,
  color,
  totalBars,
}) => {
  const barHeight = useSharedValue(minHeight);
  const animProgress = useSharedValue(0);

  useEffect(() => {
    if (isRecording && !isPaused) {
      // Animação contínua quando gravando
      const delay = (index * 100) / totalBars; // Efeito cascata
      
      animProgress.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 10, stiffness: 50 }),
          withSpring(0, { damping: 10, stiffness: 50 })
        ),
        -1, // Infinito
        false
      );
    } else {
      // Para animação
      animProgress.value = withSpring(0);
    }
  }, [isRecording, isPaused, index, totalBars]);

  useEffect(() => {
    if (isRecording && !isPaused && audioLevel > 0) {
      // Altura baseada no nível de áudio
      const normalizedLevel = Math.min(Math.max(audioLevel + 100, 0) / 100, 1);
      
      // Variação por barra (efeito mais natural)
      const barVariation = Math.sin((index / totalBars) * Math.PI) * 0.3 + 0.7;
      const targetHeight = minHeight + (maxHeight - minHeight) * normalizedLevel * barVariation;
      
      barHeight.value = withSpring(targetHeight, {
        damping: 8,
        stiffness: 100,
      });
    } else if (isPaused) {
      // Barras ficam em altura média quando pausado
      barHeight.value = withSpring(minHeight + (maxHeight - minHeight) * 0.3);
    } else {
      // Barras ficam baixas quando não está gravando
      barHeight.value = withSpring(minHeight);
    }
  }, [audioLevel, isRecording, isPaused, index, totalBars, minHeight, maxHeight]);

  const animatedProps = useAnimatedProps(() => {
    const currentHeight = barHeight.value;
    const y = (height - currentHeight) / 2; // Centraliza verticalmente

    return {
      y,
      height: currentHeight,
      opacity: isPaused ? 0.5 : 1,
    };
  });

  return (
    <AnimatedRect
      x={x}
      width={width}
      fill={color}
      rx={width / 2} // Bordas arredondadas
      animatedProps={animatedProps}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

