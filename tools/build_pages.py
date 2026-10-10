"""Generates the portfolio's static HTML pages from shared chunks."""
import sys, pathlib

# Writes into the repo root by default: python3 tools/build_pages.py
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent
LINKEDIN = "https://www.linkedin.com/in/haajar-archer-7900a0242/"
GITHUB = "https://github.com/haaj-1"
EMAIL = "ihaajarcher@gmail.com"
RESUME = "resume/Haajar-Archer-Resume.pdf"
ASSET_VERSION = "20261010-15"  # bump on each deploy so browsers fetch fresh CSS/JS

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3CradialGradient id='g' cx='35%25' cy='30%25'%3E"
           "%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='.45' stop-color='%23d9c9ff'/%3E%3Cstop offset='1' stop-color='%237b4cf0'/%3E"
           "%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='32' cy='32' r='28' fill='url(%23g)'/%3E%3C/svg%3E")

MEDIA_VERSION = "4k2"  # bump when the background videos/posters are replaced
SCENES = {
    name: (f"assets/{name}.mp4?v={MEDIA_VERSION}", f"assets/{name}.jpg?v={MEDIA_VERSION}", f"assets/{name}-4k.mp4?v={MEDIA_VERSION}")
    for name in ("hero", "data", "portal")
}

NAV = [("about", "about.html", "About"), ("work", "work.html", "Work"), ("contact", "contact.html", "Contact")]


def head(title, desc, first_scene):
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="assets/hero.jpg">
  <meta name="theme-color" content="#8a6cf0">
  <link rel="icon" href="{FAVICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css?v={ASSET_VERSION}">
</head>"""


LOADER = """
  <div class="loader" id="loader" aria-live="polite">
    <div class="loader__inner">
      <div class="wordmark wordmark--lg" aria-label="haajar archer">haaj<span class="accent">ar</span></div>
      <p class="mono loader__tag">AGENTIC OPERATOR&nbsp;&nbsp;·&nbsp;&nbsp;AI, AUTOMATION<br>AND DATA SYSTEMS</p>
      <div class="loader__bar"><span id="loaderBar"></span></div>
      <span class="mono loader__count" id="loaderCount">000</span>
    </div>
    <button class="pill pill--glass loader__enter" id="enterBtn" type="button" disabled>
      <span class="orb orb--sm" aria-hidden="true"></span>
      <span>Enter experience</span>
    </button>
  </div>"""


def stage(scenes):
    layers = []
    for i, name in enumerate(scenes):
        src, poster, src4k = SCENES[name]
        active = " is-active" if i == 0 else ""
        preload = "auto" if i == 0 else "metadata"
        layers.append(f"""    <div class="stage__layer{active}" data-scene="{name}">
      <video data-src="{src}" data-src-4k="{src4k}" poster="{poster}" muted loop playsinline preload="{preload}"></video>
    </div>""")
    return f"""
  <div class="stage" aria-hidden="true">
{chr(10).join(layers)}
    <canvas class="stage__particles" id="particles"></canvas>
    <div class="stage__veil"></div>
    <div class="stage__grain"></div>
  </div>

  <div class="cursor" id="cursor" aria-hidden="true"></div>
  <div class="curtain" aria-hidden="true"></div>"""


def header(page):
    current = ' aria-current="page"'
    links = "\n".join(
        f'        <li><a href="{href}"{current if key == page else ""}><span class="mono header__idx">0{i + 1}</span>{label}</a></li>'
        for i, (key, href, label) in enumerate(NAV))
    return f"""
  <header class="header" id="header">
    <a class="wordmark" href="index.html" aria-label="Haajar Archer, home">haaj<span class="accent">ar</span></a>
    <nav aria-label="Primary">
      <ul class="header__links">
{links}
        <li class="header__cv-mobile"><a href="{RESUME}" target="_blank" rel="noopener"><span class="mono header__idx">04</span>Resume</a></li>
      </ul>
    </nav>
    <div class="header__actions">
      <a class="pill pill--glass pill--sm" href="{RESUME}" target="_blank" rel="noopener">Resume <span aria-hidden="true">↓</span></a>
      <a class="header__orb" href="{LINKEDIN}" target="_blank" rel="noopener" aria-label="Connect on LinkedIn">
        <span class="orb" aria-hidden="true"></span>
        <span class="header__tip mono">CONNECT ON LINKEDIN</span>
      </a>
    </div>
  </header>"""


FOOTER = f"""
    <footer class="footer">
      <div class="footer__col">
        <span class="mono footer__h">Social</span>
        <a href="{LINKEDIN}" target="_blank" rel="noopener"><span class="mono">[01]</span> LinkedIn</a>
        <a href="{GITHUB}" target="_blank" rel="noopener"><span class="mono">[02]</span> GitHub</a>
        <a href="mailto:{EMAIL}"><span class="mono">[03]</span> Email</a>
      </div>
      <div class="footer__col">
        <span class="mono footer__h">Pages</span>
        <a href="index.html"><span class="mono">[01]</span> Home</a>
        <a href="about.html"><span class="mono">[02]</span> About</a>
        <a href="work.html"><span class="mono">[03]</span> Work</a>
        <a href="contact.html"><span class="mono">[04]</span> Contact</a>
      </div>
      <div class="footer__col">
        <span class="mono footer__h">Location</span>
        <span>Doha, Qatar</span>
        <span class="mono footer__small">Canadian · English &amp; Arabic</span>
      </div>
      <div class="footer__base mono">
        <span>© 2026 Haajar Saeed Archer</span>
        <span>Visuals generated with Higgsfield</span>
      </div>
    </footer>"""

SCRIPTS = f"""
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
  <script src="main.js?v={ASSET_VERSION}"></script>
