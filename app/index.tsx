import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useDocumentsStore } from '../src/stores/documentsStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 [App] Initializing...');
      
      // Get store methods
      const { loadDocuments, documents } = useDocumentsStore.getState();
      
      // Load documents from storage
      await loadDocuments();
      
      // Get fresh state after loading
      const { documents: freshDocs } = useDocumentsStore.getState();
      
      // Get all documents sorted by last modified
      const docsArray = Array.from(freshDocs.values());
      const sortedDocs = docsArray.sort((a, b) => {
        const dateA = new Date(b.updatedAt || b.createdAt).getTime();
        const dateB = new Date(a.updatedAt || a.createdAt).getTime();
        return dateA - dateB;
      });

      console.log('📚 [App] Documents loaded:', sortedDocs.length);

      // If there's a last accessed note, open it
      if (sortedDocs.length > 0 && sortedDocs[0].id) {
        console.log('📖 [App] Opening last note:', sortedDocs[0].id);
        router.replace(`/editor/${sortedDocs[0].id}`);
      } else {
        // No notes yet - create a blank one and open it (notes-first approach)
        console.log('📝 [App] No notes found, creating first note');
        const newId = `doc-${Date.now()}`;
        router.replace(`/editor/${newId}`);
      }
      
      setIsInitialized(true);
    };

    initializeApp();
  }, []);

  // Show loading while initializing
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8b5cf6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

