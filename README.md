# ArtIdentify 🎨📸

A React Native Android app that identifies art and objects from photos, then retrieves rich information about them.

## What It Does

1. **Take a photo** of a painting, sculpture, or artifact
2. **On-device ML Kit** detects and labels objects in the image
3. **Bounding box overlays** appear on the photo — tap any object to learn more
4. **Cloud enrichment** fetches detailed info from Wikipedia and museum collection APIs
5. **Location awareness** — if you're at a known museum (NGA, Met, Louvre, etc.), the app narrows results and provides curation context
6. **Personal collection** — every scan is saved to your in-app gallery for later viewing

## Architecture

```
src/
├── types/index.ts              # TypeScript type definitions
├── services/
│   ├── DetectionService.ts     # On-device ML Kit object detection + fallback
│   ├── InfoService.ts          # Cloud info retrieval (Wikipedia, museum APIs)
│   ├── LocationService.ts      # GPS location acquisition
│   ├── MuseumLocations.ts      # Known museum database + Haversine distance
│   └── StorageService.ts       # AsyncStorage persistence for scans
├── screens/
│   ├── CameraScreen.tsx        # Live camera with capture button
│   ├── ResultsScreen.tsx       # Photo + detection overlay + object list
│   ├── DetailScreen.tsx        # Full info page for selected object
│   └── CollectionScreen.tsx    # Saved scans gallery
├── components/
│   ├── DetectionOverlay.tsx    # Bounding box overlay on photo
│   └── ObjectCard.tsx          # Compact object list item
└── App.tsx                      # Navigation + app entry
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.86 + TypeScript |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| Camera | react-native-vision-camera 5 (Nitro) |
| On-device ML | @react-native-ml-kit/image-labeling (Google ML Kit) |
| Location | @react-native-community/geolocation |
| Storage | @react-native-async-storage/async-storage |
| Cloud info | Wikipedia REST API + Met Museum API |
| Build | Gradle 9.3 + AGP + JDK 17 |

## Hybrid Detection Strategy

1. **On-device first**: ML Kit image labeling runs locally to identify objects with confidence scores — works offline
2. **Cloud enrichment**: When online, Wikipedia REST API and museum collection APIs (Met, NGA) provide comprehensive info: artist, provenance, cultural significance, critical reception
3. **Location cross-reference**: GPS coordinates are matched against a database of 12+ major museums worldwide. If the user is at a known venue, the app queries that museum's collection API first

## Building

```bash
# Prerequisites
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=$HOME/jdk/jdk-17.0.13+11

# Install dependencies
npm install

# Build debug APK
cd android && ./gradlew assembleDebug

# APK location
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Installing on a Device

```bash
# Enable USB debugging on your Android phone, connect it, then:
adb install app-debug.apk
```

## Known Museums (Location Cross-Reference)

- National Gallery of Art (Washington DC)
- Smithsonian American Art Museum
- Metropolitan Museum of Art (NYC) — with API integration
- MoMA (NYC)
- Art Institute of Chicago
- Louvre (Paris)
- British Museum (London)
- Uffizi Gallery (Florence)
- Vatican Museums (Rome)
- Rijksmuseum (Amsterdam)
- National Gallery London
- Musée d'Orsay (Paris)

## Future Enhancements (Designed For)

- [ ] Audio narration (text-to-speech) for hands-free browsing
- [ ] Curated audio tour paths
- [ ] More museum API integrations (NGA, Rijksmuseum, British Museum)
- [ ] Indoor positioning (BLE beacons, floor maps)
- [ ] Social sharing of objects
- [ ] User annotations and favorites
- [ ] Offline Wikipedia downloads for travel