# RizzoDev

Personal site for **RizzoDev** — web & software development for small businesses.
Static HTML/CSS/JS, no build step, designed to deploy straight to GitHub Pages.

Aesthetic: inside-of-an-80s-computer / command line / dark mode. See
[`DESIGN_CONVENTIONS.md`](DESIGN_CONVENTIONS.md) for the color, type, and component system.

---

## Structure

```
RizzoDev/
├── index.html          # Home
├── services.html       # Services
├── work.html           # Selected work / portfolio
├── about.html          # About Ryan
├── contact.html        # Contact form + booking
├── 404.html            # Custom not-found page
├── assets/
│   ├── css/style.css   # All styles (design tokens in :root)
│   ├── js/main.js      # Nav, hero typing, scroll reveals, form
│   └── favicon.svg
├── DESIGN_CONVENTIONS.md
└── README.md
```

There's no framework and nothing to compile — open any `.html` file in a browser to view it.

---

## Before you go live — 3 things to wire up

### 1. Contact form (Formspree)
In [`contact.html`](contact.html), the form's `action` is a placeholder:

```html
<form ... action="https://formspree.io/f/YOUR_FORM_ID" ...>
```

1. Create a free form at <https://formspree.io> (sends submissions to your email).
2. Replace `YOUR_FORM_ID` with the endpoint Formspree gives you.

Until that's done the form shows a friendly "not connected yet" message instead of failing
silently. The JS in `assets/js/main.js` handles inline success/error states automatically.

### 2. Booking link (Calendly)
In [`contact.html`](contact.html), replace the Calendly placeholder:

```html
<a href="https://calendly.com/YOUR_CALENDLY/intro-call" ...>Book a free intro call →</a>
```

with your real Calendly link. (Optional: swap the button for an inline embed using
Calendly's embed snippet.)

### 3. Real links & content
- Update the **GitHub** and **LinkedIn** URLs in the footer of every page and in
  `contact.html` (search for `github.com/` and `linkedin.com/`).
- Replace placeholder **work** cards in `work.html` with real case studies
  (problem → what you built → result).
- Replace the **testimonial** "Client name" with a real attribution once you have permission.

---

## Deploy to GitHub Pages

**Option A — user site (recommended, served at the root `rbrizzo99.github.io`):**
1. Create a repo named exactly `rbrizzo99.github.io`.
2. Push these files to the `main` branch (the `.html` files at the repo root).
3. In **Settings → Pages**, set Source to `main` / `/ (root)`.
4. Live at `https://rbrizzo99.github.io` within a minute or two.

```bash
git init
git add .
git commit -m "Initial RizzoDev site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

**Option B — project site (served at a subpath, e.g. `you.github.io/RizzoDev/`):**
Same steps with any repo name. Note: the `404.html` uses root-absolute paths (`/index.html`),
which assume root hosting. If you deploy under a subpath, change those to relative paths
(`index.html`) or add a custom domain.

### Custom domain (optional)
Add a file named `CNAME` at the repo root containing just your domain (e.g.
`rizzodev.com`), then configure the DNS records GitHub shows you under Settings → Pages.

---

## Notes
- Fonts load from Google Fonts (JetBrains Mono). Everything else is local — no other
  third-party dependencies, no tracking.
- All motion respects `prefers-reduced-motion`.
