-- Deep Research Notes - Storage Setup
-- Migration: 002_storage_setup
-- Created: 2025-11-10

-- ============================================
-- STORAGE BUCKET FOR AUDIO RECORDINGS
-- ============================================

-- Create bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Users can upload their own audio files
CREATE POLICY "Users can upload their own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: Users can view their own audio files
CREATE POLICY "Users can view their own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: Users can update their own audio files
CREATE POLICY "Users can update their own audio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: Users can delete their own audio files
CREATE POLICY "Users can delete their own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

