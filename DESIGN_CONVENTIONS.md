# RizzoDev — Design Conventions

The system that keeps the "inside of an 80s computer" aesthetic disciplined instead of
sprawling. When in doubt, fewer colors, more whitespace, mono everything.

> Brand in one line: **technical, precise, minimal — and genuinely alongside you.**
> Should never feel: confusing, cheap, or overcomplicated.

---

## 1. Color palette

All colors are defined as CSS custom properties in [`assets/css/style.css`](assets/css/style.css)
under `:root`. Use the variables — never hard-code hex values in markup or new CSS.

### Surfaces (near-black)
| Token        | Hex       | Use                                   |
|--------------|-----------|----------------------------------------|
| `--black`    | `#010101` | Page background                        |
| `--panel`    | `#0A0D0A` | Cards, raised surfaces                  |
| `--panel-2`  | `#0E120E` | Inputs, nested surfaces                 |
| `--line`     | `#16321C` | Hairline borders                        |

### Brand green
| Token          | Hex       | Use                                  |
|----------------|-----------|---------------------------------------|
| `--lime`       | `#1FC742` | Primary brand, links, accents (the one from your brief) |
| `--lime-bright`| `#45F06A` | Hover, highlights, glow               |
| `--lime-dim`   | `#128A2E` | Pressed/muted brand, subtle borders   |

### Text
| Token        | Hex       | Use                                   |
|--------------|-----------|----------------------------------------|
| `--heading`  | `#F2FFF4` | Large headings (brightest)             |
| `--text`     | `#CDEBD3` | Body copy — soft green-white, easy to read on black |
| `--text-dim` | `#6E8A73` | Secondary text, captions, muted        |

> **Why body text isn't pure lime:** long paragraphs in `#1FC742` on black are harsh and
> tiring. `--text` keeps the green cast while staying readable. Reserve full lime for
> accents, labels, and links.

### Accent — amber (use sparingly)
| Token           | Hex       | Use                                |
|-----------------|-----------|-------------------------------------|
| `--amber`       | `#FFB000` | Primary CTA buttons only            |
| `--amber-bright`| `#FFC740` | CTA hover                           |

Classic green-screen + amber CRT pairing. Amber is the "press here" signal — it should be
rare enough that it always means *the* next action. Don't use it for decoration.

### Status
- `--danger: #FF5C57` — errors only (form validation, 404).

---

## 2. Typography

- **One typeface: `JetBrains Mono`** (loaded from Google Fonts), with a system-monospace
  fallback stack. Everything is mono — it carries the terminal identity. Clean and modern,
  not pixelated/retro (that would read as "cheap").
- Headings: weight 700, tight letter-spacing (`-0.01em`).
- Body: weight 400, line-height `1.7` for readability.
- Sizes use `clamp()` so they scale fluidly — see `h1`–`h3` in the stylesheet.

### Eyebrow + title pattern
Every section opens with the same rhythm (consistent with how you structure the Thoughtly site):

```html
<p class="eyebrow">section label</p>   <!-- small, uppercase, lime, prefixed with › -->
<h2>The human-readable headline</h2>
<p>Optional supporting sentence in --text-dim.</p>
```

---

## 3. Terminal / command-line motifs

These are what make it feel like an 80s machine. Use them with restraint — they're seasoning.

- **Terminal window** (`.terminal`): titlebar with three dots + a `user@rizzodev: ~` title,
  then a body of prompt/command/output lines. Used in the hero and About page.
- **Prompt lines** inside a terminal: `.line` containing `.prompt` (lime), `.cmd` (white,
  typed via JS), `.out` (dim, the "output"), `.ok` (lime success), `.flag` (amber).
- **Blinking caret** (`.caret`) closes a terminal block. The brand wordmark also ends in a
  blinking block cursor.
- **CRT scanlines + vignette**: a single fixed `body::before` overlay at very low opacity.
  Disabled under `prefers-reduced-motion`.
- **Prompt prefixes** in copy: footer copyright and CTA eyebrows use `$` / `›` to nod at the
  shell without being gimmicky.

> Restraint rule: a screen should read as "a sharp dark site by someone who clearly knows
> terminals," not "a novelty hacker theme." If an effect makes content harder to read, cut it.

---

## 4. Components (class reference)

| Component        | Class(es)                          |
|------------------|------------------------------------|
| Section wrapper  | `.section`, `.section--tight`      |
| Constrained width| `.container` (max 1100px)          |
| Buttons          | `.btn` + `.btn-primary` (amber) / `.btn-lime` / `.btn-ghost` |
| Card             | `.card` (+ `.work-card` for projects) |
| Grid             | `.grid` + `.grid-2` / `.grid-3`    |
| Process steps    | `.steps` > `.step`                 |
| Stats            | `.stats` > `.stat`                 |
| Testimonial      | `.testimonial`                     |
| CTA band         | `.cta-band`                        |
| Form             | `.form` > `.field`                 |
| Reveal-on-scroll | add `.reveal` to any block         |

---

## 5. Motion

- **Hero typing animation** — JS types out the `.cmd` text in the `[data-typed]` terminal.
- **Reveal-on-scroll** — add `.reveal`; an IntersectionObserver fades it in once.
- **All motion respects `prefers-reduced-motion`** and degrades to instantly-visible.

---

## 6. Accessibility & quality bar

- Skip link on every page; visible focus states (`:focus-visible`).
- Decorative terminals are `aria-hidden`; the form status uses `aria-live`.
- Color contrast: body text and headings clear AA on black. Amber CTA text is dark-on-amber.
- The site itself is the portfolio — keep the HTML clean, semantic, and indented. Sloppy
  markup undercuts the whole pitch.
