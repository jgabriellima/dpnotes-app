# React Native Live Waveform + Recording — Technical Implementation Guide (2025)

## Topics

1. Overview & Goals
2. Tech Choices & Versions (as of Nov 10, 2025)
3. Install & Setup
4. iOS/Android Configuration (permissions & build)
5. Recording Audio (Expo `expo-audio`)
6. Rendering a Live Waveform (`@simform_solutions/react-native-audio-waveform`)
7. Styling & Customization
8. Performance Tuning
9. Troubleshooting & Known Issues
10. Version Matrix & Pinning
11. Alternatives & When to Use Them

---

## 1) Overview & Goals

You want to **record audio** and **show a customizable waveform** in a React Native app. The **recorded file will be handled upstream** (your own pipeline), so this guide focuses on **capture** + **visualization**.

**Recommended stack:**

* **Recording:** `expo-audio` (successor to `expo-av` for audio) — official, cross-platform recording/playback. ([Expo Documentation][1])
* **Waveform (live + static):** `@simform_solutions/react-native-audio-waveform` — supports **dynamic/live** waveform during capture and **static** waveform for files. ([GitHub][2])

---

## 2) Tech Choices & Versions (as of Nov 10, 2025)

* **Expo SDK 54** (ships RN 0.81): stable, widely adopted. ([Expo][3])
* **`expo-audio`** bundled version around **`~1.0.14`** in latest docs for SDK 54. Use `npx expo install expo-audio` to auto-resolve the right semver for your SDK. ([Expo Documentation][1])
* **`@simform_solutions/react-native-audio-waveform` v2.1.6** (latest release tag). ([GitHub][4])
* **Note:** `expo-av`’s `Audio` API is **deprecated** in favor of `expo-audio`. If you’re on older code, plan migration. ([Expo Documentation][5])

---

## 3) Install & Setup

```bash
# Always prefer expo's installer to match your SDK
npx expo install expo-audio

# Waveform lib (pin a known stable)
npm i @simform_solutions/react-native-audio-waveform@2.1.6
# or
yarn add @simform_solutions/react-native-audio-waveform@2.1.6
```

Why: `expo install` picks a **compatible** `expo-audio` for your SDK; pin the waveform lib to avoid unexpected changes. ([Expo Documentation][6])

---

## 4) iOS/Android Configuration (permissions & build)

**app.json / app.config.js** (Expo config plugin for `expo-audio`)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ]
  }
}
```

This adds **NSMicrophoneUsageDescription** (iOS) and configures Android mic permissions. ([Expo Documentation][1])

**iOS / Silent mode**
If you need playback during preview, set `playsInSilentModeIOS: true` at runtime. ([Stack Overflow][7])

**Heads up on SDK 54 upgrades**
If you’re upgrading from SDK 53 → 54 and see build issues (Kotlin mismatch, etc.), follow the SDK 54 upgrade notes. ([Expo Documentation][8])

---

## 5) Recording Audio (Expo `expo-audio`)

> Minimal example to **start/stop recording** and **get a file URI**.

```tsx
// src/audio/useRecorder.ts
import { useCallback, useRef, useState } from 'react';
import * as Audio from 'expo-audio';

export function useRecorder() {
  const recorderRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);

  const requestPermissions = useCallback(async () => {
    const p = await Audio.requestRecordingPermissionsAsync();
    if (!p.granted) throw new Error('Microphone permission denied');
  }, []);

  const start = useCallback(async () => {
    await requestPermissions();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true, // helpful for iOS previewing after record
    });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.DEFAULT_RECORDING_OPTIONS_PRESET
    );
    await recording.startAsync();
    recorderRef.current = recording;
    setIsRecording(true);
  }, [requestPermissions]);

  const stop = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec) return null;
    await rec.stopAndUnloadAsync();
    const fileUri = rec.getURI() ?? null;
    setUri(fileUri);
    recorderRef.current = null;
    setIsRecording(false);
    return fileUri; // send this upstream
  }, []);

  return { isRecording, uri, start, stop };
}
```

`expo-audio` is the current, supported API for recording/playback going forward. ([Expo Documentation][1])

---

## 6) Rendering a Live Waveform (`@simform_solutions/react-native-audio-waveform`)

> The Simform lib supports **`mode="live"`** (microphone waveform while recording) and **static mode** for files.

```tsx
// src/components/LiveWaveformRecorder.tsx
import React, { useRef } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Waveform, type IWaveformRef } from '@simform_solutions/react-native-audio-waveform';
import { useRecorder } from '../audio/useRecorder';

