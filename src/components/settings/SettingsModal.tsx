import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Icon } from '../ui/Icon';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ScrollPosition, FontSize, Theme } from '../../stores/settingsStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { settings, updateScrollPosition, updateFontSize, updateTheme, updateHighContrast, updateScrollAreaWidth } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  
  // Local state for immediate UI feedback
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>(settings.scrollPosition);
  const [fontSize, setFontSize] = useState<FontSize>(settings.fontSize);
  const [theme, setTheme] = useState<Theme>(settings.theme);
  const [highContrast, setHighContrast] = useState(settings.highContrast);
  const [scrollAreaWidth, setScrollAreaWidth] = useState(settings.scrollAreaWidth);

  // Determine effective theme
  const isDark = settings.theme === 'dark' || (settings.theme === 'light' ? false : systemColorScheme === 'dark');
  
  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    secondaryBg: isDark ? '#2a2a2a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#6b7280',
    border: isDark ? '#3a3a3a' : '#e5e7eb',
    accent: '#FF7B61',
    accentLight: isDark ? '#FF7B6120' : '#FF7B6110',
  };

  // Update local state when modal opens or settings change
  useEffect(() => {
    if (visible) {
      setScrollPosition(settings.scrollPosition);
      setFontSize(settings.fontSize);
      setTheme(settings.theme);
      setHighContrast(settings.highContrast);
      setScrollAreaWidth(settings.scrollAreaWidth);
    }
  }, [visible, settings]);

  const fontSizes = [
    { id: 'small', label: 'Pequeno', value: 15 },
    { id: 'medium', label: 'Médio', value: 17 },
    { id: 'large', label: 'Grande', value: 19 },
  ];

  const handleApplySettings = async () => {
    // Apply all settings
    await Promise.all([
      updateScrollPosition(scrollPosition),
      updateFontSize(fontSize),
      updateTheme(theme),
      updateHighContrast(highContrast),
      updateScrollAreaWidth(scrollAreaWidth),
    ]);
    
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Scroll Area Position */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Posição da Área de Scroll</Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Escolha em qual lado a área de scroll seguro deve aparecer
            </Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[
                  styles.optionButton,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  scrollPosition === 'left' && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                ]}
                onPress={() => setScrollPosition('left')}
              >
                <Icon
                  name="align_horizontal_left"
                  size={20}
                  color={scrollPosition === 'left' ? colors.accent : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    scrollPosition === 'left' && { color: colors.accent },
                  ]}
                >
                  Esquerda
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.optionButton,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  scrollPosition === 'right' && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                ]}
                onPress={() => setScrollPosition('right')}
              >
                <Icon
                  name="align_horizontal_right"
                  size={20}
                  color={scrollPosition === 'right' ? colors.accent : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    scrollPosition === 'right' && { color: colors.accent },
                  ]}
                >
                  Direita
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Scroll Area Width Slider */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Largura da Área de Scroll</Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Ajuste o tamanho da área de scroll seguro ({Math.round(scrollAreaWidth)}px)
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>32px</Text>
              <Slider
                style={styles.slider}
                minimumValue={32}
                maximumValue={72}
                step={4}
                value={scrollAreaWidth}
                onValueChange={setScrollAreaWidth}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.accent}
              />
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>72px</Text>
            </View>
          </View>

          {/* Font Size */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tamanho da Fonte</Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Ajuste o tamanho do texto para melhor leitura
            </Text>
            <View style={styles.optionRow}>
              {fontSizes.map((size) => (
                <Pressable
                  key={size.id}
                  style={[
                    styles.optionButton,
                    { borderColor: colors.border, backgroundColor: colors.background },
                    fontSize === size.id && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                  ]}
                  onPress={() => setFontSize(size.id as 'small' | 'medium' | 'large')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.textSecondary, fontSize: size.value },
                      fontSize === size.id && { color: colors.accent },
                    ]}
                  >
                    {size.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Theme */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tema</Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Escolha entre tema claro ou escuro
            </Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[
                  styles.optionButton,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  theme === 'light' && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                ]}
                onPress={() => setTheme('light')}
              >
                <Icon
                  name="light_mode"
                  size={20}
                  color={theme === 'light' ? colors.accent : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    theme === 'light' && { color: colors.accent },
                  ]}
                >
                  Claro
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.optionButton,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  theme === 'dark' && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                ]}
                onPress={() => setTheme('dark')}
              >
                <Icon
                  name="dark_mode"
                  size={20}
                  color={theme === 'dark' ? colors.accent : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    theme === 'dark' && { color: colors.accent },
                  ]}
                >
                  Escuro
                </Text>
              </Pressable>
            </View>
          </View>

          {/* High Contrast */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Alto Contraste</Text>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  Aumenta o contraste para melhor legibilidade
                </Text>
              </View>
              <Switch
                value={highContrast}
                onValueChange={setHighContrast}
                trackColor={{ false: colors.border, true: colors.accent + '80' }}
                thumbColor={highContrast ? colors.accent : colors.secondaryBg}
              />
            </View>
          </View>

          {/* Spacer at bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable style={[styles.applyButton, { backgroundColor: colors.accent }]} onPress={handleApplySettings}>
            <Text style={styles.applyButtonText}>Aplicar Configurações</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'center',
  },
});

