# Lunagi Studios - Phase 1 Prototype

A free, no-account, browser-based Korean-style photobooth web application. 

This repository contains the Phase 1 static prototype of Lunagi Studios. It establishes the design system tokens, core TypeScript layouts, state machine step transitions, and responsive layout foundations.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

1. Clone this repository (or navigate to the workspace directory).
2. Install the package dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the Vite developer server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

To verify type safety and bundle creation:
```bash
npm run build
```

---

## Phase 1 Scope

- **Responsive Landing Page (`/`)**: Polished wordmark header, hero tagline, high-end simulated crop card mockups, "How it works" guide, and privacy statements.
- **Unified Hash Router**: Built-in state routing dispatcher managing transitioning between `#/?landing` and `#/booth`.
- **Wizard Step State Machine**: A 5-step wizard experience:
  1. **Preview Step (`preview`)**: Camera view crop hair-lines guide and start CTA.
  2. **Capture Step (`capture`)**: Simulated automated capture sequence with visual flash backdrop triggers.
  3. **Selection Step (`select`)**: 8 mock grid photos allowing selecting exactly 4 frames in tap-badge order.
  4. **Editor Step (`editor`)**: Layout switches (Vertical Strip vs 2x2 Square Grid), frame presets, and custom CSS color templates/filters.
  5. **Result Step (`result`)**: physical printed photo rotation sheet and format grids with download toasts.
- **Architectural Data Models**:
  - `src/types/booth.ts`: Captures step routes, photo layouts, aspect-ratio crops, and placement mappings.
  - `src/types/frames.ts`: Configures slots, coordinate matrices, backgrounds, and template outlines.
- **Design Tokens (`DESIGN.md`)**: Configured via Tailwind, introducing minimal paper surfaces, soft low-contrast lines, spacious padding, and fully rounded elements.

---

## What is Mocked in Phase 1

- **Camera Capture**: Hardware webcam access is disabled. Capture sequence uses auto-advancing timers that consume pre-defined high-quality local vector-art (SVG pose outlines) as fake photos.
- **Canvas Collages**: collages are rendered directly via HTML and CSS inside the DOM preview container. Canvas generation is simulated.
- **Downloads & Sharing**: Clicking download formats (Strip, Square, Video, GIF) and share triggers a simulated minimal toast description indicating scheduled canvas actions.
- **Media Crop & Adjustment**: Default 3:4 portrait crop values are mapped programmatically; manual reposition controls are disabled.

---

## Known Limitations

- **No Persistence**: Exiting or reloading the browser resets the photobooth step flow and clears selected/captured mock state.
- **No Native Camera API**: The camera preview displays an active animated indicator, but does not bind to `getUserMedia` camera streams.

---

## Recommended Phase 2 Tasks

1. **Hardware Integration**:
   - Bind the camera preview to browser `navigator.mediaDevices.getUserMedia` video elements.
   - Replace vector SVGs in the capture buffer with high-quality base64 frames captured from the video element canvas stream.
2. **Canvas Collating & Exports**:
   - Implement a background canvas compositor to stitch selected photos, frame borders, overlay textures, and watermark logos at target resolutions (1200x3600px for strips, 2000x2000px for squares).
   - Enable triggers for downloading the generated PNGs/JPEGs.
3. **Timelapse Video / GIF Recording**:
   - Integrate a frame buffer recorder (`MediaRecorder` or `gif.js` script) to capture frames during the countdown sequence and export a timelapse loop.
4. **Web Share API**:
   - Integrate the native `navigator.share` system to share generated collages.
