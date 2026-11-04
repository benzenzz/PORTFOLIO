# CLAUDE.md — Personal Portfolio Website

## 1. Project purpose

Build a personal creative portfolio website that feels **modern, clean, expressive, interactive, and easy to use**. The experience should communicate a strong visual point of view without sacrificing clarity, accessibility, performance, or usability.

This is a portfolio, not simply an online CV. It should let visitors quickly understand the creator's creative range, inspect selected work, understand each project's contribution, and get in touch.

### Core experience goals
- Make the work the main character; do not let interface effects compete with it.
- Combine editorial art direction with a friendly, intuitive user experience.
- Use motion to provide feedback, reveal hierarchy, and create a sense of craft—not merely as decoration.
- Make browsing feel rewarding on desktop while remaining complete and comfortable on touch devices.
- Keep the visual system coherent across the landing page, project pages, navigation, and contact section.

## 2. Creative direction from the moodboard

Treat the provided **MOOD BOARD PORTFOLIO** image as the visual north star when it is available in the project files. It suggests a high-contrast editorial / experimental graphic-design language.

### Visual keywords
- Monochrome photography and black-and-white imagery
- Stark contrast, deep blacks, off-whites, and large areas of negative space
- Bold, condensed, assertive display typography
- Asymmetric editorial layouts and carefully composed image grids
- Motion blur, ghosted silhouettes, grain, halftone, scan-like texture, and digital distortion used selectively
- Vivid red as a signal or focal accent—not as a background for everything
- A mix of refined minimalism and controlled visual disruption

### Important interpretation
The moodboard is a **direction, not a template to copy literally**. Do not reproduce its posters, layouts, text, or artwork. Do not force the horse imagery, glitch effects, or distressed textures into every section. Borrow the principles—contrast, typography, composition, image treatment, and selective disruption—and translate them into a coherent digital portfolio.

The final site should feel more usable and welcoming than a static experimental poster wall. Preserve the moodboard's edge while making navigation, project information, and calls to action obvious.

## 3. Initial design system

Use these as starting tokens, then adapt them to the existing implementation and real project assets.

### Color
- `--color-ink: #101010` — primary dark surfaces and typography
- `--color-paper: #F5F4F0` — warm, soft light surface
- `--color-red: #FF343B` — vivid signal accent for emphasis, selected states, and small interactive details
- `--color-gray: #777777` — secondary text and muted details, subject to contrast checks
- `--color-line: rgba(16, 16, 16, 0.16)` — subtle dividers on light surfaces

Rules:
- Start with a monochrome foundation; use red sparingly and intentionally.
- Keep text readable on every surface. Verify actual contrast instead of assuming gray text is accessible.
- Avoid adding extra accent colors unless real project artwork requires them.
- Let portfolio thumbnails retain their own art direction; use the interface to frame them consistently.

### Typography
- Pair a bold, possibly condensed display face with a highly readable sans-serif for body copy and UI.
- Use display typography for short statements, project names, section titles, and intentional graphic moments.
- Use a neutral, legible text style for descriptions, metadata, navigation, and project details.
- Establish a responsive type scale with `clamp()` or the equivalent in the existing styling system.
- Avoid oversized type that wraps awkwardly, overlaps controls, or makes mobile navigation difficult.
- Use uppercase, tight tracking, vertical text, and rotated labels selectively. Do not make every label experimental.
- Prefer project fonts and dependencies already in the repo. Do not add a font dependency without a reason.

### Layout and composition
- Use a strong grid as the structural foundation, with controlled asymmetry to give the work personality.
- Mix generous whitespace with dense image groupings; ensure the page still has an obvious reading order.
- Keep alignment, spacing, and project metadata consistent even when thumbnail sizes vary.
- Use large edge-to-edge imagery only when it improves the project story.
- Build layouts from reusable spacing and layout tokens rather than many unrelated one-off values.
- Avoid unnecessary cards, rounded panels, gradients, and shadows if they dilute the editorial direction.

### Image treatment
- Prioritize real project visuals and high-quality stills over decorative stock imagery.
- Use crop, scale, contrast, grayscale, duotone, grain, or blur only where it reinforces the specific work.
- Any hover treatment must return to a clear, inspectable image state and must not obscure the work permanently.
- Do not use placeholders that could be mistaken for completed portfolio projects.
- If a project image or asset is missing, use an explicit placeholder and keep the asset path easy to replace.

## 4. Interaction and motion principles

Motion is part of the site's identity, but it must always support comprehension and control.

