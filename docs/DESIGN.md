---
name: LUNAGI STUDIOS
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfde'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#231820'
  on-tertiary-container: '#907f8a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c7c6c5'
  on-secondary-fixed: '#1b1c1b'
  on-secondary-fixed-variant: '#464746'
  tertiary-fixed: '#f1dde9'
  tertiary-fixed-dim: '#d5c1cd'
  on-tertiary-fixed: '#231820'
  on-tertiary-fixed-variant: '#51434c'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0em
  wordmark:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.15em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style
The design system is rooted in a **Minimalist / Editorial** aesthetic with a Korean "self-studio" influence. The brand personality is calm, refined, and effortlessly chic, balancing high-fashion monochrome with soft, "cute" pastel accents. It targets an audience that values aesthetic documentation, social sharing, and intentional design.

The visual mood is defined by:
- **Spaciousness:** Ample breathing room to let high-quality photography stand out.
- **Modernity:** A clean, systematic approach to typography and layout.
- **Softness:** Subtle warm tones and rounded corners to avoid feeling cold or clinical.

## Colors
This design system uses a monochrome foundation with functional pastels.

- **Primary:** High-contrast black for text and primary actions.
- **Surface:** A warm off-white that adds depth and comfort compared to pure white.
- **Accents:** Soft Pink, Blue, and Lavender are used sparingly for active states, tags, or categorized content to maintain a "soft-cute" feeling without overwhelming the editorial tone.
- **Neutral:** Muted grays are used for secondary information and light borders to define structure subtly.

## Typography
The typography system uses **Inter** to ensure a contemporary and highly legible experience.

- **The Wordmark:** Specifically set in uppercase with increased tracking (`0.15em`) to create an elegant, airy brand presence.
- **Headings:** Utilize tighter letter-spacing and substantial line heights to maintain an editorial feel.
- **Body Text:** Designed with generous line-heights (`1.6`) to improve readability and reinforce the "spacious" brand quality.
- **Labels:** Used for chips, buttons, and metadata, often employing uppercase for a refined, organized look.

## Layout & Spacing
The design system follows a **Fluid Grid** model with high margins to create an editorial frame around the content.

- **Grid:** A 12-column layout for desktop and 4-column for mobile.
- **Margins:** Intentional "dead space" is encouraged. Desktop layouts should use a minimum of 64px side margins.
- **Spacing Rhythm:** Based on a 4px scale. Components should prioritize large internal padding (e.g., `24px` or `32px`) to emphasize the "spacious" requirement.
- **Media:** Photography is the hero. Images should span multiple columns and use large aspect ratios (e.g., 4:5 or 2:3) to mimic physical photo strips.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surfaces:** The background is pure white (#FFFFFF), while interactive or nested containers use the warm surface color (#FDFBFA).
- **Outlines:** Borders are the primary tool for separation. Use a thin 1px border in #E5E5E5.
- **Shadows:** When necessary for cards or floating menus, use an "Ambient Shadow": very low opacity (3-5%), large blur (20-30px), and a slight warm tint to match the surface color. Avoid "hard" shadows.

## Shapes
The shape language is consistently **Rounded**, leaning towards a soft but structured appearance.

- **Standard Elements:** Buttons, cards, and input fields use a `0.5rem` (8px) to `0.75rem` (12px) radius.
- **Pill Shapes:** Primarily reserved for "Primary Buttons" and "Active Chips" to create a distinct visual hierarchy.
- **Media:** Images should mirror the container roundedness (typically 12px or 16px) to maintain the soft-cute aesthetic.

## Components
- **Primary Button:** Solid #1A1A1A fill with #FFFFFF text. Shape is always a full pill. No shadow.
- **Secondary Button:** Ghost style with a 1px #E5E5E5 border and #1A1A1A text. Subtle hover state transitions to the warm surface color (#FDFBFA).
- **Chips:** Used for filtering and selection. 
    - *Inactive:* Light gray border, no fill.
    - *Active:* Solid pastel fill (Pink, Blue, or Lavender) with #1A1A1A text.
- **Cards:** Use #FDFBFA background with a 1px #E5E5E5 border. Padding should be generous (24px+).
- **Inputs:** Minimalist style. No background fill (transparent), 1px bottom border only, or a subtle all-around border in #E5E5E5.
- **Photo Previews:** Large, high-quality slots with 16px rounded corners. Often grouped in vertical "strips" to evoke the photobooth experience.