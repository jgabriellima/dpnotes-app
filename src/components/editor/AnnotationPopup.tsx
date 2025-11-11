/**
 * Annotation Popup Component
 * 
 * Modal/popup that appears on text selection to apply annotations.
 * Shows available labels and options for notes/audio.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { BottomSheetModal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { useLabels } from '../../hooks/useLabels';

interface AnnotationPopupProps {
  visible: boolean;
  selectedText: string;
  onClose: () => void;
  onApplyLabel: (labelIds: string[], textNote?: string) => void;
  onRecordAudio: () => void;
}

export function AnnotationPopup({
  visible,
  selectedText,
  onClose,
  onApplyLabel,
  onRecordAudio,
}: AnnotationPopupProps) {
  const { data: labels = [] } = useLabels();
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [textNote, setTextNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const predefinedLabels = labels.filter(l => l.is_predefined);
  const customLabels = labels.filter(l => !l.is_predefined);

  const toggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      setSelectedLabelIds(selectedLabelIds.filter(id => id !== labelId));
    } else {
      setSelectedLabelIds([...selectedLabelIds, labelId]);
    }
  };

  const handleApply = () => {
    if (selectedLabelIds.length === 0 && !textNote.trim()) {
      Alert.alert('No Annotation', 'Please select at least one label or add a note.');
      return;
    }

    onApplyLabel(selectedLabelIds, textNote.trim() || undefined);
    
    // Reset state
    setSelectedLabelIds([]);
    setTextNote('');
    setShowNoteInput(false);
  };

  const handleClose = () => {
    setSelectedLabelIds([]);
    setTextNote('');
    setShowNoteInput(false);
    onClose();
  };

  const handleRecordAudio = () => {
    handleClose();
    onRecordAudio();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <View className="flex flex-col gap-4">
        {/* Header */}
        <View>
          <Text className="text-text-primary text-xl font-bold">
            Add Annotation
          </Text>
          <Text className="text-text-secondary text-sm mt-1" numberOfLines={2}>
            "{selectedText.length > 80 ? selectedText.substring(0, 80) + '...' : selectedText}"
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="flex flex-row gap-2">
          <Pressable
            onPress={() => setShowNoteInput(!showNoteInput)}
            className="flex-1 flex-row items-center justify-center rounded-lg p-3"
            style={{
              backgroundColor: showNoteInput ? '#ffccc3' : '#ffe6e1',
            }}
          >
            <Icon name="edit" size={20} color="#4A5568" />
            <Text className="text-sm font-medium ml-2" style={{ color: '#4A5568' }}>
              Add Note
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRecordAudio}
            className="flex-1 flex-row items-center justify-center rounded-lg p-3"
            style={{ backgroundColor: '#ffe6e1' }}
          >
            <Icon name="mic" size={20} color="#4A5568" />
            <Text className="text-sm font-medium ml-2" style={{ color: '#4A5568' }}>
              Record Audio
            </Text>
          </Pressable>
        </View>

        {/* Text Note Input */}
        {showNoteInput && (
          <TextArea
            placeholder="Add your note here..."
            value={textNote}
            onChangeText={setTextNote}
            numberOfLines={3}
          />
        )}

        {/* Labels Section */}
        <View>
          <Text className="text-text-primary text-base font-semibold mb-2">
            Quick Labels
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {predefinedLabels.map((label) => (
              <Pressable
                key={label.id}
                onPress={() => toggleLabel(label.id)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: selectedLabelIds.includes(label.id)
                    ? '#ffccc3'
                    : '#ffe6e1',
                  borderWidth: selectedLabelIds.includes(label.id) ? 2 : 0,
                  borderColor: '#ff6b52',
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: '#4A5568' }}
                >
                  {label.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Custom Labels */}
        {customLabels.length > 0 && (
          <View>
            <Text className="text-text-primary text-base font-semibold mb-2">
              Custom Labels
            </Text>
            <View className="flex flex-row flex-wrap gap-2">
              {customLabels.map((label) => (
                <Pressable
                  key={label.id}
                  onPress={() => toggleLabel(label.id)}
                  className="rounded-full px-4 py-2"
                  style={{
                    backgroundColor: selectedLabelIds.includes(label.id)
                      ? label.color || '#ffccc3'
                      : '#f5f5f5',
                    borderWidth: selectedLabelIds.includes(label.id) ? 2 : 1,
                    borderColor: selectedLabelIds.includes(label.id)
                      ? '#ff6b52'
                      : '#e5e5e5',
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: '#4A5568' }}
                  >
                    {label.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex flex-row gap-3 mt-2">
          <View className="flex-1">
            <Button variant="secondary" onPress={handleClose} fullWidth>
              Cancel
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="primary"
              onPress={handleApply}
              fullWidth
              disabled={selectedLabelIds.length === 0 && !textNote.trim()}
            >
              Apply
            </Button>
          </View>
        </View>

        {/* Selected Count */}
        {selectedLabelIds.length > 0 && (
          <Text className="text-text-secondary text-xs text-center">
            {selectedLabelIds.length} label{selectedLabelIds.length > 1 ? 's' : ''} selected
          </Text>
        )}
      </View>
    </BottomSheetModal>
  );
}

/**
 * Simple Label Selector (for quick inline use)
 */
interface SimpleLabelSelectorProps {
  onLabelSelect: (labelId: string) => void;
  onCancel: () => void;
}

export function SimpleLabelSelector({ onLabelSelect, onCancel }: SimpleLabelSelectorProps) {
  const { data: labels = [] } = useLabels();
  const predefinedLabels = labels.filter(l => l.is_predefined).slice(0, 5);

  return (
    <View className="flex flex-col gap-2 p-4 bg-white rounded-xl">
      <Text className="text-text-primary text-base font-semibold mb-1">
        Quick Annotate
      </Text>
      
      {predefinedLabels.map((label) => (
        <Pressable
          key={label.id}
          onPress={() => onLabelSelect(label.id)}
          className="flex-row items-center p-3 rounded-lg"
          style={{ backgroundColor: '#ffe6e1' }}
        >
          <Icon name="sell" size={20} color="#ff6b52" />
          <Text className="text-sm font-medium ml-3" style={{ color: '#4A5568' }}>
            {label.name}
          </Text>
        </Pressable>
      ))}

      <Pressable
        onPress={onCancel}
        className="p-3 rounded-lg mt-2"
        style={{ backgroundColor: '#f5f5f5' }}
      >
        <Text className="text-sm font-medium text-center" style={{ color: '#6C6F7D' }}>
          Cancel
        </Text>
      </Pressable>
    </View>
  );
}

