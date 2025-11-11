/**
 * TypeScript types for Supabase database schema
 * Generated based on the database schema in docs/DATABASE_SCHEMA.md
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          content: string;
          content_md: string | null;
          language: string;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          content: string;
          content_md?: string | null;
          language?: string;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          content?: string;
          content_md?: string | null;
          language?: string;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      labels: {
        Row: {
          id: string;
          user_id: string | null;
          project_id: string | null;
          name: string;
          description: string | null;
          color: string;
          is_predefined: boolean;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          project_id?: string | null;
          name: string;
          description?: string | null;
          color?: string;
          is_predefined?: boolean;
          usage_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          project_id?: string | null;
          name?: string;
          description?: string | null;
          color?: string;
          is_predefined?: boolean;
          usage_count?: number;
          created_at?: string;
        };
      };
      annotations: {
        Row: {
          id: string;
          document_id: string;
          marker_id: string;
          text_note: string | null;
          annotation_type: Database['public']['Enums']['annotation_type'];
          source: Database['public']['Enums']['annotation_source'];
          is_custom_label: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          marker_id: string;
          text_note?: string | null;
          annotation_type?: Database['public']['Enums']['annotation_type'];
          source?: Database['public']['Enums']['annotation_source'];
          is_custom_label?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          marker_id?: string;
          text_note?: string | null;
          annotation_type?: Database['public']['Enums']['annotation_type'];
          source?: Database['public']['Enums']['annotation_source'];
          is_custom_label?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      annotation_labels: {
        Row: {
          annotation_id: string;
          label_id: string;
          created_at: string;
        };
        Insert: {
          annotation_id: string;
          label_id: string;
          created_at?: string;
        };
        Update: {
          annotation_id?: string;
          label_id?: string;
          created_at?: string;
        };
      };
      audio_recordings: {
        Row: {
          id: string;
          annotation_id: string;
          audio_url: string;
          duration_seconds: number | null;
          transcription: string | null;
          language: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          annotation_id: string;
          audio_url: string;
          duration_seconds?: number | null;
          transcription?: string | null;
          language?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          annotation_id?: string;
          audio_url?: string;
          duration_seconds?: number | null;
          transcription?: string | null;
          language?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      annotation_type: 'label' | 'note' | 'audio' | 'mixed';
      annotation_source: 'manual_selection' | 'audio_transcription' | 'quick_note';
    };
  };
}

