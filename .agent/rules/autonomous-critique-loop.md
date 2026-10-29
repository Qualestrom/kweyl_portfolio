# Autonomous Critique & Refinement Loop Protocol

> **Core Mandate**: Uncompromising quality and empirical verification over speed. Never deliver unverified or intermediate work to the user.

This rule governs all development, visual engineering, 3D graphics, animations, styling, and architectural modifications in the **Christopher Lamera Portfolio** codebase.

---

## 1. Mandatory Autonomous Execution Loop
Whenever handling any feature request, UI adjustment, visual overhaul, bug fix, or polish:
**DO NOT** make code edits and immediately yield back to the user without validating the result.
Instead, execute this closed-loop cycle autonomously:

```
[1. IMPLEMENT] ──> [2. COMPILE & BUILD] ──> [3. VISUAL CAPTURE] ──> [4. CRITIQUE] ──> [5. REFINE] (Loop until verified) ──> [6. SYNC & PUSH]
```

---

### Step 1: Implement with Aesthetic Rigor
- Ground all visuals in the established theme: **Snezhnayan / Cryo / Nod-Krai Frostmoon** crystalline elegance (pure ice blue, deep frost navy, silver highland dust, diamond stars).
- Strictly obey [`.agents/rules/anti-ai-slop-design.md`](file:///c:/Users/Christopher/Documents/GitHub/kweyl_portfolio/.agents/rules/anti-ai-slop-design.md) (no cliché neon gradients, no bracket spam, no monospace eyebrow spam, no glowing everything).
- Ensure mobile-first responsive scaling and `prefers-reduced-motion` compliance.

### Step 2: Compile & Build Verification
- Always execute `npm run build` before declaring any task complete.
- Verify exit code 0 and zero bundler/syntax errors.
- Never commit or present code with broken production builds.

### Step 3: Automated Visual Browser Inspection
- Inspect the rendered application on the local server (`http://localhost:5173/` or `5174`).
- Capture high-resolution screenshots across both:
  - **Desktop Viewport** (e.g. 1440x900 or 1920x1080).
  - **Mobile Viewport** (e.g. 390x844).
- Inspect key states: initial load, active section transitions, hover/focus states, and background contrast.

### Step 4: Critical Self-Evaluation Checklist
Evaluate the captured render against the user's intent:
1. **Typography & Contrast**: Is every piece of text readable (WCAG AA $\ge 4.5:1$)? Does background graphics/moon shade properly behind text?
2. **Optical Balance & Centering**: Are elements optically centered? Are headings, buttons, and bento cards harmoniously proportioned?
3. **No Visual Overlap / Hitbox Collision**: Are constellations, particles, or labels colliding with primary UI elements or the Frostmoon?
4. **Art Style Integrity**: Does it match the hand-crafted, high-definition aesthetic? Zero low-res textures, zero pixelation, zero wireframe artifacts.
5. **Responsiveness**: Do elements adapt cleanly to narrow screens without horizontal overflow or awkward wrapping?

### Step 5: Autonomous Refinement
- If ANY visual defect, clipping, contrast failure, or divergence from the user's goal is discovered:
  - **DO NOT stop and ask the user to test it.**
  - Autonomously diagnose the root cause, adjust the code, re-build, re-capture, and re-critique.
  - Repeat the cycle until the result achieves pristine, production-grade excellence.

### Step 6: Workspace & Git Synchronization
- Update execution documentation if applicable ([`docs/STELLAR_GLIMMER_EXECUTION_LOG.md`](file:///c:/Users/Christopher/Documents/GitHub/kweyl_portfolio/docs/STELLAR_GLIMMER_EXECUTION_LOG.md)).
- Stage all modified files (`git add ...`), commit with clear conventional commit messages, and push to `origin/main`.