### Motion language
- Favor smooth, deliberate transitions, spatial continuity, subtle parallax, image reveals, staggered entrances, and typography movement where appropriate.
- Use fast, crisp feedback for buttons and controls; use slower movement for storytelling moments.
- Prefer opacity and transform animations. Animate layout-affecting properties only when necessary.
- Create a consistent easing and duration system instead of assigning arbitrary timing to every element.
- A useful starting range is 120–220 ms for micro-interactions and 300–700 ms for larger reveals. These are guidelines, not mandatory values.
- Stagger groups lightly; avoid making visitors wait for a cascade of animations before they can interact.
- Keep the initial hero reveal brief, skippable in effect, and non-blocking. Never require an intro animation to finish before the site can be used.

### Potential signature interactions
Choose only interactions that improve the specific page; do not implement all of these by default.
- Project thumbnails respond to hover with a small scale, image shift, mask reveal, or restrained color treatment.
- Project title, category, year, or a short descriptor appears with a clear and readable transition.
- A cursor-following label or subtle mouse-reactive element may be used on desktop if it does not interfere with selecting text, links, or controls.
- Project details reveal progressively as the visitor scrolls, while remaining available without animation.
- Navigation and contact elements use clear hover, focus, active, and pressed states.

### Interaction rules
- Every interactive-looking element must have a real, working action.
- All hover-only information must have a touch-friendly equivalent, such as a tap, always-visible metadata, or a clear project detail page.
- Do not replace the native cursor globally unless the custom cursor has a clear usability benefit and a dependable fallback.
- Do not make scroll hijacking, forced horizontal scrolling, or scroll-jacking transitions the default.
- Do not trap the visitor in an animation, modal, or intro screen.
- Avoid flashing, rapid repeated motion, excessive wobble, or effects that make text hard to read.
- Interactive targets must be usable with a keyboard and clearly indicate focus.

### Reduced motion
- Respect `prefers-reduced-motion: reduce`.
- Provide a reduced-motion mode that removes or substantially simplifies parallax, large transforms, cursor-following elements, and nonessential animated transitions.
- The site must remain understandable and visually complete when motion is reduced or JavaScript animation fails.

## 5. UX principles: friendly, clear, and confident

- A new visitor should understand what this portfolio is, what kind of work is featured, and where to click within a few seconds.
- Give the page a clear hierarchy: introduction → selected work → supporting context → contact.
- Make navigation labels plain and predictable. Visual experimentation should not make navigation cryptic.
- Make each project thumbnail look clickable and provide a visible hover/focus state.
- State project role, scope, and outcome clearly when those facts are available.
- Make email and relevant social links easy to find without forcing a visitor to hunt through the site.
- Avoid overloading the landing page with all biographical details. Put deeper context in About or project case studies.
- Preserve readable line lengths, adequate spacing, consistent component behavior, and clear feedback for all controls.
- Do not use motion as the only way to communicate a state or piece of information.

## 6. Suggested information architecture

Adapt this to the real project and existing codebase rather than building every section automatically.

1. **Landing / Hero**
   - A short, memorable introduction to the creator and creative focus.
   - One clear next action, such as “View selected work”.
   - A distinctive but brief motion moment that does not delay access to the page.

2. **Selected Work**
   - A responsive editorial grid or otherwise clear project index.
   - Project title, discipline/category, and year where known.
   - Consistent, meaningful hover/focus feedback and a usable touch equivalent.

3. **Project Case Study**
   - Context or brief, challenge, role, process, selected visuals, and result when available.
   - Make the creator's specific contribution distinguishable from the team's work.
   - Use process material and motion/video where they add evidence, not just decoration.

4. **About / Capabilities**
   - A concise introduction, current interests, and relevant capabilities.
   - Potential work categories may include visual design, creative ideation/art direction, video editing and production, digital experiences, and campaign/social content. Include only those that accurately represent the owner's work.

5. **Contact**
   - A simple, direct contact action with working links.
   - Keep this section visually memorable without making the contact method difficult to use.

Do not create fake testimonials, client names, awards, performance metrics, project outcomes, or unsupported claims to fill the page.

## 7. Content integrity

- Use only content and achievements supplied by the owner or already present in the project assets.
- Never invent numbers, client permissions, deliverables, project roles, campaign results, dates, or testimonials.
- When facts are unknown, use clearly marked editable placeholders such as `[Project year]` or `[Add verified result]` in development—not fabricated final copy.
- Preserve the owner's original meaning when editing copy. Improve clarity and concision without overstating their contribution.
- Ensure every project has a clear path to add title, year, category, cover image, role, description, media, and verified outcome.

## 8. Responsive behavior

Design and test for narrow mobile screens, tablets, laptops, and large desktop displays.

