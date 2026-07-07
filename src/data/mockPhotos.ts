import { CapturedPhoto } from '../types/booth';

// Generates SVG data URLs representing high-end minimalist photobooth poses.
const generateMockSvgSrc = (index: number, poseName: string, bgColor: string, textColor: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
      <!-- Background -->
      <rect width="600" height="800" fill="${bgColor}"/>
      
      <!-- Studio Lights Overlay (radial gradients for soft depth) -->
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <rect width="600" height="800" fill="url(#glow)"/>
      
      <!-- Minimalist Silhouette / Pose Representation -->
      <g transform="translate(150, 220)" stroke="${textColor}" stroke-width="2" fill="none" opacity="0.3">
        <!-- Head -->
        <circle cx="150" cy="120" r="60" />
        <!-- Shoulders / Torso -->
        <path d="M 50,320 C 50,220 250,220 250,320" />
        <!-- Pose specifics based on index -->
        ${
          index === 0 ? '<path d="M 120,130 Q 150,160 180,130" stroke-width="3" />' : // Smile
          index === 1 ? '<path d="M 110,120 Q 130,100 130,120 M 170,120 Q 170,100 190,120" stroke-dasharray="4 4" />' : // Wink
          index === 2 ? '<path d="M 150,60 L 150,30 M 130,50 L 150,30 L 170,50" />' : // Crown hands
          index === 3 ? '<rect x="135" y="105" width="30" height="20" rx="3" />' : // Sunglasses
          index === 4 ? '<path d="M 120,130 C 130,120 170,120 180,130 Q 150,150 120,130 Z" fill="none" />' : // Open smile
          index === 5 ? '<circle cx="150" cy="180" r="10" />' : // Surprised
          index === 6 ? '<path d="M 100,100 L 200,100" />' : // Cool glasses
          '<path d="M 100,130 Q 150,110 200,130" />' // Pout
        }
      </g>

      <!-- Pose Label / Index -->
      <text x="300" y="550" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="600" fill="${textColor}" letter-spacing="0.1em" text-anchor="middle" opacity="0.7">
        POSE 0${index + 1}
      </text>
      <text x="300" y="590" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="400" fill="${textColor}" letter-spacing="0.05em" text-anchor="middle" opacity="0.4">
        "${poseName}"
      </text>

      <!-- Watermark -->
      <text x="300" y="740" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="500" fill="${textColor}" letter-spacing="0.2em" text-anchor="middle" opacity="0.25">
        LUNAGI STUDIOS
      </text>

      <!-- Tech border overlay -->
      <rect x="20" y="20" width="560" height="760" fill="none" stroke="${textColor}" stroke-width="1" opacity="0.05"/>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

const poses = [
  { name: 'Gently Smiling', bg: '#FDF8F8', text: '#1C1B1B' },
  { name: 'Playful Wink', bg: '#F9F5F5', text: '#313030' },
  { name: 'Peace Sign', bg: '#FAF6F6', text: '#1C1B1B' },
  { name: 'Editorial Look', bg: '#F2EDED', text: '#444748' },
  { name: 'Cute Hearts', bg: '#EBE7E6', text: '#1C1B1B' },
  { name: 'Looking Away', bg: '#F9F3F2', text: '#5F5E5E' },
  { name: 'Cool Silhouette', bg: '#FAF9F6', text: '#1A1A1A' },
  { name: 'Big Laugh', bg: '#E5E2E1', text: '#1C1B1B' },
];

export const generateMockPhotos = (): CapturedPhoto[] => {
  const timestamp = Date.now();
  return poses.map((pose, idx) => ({
    id: `mock-photo-${idx}-${timestamp}`,
    src: generateMockSvgSrc(idx, pose.name, pose.bg, pose.text),
    capturedAt: timestamp + idx * 3000,
    crop: {
      x: 0,
      y: 0,
      width: 600,
      height: 800,
      aspectRatio: '3:4',
    },
  }));
};
