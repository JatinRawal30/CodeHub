---
name: Alabaster Dev Platform
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style

This design system targets software engineers, systems architects, and technical leaders who demand density, precision, and aesthetic discipline without eye fatigue. It rejects the sterile, high-glare "hospital white" of legacy enterprise utilities in favor of an ambient, layered ivory-and-slate canvas.

The aesthetic fuses **Precision Minimalism** with **Tactile Developer Craftsmanship**, echoing the refined finishes of Linear, Raycast Light, and Stripe:
- **Canvas Temperature:** Warm porcelain, soft alabaster, and light slate tints provide a soothing foundation for sustained focus during code reviews, contest runs, and schema modeling.
- **Purposeful Color Density:** Vibrant functional pigments—indigo-violet, crisp emerald, warm amber, and rose-coral—serve strictly as semantic indicators and focal anchors, never superficial decoration.
- **Restraint & Polish:** Crisp sub-pixel structural borders, micro-radii, and monospaced data anchors create an unmistakable atmosphere of technical maturity, rigor, and speed.

## Colors

The palette balances soft off-white surface layers with high-potency functional accents.

### Palette Architecture
- **Primary (`#4f46e5` / `#6366f1`):** Electric indigo-violet used for key interactions, primary action buttons, active navigation markers, and focus rings.
- **Secondary (`#059669` / `#10b981`):** Emerald/teal signifying success, "Easy" difficulty classifications, high test coverage, and accepted runtime submissions.
- **Tertiary (`#f59e0b`):** Warm amber designating pending state, "Medium" problem classification, deprecation warnings, and live contest timers.
- **Rose-Coral Accent (`#f43f5e`):** Reserved for "Hard" benchmark challenges, fatal build errors, broken builds, and destructive actions.
- **Neutral Core (`#64748b`):** Cool slate used for secondary labels, subtle borders, and structural framing.

### Surface Canvas Hierarchy
Never deploy `#ffffff` globally across full canvases. Establish depth using three layered tints:
1. **Base Foundation (`#f8fafc` / `#f1f5f9`):** The default window canvas, background canvas, and navigation rail background.
2. **Elevated Surface (`#ffffff`):** Work surfaces, code execution cards, table bodies, and modal dialogs.
3. **Surface Containers & Tints (`indigo-50` `#eef2ff`, `emerald-50` `#ecfdf5`, `amber-50` `#fffbeb`, `rose-50` `#fff1f2`): Subtle tinted backdrops for active filters, alert bars, badge pills, and monospaced code chips.

## Typography

Typography pairs **Geist** for clean, geometric UI text with **JetBrains Mono** for code fragments, runtime logs, metric badges, and keyboard shortcuts.

### Implementation Rules
- **Tabular Figures:** Enable tabular figures (`font-variant-numeric: tabular-nums`) on all monospaced elements, test durations, and leaderboard ranks to eliminate visual jitter during real-time updates.
- **Uppercase Micro-Labels:** `label-caps` is styled with uppercase transform (`text-transform: uppercase`) exclusively for section dividers, table headers, and category tags.
- **Readability Contrast:** Headings use deep slate-black (`#0f172a`), standard body copy uses neutral slate (`#334155`), and supportive metadata uses balanced slate (`#64748b`).

## Layout & Spacing

The layout model emphasizes high information density while safeguarding breathing room around complex editor panes and analytical data displays.

### Layout Philosophy
- **Responsive Hybrid Grid:** A desktop 12-column layout transitioning to a 4-column structure on mobile devices.
- **Fixed/Fluid Mixed Panes:** Developer consoles employ a fixed-width left rail (240px–280px), a flexible primary workspace (fluid, minimum 600px), and an optional collapsible inspection drawer (320px–380px).
- **Rhythm:** Component gaps and interior card paddings conform to a 4px sub-grid baseline. Dense toolbars rely on `space-xs` (4px) and `space-sm` (8px), while dashboard cards and panels use `space-lg` (16px) or `space-xl` (24px).

## Elevation & Depth

Visual depth avoids heavy drop shadows, instead using micro-borders, translucent fills, and tinted ambient diffusion.

