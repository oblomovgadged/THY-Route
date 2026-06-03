# 🛫 THY Route Design System & Visual Guidelines

This document defines the core styling guidelines, CSS tokens, micro-interactions, and extraction workflows for the **THY Route** project. It serves as the primary reference for maintaining a premium, high-fidelity user interface.

---

## 🎨 1. Brand Tokens & Design System (Compliance)

All layouts must strictly adhere to the CSS variables declared in [style.css](file:///c:/Users/borak/OneDrive/Desktop/Route/css/style.css):

### Color Palette
*   **Corporate Red:** `var(--thy-red)` (`#B7312C`) - Primary branding.
*   **Deep Navy (Primary Background):** `var(--bg-primary)` / `var(--thy-navy)` (`#0A1628`) - Premium feel.
*   **Elevated Surfaces:** `var(--bg-card)` (`#132237`) and `var(--bg-card-hover)` (`#1B2F4C`).
*   **Accent Gold (Premium Features):** `var(--thy-gold)` (`#C5A059`) - Used for Miles&Smiles/Premium cards.

### Typography
*   **Primary Font:** `Outfit`, `Inter`, sans-serif (fluid modern curves).
*   **Sizes:** Keep headers bold, use high contrast scale from `0.875rem` (muted labels) up to `2.5rem` (hero headers).

### Corner Geometry
*   **Cards/Panels:** `var(--radius-md)` (`12px`) or `var(--radius-lg)` (`18px`) for fluid visual borders.
*   **Interactive Controls (Pills/Buttons):** `var(--radius-full)` (`9999px`) or `var(--radius-sm)` (`6px`).

---

## 💫 2. Micro-Interactions & CSS Animation Recipes

Use these classes to add fluid, aerodynamic transitions to interactive elements:

### Aerodynamic Hover Lift
Apply transition variables for smooth UI reaction.
```css
.interactive-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  transition: transform var(--transition-base), background-color var(--transition-base), box-shadow var(--transition-base);
}

.interactive-card:hover {
  transform: translateY(-4px);
  background-color: var(--bg-card-hover);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  border-color: var(--thy-red);
}
```

### Premium Glassmorphism Overlay
Used for navigation bars, popup overlays, and map controls.
```css
.glass-panel {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-lg);
}
```

### Fluid Entrances
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-slide {
  animation: fadeInUp var(--transition-slow) var(--transition-aerodynamic) forwards;
}
```

---

## 🔍 3. HTML to CSS / Style Extraction Workflow

When you find a stunning design element from external websites (like **Awwwards, Behance, Dribbble**, or the official **turkishairlines.com**), follow this workflow to feed it to the AI assistant (me):

1.  **CSS Peeper (Chrome/Firefox Extension):** 
    *   Install the [CSS Peeper Extension](https://csspeeper.com/).
    *   Click on any element on a website to extract its exact colors, fonts, shadow variables, line heights, and dimensions.
2.  **DevTools Style Extraction:**
    *   Right-click the element -> `Inspect (İncele)`.
    *   In the **Computed (Hesaplanmış)** tab, check the exact sizes, margins, padding, and layout structure (Flex/Grid).
3.  **Feed to the AI Assistant:**
    *   Paste the extracted styles directly into the chat prompt.
    *   *Prompt Example:* `"Extract styles for this custom card: background is #0A1628, margin is 16px, border-radius is 12px, hover glow is red. Port this style into THY Route's design tokens."*
    *   I will automatically map these external styles to the project's variables (`--bg-primary`, `--radius-md`, `--thy-red`) to keep everything clean and consistent.

---

## 🌐 4. GitHub "Skills" Repos & Learning Resources

To enhance my visual execution, you can point me to these public GitHub repositories and style files:

*   **Animate.css (CSS Transitions):** [daneden/animate.css](https://github.com/animate-css/animate.css) - A repository filled with standard CSS keyframe animations.
*   **Hover.css (Micro-interactions):** [IanLunn/Hover](https://github.com/IanLunn/Hover) - Best-in-class collection of hover effects for buttons and links.
*   **Glassmorphism Generator & Specs:** [Glassmorphism UI Guidelines](https://github.com/mrinmayost/glassmorphism-ui) - Best practices for CSS backdrop-filter and overlay layouts.
*   **Lucide Icons (SVG Vectors):** [lucide-icons/lucide](https://github.com/lucide-icons/lucide) - Standard modern line icon library used for building premium, clean UI control grids.
