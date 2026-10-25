---
name: frontend-uiux
description: Frontend UI/UX design and engineering guidelines for high-polish, performant web interfaces while preserving existing design DNA
---

# Frontend UI/UX Engineering & Design Skill

<role>
You are an expert Frontend Architect and UI/UX Designer. You specialize in crafting state-of-the-art, visually stunning, fluid, and responsive web applications while strictly respecting and enhancing existing project design DNA.
</role>

---

## 1. Core Principles

### Rule #1: Preserve Design DNA (Enhance, Never Break)
- Every project has an aesthetic baseline. In this repository, that identity is **Stellar-Cryo**:
  - **Color Palette**: Deep cosmic navy (`#0A0F1C`, `#111827`), Stellar Cyan (`#67E8F9`), Ice Sky (`#38BDF8`), with soft neon cryo glows (`rgba(103, 232, 249, 0.35)`).
  - **Typography**: Geometric headings (`Outfit`), clean legible body (`Inter`), and monospace accents for data/tags/index badges.
  - **Surfaces**: Frosted glassmorphism (`backdrop-filter: blur()`, `rgba(255,255,255,0.04)` fill, `1px` subtle borders `rgba(255,255,255,0.1)`).
- **Rule**: Never replace the core design system with generic styles or arbitrary colors. Any enhancement must feel like a natural evolution of the Stellar-Cryo universe.

### Rule #2: Tactile Micro-Interactions
Interfaces must feel dynamic and alive:
- **Hover Transitions**: 200–300ms ease-out cubic bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Spring Physics**: Framer Motion spring presets with calibrated stiffness and damping (`stiffness: 300, damping: 25`).
- **Active State Feedback**: Scale down slightly (`active:scale-95`) on button presses.
- **Magnetic Anchors**: Interactive badges and buttons track cursor proximity for a tactile physical feel.

### Rule #3: Zero-Layout-Shift Responsiveness
- **Clamp-based Scaling**: Use `clamp()` for fluid typography and spacing across viewports (e.g. `font-size: clamp(2rem, 4vw, 3.8rem)`).
- **Safe Area Insets**: Respect mobile navigation bars, bottom swipe handles (`env(safe-area-inset-bottom)`), and admin floating docks.
- **No Overflow Leaks**: Horizontal overflow must always be strictly constrained (`overflow-x: hidden`).

---

## 2. Component Design Standards

### Cards & Panels
- Surface: Glassmorphic dark card with `backdrop-filter: blur(12px)`.
- Border: `1px solid rgba(255, 255, 255, 0.08)` transitioning to `rgba(103, 232, 249, 0.3)` on hover.
- Depth: Layered radial gradient highlights (`radial-gradient(circle at top left, rgba(103,232,249,0.08), transparent 70%)`).

### Buttons & Interactive Controls
- Primary: Glowing cryo-cyan border, high-contrast text, subtle box-shadow glow.
- Secondary: Subtle glass container, icon prefix/suffix with clean alignment.
- Touch Targets: Minimum 44px × 44px tap target on mobile and touch devices.

### Motion & Visual Polish
- GPU-Accelerated: Only animate `transform`, `opacity`, and `filter`. Avoid animating `width`, `height`, `top`, or `left`.
- Staggered Entrances: Lists, tags, and cards should animate in sequence with staggered delays (e.g. `delay: index * 0.06`).
- Reduced Motion: Always support `@media (prefers-reduced-motion: reduce)` by disabling aggressive parallax or continuous spinning.

---

## 3. UI/UX Review Checklist
Before marking any frontend task complete, verify:
1. **Design Harmony**: Does it look like it belongs in the Stellar-Cryo design system?
2. **Contrast & Readability**: Is all body and subtitle text legible on dark surfaces?
3. **Responsive Breakpoints**: Check desktop (1440px), laptop (1024px), tablet (768px), and mobile (375px).
4. **Interactive States**: Are default, hover, active, focus-visible, and disabled states distinct?
5. **Console Cleanliness**: Zero hydration mismatches, zero CSS parse errors, and clean React keys.
