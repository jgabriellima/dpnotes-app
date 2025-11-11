# Deep Research Notes

> **dpnotes.ai** - Your intelligent research companion for annotating and organizing long-form content.

<div align="center">

![Status](https://img.shields.io/badge/Status-In_Development-yellow)
![Progress](https://img.shields.io/badge/Progress-67%25-blue)
![Platform](https://img.shields.io/badge/Platform-iOS_|_Android-green)
![Framework](https://img.shields.io/badge/Framework-React_Native-61dafb)

</div>

---

## 🎯 Overview

Deep Research Notes is an elegant mobile app designed for researchers, students, and knowledge workers who need to annotate and organize long-form content from ChatGPT and other sources.

### Key Features

- 📝 **Smart Text Import** - Clipboard detection and automatic text processing
- 🏷️ **Multi-level Annotations** - Sentence-level annotations with custom labels
- 🎤 **Voice Notes** - Record audio annotations with live waveform and auto-transcription
- 📊 **Project Organization** - Organize research into projects with multiple documents
- 🚀 **ChatGPT Export** - Generate structured prompts with all annotations
- 🌍 **Multi-language** - Support for 99+ languages with auto-detection

---

## 🏗️ Tech Stack

### Core
- **React Native** (0.81.5) - Mobile framework
- **Expo** (SDK 54) - Development platform
- **TypeScript** - Type safety
- **NativeWind** (Tailwind CSS) - Styling

### Data & State
- **Supabase** - Database, auth, and storage
- **React Query** (@tanstack/react-query) - Data fetching and caching
- **Zustand** - Client state management

### Audio & Transcription
- **expo-audio** - Audio recording
- **@simform_solutions/react-native-audio-waveform** - Live waveform
- **Groq Whisper** - Fast AI transcription (216x speed)

### UI & Navigation
- **Expo Router** - File-based navigation
- **Lucide React Native** - Icons
- **react-native-markdown-display** - Markdown rendering

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd deep-research-notes

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see ENVIRONMENT_SETUP.md)
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migrations in SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_setup.sql`
3. Get your API keys from Settings > API

### Running the App

```bash
# Start development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

---

## 📁 Project Structure

```
deep-research-notes/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   ├── editor/[id].tsx    # Text editor
│   └── export/[id].tsx    # Export preview
│
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   ├── audio/        # Audio recording
│   │   └── text/         # Text editor components
│   │
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API clients and services
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
│
├── docs/                 # Documentation
├── supabase/            # Database migrations
└── assets/              # Images and static files
```

---

## 🎨 Design System

The app follows a beautiful **pastel coral** design system with elegant typography:

### Colors
- **Primary:** `#ffccc3` (Coral pastel)
- **Background:** `#fff2f0` (Lightest coral)
- **Text:** `#2D313E` (Dark gray)
- **Accent:** `#ffd9d2` (Medium coral)

### Typography
- **Font:** Inter (400, 500, 600, 700, 800)
- **Scale:** 12px, 14px, 16px, 18px, 24px, 32px

### Components
All UI components are implemented with **100% fidelity** to the design specifications in `docs/UX_UI_REFERENCES/`.

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[App Definition](docs/01_APP_DEFINITION.md)** - Concept and features
- **[Technical Architecture](docs/02_TECHNICAL_ARCHITECTURE.md)** - System design
- **[User Journeys](docs/03_USER_JOURNEYS_DETAILED.md)** - User flows
- **[UI/UX Specifications](docs/04_UI_UX_SPECIFICATIONS.md)** - Design system
- **[Screen Inventory](docs/06_SCREEN_INVENTORY.md)** - Screen mapping
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Database documentation
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Configuration guide
- **[Implementation Status](docs/IMPLEMENTATION_STATUS.md)** - Current progress

---

## 🔧 Configuration

### Environment Variables

Required environment variables (see `.env.example`):

```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_PROJECT_ID=your_project_id
```

### API Keys

- **Groq API** - Get from https://console.groq.com/ ($0.04/hour of audio)
- **Supabase** - Get from https://supabase.com/dashboard (free tier available)

---

## ✅ Implementation Status

### Completed (67%)
- ✅ Project infrastructure and theme
- ✅ Supabase database schema
- ✅ All base UI components
- ✅ Audio transcription service (Groq Whisper)
- ✅ Home screen with project management
- ✅ Text editor with markdown support
- ✅ Clipboard detection service

### In Progress
- 🚧 Annotation modal (hooks complete, UI pending)

### Pending
- ⏳ Tag management screens
- ⏳ Export preview and prompt generation
- ⏳ Settings and profile screens
- ⏳ Authentication screens

See [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) for detailed progress.

---

## 🤝 Contributing

This is currently a solo project. Contributions will be welcome once the MVP is complete.

---

## 📄 License

[License TBD]

---

## 🙏 Acknowledgments

- **Design System** - Inspired by modern productivity apps
- **Audio Transcription** - Powered by Groq's Whisper Large V3 Turbo
- **Database** - Powered by Supabase
- **UI References** - Based on carefully designed HTML prototypes

---

<div align="center">

**Made with ❤️ and ☕**

[Documentation](docs/) • [Issues](#) • [Changelog](#)

</div>
