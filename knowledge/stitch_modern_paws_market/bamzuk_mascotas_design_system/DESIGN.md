---
name: Bamzuk Mascotas Design System
colors:
  surface: '#f1fbff'
  surface-dim: '#d1dce0'
  surface-bright: '#f1fbff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf5fa'
  surface-container: '#e4f0f4'
  surface-container-high: '#dfeaef'
  surface-container-highest: '#d9e4e9'
  on-surface: '#131d21'
  on-surface-variant: '#4d4636'
  inverse-surface: '#283236'
  inverse-on-surface: '#e7f3f7'
  outline: '#7f7664'
  outline-variant: '#d0c5b1'
  surface-tint: '#755b00'
  primary: '#755b00'
  on-primary: '#ffffff'
  primary-container: '#f6cf65'
  on-primary-container: '#715700'
  inverse-primary: '#e8c25a'
  secondary: '#586062'
  on-secondary: '#ffffff'
  secondary-container: '#dae1e3'
  on-secondary-container: '#5d6466'
  tertiary: '#5f5e5a'
  on-tertiary: '#ffffff'
  tertiary-container: '#d5d3cd'
  on-tertiary-container: '#5b5b56'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf90'
  primary-fixed-dim: '#e8c25a'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#dde4e6'
  secondary-fixed-dim: '#c1c8ca'
  on-secondary-fixed: '#161d1f'
  on-secondary-fixed-variant: '#41484a'
  tertiary-fixed: '#e5e2dc'
  tertiary-fixed-dim: '#c9c6c1'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#474743'
  background: '#f1fbff'
  on-background: '#131d21'
  surface-variant: '#d9e4e9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
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

The brand personality is warm, reliable, and energetic, specifically tailored for pet owners who view their animals as family members. This design system balances the excitement of pet ownership with the professional rigor of a high-end e-commerce platform.

The visual style is **Corporate / Modern** with a **Playful** twist. It utilizes generous whitespace, soft UI elements, and a vibrant yellow primary color to create an atmosphere that is both inviting and trustworthy. The interface remains clean and uncluttered to ensure that product photography remains the primary focus, while rounded corners and soft shadows inject a sense of friendliness and "tactile" comfort.

## Colors

The palette is anchored by the signature yellow from the logo, used strategically for action-oriented elements.

- **Primary (#F6CF65):** Used for primary buttons, highlighted categories, and promotional banners. It represents the "sunny" personality of the brand.
- **Secondary (#2D3436):** A deep charcoal used for high-contrast typography and iconography to ensure professional readability.
- **Tertiary (#F9F6F0):** A warm off-white used for section backgrounds and card surfaces to prevent visual fatigue caused by pure white.
- **Neutral (#636E72):** A balanced grey for secondary text, borders, and disabled states.

The system is designed for a **light mode** experience to maintain a clean, "fresh" retail environment.

## Typography

This design system uses two complementary sans-serifs to achieve a balance between character and clarity.

**Plus Jakarta Sans** is the headline face. Its slightly rounded terminals and geometric structure feel modern and optimistic. It should be used for all headings and price displays.

**Be Vietnam Pro** serves as the workhorse body font. It offers exceptional legibility at small sizes, making it ideal for product descriptions, reviews, and checkout forms.

- **Emphasis:** Use SemiBold (600) for sub-headers and Bold (700) for primary headlines. 
- **Readability:** Maintain a line height of 1.5x for body text to ensure a comfortable reading rhythm during long browsing sessions.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum content width of 1280px.

- **Desktop:** 12-column grid with 24px gutters. Use wide 64px outer margins to give the content room to "breathe," reinforcing the premium feel.
- **Mobile:** 4-column grid with 16px gutters and margins. Content should be stacked vertically, utilizing horizontal scrolling for product carousels to maximize vertical screen real estate.

Spacing follows an 8px base unit. Internal component padding should favor the "MD" (24px) unit for a spacious, open feel that mimics a physical boutique.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**.

- **Surfaces:** Use the Tertiary color (#F9F6F0) for the main page background and pure white (#FFFFFF) for interactive cards and containers. This creates a subtle lift without needing heavy borders.
- **Shadows:** Apply very soft, diffused shadows to "floating" elements like product cards and navigation bars. Use a shadow color with a hint of the primary yellow (e.g., `rgba(246, 207, 101, 0.1)`) to keep the depth feeling warm and integrated rather than grey and cold.
- **Interactions:** On hover, cards should slightly lift (move -4px on the Y-axis) and the shadow should increase in diffusion, providing tactile feedback to the user.

## Shapes

The shape language is consistently **Rounded**, mirroring the friendly curves of the logo's "mascotas" script.

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Product cards and promotional banners use `rounded-lg` (1rem / 16px).
- **Specialty:** Badges (e.g., "Sale" or "New") and the "Add to Cart" fab should use `rounded-xl` or full pill shapes to stand out as distinct, friendly call-outs.

## Components

### Buttons
- **Primary:** Solid Primary Yellow (#F6CF65) with Secondary (#2D3436) text. High contrast is essential for the "Buy" trigger.
- **Secondary:** Outline style with a 2px border in Primary Yellow.
- **Ghost:** No background, Secondary text, used for less critical actions like "View More Details."

### Cards
Product cards should have a pure white background, a 16px corner radius, and a soft ambient shadow. The product image should be centered with a subtle light grey background to normalize various image aspect ratios.

### Input Fields
Inputs use a light grey background and a 1px border that turns Primary Yellow on focus. Use Be Vietnam Pro for placeholder text to maintain the clean, approachable look.

### Chips & Tags
Used for categories (e.g., "Dog," "Cat," "Health"). These should be pill-shaped with a light tint of the primary color and dark text.

### Progress Indicators
For the checkout flow, use a simplified stepper with rounded nodes and a yellow progress bar to keep the user encouraged and informed.