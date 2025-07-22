# Audio Visualizer

A high-performance, client-side audio visualizer built with React, Vite, Three.js, Zustand, GSAP, and the Web Audio API. All processing is local and in-memory—no uploads, no backend.

## Features
- Three.js 3D visuals (no react-three-fiber)
- Web Audio API analysis (after user gesture)
- Deterministic, seeded randomness per audio file (via `seedrandom`)
- Zustand for global UI state (visual mode, intensity, etc.)
- GSAP for smooth UI/visual transitions
- Export to video (non-iOS browsers)
- Tailwind CSS for styling (optional, enabled)

## Tech Stack
- React + Vite
- Zustand
- Three.js (raw)
- Web Audio API
- GSAP
- seedrandom
- Tailwind CSS

## Folder Structure
```
src/
  components/           # React UI components (Upload, Controls, SeedDisplay, ExportPanel)
  engine/               # Three.js visualizer and scene generation logic
  audio/                # Web Audio API setup and analysis
  utils/                # Seed generator, audio hash, helpers
  styles/               # Tailwind config or global styles
  main.tsx              # React + Vite entry point
  App.tsx               # Root app wrapper with layout
index.html
vite.config.ts
tailwind.config.js
postcss.config.js
```

## Setup
```bash
npm install
```

## Development
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Preview Production Build
```bash
npm run preview
```

## Notes
- No analytics, tracking, or file uploads.
- All audio is processed in-memory, never sent to a server.
- Three.js is mounted directly in a div, not via react-three-fiber.
- Zustand is used for global state, not React prop drilling.
- Export to video uses `canvas.captureStream()` and `MediaRecorder` (not supported on iOS/Safari).
- Bundle size target: <200kb (production, minified).

---
MIT License 