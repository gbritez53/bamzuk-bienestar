---
name: Minimalist Apothecary
colors:
  surface: '#f5fbf0'
  surface-dim: '#d6dcd2'
  surface-bright: '#f5fbf0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5eb'
  surface-container: '#eaf0e5'
  surface-container-high: '#e4eadf'
  surface-container-highest: '#dee4da'
  on-surface: '#171d17'
  on-surface-variant: '#40493b'
  inverse-surface: '#2c322b'
  inverse-on-surface: '#edf3e8'
  outline: '#707a69'
  outline-variant: '#c0cab6'
  surface-tint: '#1d6d00'
  primary: '#1d6d00'
  on-primary: '#ffffff'
  primary-container: '#66b949'
  on-primary-container: '#0f4600'
  inverse-primary: '#86db66'
  secondary: '#51634e'
  on-secondary: '#ffffff'
  secondary-container: '#d1e6cb'
  on-secondary-container: '#556852'
  tertiary: '#5b5f5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#a3a7a3'
  on-tertiary-container: '#383c39'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a1f87f'
  primary-fixed-dim: '#86db66'
  on-primary-fixed: '#042100'
  on-primary-fixed-variant: '#145200'
  secondary-fixed: '#d3e8ce'
  secondary-fixed-dim: '#b8ccb3'
  on-secondary-fixed: '#0f1f0f'
  on-secondary-fixed-variant: '#394b38'
  tertiary-fixed: '#e0e3df'
  tertiary-fixed-dim: '#c4c7c3'
  on-tertiary-fixed: '#191c1a'
  on-tertiary-fixed-variant: '#444844'
  background: '#f5fbf0'
  on-background: '#171d17'
  surface-variant: '#dee4da'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is rooted in the "Minimalist Apothecary" aesthetic—a fusion of clinical precision and organic warmth. It targets health-conscious consumers seeking clarity and tranquility in their wellness journey. The visual language is defined by vast white space, airy compositions, and a high-end editorial feel that avoids the clutter typical of traditional e-commerce. 

The emotional response is one of "Atmospheric Calm." By utilizing a restrained palette and sophisticated typography, the UI establishes immediate trust and authority while remaining approachable and natural. It prioritizes content legibility and breathability, ensuring the user feels unhurried and supported throughout the shopping experience.

## Colors

The palette is derived from the lush, vibrant green of the brand identity, balanced by desaturated botanical tones.

*   **Primary (Fresh Green):** Used strategically for calls to action, active states, and brand-critical highlights. It represents vitality and growth.
*   **Secondary (Sage):** A muted, earthy green used for secondary UI elements, icons, and subtle backgrounds to provide depth without visual noise.
*   **Surface (Off-White/Bone):** The primary background color is not a pure white but a very soft, warm neutral to reduce eye strain and enhance the organic feel.
*   **Neutral (Deep Forest):** A very dark green-grey used for typography and structural borders to maintain high contrast while remaining softer than pure black.

## Typography

This design system utilizes **Plus Jakarta Sans** exclusively to maintain a modern, clean, and optimistic tone. The typeface's geometric clarity and open counters mirror the brand's transparency.

*   **Headlines:** Large scale with tight letter-spacing for a confident, editorial presence. On mobile, the largest scales are reduced to maintain readability within the viewport.
*   **Body:** Generous line-heights are employed to ensure the "Apothecary" feel—airy, legible, and scholarly.
*   **Labels:** Small caps with increased tracking are used for categories and metadata to create a clear visual hierarchy against body text.

## Layout & Spacing

The system follows a **Fluid Grid** model with high horizontal margins to create the "Minimalist" centered focus. 

*   **Desktop:** 12-column grid with a max-width of 1280px. Large 80px (xl) vertical sections provide significant breathing room between product categories.
*   **Mobile:** 4-column grid with 16px margins. Padding is prioritized over borders to separate content.
*   **Rhythm:** An 8px baseline grid ensures consistent vertical alignment. Components should favor `md` (24px) padding to maintain the spacious aesthetic.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Soft Ambient Shadows**. 

*   **Surfaces:** The primary background is the warm off-white. Secondary surfaces (cards, sidebars) use the very light Tertiary green/grey to create subtle "sunken" or "raised" effects without harsh lines.
*   **Shadows:** Extremely soft, diffused shadows are used only for interactive floating elements (modals, dropdowns, hovered product cards). Use a Y-offset of 4px-8px with a 24px blur and a 4% opacity tint of the Primary color to maintain a natural, non-digital look.
*   **Outlines:** For input fields and inactive states, use 1px solid borders in the Secondary Sage color at 20% opacity.

## Shapes

The shape language is "Organic Geometric." Following the 12px (0.75rem) standard requested, the system uses soft but defined corners that bridge the gap between medical precision and nature's curves.

*   **Standard (0.5rem / 8px):** Used for small components like inputs and checkboxes.
*   **Large (1rem / 16px):** Used for product cards, image containers, and primary buttons.
*   **Extra Large (1.5rem / 24px):** Used for promotional banners and large layout containers.

## Components

*   **Buttons:** Primary buttons are solid Primary Green with white text and 12px rounded corners. Secondary buttons use a Sage outline. All buttons feature a 24px horizontal padding to appear wide and stable.
*   **Product Cards:** Cards have no borders; depth is suggested by the Tertiary surface color. On hover, the card scales slightly (1.02x) and gains a soft ambient shadow.
*   **Input Fields:** Ghost-style inputs with a subtle Sage border. Focus states transition the border to solid Primary Green with a 2px glow of the same color at 10% opacity.
*   **Chips/Tags:** Used for "Vegan," "Organic," or "Gluten-Free" labels. These use the `label-caps` typography and a light Secondary background with 32px (pill) rounding.
*   **Lists:** Minimalist lists with 16px vertical spacing. Icons are monolinear and use the Secondary Sage color.
*   **Navigation:** A transparent or Off-White sticky header with a centered logo. Navigation links use `body-sm` with a Primary Green dot appearing under active items.