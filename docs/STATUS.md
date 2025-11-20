# Project Status

## Current State: Production-Ready MVP

### Architecture: Notes-First + Local Storage

The app has been simplified to a **notes-first, local-only** architecture:
- ✅ Single editor screen as main interface
- ✅ Hamburger menu for notes navigation
- ✅ All data stored locally with AsyncStorage + Zustand
- ✅ WebView-based text selection engine
- ✅ Inline annotation popover (no modals)
- ✅ Audio transcription via Groq Whisper
- ✅ Settings modal for customization

---

## Tech Stack

### Core
- React Native 0.81.5
- Expo SDK 54
- TypeScript
- NativeWind (Tailwind CSS)

### State & Storage
- Zustand (client state)
- AsyncStorage (persistence)

### Key Libraries
- expo-audio (recording)
- react-native-webview (text rendering/selection)
- lucide-react-native (icons)
- Groq Whisper API (transcription)

---

## Removed/Cleaned Up

### Backend & Auth (Removed)
- ❌ Supabase integration
- ❌ React Query
- ❌ Authentication system
- ❌ Remote database

### Old UI (Removed)
- ❌ Tab-based navigation
- ❌ Projects screen
- ❌ Export preview screen
- ❌ Full-screen modals
- ❌ Native text selection components
- ❌ Markdown display library

### NPM Dependencies Removed
- `@supabase/supabase-js`
- `@tanstack/react-query`
- `expo-auth-session`
- `expo-web-browser`
- `expo-sqlite`
- `@alentoma/react-native-selectable-text`
- `react-native-markdown-display`

---

## Current Features

### ✅ Core Functionality
- Import text from clipboard
- WebView-based text rendering and selection
- Create annotations (text, audio, tags)
- Edit/delete annotations
- Audio recording with live waveform
- Audio transcription (Groq Whisper)
- Copy annotated text to clipboard
- Notes management (create, list, navigate)
- Settings (font size, theme, scroll position, high contrast)

### ✅ UX Highlights
- Drag-and-drop annotation popover
- Keyboard-aware positioning
- Smooth selection with touch and drag
- Visual annotation markers (colored with icons)
- Back button handling (close popover first)
- Empty state with import CTA

---

## File Structure

```
app/
├── index.tsx              # Entry → last note
├── _layout.tsx            # Root layout
└── editor/[id].tsx        # Main editor

src/
├── components/
│   ├── audio/             # Recording & playback
│   ├── editor/            # WebView + Popover + EmptyState
│   ├── notes/             # NotesMenu
│   ├── settings/          # SettingsModal
│   ├── tags/              # TagSelector
│   ├── ui/                # Icon, Button, Input
│   └── ErrorBoundary.tsx
├── hooks/
│   ├── useDocumentEditor.ts
│   ├── useAudioRecorder.ts
│   └── useNativeErrorHandler.ts
├── stores/
│   ├── documentsStore.ts
│   ├── tagsStore.ts
│   └── settingsStore.ts
├── services/
│   ├── clipboard/
│   ├── export/
│   └── transcription/
├── types/
└── utils/
```

---

## Known Issues

### Minor
- Reanimated warnings (false positives, can be ignored)
- lucide-react-native peer dependency warning (resolved with --legacy-peer-deps)

---

## Next Steps (Optional Future Enhancements)

### Potential Features
- Cloud sync (optional)
- Export to PDF/Markdown
- Search across notes
- Bulk annotation management
- Tag statistics
- Note templates

### Performance
- Large document optimization
- Annotation caching
- Image support

---

## Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## Environment Variables

Required:
```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

Optional:
```env
EXPO_PUBLIC_USE_MOCK_CLIPBOARD=false
```

---

Last Updated: 2025-11-19
