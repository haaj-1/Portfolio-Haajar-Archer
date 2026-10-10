# haajar — portfolio

Personal portfolio of **Haajar Saeed Archer**, Agentic Operator at Utopia Studio (Doha, Qatar).
I build AI agents, automation and data systems that run the work behind the work.

**Live:** https://haajar-archer.vercel.app · **LinkedIn:** https://www.linkedin.com/in/haajar-archer-7900a0242/

## Pages

- **Home** (`index.html`): intro, highlights and featured work
- **About** (`about.html`): bio, experience at Utopia Studio and the APU Career Centre, education and toolkit
- **Work** (`work.html`): all projects, filterable by AI & Agents or Data & ML
- **Contact** (`contact.html`): LinkedIn, email and GitHub

## How it's built

A static site with no build step, deployed on Vercel (it redeploys automatically on every push to `main`).

- **Motion:** GSAP + ScrollTrigger for character reveals, parallax and the scroll-driven camera push; Lenis for smooth scrolling; a canvas particle field; and a scroll-velocity marquee.
- **Scenes:** the painterly garden backdrops and project covers were generated with [Higgsfield](https://higgsfield.ai) (GPT Image), upscaled to 4K, and animated in code with a slow camera drift, cursor parallax and drifting petals.
- **Type:** Instrument Serif, JetBrains Mono and Inter.
- **Accessibility:** respects `prefers-reduced-motion`, has keyboard-reachable navigation, and uses no horizontal scrolling on mobile.

Design inspired by the cinematic, scroll-led style of award-winning agency sites.

## Editing

The four pages are generated from `tools/build_pages.py`, so edit the content there rather than in the HTML:

```bash
python3 tools/build_pages.py
```

The resume is built from `tools/build_resume.js`, which needs Node.js:

```bash
cd tools && npm install
node build_resume.js out --public   # web copy (no phone or birth date)
node build_resume.js out            # full CV; reads tools/private.json (not committed)
```

Then print `out/*.html` to PDF. This copy is kept out of the public site.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
