/**
 * SelectionToolbar Component
 * 
 * Floating toolbar that appears above selected text with action buttons.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';

interface SelectionToolbarProps {
  position: { x: number; y: number };
  onAnnotate: () => void;
  onCancel: () => void;
  selectedLength: number;
}

export function SelectionToolbar({
  position,
  onAnnotate,
  onCancel,
  selectedLength,
}: SelectionToolbarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          top: position.y,
          left: position.x,
        },
      ]}
    >
      {/* Selection info */}
      <View style={styles.infoSection}>
        <Icon name="check_circle" size={14} color="#10b981" />
        <Text style={styles.infoText}>
          {selectedLength} characters
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <Pressable
          onPress={onCancel}
          style={styles.cancelButton}
        >
          <Icon name="close" size={16} color="#6b7280" />
        </Pressable>

        <Pressable
          onPress={onAnnotate}
          style={styles.annotateButton}
        >
          <Icon name="add" size={16} color="#ffffff" />
          <Text style={styles.annotateButtonText}>Annotate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  cancelButton: {
    padding: 6,
    borderRadius: 6,
  },
  annotateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  annotateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

