# Deep Research Notes

> **dpnotes.ai** - Your intelligent research companion for annotating long-form content.

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-green)
![Platform](https://img.shields.io/badge/Platform-iOS_|_Android-green)
![Framework](https://img.shields.io/badge/Framework-React_Native-61dafb)

</div>

---

## 🎯 Overview

Deep Research Notes is an elegant mobile app designed for researchers, students, and knowledge workers who need to annotate long-form content from ChatGPT and other sources.

### Key Features

- 📝 **Smart Text Import** - Clipboard import with automatic text processing
- 🏷️ **Inline Annotations** - Multi-type annotations (text, audio, tags)
- 🎤 **Voice Notes** - Record audio annotations with live waveform and auto-transcription (Groq Whisper)
- 💾 **Local-First** - All data stored locally on device with AsyncStorage
- 🚀 **ChatGPT Export** - Copy annotated text to clipboard with structured markers
- 🎨 **Notes-First** - Open directly to last edited note, hamburger menu for navigation
- ⚡ **Fast Startup** - Optimized splash screen with Hermes engine (1-1.5s cold start)

---

## 🏗️ Tech Stack

### Core
- **React Native** (0.81.5) - Mobile framework
- **Expo** (SDK 54) - Development platform
- **TypeScript** - Type safety
- **NativeWind** (Tailwind CSS) - Styling

### State Management
- **Zustand** - Local state management (documents, tags, settings)
- **AsyncStorage** - Persistent storage

### Audio & Transcription
- **expo-audio** - Audio recording
- **Custom SVG Waveform** - Live waveform visualization
- **Groq Whisper** - Fast AI transcription (216x speed)

### UI & Navigation
- **Expo Router** - File-based navigation
- **Lucide React Native** - Icons
- **react-native-webview** - Text rendering and selection engine

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd deep-research-notes

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (Groq API for transcription)
```

### Optional: Generate Splash Screen Assets

```bash
# Generate splash screen, app icon, and adaptive icon
make splash-assets

# Or use the script directly
bash scripts/generate-splash-assets.sh

# Requires ImageMagick
brew install imagemagick  # macOS
```

> 📖 **See** `docs/SPLASH_QUICK_START.md` for detailed splash screen setup

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 📁 Project Structure

```
deep-research-notes/
├── app/                       # Screens (Expo Router)
│   ├── index.tsx             # Entry point (redirects to last note)
│   ├── _layout.tsx           # Root layout
│   └── editor/[id].tsx       # Notes editor (main screen)
│
├── src/
│   ├── components/
│   │   ├── audio/            # AudioRecorder, AudioPlayer, CustomWaveform
│   │   ├── editor/           # WebViewSelectableEditor, AnnotationPopover, EmptyState
│   │   ├── notes/            # NotesMenu (hamburger menu)
│   │   ├── settings/         # SettingsModal
│   │   ├── tags/             # TagSelector
│   │   └── ui/               # Icon, Button, Input
│   │
│   ├── hooks/
│   │   ├── useDocumentEditor.ts    # Main editor logic
│   │   ├── useAudioRecorder.ts     # Audio recording
│   │   └── useNativeErrorHandler.ts
│   │
│   ├── stores/               # Zustand stores
│   │   ├── documentsStore.ts # Documents and annotations
│   │   ├── tagsStore.ts      # Tags management
│   │   └── settingsStore.ts  # App settings
│   │
│   ├── services/
│   │   ├── clipboard/        # Import from clipboard
│   │   ├── export/           # Generate ChatGPT prompts
│   │   └── transcription/    # Groq Whisper integration
│   │
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
│
└── docs/                     # Documentation
```

---

## 🎨 App Flow

### Notes-First Architecture

1. **App Launch** → Opens directly to last edited note
2. **Hamburger Menu** → Access all notes, create new notes
3. **Editor Screen** → Import, annotate, export
4. **Settings** → Font size, theme, scroll position, high contrast

### Annotation Workflow

1. Select text in WebView
2. Popover appears with options: Text, Audio, Tags
3. Create annotation inline (no full-screen modals)
4. Annotated text is marked with color and icon
5. Click marked text to edit annotation
6. Copy to clipboard with structured format

---

## 🔧 Configuration

### Environment Variables

Required environment variables:

```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_USE_MOCK_CLIPBOARD=false
```

### API Keys

- **Groq API** - Get from https://console.groq.com/ ($0.04/hour of audio)

---

## ✨ Key Features

### WebView Selection Engine
- Uses native browser selection for performance
- Custom touch handlers for smooth drag selection
- JavaScript injection for selection events
- No native context menu interference

### Draggable Annotation Popover
- Drag handle to reposition
- Keyboard-aware positioning
- Inline text input, audio recorder, tag selector
- Edit mode for existing annotations

### Audio Transcription
- Live waveform visualization
- Pause/resume recording
- Automatic transcription via Groq Whisper
- Playback with transcription display

### Settings
- Scroll position (left/right)
- Font size (small/medium/large)
- Theme (light/dark)
- High contrast mode

---

## 📚 Documentation

Available in the `docs/` directory:

### Core Documentation
- **Technical Architecture** - System design
- **UI/UX Specifications** - Design system
- **Implementation Details** - Component documentation

### Splash Screen & Performance
- **[SPLASH_QUICK_START.md](docs/SPLASH_QUICK_START.md)** - 5-minute setup guide
- **[SPLASH_SCREEN_SUMMARY.md](docs/SPLASH_SCREEN_SUMMARY.md)** - Complete overview
- **[SPLASH_SCREEN_OPTIMIZATION.md](docs/SPLASH_SCREEN_OPTIMIZATION.md)** - Technical optimizations
- **[SPLASH_SCREEN_DESIGN_GUIDE.md](docs/SPLASH_SCREEN_DESIGN_GUIDE.md)** - Design specifications
- **[assets/README_ASSETS.md](assets/README_ASSETS.md)** - Assets guide

---

## 🤝 Contributing

This is currently a solo project. Contributions will be welcome once the MVP is complete.

---

## 📄 License

[License TBD]

---

## 🙏 Acknowledgments

- **Audio Transcription** - Powered by Groq's Whisper Large V3 Turbo
- **UI Design** - Modern, minimalist annotation interface
- **Local-First** - Privacy-focused, no external database required

---

<div align="center">

**Made with ❤️ and ☕**

[Documentation](docs/)

</div>