export default function LiveWaveformRecorder() {
  const wfRef = useRef<IWaveformRef>(null);
  const { isRecording, start, stop } = useRecorder();

  const onStart = async () => {
    await start();
    wfRef.current?.startRecording();  // live drawing begins
  };

  const onStop = async () => {
    wfRef.current?.stopRecording();
    const uri = await stop();         // send uri upstream
    console.log('Recorded file:', uri);
  };

  return (
    <View style={styles.container}>
      <Waveform
        ref={wfRef}
        mode="live"
        candleWidth={3}
        candleSpace={2}
        waveColor="#5B6CFF"
        containerStyle={styles.wave}
      />
      <Pressable onPress={isRecording ? onStop : onStart} style={styles.btn}>
        <Text style={styles.btnText}>{isRecording ? 'Stop' : 'Record'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  wave: { height: 96, borderRadius: 12, overflow: 'hidden' },
  btn: { padding: 12, backgroundColor: '#111', borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' }
});
```

The package explicitly advertises **pre-recorded file waveforms** and **real-time waveforms during recording**. ([GitHub][2])

**Static waveform (after recording):**

```tsx
<Waveform
  mode="static"
  uri={recordedFileUri} // local file or remote URL
  candleWidth={2}
  candleSpace={1}
  waveColor="#8E9196"
  progress={playbackProgress} // optional if you tie to a player
/>
```

Releases show **v2.1.6** current as of Oct 17, 2025. ([GitHub][4])

---

## 7) Styling & Customization

Key props you’ll likely tweak (names may vary by minor versions):

* `candleWidth` / `candleSpace` — density of bars for performance/visual balance.
* `waveColor` / `containerStyle` — theming.
* `maxCandlesToRender` — cap to protect perf on low-end devices.
* `mode="live" | "static"` — live drawing vs from file.

See the README for full prop surface and examples. ([GitHub][2])

---

## 8) Performance Tuning

* Prefer narrower `candleWidth` and add `candleSpace` to reduce overdraw. ([GitHub][2])
* Limit **re-renders**: keep waveform props **stable** (memoize styles/handlers).
* If you display multiple static waveforms (e.g., list), **virtualize** and use smaller heights.
* On iOS, ensure audio runs in silent mode if you preview playback alongside drawing (prevents “no sound” confusions). ([Stack Overflow][7])

---

## 9) Troubleshooting & Known Issues

* **expo-av → expo-audio migration:** `expo-av` Audio APIs are deprecated and **removed in SDK 54**; use `expo-audio`. ([Expo Documentation][9])
* **Bundled asset playback with expo-audio:** historic issues reported; prefer file/stream URIs; check current status. ([GitHub][10])
* **Simform waveform issues:** open GitHub issues include iOS glitches and record/playback edge cases; test on real devices and track the repo’s issue list. ([GitHub][11])

---

## 10) Version Matrix & Pinning

| Layer    | Recommended (SDK 54)                                                 | Notes                                                                                                  |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Expo     | **SDK 54**                                                           | Ships React Native 0.81. ([Expo][3])                                                                   |
| Audio    | **`expo-audio` ~1.0.14** (install via `npx expo install expo-audio`) | Docs show bundled `~1.0.14` for latest SDK 54; let Expo resolve exact minor. ([Expo Documentation][1]) |
| Waveform | **`@simform_solutions/react-native-audio-waveform@2.1.6`**           | Supports **live** and **static** waveforms. ([GitHub][4])                                              |

> Tip: lock `@simform_solutions/*` to **2.1.6** initially; upgrade after testing. For `expo-audio`, **don’t hard-pin**; let `expo install` pick the compatible build for your SDK. ([Expo Documentation][6])

---

## 11) Alternatives & When to Use Them

* **`@kaannn/react-native-waveform`** — good for **static** visualization from local/remote files; live capture support is limited/“planned” historically. Use when you **don’t need live drawing** and want a simpler surface. ([npm][12])
* **`react-native-audio-api` (Software Mansion)** — lower-level **audio primitives** (Web Audio–style). Pick if you need **DSP** or custom pipelines; requires extra setup (Metro wrapper). ([docs.swmansion.com][13])
* **`react-native-audio-analyzer`** — produces **amplitude arrays** you render yourself (e.g., via `react-native-svg`). Choose for **full control** over rendering; more boilerplate. ([GitHub][14])

[1]: https://docs.expo.dev/versions/latest/sdk/audio/?utm_source=chatgpt.com "Audio (expo-audio)"
[2]: https://github.com/SimformSolutionsPvtLtd/react-native-audio-waveform?utm_source=chatgpt.com "SimformSolutionsPvtLtd/react-native-audio-waveform"
[3]: https://expo.dev/changelog/sdk-54?utm_source=chatgpt.com "Expo SDK 54 - Expo Changelog"
[4]: https://github.com/SimformSolutionsPvtLtd/react-native-audio-waveform/releases?utm_source=chatgpt.com "SimformSolutionsPvtLtd/react-native-audio-waveform"
[5]: https://docs.expo.dev/versions/latest/sdk/audio-av/?utm_source=chatgpt.com "Audio (expo-av)"
[6]: https://docs.expo.dev/versions/latest/?utm_source=chatgpt.com "Reference - Expo Documentation"
[7]: https://stackoverflow.com/questions/76706375/how-to-play-sound-with-reactnative-expo-av?utm_source=chatgpt.com "How to play sound with ReactNative expo-av"
[8]: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/?utm_source=chatgpt.com "Upgrade Expo SDK"
[9]: https://docs.expo.dev/versions/latest/sdk/av/?utm_source=chatgpt.com "AV - Expo Documentation"
[10]: https://github.com/expo/expo/issues/33665?utm_source=chatgpt.com "[expo-audio] Unable to play bundled assets · Issue #33665"
[11]: https://github.com/SimformSolutionsPvtLtd/react-native-audio-waveform/issues?utm_source=chatgpt.com "Issues · SimformSolutionsPvtLtd/react-native-audio-waveform"
[12]: https://www.npmjs.com/package/%40kaannn/react-native-waveform?utm_source=chatgpt.com "kaannn/react-native-waveform"
[13]: https://docs.swmansion.com/react-native-audio-api/docs/fundamentals/getting-started/?utm_source=chatgpt.com "Getting started | React Native Audio API"
[14]: https://github.com/exzos28/react-native-audio-analyzer?utm_source=chatgpt.com "exzos28/react-native-audio-analyzer"
