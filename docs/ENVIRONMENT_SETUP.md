# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Deep Research Notes - Environment Variables

# Groq API (for Whisper transcription)
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Supabase Project ID (for MCP tools)
SUPABASE_PROJECT_ID=your_supabase_project_id_here
```

## Getting API Keys

### 1. Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in `EXPO_PUBLIC_GROQ_API_KEY`

**Note:** We use Groq's Whisper Large V3 Turbo model for fast, accurate transcription.
- Pricing: $0.04 per hour of audio
- Speed: 216x speed factor
- Max file size: 100 MB
- Supported formats: FLAC, MP3, M4A, MPEG, MPGA, OGG, WAV, WEBM

### 2. Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use an existing one
3. Go to Settings > API
4. Copy the following:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - Anon/Public Key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Project Reference ID → `SUPABASE_PROJECT_ID`

## Database Schema

The database schema will be created automatically using Supabase migrations. See `docs/DATABASE_SCHEMA.md` for details.

## Required Permissions

The app requires the following permissions:

### iOS (Info.plist)
- `NSMicrophoneUsageDescription` - For audio recording
- `NSPhotoLibraryUsageDescription` - For saving exports (optional)

### Android (AndroidManifest.xml)
- `RECORD_AUDIO` - For audio recording
- `WRITE_EXTERNAL_STORAGE` - For saving exports (optional)

These are automatically configured via Expo config plugins.

## Development

After setting up the `.env` file, restart your development server:

```bash
# Clear cache and restart
npx expo start --clear
```

## Security Notes

- Never commit `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use different API keys for development and production
- Rotate API keys regularly
- For production builds, use Expo EAS Secrets to manage environment variables

## Troubleshooting

### "API Key not found" error
- Make sure the `.env` file is in the root directory
- Restart the development server with `--clear` flag
- Verify the environment variable names start with `EXPO_PUBLIC_`

### Supabase connection issues
- Verify the Supabase URL and anon key are correct
- Check if your Supabase project is active
- Ensure RLS (Row Level Security) policies are set up correctly