### Elevation Layers
1. **Level 0 (Flat / Canvas):** `#f8fafc` or `#f1f5f9` with no border or shadow. Used for window underlays and inactive panels.
2. **Level 1 (Card / Rest):** `#ffffff` surface, framed by a 1px solid border in slate-200/60 (`rgba(226, 232, 240, 0.8)`). Finished with a soft ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
3. **Level 2 (Hover / Active Pane):** Raised panels use a sharper 1px border (`#cbd5e1`) paired with an indigo-tinted shadow: `0 4px 12px -2px rgba(79, 70, 229, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`.
4. **Level 3 (Overlays, Menus & Command Palette):** `#ffffff` with frosted edge treatment (`backdrop-filter: blur(8px)`), framed with a distinct slate border (`#cbd5e1`), and elevated via: `0 12px 28px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)`.

### Border Integration
Borders remain essential. All white cards resting on soft off-white canvases must feature a crisp 1px structural outline to preserve shape definition across varying displays.

## Shapes

This design system uses **Soft (`1`)** geometry:
- **Base Elements (`rounded`, 0.25rem / 4px):** Code snippets, inline tags, dropdown items, table row highlights, and micro-badges.
- **Interactive Controls (`rounded-md`, 0.375rem / 6px):** Buttons, text inputs, segmented controls, tabs, and popovers.
- **Containers (`rounded-lg`, 0.5rem / 8px):** Code editor containers, analytical cards, modal windows, and terminal panels.
- **Pill Exception (`rounded-full`):** Reserved solely for status dots, user avatars, and standalone numeric counters.

## Components

### Buttons
- **Primary:** Solid `#4f46e5` fill, `#ffffff` text, 1px border in `#4338ca`. Hover: `#4338ca`. Focus-visible: 2px offset ring in `#6366f1`.
- **Secondary:** `#ffffff` surface, `#0f172a` text, 1px border in `#cbd5e1`. Hover: `#f8fafc` background with `#94a3b8` border.
- **Ghost:** Transparent background, `#475569` text. Hover: `#f1f5f9` fill with `#1e293b` text.
- **Destructive:** Solid `#f43f5e` fill or tint `#fff1f2` with `#e11d48` text and `#fda4af` border.

### Badges & Chips
- **Easy / Accepted:** Background `#ecfdf5` (`emerald-50`), text `#047857`, border `#a7f3d0`. Monospaced text using `label-code-sm`.
- **Medium / In-Progress:** Background `#fffbeb` (`amber-50`), text `#b45309`, border `#fde68a`.
- **Hard / Warning:** Background `#fff1f2` (`rose-50`), text `#be123c`, border `#fecdd3`.
- **Informational / Brand:** Background `#eef2ff` (`indigo-50`), text `#4338ca`, border `#c7d2fe`.

### Inputs & Search Bars
- **Surface:** `#ffffff` background with 1px border in `#cbd5e1`.
- **State Focus:** Border shifts to `#6366f1` with an ambient glow of `0 0 0 3px rgba(99, 102, 241, 0.15)`.
- **Prefix/Suffix:** JetBrains Mono keyboard shortcut pills (e.g., `⌘K`) rendered on `#f1f5f9` backgrounds with `#64748b` text.

### Code Editor & Terminal Panels
- **Container:** Bordered in `#e2e8f0` with a clean `#ffffff` surface for light code editing, or `#0f172a` for integrated output terminals.
- **Header Toolbar:** `#f8fafc` background, 36px height, divided by 1px bottom border in `#e2e8f0`, housing language indicators and run triggers.

### Cards & Panels
- **Structure:** `#ffffff` background, `rounded-lg`, framed with 1px `#e2e8f0`.
- **Header:** Padding `space-lg` (16px), separated from content by 1px border in `#f1f5f9` when content is dense.

### Checkboxes & Radios
- **Unchecked:** `#ffffff` background with 1.5px border in `#94a3b8`, `rounded` (4px) for checkboxes and circular for radios.
- **Checked:** `#4f46e5` background with sharp white glyph; transition animated at 120ms ease-out.
