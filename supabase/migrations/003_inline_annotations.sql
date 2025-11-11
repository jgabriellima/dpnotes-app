-- ============================================
-- MIGRATION: Inline Annotations with Marker IDs
-- Date: 2025-11-10
-- Description: Migrate from sentence-based to marker-based annotations
-- ============================================

-- Create ENUM types for annotation tracking
DO $$ BEGIN
    CREATE TYPE annotation_type AS ENUM ('label', 'note', 'audio', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE annotation_source AS ENUM ('manual_selection', 'audio_transcription', 'quick_note');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update annotations table structure
-- First, check if the table exists and add new columns
DO $$ 
BEGIN
    -- Add marker_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'annotations' AND column_name = 'marker_id'
    ) THEN
        ALTER TABLE annotations ADD COLUMN marker_id VARCHAR(36) UNIQUE;
    END IF;

    -- Add annotation_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'annotations' AND column_name = 'annotation_type'
    ) THEN
        ALTER TABLE annotations ADD COLUMN annotation_type annotation_type NOT NULL DEFAULT 'label';
    END IF;

    -- Add source column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'annotations' AND column_name = 'source'
    ) THEN
        ALTER TABLE annotations ADD COLUMN source annotation_source NOT NULL DEFAULT 'manual_selection';
    END IF;

    -- Add is_custom_label column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'annotations' AND column_name = 'is_custom_label'
    ) THEN
        ALTER TABLE annotations ADD COLUMN is_custom_label BOOLEAN DEFAULT FALSE;
    END IF;

    -- Drop old columns if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'annotations' AND column_name = 'sentence_index'
    ) THEN
        ALTER TABLE annotations DROP COLUMN sentence_index;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'annotations' AND column_name = 'sentence_text'
    ) THEN
        ALTER TABLE annotations DROP COLUMN sentence_text;
    END IF;
END $$;

-- Now make marker_id NOT NULL after ensuring all rows have a value
-- Generate marker_ids for existing rows if any exist
UPDATE annotations 
SET marker_id = COALESCE(marker_id, 'a' || ROW_NUMBER() OVER (ORDER BY created_at))
WHERE marker_id IS NULL;

-- Make marker_id NOT NULL
ALTER TABLE annotations ALTER COLUMN marker_id SET NOT NULL;

-- Create indexes for fast marker lookups
CREATE INDEX IF NOT EXISTS idx_annotations_marker ON annotations(marker_id);
CREATE INDEX IF NOT EXISTS idx_annotations_document_marker ON annotations(document_id, marker_id);
CREATE INDEX IF NOT EXISTS idx_annotations_type ON annotations(annotation_type);

-- Add comments for documentation
COMMENT ON COLUMN annotations.marker_id IS 'Unique marker ID used in document content: [[ann:marker_id]]text[[/ann]]';
COMMENT ON COLUMN annotations.annotation_type IS 'Type of annotation: label (only labels), note (only text), audio (only audio), mixed (combination)';
COMMENT ON COLUMN annotations.source IS 'How the annotation was created: manual_selection, audio_transcription, or quick_note';
COMMENT ON COLUMN annotations.is_custom_label IS 'TRUE if any attached labels are user-created (not pre-defined)';
