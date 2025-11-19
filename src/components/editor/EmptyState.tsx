/**
 * Empty State Component
 * 
 * Displayed when document is empty with import CTA
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface EmptyStateProps {
  onImportPress: () => void;
  isLoading?: boolean;
}

export function EmptyState({ onImportPress, isLoading = false }: EmptyStateProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Subtle pulse animation for the button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* SVG Icon - Clipboard/Document */}
        <View style={styles.iconContainer}>
          <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Clipboard background */}
            <Rect
              x="25"
              y="15"
              width="70"
              height="90"
              rx="8"
              fill="#ffccc3"
              opacity="0.3"
            />
            
            {/* Clipboard main */}
            <Rect
              x="30"
              y="20"
              width="60"
              height="80"
              rx="6"
              fill="#ffffff"
              stroke="#ff6b52"
              strokeWidth="2"
            />
            
            {/* Clipboard clip */}
            <Rect
              x="45"
              y="15"
              width="30"
              height="10"
              rx="3"
              fill="#ff6b52"
            />
            
            {/* Document lines */}
            <Rect x="40" y="35" width="40" height="3" rx="1.5" fill="#ffccc3" />
            <Rect x="40" y="45" width="35" height="3" rx="1.5" fill="#ffccc3" />
            <Rect x="40" y="55" width="38" height="3" rx="1.5" fill="#ffccc3" />
            <Rect x="40" y="65" width="30" height="3" rx="1.5" fill="#ffccc3" />
            
            {/* Plus icon */}
            <Circle cx="75" cy="85" r="15" fill="#ff6b52" />
            <Path
              d="M75 78 L75 92 M68 85 L82 85"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {/* Title */}
        <Text style={styles.title}>Comece uma Nova Nota</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Cole seu conteúdo do clipboard e{'\n'}comece a anotar imediatamente
        </Text>

        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={onImportPress}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
          >
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M4 4h8l4 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 4v4h4"
                stroke="#ff6b52"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.buttonText}>
              {isLoading ? 'Importando...' : 'Importar do Clipboard'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ff6b52',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#ff6b52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

