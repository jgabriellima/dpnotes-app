import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  useColorScheme,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Drawer } from 'react-native-drawer-layout';
import { Icon } from '../ui/Icon';
import { useDocumentsStore } from '../../stores/documentsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import type { EditorDocument, Project } from '../../types/editor.types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 400);

interface NotesMenuProps {
  visible: boolean;
  currentDocumentId?: string;
  onClose: () => void;
  onCreateNew: () => void;
  children: React.ReactNode;
}

export function NotesMenu({ visible, currentDocumentId, onClose, onCreateNew, children }: NotesMenuProps) {
  const { documents, projects, deleteDocument, moveDocumentToProject, createProject, deleteProject } = useDocumentsStore();
  const { settings, updateTheme } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedNoteMenu, setSelectedNoteMenu] = useState<string | null>(null);
  const [selectedProjectMenu, setSelectedProjectMenu] = useState<string | null>(null);
  const [showMoveToProjectModal, setShowMoveToProjectModal] = useState(false);
  const [noteToMove, setNoteToMove] = useState<string | null>(null);
  
  // Determine effective theme
  const isDark = settings.theme === 'dark' || (settings.theme === 'light' ? false : systemColorScheme === 'dark');
  
  const theme = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    secondaryBg: isDark ? '#2a2a2a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#6b7280',
    border: isDark ? '#3a3a3a' : '#e5e7eb',
    accent: '#FF7B61',
    accentLight: isDark ? '#FF7B6120' : '#FF7B6110',
  };

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

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName('');
      setShowNewProjectInput(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Excluir Nota',
      'Tem certeza que deseja excluir esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteDocument(noteId);
            setSelectedNoteMenu(null);
          },
        },
      ]
    );
  };

  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      'Excluir Projeto',
      'As notas deste projeto serão movidas para "Sem projeto".',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteProject(projectId);
            setSelectedProjectMenu(null);
          },
        },
      ]
    );
  };

  const handleMoveToProject = (projectId?: string) => {
    if (noteToMove) {
      moveDocumentToProject(noteToMove, projectId);
      setShowMoveToProjectModal(false);
      setNoteToMove(null);
    }
  };

  const openMoveToProjectModal = (noteId: string) => {
    setNoteToMove(noteId);
    setSelectedNoteMenu(null);
    setShowMoveToProjectModal(true);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getDisplayTitle = (item: EditorDocument) => {
    if (item.title && item.title !== 'Sem título') {
      return item.title;
    }
    
    if (item.content && item.content.trim().length > 0) {
      const firstLine = item.content.split('\n')[0].trim();
      if (firstLine.length > 0) {
        const cleaned = firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
        return cleaned.substring(0, 30) + (cleaned.length > 30 ? '...' : '');
      }
    }
    
    return 'Nova Nota';
  };

  const sortedDocuments = Array.from(documents.values()).sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  const sortedProjects = Array.from(projects.values()).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const documentsWithoutProject = sortedDocuments.filter(doc => !doc.projectId);

  const toggleTheme = () => {
    updateTheme(isDark ? 'light' : 'dark');
  };

  const renderNoteItem = (item: EditorDocument, isInProject: boolean = false) => {
    const isCurrentNote = item.id === currentDocumentId;
    const displayTitle = getDisplayTitle(item);
    const showMenu = selectedNoteMenu === item.id;
    
    return (
      <View key={item.id} style={[styles.noteItemContainer, { marginLeft: isInProject ? 16 : 0 }]}>
        <Pressable
          style={[
            styles.noteItem,
            { 
              backgroundColor: isCurrentNote ? theme.accentLight : 'transparent',
              borderLeftColor: isCurrentNote ? theme.accent : 'transparent',
            }
          ]}
          onPress={() => handleNotePress(item.id)}
        >
          <View style={styles.noteContent}>
            <Text 
              style={[
                styles.noteTitle, 
                { color: isCurrentNote ? theme.accent : theme.text }
              ]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            <Text style={[styles.noteDate, { color: theme.textSecondary }]}>
              {formatDate(item.updatedAt || item.createdAt)}
            </Text>
          </View>
          
          <Pressable
            style={styles.noteMenuButton}
            onPress={() => setSelectedNoteMenu(showMenu ? null : item.id)}
          >
            <Icon name="more_vert" size={18} color={theme.textSecondary} />
          </Pressable>
        </Pressable>

        {showMenu && (
          <View style={[styles.contextMenu, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => openMoveToProjectModal(item.id)}
            >
              <Icon name="folder" size={18} color={theme.text} />
              <Text style={[styles.contextMenuText, { color: theme.text }]}>Mover para projeto</Text>
            </Pressable>
            
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => handleDeleteNote(item.id)}
            >
              <Icon name="delete" size={18} color="#ef4444" />
              <Text style={[styles.contextMenuText, { color: '#ef4444' }]}>Excluir</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderProject = (project: Project) => {
    const projectDocs = sortedDocuments.filter(doc => doc.projectId === project.id);
    const showMenu = selectedProjectMenu === project.id;
    
    return (
      <View key={project.id} style={styles.projectContainer}>
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleContainer}>
            <Icon name="folder" size={20} color={theme.accent} />
            <Text style={[styles.projectTitle, { color: theme.text }]}>{project.name}</Text>
            <Text style={[styles.projectCount, { color: theme.textSecondary }]}>
              {projectDocs.length}
            </Text>
          </View>
          
          <Pressable
            style={styles.noteMenuButton}
            onPress={() => setSelectedProjectMenu(showMenu ? null : project.id)}
          >
            <Icon name="more_vert" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        {showMenu && (
          <View style={[styles.contextMenu, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
            <Pressable
              style={styles.contextMenuItem}
              onPress={() => handleDeleteProject(project.id)}
            >
              <Icon name="delete" size={18} color="#ef4444" />
              <Text style={[styles.contextMenuText, { color: '#ef4444' }]}>Excluir projeto</Text>
            </Pressable>
          </View>
        )}

        {projectDocs.length > 0 && (
          <View style={styles.projectNotes}>
            {projectDocs.map(doc => renderNoteItem(doc, true))}
          </View>
        )}
      </View>
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  // Render drawer content
  const renderDrawerContent = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Icon name="description" size={24} color={theme.accent} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notas</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={22} color={theme.text} />
        </Pressable>
      </View>

        {/* Main Content */}
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
          {/* New Note Button */}
          <Pressable 
            style={[styles.newButton, { backgroundColor: theme.accent }]} 
            onPress={handleCreateNewNote}
          >
            <Icon name="add" size={20} color="#ffffff" />
            <Text style={styles.newButtonText}>Nova Nota</Text>
          </Pressable>

          {/* New Project Button */}
          {!showNewProjectInput ? (
            <Pressable 
              style={[styles.newProjectButton, { borderColor: theme.border }]} 
              onPress={() => setShowNewProjectInput(true)}
            >
              <Icon name="create_new_folder" size={20} color={theme.accent} />
              <Text style={[styles.newProjectButtonText, { color: theme.accent }]}>Novo Projeto</Text>
            </Pressable>
          ) : (
            <View style={[styles.newProjectInput, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
              <TextInput
                style={[styles.projectInput, { color: theme.text }]}
                placeholder="Nome do projeto"
                placeholderTextColor={theme.textSecondary}
                value={newProjectName}
                onChangeText={setNewProjectName}
                autoFocus
                onSubmitEditing={handleCreateProject}
              />
              <Pressable onPress={handleCreateProject} style={styles.projectInputButton}>
                <Icon name="check" size={20} color={theme.accent} />
              </Pressable>
              <Pressable 
                onPress={() => {
                  setShowNewProjectInput(false);
                  setNewProjectName('');
                }}
                style={styles.projectInputButton}
              >
                <Icon name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          )}

          {/* Projects */}
          {sortedProjects.map(project => renderProject(project))}

          {/* Notes without project */}
          {documentsWithoutProject.length > 0 && (
            <View style={styles.notesSection}>
              {sortedProjects.length > 0 && (
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Sem projeto</Text>
              )}
              {documentsWithoutProject.map(doc => renderNoteItem(doc))}
            </View>
          )}

          {/* Empty State */}
          {sortedDocuments.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="description" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                Nenhuma nota ainda
              </Text>
            </View>
          )}
        </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.footerLeft}>
          <Text style={[styles.footerVersion, { color: theme.textSecondary }]}>v{appVersion}</Text>
          <Text style={[styles.footerCredit, { color: theme.textSecondary }]}>
            Made by João Gabriel Lima
          </Text>
        </View>
        
        <Pressable style={styles.themeToggle} onPress={toggleTheme}>
          <Icon 
            name={isDark ? 'light_mode' : 'dark_mode'} 
            size={18} 
            color={theme.textSecondary} 
          />
          <Text style={[styles.themeToggleText, { color: theme.textSecondary }]}>
            {isDark ? 'Light' : 'Dark'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  return (
    <>
      <Drawer
        open={visible}
        onOpen={() => {}}
        onClose={onClose}
        renderDrawerContent={renderDrawerContent}
        drawerPosition="left"
        drawerType="front"
        swipeEnabled={true}
        swipeEdgeWidth={20}
        drawerStyle={{
          width: DRAWER_WIDTH,
          backgroundColor: theme.background,
        }}
        overlayStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        {children}
      </Drawer>

      {/* Move to Project Modal */}
      <Modal
        visible={showMoveToProjectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoveToProjectModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowMoveToProjectModal(false)}
        >
          <View 
            style={[styles.modalContent, { backgroundColor: theme.background }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Mover para Projeto</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Selecione um projeto
              </Text>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Sem Projeto Option */}
              <Pressable
                style={[styles.projectOption, { borderBottomColor: theme.border }]}
                onPress={() => handleMoveToProject(undefined)}
              >
                <Icon name="folder_off" size={20} color={theme.textSecondary} />
                <Text style={[styles.projectOptionText, { color: theme.text }]}>
                  SEM PROJETO
                </Text>
              </Pressable>

              {/* Project Options */}
              {sortedProjects.map((project, index) => (
                <Pressable
                  key={project.id}
                  style={[
                    styles.projectOption,
                    { borderBottomColor: theme.border },
                    index === sortedProjects.length - 1 && styles.projectOptionLast
                  ]}
                  onPress={() => handleMoveToProject(project.id)}
                >
                  <Icon name="folder" size={20} color={theme.accent} />
                  <Text style={[styles.projectOptionText, { color: theme.text }]}>
                    {project.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Pressable
                style={[styles.modalCancelButton, { backgroundColor: theme.secondaryBg }]}
                onPress={() => setShowMoveToProjectModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FF7B6110',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  newButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  newProjectButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  newProjectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  projectInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  projectInputButton: {
    padding: 4,
  },
  projectContainer: {
    marginBottom: 20,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  projectCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  projectNotes: {
    gap: 4,
  },
  notesSection: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  noteItemContainer: {
    position: 'relative',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    marginBottom: 4,
  },
  noteContent: {
    flex: 1,
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  noteDate: {
    fontSize: 12,
  },
  noteMenuButton: {
    padding: 4,
  },
  contextMenu: {
    position: 'absolute',
    right: 0,
    top: 44,
    minWidth: 180,
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  contextMenuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerLeft: {
    gap: 2,
  },
  footerVersion: {
    fontSize: 11,
  },
  footerCredit: {
    fontSize: 11,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalScrollContent: {
    paddingVertical: 8,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  projectOptionLast: {
    borderBottomWidth: 0,
  },
  projectOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  modalCancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