</body>
</html>
"""


def page(name, title, desc, scenes, main):
    return (head(title, desc, scenes[0]) + f'\n<body class="is-loading" data-page="{name}">\n' + LOADER + stage(scenes)
            + header(name) + f'\n\n  <main id="main">\n{main}\n{FOOTER}\n  </main>\n' + SCRIPTS)


# ---------------------------------------------------------------- projects
PROJECTS = {
    "utopia-os": dict(title="Utopia OS", img="utopia-os", tags=["NEXT.JS", "CONVEX", "AGENTS", "ANALYTICS"],
                      desc="The studio’s operating system. I built fellow and admin onboarding, a 10-step provisioning agent, the compliance desk, finance flows and privacy-first analytics.",
                      note="INTERNAL · UTOPIA STUDIO"),
    "rnd-desk": dict(title="R&amp;D Desk", img="rnd-desk", tags=["RAG", "AI SDK", "RESEARCH"],
                     desc="An AI research workspace: a knowledge graph from your tools, research scouts, a tool-calling concierge agent and auto-written papers.",
                     note="INTERNAL · UTOPIA STUDIO"),
    "prview": dict(title="PRview", img="prview", tags=["CLAUDE CODE", "PLAYWRIGHT", "FFMPEG"],
                   desc="A Claude Code plugin that films a narrated, captioned 1080p before-and-after walkthrough of every merged PR, plus a weekly release reel.",
                   note="INTERNAL TOOL · CLAUDE CODE PLUGIN"),
    "ops-agent": dict(title="Utopia Ops Agent", img="ops-agent", tags=["NODE.JS", "LLM", "LINEAR", "SLACK"],
                      desc="A zero-dependency onboarding agent: a name and start date go in, and a checklist with owners and due dates comes out, synced to Linear with Slack reminders.",
                      href="https://github.com/haaj-1/Utopia-ops-node"),
    "prepost": dict(title="PrePost Analytics", img="prepost", tags=["XGBOOST", "BERT", "CNN", "FASTAPI"],
                    desc="Predicts a YouTube video’s performance before it’s published, using an ensemble trained on 51,888 videos (95.6% R²).",
                    href="https://github.com/haaj-1/Youtube-Analytics-Website", live="https://prepost-analytics.vercel.app"),
    "qatar": dict(title="Qatar Economic Analysis", img="qatar", tags=["POSTGRESQL", "STAR SCHEMA", "POWER BI"],
                  desc="A medallion warehouse over 15 datasets that traces an 82.7B QR post-World Cup GDP contraction sector by sector.",
                  href="https://github.com/haaj-1/Qatar-Economic-Analysis"),
    "traffic": dict(title="CNN vs Vision Transformer", img="traffic", tags=["TENSORFLOW", "CNN", "VIT"],
                    desc="Both architectures built from scratch, tuned with Keras Tuner, and compared across 43 traffic sign classes.",
                    href="https://github.com/haaj-1/Traffic_Sign_Recognition"),
    "personality": dict(title="Big Five Predictor", img="personality", tags=["CATBOOST", "SHAP", "STREAMLIT"],
                        desc="Five CatBoost models behind an adaptive 25-question quiz, with SHAP explanations for every trait.",
                        href="https://github.com/haaj-1/Personality_Trait_Predictor", live="https://personalitytraitpredictor.streamlit.app/"),
}


def card(key, wide=False):
    p = PROJECTS[key]
    cls = "card card--wide" if wide else "card"
    tags = "".join(f"<span>{t}</span>" for t in p["tags"])
    inner = f"""
          <div class="card__media"><img src="assets/work/{p['img']}.jpg" alt="" loading="lazy"></div>
          <div class="card__meta mono">{tags}</div>
          <h3 class="card__title">{p['title']}</h3>
          <p class="card__desc">{p['desc']}</p>"""
    if "live" in p:
        return f"""        <article class="{cls}">{inner}
          <div class="card__links">
            <a class="card__link card__link--live" href="{p['live']}" target="_blank" rel="noopener"><span class="card__dot" aria-hidden="true"></span>Live site <span aria-hidden="true">↗</span></a>
            <a class="card__link" href="{p['href']}" target="_blank" rel="noopener">GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </article>"""
    if "href" in p:
        return f"""        <a class="{cls}" href="{p['href']}" target="_blank" rel="noopener">{inner}
          <span class="mono card__note">VIEW ON GITHUB ↗</span>
        </a>"""
    return f"""        <article class="{cls}">{inner}
          <span class="mono card__note">{p['note']}</span>
        </article>"""


CTA = """
    <section class="cta" data-scene="{scene}">
      <span class="tag">Next</span>
      <h2 class="display display--md">
        <span class="line">{l1}</span>
        <span class="line indent"><span class="arrow">↪</span>{l2}</span>
      </h2>
      <div class="cta__row">
        {buttons}
      </div>
    </section>"""


def btn(href, label, primary=False, external=False):
    cls = "pill pill--glass pill--lg magnetic" if primary else "pill pill--ghost magnetic"
    ext = ' target="_blank" rel="noopener"' if external else ""
    orb = '<span class="orb orb--sm" aria-hidden="true"></span>' if primary else ""
    return f'<a class="{cls}" href="{href}"{ext}>{orb}<span>{label}</span><span aria-hidden="true">{"↗" if external else "→"}</span></a>'


# ---------------------------------------------------------------- home
HOME = f"""
    <section class="hero" data-scene="hero" id="top">
      <p class="mono kicker" data-reveal>AGENTIC OPERATOR AT UTOPIA STUDIO.<br>BUILDING AI AGENTS, AUTOMATION<br>AND DATA SYSTEMS IN DOHA, QATAR</p>
      <h1 class="display" data-intro>
        <span class="line"><em class="it">I</em> build agents</span>
        <span class="line">&amp; data systems</span>
        <span class="line">people rely on</span>
      </h1>
      <div class="hero__quick" data-reveal>
        {btn("work.html", "See my work", primary=True)}
        {btn("about.html", "About me")}
      </div>
      <div class="hero__scroll mono" aria-hidden="true"><span>Scroll</span><i></i></div>
    </section>

    <section class="statement" data-scene="hero">
      <span class="tag">Approach</span>
      <h2 class="display display--md">
        <span class="line"><em class="it">I</em> automate</span>
        <span class="line indent"><span class="arrow">↪</span>the work behind</span>
        <span class="line">the work</span>
      </h2>
      <p class="mono caption" data-reveal>I TURN MANUAL OPERATIONS INTO AGENTS, PIPELINES AND PRODUCT, SO TEAMS SPEND THEIR TIME ON WHAT MATTERS</p>
    </section>

    <section class="stats" data-scene="data" aria-label="Highlights">
      <div class="stat"><span class="stat__num" data-count="1800" data-suffix="+">0</span><span class="mono stat__label">COMMITS SHIPPED AT UTOPIA STUDIO</span></div>
      <div class="stat"><span class="stat__num" data-count="2800" data-suffix="+">0</span><span class="mono stat__label">AUTOMATED TESTS WRITTEN</span></div>
      <div class="stat"><span class="stat__num" data-count="10" data-suffix="">0</span><span class="mono stat__label">STEP AUTOMATED ONBOARDING PLAYBOOK</span></div>
    </section>

    <section class="projects" data-scene="data">
      <div class="section-head section-head--row">
        <div>
          <span class="tag">Featured</span>
          <h2 class="display display--md">
            <span class="line"><em class="it">Selected</em></span>
            <span class="line">work</span>
          </h2>
        </div>
        {btn("work.html", "All projects")}
      </div>
      <div class="grid">
{card("utopia-os", wide=True)}
{card("prview")}
{card("rnd-desk")}
{card("prepost")}
{card("ops-agent")}
      </div>
    </section>
