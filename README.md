# Sniffari 🐕

A dog walk tracker. Start a walk, and Sniffari records the route on a map, the distance, your steps and every poop stop. When you end the walk it asks how it went (1 to 5 stars plus an optional note) and saves it to your walk history.

Everything is stored on the phone. There are no accounts and no server.

## Features

- **Start and end a walk.** The screen stays awake while you walk, and a walk in progress is saved every few seconds, so closing the app doesn't lose it. Reopen and tap "Resume walk in progress".
- **Route and distance.** Live GPS route drawn on the map. Inaccurate fixes and jitter from standing still are filtered out so the distance doesn't creep up while the dog sniffs.
- **Steps.** Counted with the phone's pedometer. On iOS the final count also comes from the phone's step history for the whole walk.
- **Poop markers.** Tap 💩 to drop a marker at your current location.
- **Rating.** 1 to 5 stars and a note at the end of each walk.
- **History.** Last 7 days summary on the home screen, a list of all walks, and a detail page with the route and poop map for each walk.

## Run it

You need Node 20+ and the [Expo Go](https://expo.dev/go) app on your phone.

```bash
npm install
npm start
```

Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).

Allow location and motion/physical activity access when asked.

## Development

```bash
npm run typecheck   # TypeScript
npm test            # unit tests for distance and GPS filtering
```

Code layout:

- `src/app/` screens (Expo Router): home, active walk, history, walk detail
- `src/hooks/useWalkTracker.ts` GPS, pedometer and in-progress walk state
- `src/lib/` distance maths, storage, formatting, theme
- `src/components/` map, rating form and shared UI

## Known limits of v1

- **Keep the app open during the walk.** Tracking pauses when the app is in the background or the phone is locked (the screen is kept awake to help). Background tracking needs a custom development build rather than Expo Go, and is the obvious next step.
- **Android map key.** Maps work in Expo Go. A standalone Android build needs a Google Maps API key in `app.json` (`android.config.googleMaps.apiKey`).
- No web version, because the map library is mobile only.
