import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ScrollPosition, FontSize, Theme } from '../../stores/settingsStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { settings, updateScrollPosition, updateFontSize, updateTheme, updateHighContrast } = useSettingsStore();
  
  // Local state for immediate UI feedback
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>(settings.scrollPosition);
  const [fontSize, setFontSize] = useState<FontSize>(settings.fontSize);
  const [theme, setTheme] = useState<Theme>(settings.theme);
  const [highContrast, setHighContrast] = useState(settings.highContrast);

  // Update local state when modal opens or settings change
  useEffect(() => {
    if (visible) {
      setScrollPosition(settings.scrollPosition);
      setFontSize(settings.fontSize);
      setTheme(settings.theme);
      setHighContrast(settings.highContrast);
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#1f2937" />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {/* Scroll Area Position */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Área de Scroll Seguro</Text>
            <Text style={styles.sectionDescription}>
              Escolha em qual lado a área de scroll seguro deve aparecer
            </Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[
                  styles.optionButton,
                  scrollPosition === 'left' && styles.optionButtonActive,
                ]}
                onPress={() => setScrollPosition('left')}
              >
                <Icon
                  name="align_horizontal_left"
                  size={20}
                  color={scrollPosition === 'left' ? '#8b5cf6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.optionText,
                    scrollPosition === 'left' && styles.optionTextActive,
                  ]}
                >
                  Esquerda
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.optionButton,
                  scrollPosition === 'right' && styles.optionButtonActive,
                ]}
                onPress={() => setScrollPosition('right')}
              >
                <Icon
                  name="align_horizontal_right"
                  size={20}
                  color={scrollPosition === 'right' ? '#8b5cf6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.optionText,
                    scrollPosition === 'right' && styles.optionTextActive,
                  ]}
                >
                  Direita
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Font Size */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tamanho da Fonte</Text>
            <Text style={styles.sectionDescription}>
              Ajuste o tamanho do texto para melhor leitura
            </Text>
            <View style={styles.optionRow}>
              {fontSizes.map((size) => (
                <Pressable
                  key={size.id}
                  style={[
                    styles.optionButton,
                    fontSize === size.id && styles.optionButtonActive,
                  ]}
                  onPress={() => setFontSize(size.id as 'small' | 'medium' | 'large')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      fontSize === size.id && styles.optionTextActive,
                      { fontSize: size.value },
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
            <Text style={styles.sectionTitle}>Tema</Text>
            <Text style={styles.sectionDescription}>
              Escolha entre tema claro ou escuro
            </Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[
                  styles.optionButton,
                  theme === 'light' && styles.optionButtonActive,
                ]}
                onPress={() => setTheme('light')}
              >
                <Icon
                  name="light_mode"
                  size={20}
                  color={theme === 'light' ? '#8b5cf6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.optionText,
                    theme === 'light' && styles.optionTextActive,
                  ]}
                >
                  Claro
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.optionButton,
                  theme === 'dark' && styles.optionButtonActive,
                ]}
                onPress={() => setTheme('dark')}
              >
                <Icon
                  name="dark_mode"
                  size={20}
                  color={theme === 'dark' ? '#8b5cf6' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.optionText,
                    theme === 'dark' && styles.optionTextActive,
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
                <Text style={styles.sectionTitle}>Alto Contraste</Text>
                <Text style={styles.sectionDescription}>
                  Aumenta o contraste para melhor legibilidade
                </Text>
              </View>
              <Switch
                value={highContrast}
                onValueChange={setHighContrast}
                trackColor={{ false: '#d1d5db', true: '#a78bfa' }}
                thumbColor={highContrast ? '#8b5cf6' : '#f3f4f6'}
              />
            </View>
          </View>

          {/* Spacer at bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <Pressable style={styles.applyButton} onPress={handleApplySettings}>
            <Text style={styles.applyButtonText}>Aplicar Configurações</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
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
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  optionButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  optionTextActive: {
    color: '#8b5cf6',
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
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