""" + CTA.format(scene="hero", l1="Let’s <em class=\"it\">build</em>", l2="something meaningful",
                 buttons=btn(LINKEDIN, "Get in touch", primary=True, external=True) + "\n        " + btn("about.html", "More about me"))

# ---------------------------------------------------------------- about
SKILLS = [
    ("Languages", ["TypeScript", "JavaScript", "Python", "SQL"]),
    ("Web &amp; Backend", ["Next.js", "React", "Node.js", "Convex", "Clerk", "FastAPI", "Tailwind CSS", "REST &amp; webhooks"]),
    ("AI &amp; Agents", ["LLM agents &amp; tool calling", "RAG &amp; vector search", "Evals", "Claude Code", "Vercel AI SDK", "Claude &amp; OpenAI APIs", "Composio", "MCP"]),
    ("Data &amp; ML", ["Pandas", "NumPy", "XGBoost", "CatBoost", "TensorFlow / Keras", "BERT", "SHAP"]),
    ("Databases", ["PostgreSQL", "SQL Server", "MongoDB", "Redis"]),
    ("Analytics &amp; BI", ["PostHog", "Power BI (DAX)", "Google Analytics", "SAS Enterprise Miner", "R Studio", "Excel"]),
    ("Tools &amp; DevOps", ["Git", "GitHub Actions", "Vercel", "Docker", "Vitest", "Playwright", "Sentry", "Linear", "Slack API"]),
]
skills_html = "\n".join(
    f"""        <div class="toolkit__group">
          <span class="mono toolkit__h">({i + 1:03d}) {name}</span>
          <div class="chips mono">{''.join(f'<span>{s}</span>' for s in items)}</div>
        </div>""" for i, (name, items) in enumerate(SKILLS))

ABOUT = f"""
    <section class="page-hero" data-scene="hero">
      <h1 class="display" data-intro data-proximity>
        <span class="line"><em class="it">Hi,</em> I’m</span>
        <span class="line">Haajar Archer</span>
      </h1>
    </section>

    <section class="bio" data-scene="hero">
      <div class="bio__text" data-reveal>
        <p class="bio__lede">I’m an Agentic Operator at Utopia Studio in Doha. I build the <em>AI agents</em> and internal platforms that run the studio’s day-to-day work, from onboarding new fellows to compliance, analytics and research.</p>
        <p>I came to engineering through data. I studied <b>Computer Science with a specialism in Data Analytics</b>, building warehouses, dashboards and machine learning models. Now I combine the two: I ship <b>full-stack products in TypeScript and Next.js</b>, wire them into the tools teams already use, and measure whether they actually help.</p>
        <p>I like work that removes busywork for real people, and I care about testing it properly. I’ve written <b><span class="countup" data-count="2800">2,800</span>+ automated tests</b> at Utopia so far.</p>
      </div>
      <dl class="facts" data-reveal>
        <div><dt class="mono"><svg class="fact-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>Based in</dt><dd>Doha, Qatar <span class="live-time mono" data-tz="Asia/Qatar" hidden></span></dd></div>
        <div><dt class="mono"><svg class="fact-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>Currently</dt><dd>Agentic Operator Intern, Utopia Studio</dd></div>
        <div><dt class="mono"><svg class="fact-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>Studied</dt><dd>BSc (Hons) Computer Science, Data Analytics · APU</dd></div>
        <div><dt class="mono"><svg class="fact-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>Languages</dt><dd>English (native), Arabic (conversational)</dd></div>
        <div><dt class="mono"><svg class="fact-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-3 5 3-1.5-8"/></svg>Certified</dt><dd>CCNA: Introduction to Networks · Cisco</dd></div>
      </dl>
    </section>

    <section class="experience" data-scene="hero" id="experience">
      <div class="section-head">
        <span class="tag">Experience</span>
        <h2 class="display display--md">
          <span class="line"><em class="it">Where</em></span>
          <span class="line">I’ve worked</span>
        </h2>
      </div>
      <div class="jobs jobs--timeline">
        <div class="rail" aria-hidden="true"><span class="rail__fill"></span></div>
        <article class="job is-open">
          <button class="job__head" type="button" aria-expanded="true">
            <span class="mono job__idx">(001)</span>
            <span class="job__title">Agentic Operator Intern</span>
            <span class="job__org">Utopia Studio · Doha</span>
            <span class="mono job__date">JUN 2026 — PRESENT</span>
            <span class="job__toggle" aria-hidden="true"></span>
          </button>
          <div class="job__body">
            <div class="job__inner">
              <p class="job__lede">I work on Utopia OS, the studio’s internal operating system, with 1,100+ commits and 2,000+ automated tests so far.</p>
              <div class="job__cols">
                <div>
                  <h3 class="mono">UTOPIA OS · STUDIO OPERATING SYSTEM</h3>
                  <ul>
                    <li><b>Fellow onboarding, end to end.</b> Fellow-side forms with autosave, Drive uploads, ATS auto-fill and booking, plus the admin/studio onboarding desk for review and module unlocks.</li>
                    <li><b>Provisioning playbook.</b> 10 automated steps (Linear, Slack, Google Drive, Claude project context, welcome email) with retries and an audit trail.</li>
                    <li><b>Compliance desk.</b> A 15-step case runbook with DocuSign signature verification, director approvals and gated stipends.</li>
                    <li><b>Product analytics.</b> Consent-gated PostHog, masked replays, daily-active usage and an activation funnel dashboard.</li>
                    <li><b>PRview.</b> A Claude Code plugin that films a narrated video walkthrough of every merged PR.</li>
                  </ul>
                </div>
                <div>
                  <h3 class="mono">R&amp;D DESK · AI RESEARCH WORKSPACE</h3>
                  <ul>
                    <li><b>RAG + Concierge agent.</b> Per-fellow vector search and a tool-calling agent with 4 specialist desks, memory and evals.</li>
                    <li><b>Research engine.</b> Scouts over arXiv, Semantic Scholar, OpenAlex and PubMed, with 100% recall and 76% precision@5 on a gold set.</li>
                    <li><b>Voice onboarding.</b> Two-way speech onboarding plus auto-generated, journal-style research papers.</li>
                  </ul>
                  <div class="chips mono">
                    <span>TypeScript</span><span>Next.js</span><span>React</span><span>Convex</span><span>Clerk</span><span>Vercel AI SDK</span><span>Claude</span><span>Composio</span><span>PostHog</span><span>Playwright</span><span>Vitest</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
        <article class="job">
          <button class="job__head" type="button" aria-expanded="false">
            <span class="mono job__idx">(002)</span>
            <span class="job__title">Project Management Intern</span>
            <span class="job__org">APU Career Centre · Kuala Lumpur</span>
            <span class="mono job__date">JUL 2024 — NOV 2024</span>
            <span class="job__toggle" aria-hidden="true"></span>
          </button>
          <div class="job__body">
            <div class="job__inner">
              <ul class="job__single">
                <li>Built an end-to-end survey pipeline (design, collection, cleaning, analysis) for <b>1,300+ students</b>.</li>
                <li>Analysed responses in Python, Excel and Power BI to surface the most-demanded certifications and languages, which shaped curriculum and workshop planning.</li>
                <li>Benchmarked certification programmes against competitor institutions and ran performance analytics for 3+ career events.</li>
                <li>Represented APU at the NHCCE 2024 exhibition to grow employer engagement.</li>
              </ul>
              <div class="chips mono"><span>Python</span><span>Power BI</span><span>Excel</span><span>Survey design</span></div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="education" data-scene="hero" id="education">
      <div class="section-head">
        <span class="tag">Education</span>
        <h2 class="display display--md">
          <span class="line"><em class="it">Where</em></span>
          <span class="line">I studied</span>
        </h2>
      </div>
      <div class="jobs jobs--timeline">
        <div class="rail" aria-hidden="true"><span class="rail__fill"></span></div>
        <article class="job is-open">
          <button class="job__head" type="button" aria-expanded="true">
            <span class="mono job__idx">(001)</span>
            <span class="job__title">BSc (Hons) Computer Science</span>
            <span class="job__org">Specialism in Data Analytics · APU, Kuala Lumpur</span>
            <span class="mono job__date">SEP 2022 — DEC 2025</span>
            <span class="job__toggle" aria-hidden="true"></span>
          </button>
          <div class="job__body">
            <div class="job__inner">
              <p class="job__lede">Asia Pacific University of Technology &amp; Innovation, Kuala Lumpur, Malaysia.</p>
              <ul class="job__single">
                <li>Specialised in <b>data analytics</b>: data warehousing, business intelligence, machine learning and deep learning.</li>
                <li>Projects included a YouTube performance predictor (XGBoost, BERT, CNN), a Qatar macroeconomic data warehouse, and a CNN vs Vision Transformer study.</li>
              </ul>
              <div class="chips mono"><span>Python</span><span>SQL</span><span>Power BI</span><span>SAS Enterprise Miner</span><span>R Studio</span><span>TensorFlow</span></div>
            </div>
          </div>
        </article>
        <article class="job">
          <button class="job__head" type="button" aria-expanded="false">
            <span class="mono job__idx">(002)</span>
            <span class="job__title">CCNA: Introduction to Networks</span>
            <span class="job__org">Certification · Cisco</span>
            <span class="mono job__date">CERTIFICATION</span>
            <span class="job__toggle" aria-hidden="true"></span>
          </button>
          <div class="job__body">
            <div class="job__inner">
              <p class="job__lede">Cisco Networking Academy certification covering network fundamentals, addressing, switching and routing basics.</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="capabilities" data-scene="hero" aria-label="What I do">
      <span class="tag">What I do</span>
      <div class="marquee" aria-hidden="true"><div class="marquee__track"></div></div>
      <ul class="sr-only" id="capList">
        <li>AI Agents &amp; Tool Calling</li>
        <li>RAG &amp; Vector Search</li>
        <li>Workflow Automation</li>
        <li>Full-stack Web Apps</li>
        <li>Product Analytics</li>
        <li>Data Warehousing</li>
        <li>Machine Learning</li>
        <li>Dashboards &amp; BI</li>
        <li>Slack · Linear · Drive Integrations</li>
        <li>Evals &amp; Testing</li>
        <li>Developer Tooling</li>
        <li>Data Storytelling</li>
      </ul>
    </section>

    <section class="toolkit" data-scene="hero">
      <div class="section-head section-head--row">
        <div>
          <span class="tag">Toolkit</span>
          <h2 class="display display--md">
            <span class="line">Tools <em class="it">I</em></span>
            <span class="line">work with</span>
          </h2>
        </div>
        {btn(RESUME, "Download resume", external=True)}
      </div>
      <div class="toolkit__grid">
{skills_html}
      </div>
    </section>
