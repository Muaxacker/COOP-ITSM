---
name: BankCare Dark High-Contrast
colors:
  surface: '#1c1f26'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c6c6cb'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#909095'
  outline-variant: '#45474b'
  surface-tint: '#c4c6cf'
  primary: '#c4c6cf'
  on-primary: '#2e3037'
  primary-container: '#0b0e14'
  on-primary-container: '#797b83'
  inverse-primary: '#5c5e66'
  secondary: '#84d5cc'
  on-secondary: '#003733'
  secondary-container: '#006861'
  on-secondary-container: '#92e3da'
  tertiary: '#c4c6d0'
  on-tertiary: '#2d3038'
  tertiary-container: '#0b0e15'
  on-tertiary-container: '#787b84'
  error: '#ff897d'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e2eb'
  primary-fixed-dim: '#c4c6cf'
  on-primary-fixed: '#191c22'
  on-primary-fixed-variant: '#44474e'
  secondary-fixed: '#a0f1e8'
  secondary-fixed-dim: '#84d5cc'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#e0e2ec'
  tertiary-fixed-dim: '#c4c6d0'
  on-tertiary-fixed: '#191c22'
  on-tertiary-fixed-variant: '#44474e'
  background: '#0b0e14'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
  text-primary: '#f7f9fc'
  text-secondary: '#94a3b8'
  border-subtle: '#2d333d'
  accent-teal: '#00a399'
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
  header-xl-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
This design system transition brings a high-contrast, professional, and secure atmosphere to the product's digital identity. It evolves the brand from a traditional light-mode banking experience into a sophisticated, "fintech-forward" dark environment. 

The aesthetic is **Corporate / Modern** with a focus on data density and clarity. By utilizing a deep charcoal base and slate-toned containers, the system minimizes eye strain during prolonged financial management tasks while maintaining a premium feel. The interface prioritizes clear information hierarchy through careful use of luminescence rather than saturated colors, ensuring that users feel a sense of control and reliability.

## Colors
The palette is built upon a high-contrast dark foundation to maximize legibility. 

- **Background & Surface:** The base uses a Deep Navy/Charcoal (#0b0e14). Surface containers transition to a Slate Gray (#1c1f26) to create a clear visual distinction for cards and modals.
- **Typography:** Primary information uses an Off-white (#f7f9fc) to ensure maximum contrast ratios. Secondary or metadata uses Muted Gray (#94a3b8) to reduce visual noise.
- **Interactive Accents:** The signature Teal has been shifted slightly toward a more luminous shade (#00a399) when used on dark backgrounds to ensure it meets WCAG AA accessibility standards for interactive elements and iconography.
- **Borders:** Borders use a subtle Slate (#2d333d) to define structure without creating harsh outlines.

## Typography
The system utilizes **Inter** exclusively to maintain a highly legible, utilitarian feel suitable for complex financial data. 

To maintain readability against the dark background, font weights remain slightly heavier for headers to prevent "bleeding" or light-on-dark glow effects. Body text uses a standard weight but relies on the `text-primary` off-white color to ensure crispness. For mobile views, the `header-xl-mobile` scale ensures that large headlines do not break layout while maintaining the necessary prominence for banking dashboard views.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop dashboards to ensure data columns remain predictable and scannable. 

- **Grid:** A 12-column grid is used for the main content area with a 24px gutter.
- **Sidebar:** A fixed 280px sidebar houses the primary navigation, providing a consistent anchor for the user.
- **Responsive Behavior:** On tablet and mobile devices, the layout shifts to a fluid model with 16px margins.
- **Vertical Rhythm:** Spacing is managed via a "stack" system, using multiples of 4px and 8px to ensure tight, logical grouping of financial line items and form fields.

## Elevation & Depth
In this high-contrast dark mode, depth is conveyed through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Layering:** The primary background sits at the lowest level. Surface containers (#1c1f26) are placed on top to represent cards and content sections.
- **Outlines:** To define interactive elements like input fields and buttons, a subtle 1px border (#2d333d) is used.
- **Interaction Elevation:** When an element is hovered or active, its background color shifts slightly lighter (using a 5% opacity white overlay) rather than increasing shadow size, maintaining a flat, professional aesthetic.

## Shapes
The design system uses a **Rounded** shape language to soften the high-contrast color palette, making the interface feel more approachable.

Standard components like buttons and inputs utilize a 0.5rem (8px) radius. Larger layout containers and cards utilize a 1rem (16px) radius to create a distinct visual "nesting" effect. This consistent application of rounded corners balances the "serious" nature of the dark fintech aesthetic with modern user-friendly characteristics.

## Components
- **Buttons:** Primary buttons use the accent teal (#00a399) with white text. Secondary buttons use the slate border (#2d333d) with the off-white text.
- **Input Fields:** Backgrounds are slightly darker than the surface color to create an "inset" look, using the slate border for definition. Focus states use a 2px teal glow.
- **Cards:** Use the surface color (#1c1f26) with a subtle slate border. Card headers should use the `header-lg` typography style.
- **Chips/Status Tags:** Use low-saturation backgrounds (e.g., dark green for "Success") with high-saturation text to ensure legibility without being overly distracting.
- **Data Lists:** Use subtle 1px slate dividers between rows. Zebra striping is discouraged; use hover states to highlight rows instead.
- **Navigation:** The sidebar uses a deep charcoal background with muted gray text for inactive links and off-white text with a teal vertical indicator for active states.