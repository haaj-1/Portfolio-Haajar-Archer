# haajar — portfolio

Personal portfolio of **Haajar Saeed Archer**, Agentic Operator at Utopia Studio (Doha, Qatar).
I build AI agents, automation and data systems that run the work behind the work.

**Live:** https://haaj-1.github.io · **LinkedIn:** https://www.linkedin.com/in/haajar-archer-7900a0242/

## What's inside

- Experience at Utopia Studio (Utopia OS and the R&D Desk) and the APU Career Centre
- Selected projects: Utopia OS, R&D Desk, PRview, Utopia Ops Agent, PrePost Analytics, Qatar Economic Analysis, CNN vs ViT, and the Big Five Predictor
- Contact via LinkedIn

## How it's built

A static site with no build step, so it deploys straight to GitHub Pages.

- **Motion:** GSAP + ScrollTrigger for character reveals, parallax and the scroll-driven camera push; Lenis for smooth scrolling; a canvas particle field; and a scroll-velocity marquee.
- **Scenes:** the backdrop videos and project covers were generated with [Higgsfield](https://higgsfield.ai) (GPT Image + Kling v3), then looped and compressed with FFmpeg.
- **Type:** Instrument Serif, JetBrains Mono and Inter.
- **Accessibility:** respects `prefers-reduced-motion`, has keyboard-reachable navigation, and uses no horizontal scrolling on mobile.

Design inspired by the cinematic, scroll-led style of award-winning agency sites.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
