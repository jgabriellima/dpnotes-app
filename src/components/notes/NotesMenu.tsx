import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Icon } from '../ui/Icon';
import { useDocumentsStore } from '../../stores/documentsStore';
import { router } from 'expo-router';
import type { EditorDocument } from '../../types/editor.types';

interface NotesMenuProps {
  visible: boolean;
  currentDocumentId?: string;
  onClose: () => void;
  onCreateNew: () => void;
}

export function NotesMenu({ visible, currentDocumentId, onClose, onCreateNew }: NotesMenuProps) {
  const { documents } = useDocumentsStore();

  const handleNotePress = (documentId: string) => {
    if (documentId !== currentDocumentId) {
      router.replace(`/editor/${documentId}`);
    }
    onClose();
  };

  const handleCreateNewNote = () => {
    onCreateNew();
    onClose();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const sortedDocuments = Array.from(documents.values()).sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  // Helper function to generate display title
  const getDisplayTitle = (item: EditorDocument) => {
    if (item.title && item.title !== 'Sem título') {
      return item.title;
    }
    
    // Generate from first line
    if (item.content && item.content.trim().length > 0) {
      const firstLine = item.content.split('\n')[0].trim();
      if (firstLine.length > 0) {
        const cleaned = firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
        return cleaned.substring(0, 40) + (cleaned.length > 40 ? '...' : '');
      }
    }
    
    return 'Nova Nota';
  };

  const renderNoteItem = ({ item }: { item: EditorDocument }) => {
    const isCurrentNote = item.id === currentDocumentId;
    const preview = item.content?.substring(0, 80) || 'Nota vazia';
    const displayTitle = getDisplayTitle(item);
    
    return (
      <Pressable
        style={[styles.noteItem, isCurrentNote && styles.noteItemActive]}
        onPress={() => handleNotePress(item.id)}
      >
        <View style={styles.noteItemContent}>
          <View style={styles.noteItemHeader}>
            <Text style={[styles.noteTitle, isCurrentNote && styles.noteTitleActive]} numberOfLines={1}>
              {displayTitle}
            </Text>
            {isCurrentNote && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Atual</Text>
              </View>
            )}
          </View>
          <Text style={styles.notePreview} numberOfLines={2}>
            {preview}
          </Text>
          <Text style={styles.noteDate}>
            {formatDate(item.updatedAt || item.createdAt)}
          </Text>
        </View>
        <Icon name="chevron_right" size={20} color="#9ca3af" />
      </Pressable>
    );
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
          <Text style={styles.headerTitle}>Minhas Notas</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#1f2937" />
          </Pressable>
        </View>

        {/* Create New Note Button */}
        <View style={styles.createButtonContainer}>
          <Pressable style={styles.createButton} onPress={handleCreateNewNote}>
            <Icon name="add" size={24} color="#ffffff" />
            <Text style={styles.createButtonText}>Nova Nota</Text>
          </Pressable>
        </View>

        {/* Notes List */}
        <FlatList
          data={sortedDocuments}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="description" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>Nenhuma nota ainda</Text>
              <Text style={styles.emptyStateDescription}>
                Crie sua primeira nota para começar a anotar
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  createButtonContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  noteItemActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  noteItemContent: {
    flex: 1,
    marginRight: 8,
  },
  noteItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  noteTitleActive: {
    color: '#8b5cf6',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  notePreview: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});