""" + CTA.format(scene="portal", l1="See what <em class=\"it\">I’ve</em>", l2="built",
                 buttons=btn("work.html", "View my work", primary=True) + "\n        " + btn("contact.html", "Contact"))

# ---------------------------------------------------------------- work
WORK = f"""
    <section class="page-hero" data-scene="hero">
      <h1 class="display" data-intro>
        <span class="line">Some</span>
        <span class="line"><em class="it">of my</em> projects</span>
      </h1>
      <p class="mono caption" data-reveal>A SELECTION WHERE AGENTS, DATA AND PRODUCT COME TOGETHER</p>
    </section>

    <section class="projects projects--page" data-scene="hero">
      <div class="filters mono" role="group" aria-label="Filter projects">
        <button type="button" class="is-active" data-filter="all">All <sup>8</sup></button>
        <button type="button" data-filter="ai">AI &amp; Agents <sup>4</sup></button>
        <button type="button" data-filter="data">Data &amp; ML <sup>4</sup></button>
      </div>
      <div class="grid" id="workGrid">
{card("utopia-os", wide=True).replace('class="card card--wide"', 'class="card card--wide" data-cat="ai"', 1)}
{card("rnd-desk").replace('class="card"', 'class="card" data-cat="ai"', 1)}
{card("prview").replace('class="card"', 'class="card" data-cat="ai"', 1)}
{card("ops-agent").replace('class="card"', 'class="card" data-cat="ai"', 1)}
{card("prepost").replace('class="card"', 'class="card" data-cat="data"', 1)}
{card("qatar").replace('class="card"', 'class="card" data-cat="data"', 1)}
{card("traffic").replace('class="card"', 'class="card" data-cat="data"', 1)}
{card("personality").replace('class="card"', 'class="card" data-cat="data"', 1)}
      </div>
    </section>
