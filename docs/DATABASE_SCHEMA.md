# Database Schema - Deep Research Notes

## Overview

The database uses Supabase (PostgreSQL) with Row Level Security (RLS) enabled for data protection.

## Tables

### 1. `profiles`
User profile information (extends Supabase auth.users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `projects`
Research projects that contain multiple documents

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#ffccc3',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `documents`
Text documents within projects

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_md TEXT, -- Markdown version
  language TEXT DEFAULT 'en',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `labels`
Tags/labels for annotations (pre-defined + custom)

```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#ffccc3',
  is_predefined BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: predefined labels don't belong to specific users/projects
  CONSTRAINT valid_ownership CHECK (
    (is_predefined = TRUE AND user_id IS NULL AND project_id IS NULL) OR
    (is_predefined = FALSE AND user_id IS NOT NULL)
  )
);
```

### 5. `annotations`
Annotations on document sentences/paragraphs

```sql
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  sentence_index INTEGER NOT NULL, -- Index of the sentence in the document
  sentence_text TEXT NOT NULL,
  text_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(document_id, sentence_index)
);
```

### 6. `annotation_labels`
Many-to-many relationship between annotations and labels

```sql
CREATE TABLE annotation_labels (
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (annotation_id, label_id)
);
```

### 7. `audio_recordings`
Audio recordings attached to annotations

```sql
CREATE TABLE audio_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annotation_id UUID NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL, -- Supabase Storage URL
  duration_seconds INTEGER,
  transcription TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes

```sql
-- Optimize project queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- Optimize document queries
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);

-- Optimize annotation queries
CREATE INDEX idx_annotations_document_id ON annotations(document_id);
CREATE INDEX idx_annotation_labels_annotation_id ON annotation_labels(annotation_id);
CREATE INDEX idx_annotation_labels_label_id ON annotation_labels(label_id);

-- Optimize label queries
CREATE INDEX idx_labels_user_id ON labels(user_id);
CREATE INDEX idx_labels_project_id ON labels(project_id);
CREATE INDEX idx_labels_predefined ON labels(is_predefined) WHERE is_predefined = TRUE;

-- Optimize audio queries
CREATE INDEX idx_audio_annotation_id ON audio_recordings(annotation_id);
```

## Row Level Security (RLS) Policies

### Profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Projects
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

### Documents
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents in their projects"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their projects"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents in their projects"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in their projects"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );
```

### Labels
```sql
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view predefined labels"
  ON labels FOR SELECT
  USING (is_predefined = TRUE);

CREATE POLICY "Users can view own labels"
  ON labels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own labels"
  ON labels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own labels"
  ON labels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own labels"
  ON labels FOR DELETE
  USING (auth.uid() = user_id AND is_predefined = FALSE);
```

### Annotations (cascade from documents)
```sql
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view annotations in their documents"
  ON annotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = annotations.document_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create annotations in their documents"
  ON annotations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = annotations.document_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update annotations in their documents"
  ON annotations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = annotations.document_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete annotations in their documents"
  ON annotations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN projects p ON p.id = d.project_id
      WHERE d.id = annotations.document_id
      AND p.user_id = auth.uid()
    )
  );
```

### Annotation Labels (cascade from annotations)
```sql
ALTER TABLE annotation_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view annotation labels in their documents"
  ON annotation_labels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM annotations a
      JOIN documents d ON d.id = a.document_id
      JOIN projects p ON p.id = d.project_id
      WHERE a.id = annotation_labels.annotation_id
      AND p.user_id = auth.uid()
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE...
```

### Audio Recordings (cascade from annotations)
```sql
ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audio in their annotations"
  ON audio_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM annotations a
      JOIN documents d ON d.id = a.document_id
      JOIN projects p ON p.id = d.project_id
      WHERE a.id = audio_recordings.annotation_id
      AND p.user_id = auth.uid()
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE...
```

## Storage Buckets

### audio-recordings
Bucket for storing audio files

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false);

-- RLS policy for audio files
CREATE POLICY "Users can upload their own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Pre-defined Labels

```sql
-- Insert default labels
INSERT INTO labels (name, description, is_predefined, color) VALUES
  ('Expand', 'Elaborate on the selected text with more details', TRUE, '#ffccc3'),
  ('Summarize', 'Condense the key points', TRUE, '#ffd9d2'),
  ('Simplify', 'Make the text easier to understand', TRUE, '#ffe6e1'),
  ('Clarify', 'Make the meaning more clear', TRUE, '#ffccc3'),
  ('Add Example', 'Include a concrete example', TRUE, '#ffd9d2'),
  ('Rephrase', 'Express the same idea differently', TRUE, '#ffe6e1'),
  ('Remove', 'This section should be removed', TRUE, '#FF5C5C'),
  ('Fact Check', 'Verify the accuracy of this information', TRUE, '#ffccc3');
```

## Database Functions

### Update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Increment label usage count
```sql
CREATE OR REPLACE FUNCTION increment_label_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE labels
  SET usage_count = usage_count + 1
  WHERE id = NEW.label_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_label_usage_trigger
  AFTER INSERT ON annotation_labels
  FOR EACH ROW EXECUTE FUNCTION increment_label_usage();
```

## Setup Instructions

1. Create a Supabase project at https://supabase.com
2. Run the migration SQL scripts in order
3. Configure environment variables (see ENVIRONMENT_SETUP.md)
4. Test RLS policies in Supabase SQL Editor

## Backup & Recovery

- Supabase provides automatic daily backups
- Export data regularly using Supabase CLI
- For production, enable Point-in-Time Recovery (PITR)

