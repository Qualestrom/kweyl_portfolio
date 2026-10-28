# Anti-AI Slop Design Engineering Rules

These rules govern all UI, UX, styling, and visual decisions in this codebase. They exist to permanently eradicate generic AI design mannerisms, enforce aesthetic restraint, and ensure that every visual element feels human-crafted, premium, and intentional.

---

## 1. The 8 Prohibited AI Design Tells (STRICTLY FORBIDDEN)

1. **NO Neon Cliché Gradients**:
   - NEVER use arbitrary two-tone neon gradients (e.g. cyan-to-purple, magenta-to-blue, orange-to-pink) across headers, buttons, borders, or text.
   - Restrict colors to a disciplined, theme-grounded palette (for this portfolio: pure crystalline ice blue, deep frost slate, and crisp white). Accents must occupy less than 10% of the screen.

2. **NO Decorative Bracket & Corner Spam**:
   - NEVER slap chamfered brackets, mechanical corner notches, crosshairs, or sci-fi angles onto ordinary content cards or sections.
   - Borders must be clean, crisp, and subtle (e.g., `1px solid rgba(148, 163, 184, 0.12)`).

3. **NO Monospace Eyebrow Overload**:
   - NEVER add tracked-out uppercase monospace eyebrows above every heading (`01 // ROOT`, `SECTION // ARCHITECTURE`, `STATUS: ONLINE`).
   - Labels should only exist when they provide real, necessary classification for the user.

4. **NO Pointless Numbering**:
   - NEVER add numbers (`01`, `02`, `03`) to sections or cards unless the content is an actual sequence (e.g., a multi-step onboarding wizard, a chronological timeline, or a numbered tutorial).

5. **NO Cookie-Cutter SaaS Cards**:
   - Do NOT chop every single piece of information into identical rounded boxes with identical heavy box-shadows.
   - Establish visual hierarchy through generous negative space, alignment, and typographic scale rather than surrounding everything with a box.

6. **NO "Everything Glows" Syndrome**:
   - If everything glows, nothing is special. Never apply glows simultaneously to titles, borders, badges, buttons, and backgrounds.
   - Reserve glow strictly for the single primary focal point (e.g., the celestial star linchpin) or an active `:focus-visible` state.

7. **NO Scattered Animation Bloat**:
   - Do NOT attach entrance slide-up/fade-in animations to every heading, paragraph, and card on scroll. It creates visual fatigue and screams "AI template."
   - Entrance motion should be confined to one coordinated initial reveal. All subsequent animations must be direct, crisp responses to user interaction (hover, tap, expand).

8. **NO Massive Multi-Component Overhauls**:
   - NEVER edit 3–4 separate components and style sheets simultaneously in one pass.
   - Work in single, atomic, verified steps. If a change cannot be clearly evaluated in isolation, it is too broad.

---

## 2. The Law of Restraint (Chanel's Rule)

> *"Before leaving the house, take a look in the mirror and remove one accessory."* — Coco Chanel

- Before finalizing any UI or CSS change, inspect the diff and remove at least one decorative element (an extra border, an unnecessary badge, a secondary glow, or a redundant icon).
- Let confidence come from whitespace, typography, and contrast rather than surface decoration.

---

## 3. Pre-Flight Design Contract

Before modifying any CSS or UI component:
1. **Identify the Theme Anchor**: Ground the visual choices in the subject matter (Genshin Snezhnaya / Cryo / Sandrone clockwork & crystalline ice elegance, NOT generic cyber arcade).
2. **State the Single Focal Point**: Declare what the ONE memorable element of the view will be.
3. **Declare the Freeze List**: Explicitly list what working components or styles must NOT be altered.
4. **Isolate the Step**: Change only one component or styling domain at a time, verify it in the browser, and ensure it satisfies WCAG AA contrast ($\ge 4.5:1$).