""" + CTA.format(scene="portal", l1="Like <em class=\"it\">what</em>", l2="you see?",
                 buttons=btn(LINKEDIN, "Get in touch", primary=True, external=True) + "\n        " + btn(GITHUB, "GitHub", external=True))

# ---------------------------------------------------------------- contact
CONTACT = f"""
    <section class="contact" data-scene="portal" id="contact">
      <span class="tag">Stay in touch</span>
      <h1 class="display" data-intro>
        <span class="line">Let’s <em class="it">build</em></span>
        <span class="line indent"><span class="arrow">↪</span>something</span>
        <span class="line">meaningful</span>
      </h1>
      <p class="mono caption" data-reveal>HAVE A ROLE, AN IDEA OR A WORKFLOW THAT SHOULD RUN ITSELF? LET’S TALK</p>
      <div class="contact__ctas" data-reveal>
        <a class="pill pill--glass pill--lg magnetic" href="{LINKEDIN}" target="_blank" rel="noopener">
          <span class="orb orb--sm" aria-hidden="true"></span><span>Connect on LinkedIn</span><span aria-hidden="true">↗</span>
        </a>
        <button class="pill pill--ghost magnetic copy-email" type="button" data-email="{EMAIL}">
          <span class="copy-email__label">{EMAIL}</span><span class="mono copy-email__hint">COPY</span>
        </button>
      </div>
      <dl class="contact__list" data-reveal>
        <div><dt class="mono">[01] LinkedIn</dt><dd><a href="{LINKEDIN}" target="_blank" rel="noopener">haajar-archer ↗</a></dd></div>
        <div><dt class="mono">[02] Email</dt><dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd></div>
        <div><dt class="mono">[03] GitHub</dt><dd><a href="{GITHUB}" target="_blank" rel="noopener">haaj-1 ↗</a></dd></div>
        <div><dt class="mono">[04] Resume</dt><dd><a href="{RESUME}" target="_blank" rel="noopener">Download PDF ↓</a></dd></div>
      </dl>
    </section>"""

DESC = "Haajar Saeed Archer builds AI agents, automation and data systems. Agentic Operator at Utopia Studio, Doha."
pages = {
    "index.html": page("home", "Haajar Archer — Agentic Operator", DESC, ["hero", "data"], HOME),
    "about.html": page("about", "About — Haajar Archer", "About Haajar Archer: experience, education and toolkit.", ["hero", "portal"], ABOUT),
    "work.html": page("work", "Work — Haajar Archer", "Selected projects by Haajar Archer: AI agents, automation, data and ML.", ["hero", "portal"], WORK),
    "contact.html": page("contact", "Contact — Haajar Archer", "Get in touch with Haajar Archer via LinkedIn or email.", ["portal"], CONTACT),
}
for name, html in pages.items():
    (OUT / name).write_text(html)
    print("wrote", name, len(html))