- Reflow editorial grids deliberately; do not simply shrink a desktop composition.
- Preserve strong typography and image crops while preventing horizontal overflow.
- Disable or simplify mouse-dependent effects on touch devices.
- Ensure menus, filters, carousels, modals, and media controls work on touch.
- Ensure focus states and text remain visible against both light and dark sections.
- Test portrait and landscape orientations where the composition depends on screen shape.
- Do not make a critical interaction depend on hover, pointer precision, or a particular viewport width.

## 9. Accessibility and performance

- Use semantic HTML and the existing framework's accessible patterns.
- Ensure full keyboard navigation, visible focus, descriptive link names, sensible heading order, and labels for controls.
- Give meaningful images appropriate alternative text; use empty alt text for purely decorative visuals.
- Maintain sufficient contrast for body text, metadata, and interactive states.
- Respect reduced-motion settings and avoid conveying information through color alone.
- Optimize image dimensions and formats; lazy-load noncritical media while keeping key hero content from appearing late.
- Avoid unnecessarily large video backgrounds, oversized libraries, and complex effects that degrade mobile performance.
- Keep the first meaningful content visible quickly; use lightweight fallbacks for media or animation failures.
- Check console errors, broken assets, layout shifts, and horizontal overflow.

## 10. Engineering rules for Claude

Before changing code:
1. Inspect the repository structure, `package.json`, current framework, styling approach, route structure, and existing animation libraries.
2. Identify which components and pages already exist; summarize the relevant structure before making broad changes.
3. Look for the actual portfolio content and image/video assets before creating new copy or placeholders.
4. Follow the project's current conventions and reuse existing dependencies where practical.

While implementing:
- Make the smallest coherent changes that achieve the requested result.
- Reuse components, design tokens, and existing utilities where appropriate.
- Do not rewrite the application, replace the framework, or delete existing work without explicit permission.
- Do not add packages simply because they are familiar; explain why a new dependency is needed when it materially affects the project.
- Keep content data separate from presentation when that makes projects easier to add or reorder.
- Avoid duplicated styling, unexplained magic numbers, unnecessary global event listeners, and brittle selector-based behavior.
- Clean up event listeners and animation instances correctly.
- Keep components readable and interaction logic easy to maintain.
- Do not treat a successful build as proof that visual quality, responsiveness, or accessibility are correct.
- If an important detail is missing, make a reasonable reversible assumption and state it. Ask only when the ambiguity blocks a safe or meaningful implementation.

After implementing:
1. Run the relevant checks available in the repo (build, lint, type-check, or tests).
2. Inspect the page at mobile and desktop widths, preferably with screenshots if browser tooling is available.
3. Check keyboard interaction, focus states, reduced-motion behavior, and touch alternatives.
4. Check for broken images/video, console errors, overflow, overlapping type, and dead links.
5. Report what changed, what was tested, and what remains unverified. Never claim a test was run if it was not.

## 11. Definition of done

A change is not complete until the relevant criteria below are met:

- [ ] The visual direction feels like a coherent digital interpretation of the moodboard, not a copied poster collage.
- [ ] The work remains the focus; effects do not overwhelm content.
- [ ] Layout and typography work at mobile, tablet, and desktop sizes.
- [ ] Interactive states are obvious, functional, and accessible by keyboard.
- [ ] Hover interactions have a touch alternative.
- [ ] Reduced-motion preferences are respected.
- [ ] The page has no unintended horizontal overflow or major visual collisions.
- [ ] Images and links resolve correctly; missing content is clearly marked rather than fabricated.
- [ ] Relevant project checks have been run and their result reported accurately.

## 12. Decision filter

When choosing between two implementation options, prioritize in this order:

1. **Clarity and usability** — the visitor can understand and use the site.
2. **Portfolio storytelling** — the work and the creator's contribution are easy to evaluate.
3. **Visual coherence** — typography, composition, imagery, and color feel intentional.
4. **Motion quality** — movement feels polished and purposeful.
5. **Novelty** — experimental ideas are welcome only when they do not weaken the first four priorities.

The target is not “maximum animation.” The target is a memorable, art-directed portfolio that feels alive while remaining clear, fast, accessible, and friendly.

## 13. Token budget

- Do not open files in `reference/` or `content-raw/` unless the owner names the specific file.
- Use `content-raw/INVENTORY.md` to learn what assets exist.
- Do not read `node_modules/`, `.next/`, or saved HTML pages.
- Read only the files you need to change.
- Keep replies short; do not repeat code already written.
- When a phase is done, commit and stop.

## 14. Agent team

This project is built by Claude Code and Sixth working in turns. Follow PIPELINE.md and track all work in tasks/BOARD.md.
