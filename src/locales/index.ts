// Internationalization (i18n) translations

export type Language = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      close: 'Fechar',
      confirm: 'Confirmar',
      loading: 'Carregando...',
    },
    home: {
      title: 'Deep Research Notes',
      importClipboard: 'Importar do Clipboard',
      createProject: 'Criar Novo Projeto',
      recentProjects: 'Projetos Recentes',
      noProjects: 'Nenhum projeto encontrado',
    },
    editor: {
      export: 'Exportar',
      selectSentence: 'Selecione uma sentença para anotar',
      addLabel: 'Aplicar Label',
      recordAudio: 'Gravar Áudio',
      addNote: 'Adicionar Nota',
      editAnnotation: 'Editar Anotação',
    },
    labels: {
      title: 'Labels',
      expand: 'Expandir',
      simplify: 'Simplificar',
      remove: 'Remover',
      clarify: 'Esclarecer',
      counter: 'Contrapor',
      example: 'Exemplificar',
      createNew: 'Criar Nova Label',
      predefined: 'Labels Pré-definidas',
      custom: 'Labels Customizadas',
    },
    settings: {
      title: 'Configurações',
      language: 'Idioma',
      theme: 'Tema',
      transcription: 'Transcrição',
      export: 'Exportação',
      data: 'Dados',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      loading: 'Loading...',
    },
    home: {
      title: 'Deep Research Notes',
      importClipboard: 'Import from Clipboard',
      createProject: 'Create New Project',
      recentProjects: 'Recent Projects',
      noProjects: 'No projects found',
    },
    editor: {
      export: 'Export',
      selectSentence: 'Select a sentence to annotate',
      addLabel: 'Apply Label',
      recordAudio: 'Record Audio',
      addNote: 'Add Note',
      editAnnotation: 'Edit Annotation',
    },
    labels: {
      title: 'Labels',
      expand: 'Expand',
      simplify: 'Simplify',
      remove: 'Remove',
      clarify: 'Clarify',
      counter: 'Counter',
      example: 'Example',
      createNew: 'Create New Label',
      predefined: 'Predefined Labels',
      custom: 'Custom Labels',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      transcription: 'Transcription',
      export: 'Export',
      data: 'Data',
    },
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      loading: 'Cargando...',
    },
    home: {
      title: 'Deep Research Notes',
      importClipboard: 'Importar del Portapapeles',
      createProject: 'Crear Nuevo Proyecto',
      recentProjects: 'Proyectos Recientes',
      noProjects: 'No se encontraron proyectos',
    },
    editor: {
      export: 'Exportar',
      selectSentence: 'Seleccione una oración para anotar',
      addLabel: 'Aplicar Etiqueta',
      recordAudio: 'Grabar Audio',
      addNote: 'Agregar Nota',
      editAnnotation: 'Editar Anotación',
    },
    labels: {
      title: 'Etiquetas',
      expand: 'Expandir',
      simplify: 'Simplificar',
      remove: 'Remover',
      clarify: 'Aclarar',
      counter: 'Contraponer',
      example: 'Ejemplificar',
      createNew: 'Crear Nueva Etiqueta',
      predefined: 'Etiquetas Predefinidas',
      custom: 'Etiquetas Personalizadas',
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      theme: 'Tema',
      transcription: 'Transcripción',
      export: 'Exportación',
      data: 'Datos',
    },
  },
} as const;

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

