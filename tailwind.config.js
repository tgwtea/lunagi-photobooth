/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f3",
        "inverse-on-surface": "#f2f0f0",
        "on-primary-fixed-variant": "#474746",
        "on-tertiary-fixed-variant": "#51434c",
        "surface": "#fbf9f9",
        "on-secondary-fixed-variant": "#464746",
        "on-tertiary": "#ffffff",
        "error-container": "#ffdad6",
        "surface-tint": "#5f5e5e",
        "surface-container-highest": "#e3e2e2",
        "outline": "#747878",
        "on-secondary": "#ffffff",
        "primary-fixed": "#e5e2e1",
        "on-secondary-container": "#626262",
        "primary-fixed-dim": "#c8c6c5",
        "tertiary": "#000000",
        "background": "#fbf9f9",
        "on-primary-fixed": "#1c1b1b",
        "secondary": "#5e5e5e",
        "on-secondary-fixed": "#1b1c1b",
        "surface-container": "#efeded",
        "on-error": "#ffffff",
        "on-primary": "#ffffff",
        "surface-container-high": "#e9e8e7",
        "inverse-surface": "#303031",
        "surface-dim": "#dbdad9",
        "error": "#ba1a1a",
        "on-background": "#1b1c1c",
        "on-tertiary-container": "#907f8a",
        "secondary-container": "#e1dfde",
        "on-primary-container": "#858383",
        "secondary-fixed-dim": "#c7c6c5",
        "inverse-primary": "#c8c6c5",
        "on-surface": "#1b1c1c",
        "secondary-fixed": "#e4e2e1",
        "surface-bright": "#fbf9f9",
        "on-tertiary-fixed": "#231820",
        "tertiary-fixed": "#f1dde9",
        "tertiary-container": "#231820",
        "primary-container": "#1c1b1b",
        "primary": "#1A1A1A", // standard K-Photo dark primary
        "surface-variant": "#e3e2e2",
        "outline-variant": "#e5e5e5", // soft borders from design.md
        "on-surface-variant": "#444748",
        "tertiary-fixed-dim": "#d5c1cd",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "64px",
        "gutter": "24px",
        "margin-mobile": "20px",
        "unit": "4px",
        "container-max": "1280px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
