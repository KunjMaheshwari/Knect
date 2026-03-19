# Design System Specification: High-End Editorial SaaS

## 1. Overview & Creative North Star: "The Ethereal Observer"
This design system moves away from the rigid, boxy constraints of traditional SaaS dashboards toward a high-end editorial experience. Our Creative North Star is **"The Ethereal Observer"**—a philosophy that treats the user interface not as a static tool, but as a series of light-infused, translucent layers. 

To achieve a signature look, we break the "template" feel by utilizing **intentional asymmetry** and **tonal depth**. Rather than containing data within heavy borders, we allow the UI to breathe through expansive white space and overlapping glass surfaces. The goal is a production-level quality that feels bespoke, premium, and calm.

---

## 2. Color Architecture & Surface Philosophy
The palette is a sophisticated interplay of deep indigo slates and vibrant violet accents, optimized for a "True Dark" premium aesthetic.

### Surface Hierarchy & Nesting
We abandon the flat grid. Depth is achieved through the **Surface Tier System**.
- **Base Layer:** `surface` (#0b1326) – The infinite canvas.
- **Sectioning:** `surface_container_low` (#131b2e) – Used for large structural areas.
- **Card/Element Layer:** `surface_container` (#171f33) – The standard container for interactive content.
- **Feature/Elevated Layer:** `surface_container_highest` (#2d3449) – Reserved for items requiring immediate focus.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts or the `outline_variant` (#464554) at **10% opacity** only when accessibility requires a "Ghost Border."

### The "Glass & Gradient" Rule
Main CTAs and Hero moments must use a linear gradient: `primary` (#bdc2ff) to `primary_container` (#7c87f3) at a 135° angle. This provides a "visual soul" that flat color cannot replicate.

---

## 3. Typography: Fluid Hierarchy
Using **Inter** as our sole typeface, we lean into aggressive scale shifts to create an editorial feel.

| Token | Size | Weight | Use Case |
| :--- | :--- | :--- | :--- |
| **display-lg** | 3.5rem | 700 (Bold) | Hero headlines, high-impact data points. |
| **headline-md** | 1.75rem | 600 (Semi-Bold)| Section headers, primary module titles. |
| **title-sm** | 1rem | 500 (Medium) | Card titles, navigation items. |
| **body-md** | 0.875rem | 400 (Regular) | Standard reading text, descriptions. |
| **label-sm** | 0.6875rem | 600 (Semi-Bold)| Micro-copy, overlines, all-caps tags. |

*Note: Use `on_surface_variant` (#c7c4d7) for body text to reduce eye strain, reserving `on_surface` (#dae2fd) for high-priority headlines.*

---

## 4. Elevation & Depth: Tonal Layering
We reject standard drop shadows in favor of **Ambient Light Mimicry**.

- **The Layering Principle:** Place a `surface_container_lowest` (#060e20) element inside a `surface_container` (#171f33) to create a "recessed" look without shadows.
- **Ambient Shadows:** For floating elements (modals/dropdowns), use a multi-layered shadow:
  - Layer 1: `0 4px 20px rgba(6, 14, 32, 0.5)`
  - Layer 2: `0 12px 40px rgba(189, 194, 255, 0.08)` (A tinted glow using the `surface_tint`).
- **Glassmorphism:** Use `surface_container` with an opacity of 60% and a `backdrop-filter: blur(12px)`. This allows the indigo background to bleed through, softening the interface.

---

## 5. Components & Primitives

### Buttons
- **Primary:** Gradient (`primary` to `primary_container`). Text: `on_primary_fixed`. Radius: `md` (0.75rem).
- **Secondary:** Surface-only. Background: `surface_bright`. Border: Ghost Border (10% opacity).
- **Tertiary:** No background. Text: `primary`. Interaction state: `surface_container_high` background on hover.

### Input Fields
Forbid the "boxed" look. Use `surface_container_low` as the field background with a bottom-only `outline` (#908fa0) at 20% opacity. Upon focus, transition the background to `surface_container_highest` and the bottom border to `primary`.

### Cards & Lists
**Forbid divider lines.** Use vertical spacing from the 8px grid (e.g., `spacing-8` or `spacing-10`) to separate items. For lists, use a subtle hover state of `surface_container_low` to indicate interactivity.

### Featured Component: The "Etheric Chip"
Selection chips should use `secondary_container` (#6f00be) with `on_secondary_container` (#d6a9ff) text. Apply a `xl` (1.5rem) roundedness for a pill-shaped, organic feel.

---

## 6. Do’s and Don’ts

### Do
- **Do** use intentional asymmetry. Offset a text block from its supporting image to create movement.
- **Do** leverage the Spacing Scale strictly (e.g., `spacing-4` for internal card padding, `spacing-16` for section breathing room).
- **Do** use `surface_bright` (#31394d) for subtle hover states on dark backgrounds.

### Don’t
- **Don't** use 100% white (#ffffff) for text. It vibrates against the deep indigo. Use `on_surface`.
- **Don't** use standard shadows. If an element doesn't look "lifted" via color alone, use an Ambient Shadow with a violet tint.
- **Don't** use dividers. If content feels cluttered, increase the spacing to the next tier in the scale (`12` or `16`).

---

## 7. Spacing Grid (4px/8px)
| Value | Rem | Px | Application |
| :--- | :--- | :--- | :--- |
| **1** | 0.2rem | 4px | Micro-adjustments, icon-to-text. |
| **2** | 0.4rem | 8px | Tight clusters, small padding. |
| **4** | 0.9rem | 16px | Standard component internal padding. |
| **8** | 1.75rem | 32px | Gutter spacing between cards. |
| **16** | 3.5rem | 64px | Large layout breathing room. |