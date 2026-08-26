---
name: BankCare
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#44474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4e6077'
  primary: '#00050e'
  on-primary: '#ffffff'
  primary-container: '#0b1f33'
  on-primary-container: '#7587a0'
  inverse-primary: '#b5c8e3'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#000315'
  on-tertiary: '#ffffff'
  tertiary-container: '#001950'
  on-tertiary-container: '#4c7eff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b5c8e3'
  on-primary-fixed: '#081d30'
  on-primary-fixed-variant: '#36485e'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  brand-display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  header-xl:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  header-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  header-xl-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  sidebar-width: 280px
  gutter: 24px
  margin-mobile: 16px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for the fintech sector, prioritizing trust, clarity, and structural integrity. It employs a **Modern Corporate** aesthetic with **Minimalist** leanings, ensuring that complex financial data remains legible and actionable. 

The visual narrative is driven by high-contrast structural elements—specifically a deep navy sidebar and navigation—contrasted against a soft, breathable workspace. The emotional response is one of calm authority; it feels reliable like a traditional bank but moves with the speed of a modern SaaS platform.

## Colors
The palette is anchored by **Deep Navy**, used for high-level structural components to establish a firm frame for the application. **Teal** serves as the functional accent, reserved strictly for interactive elements and positive progress. 

Surface colors utilize a tiered gray scale to separate the navigation layer (Navy) from the application canvas (Soft Gray) and the content layer (White). Status colors are calibrated for high legibility against white backgrounds, ensuring critical financial alerts are immediately recognizable.

## Typography
The design system exclusively utilizes **Inter**, a typeface designed for user interfaces. Its high x-height and systematic weight distribution ensure numerical data remains clear at small sizes. 

- **Headlines:** Use tight letter spacing for a modern, executive feel.
- **Body:** Standardized at 14px for density, allowing for data-heavy dashboards without overwhelming the user.
- **Hierarchy:** Contrast is created through weight shifts (Semibold to Regular) rather than dramatic size shifts, maintaining a restrained, professional tone.

## Layout & Spacing
This design system employs a **Fixed-Fluid Hybrid** grid. The primary navigation is a fixed-width sidebar (Deep Navy), while the main content area is a fluid 12-column grid that scales to a maximum width of 1440px.

- **Desktop:** 24px gutters and margins provide significant "air" between financial modules.
- **Mobile:** The sidebar collapses into a bottom bar or hamburger menu; margins reduce to 16px to maximize horizontal space for data tables.
- **Rhythm:** All vertical spacing follows an 8px base unit to ensure consistent alignment of form fields and button groups.

## Elevation & Depth
Depth is conveyed through **Low-contrast outlines** combined with a single, highly-diffused shadow style. 

- **Level 0 (Canvas):** The #F7F9FC background.
- **Level 1 (Cards/Modules):** White background, #E2E8F0 1px solid border, and a subtle "Soft Drop" shadow (y: 2px, blur: 4px, color: rgba(11, 31, 51, 0.04)).
- **Level 2 (Dropdowns/Modals):** White background, #E2E8F0 1px solid border, and a "Focused" shadow (y: 8px, blur: 16px, color: rgba(11, 31, 51, 0.08)).

This approach avoids heavy skeuomorphism, opting for a flat, layered look that feels "anchored" to the page.

## Shapes
The shape language is professional and approachable. A consistent **0.5rem (8px) to 0.75rem (12px)** corner radius is applied to all primary containers.

- **Small Components (Buttons, Inputs):** 8px radius.
- **Medium Components (Cards, Modals):** 12px radius.
- **Strictness:** Do not use fully rounded "pill" shapes for buttons; maintain the 8px radius to preserve the structured, fintech architectural feel.

## Components
- **Buttons:** Primary buttons use the Teal (#0F766E) background with white text. Secondary buttons use a White background with the Navy (#0B1F33) border and text.
- **Cards:** Essential for the dashboard. Must use the defined 12px radius, white fill, and 1px #E2E8F0 border. Headers within cards should have a subtle bottom border to separate titles from content.
- **Input Fields:** 14px text, 8px radius, with a 1px #E2E8F0 border. On focus, the border transitions to Teal (#0F766E) with a subtle outer glow.
- **Status Badges (Chips):** Use a low-opacity tint of the status color for the background (10-15%) and the full-saturation status color for the text (e.g., Green text on light green background).
- **Navigation Sidebar:** The Deep Navy (#0B1F33) background should use a slightly lighter navy (#162D45) for hover states and Teal (#0F766E) for the "active" indicator (usually a 4px vertical bar on the left edge).
- **Data Tables:** Use 14px Regular text. Row separators should be 1px #F1F5F9. Header rows should have a Soft Gray (#F7F9FC) background.