// Builds the CV as .docx and .html (for PDF printing) from one content model.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType, LevelFormat,
  BorderStyle, TabStopType,
} = require('docx');

const OUT_DIR = process.argv[2] || path.join(__dirname, 'out');
const PUBLIC = process.argv[3] === '--public'; // web copy: no phone or birth date

// Phone number and birth date stay out of this public repo: the full CV reads them
// from tools/private.json (gitignored), e.g. {"phone": "...", "birthDate": "..."}.
const PRIVATE_FILE = path.join(__dirname, 'private.json');
const PRIVATE = fs.existsSync(PRIVATE_FILE) ? JSON.parse(fs.readFileSync(PRIVATE_FILE, 'utf8')) : {};
if (!PUBLIC && (!PRIVATE.phone || !PRIVATE.birthDate)) {
  console.warn('tools/private.json missing phone/birthDate; the full CV will omit them.');
}
const NAME = PUBLIC ? 'Haajar-Archer-Resume' : 'Haajar-Saeed-Archer-CV';

// ---------- content ----------
// Inline markup: **bold**
const CV = {
  name: 'HAAJAR SAEED ARCHER',
  contact: [
    ...(!PUBLIC && PRIVATE.phone ? [{ text: PRIVATE.phone }] : []),
    { text: 'ihaajarcher@gmail.com' },
    { text: 'GitHub', url: 'https://github.com/haaj-1' },
    { text: 'LinkedIn', url: 'https://www.linkedin.com/in/haajar-archer-7900a0242/' },
    ...(PUBLIC ? [{ text: 'Portfolio', url: 'https://haaj-1.github.io/Portfolio-Haajar-Archer/' }] : []),
  ],
  meta: '**Country of Residence:** Qatar | **Nationality:** Canadian | '
    + (!PUBLIC && PRIVATE.birthDate ? `**Birth Date:** ${PRIVATE.birthDate} | ` : '')
    + '**Languages:** English (Native), Arabic (Conversational)',
  sections: [
    { title: 'EDUCATION', items: [
      { kind: 'degree', title: 'BACHELOR OF SCIENCE (HONOURS) IN COMPUTER SCIENCE WITH A SPECIALISM IN DATA ANALYTICS', date: 'Sep 2022 – Dec 2025',
        place: 'Asia Pacific University of Technology & Innovation (APU) – Kuala Lumpur, Malaysia' },
    ] },
    { title: 'SKILLS', items: [{ kind: 'bullets', bullets: [
      '**Languages:** TypeScript, JavaScript, Python, SQL',
      '**Web & Backend:** Next.js, React, Node.js, Convex, Clerk, FastAPI, Tailwind CSS, REST APIs & webhooks',
      '**AI & Agents:** LLM agents & tool calling, RAG & vector search, evals, Claude Code, Vercel AI SDK, Claude & OpenAI APIs, Composio, MCP',
      '**Data & ML:** Pandas, NumPy, Matplotlib, XGBoost, CatBoost, TensorFlow/Keras, BERT, SHAP, Machine & Deep Learning',
      '**Databases:** PostgreSQL, SQL Server, MongoDB, Redis',
      '**Analytics & BI:** PostHog, Power BI (DAX, Data Modelling, Dashboards), Google Analytics, SAS Enterprise Miner, R Studio, Excel',
      '**Tools & DevOps:** Git, GitHub Actions, Vercel, Docker, Vitest, Playwright, Sentry, Linear, Slack API, Word, PowerPoint',
      '**Certification:** CCNA: Introduction to Networks – Cisco',
    ] }] },
    { title: 'WORK EXPERIENCE', items: [
      { kind: 'role', title: 'AGENTIC OPERATOR INTERN', place: 'Utopia Studio – Doha, Qatar', date: 'Jun 2026 – Present', bullets: [
        'Build and maintain the studio’s two internal AI platforms, Utopia OS and the R&D Desk, in TypeScript, Next.js, React, Convex, Clerk and Vercel, with **~1,800 commits** and **2,800+ automated tests** so far.',
      ] },
      { kind: 'sub', title: 'Utopia OS', desc: 'the studio operating system used by fellows, the studio team and admins', bullets: [
        'Built end-to-end **fellow onboarding** across the fellow and studio/admin workspaces: multi-step forms with draft autosave, Google Drive document uploads, Ashby auto-fill and Calendly booking, plus an admin onboarding desk to review submissions, unlock modules and manage the fellow directory.',
        'Automated new-fellow **provisioning** with a 10-step, Composio-powered playbook (Linear project, Slack channel, Google Drive workspace, Claude project context, welcome email, team announcement) with retries, an audit trail and a CI-validated tool registry.',
        'Owned the **compliance desk**: a 15-step case runbook covering DocuSign Connect signature verification (HMAC webhooks), KYC review, director approvals and gated stipend release; named procedure owner in the studio SOP.',
        'Implemented privacy-first **product analytics**: PostHog with consent gating, masked session replay and URL redaction, plus a Convex daily-active-usage model and cron-computed activation funnel in a studio analytics dashboard.',
        'Shipped finance and comms tooling: multi-currency (USD/QAR/EUR) stipend and compute requests with tiered approvals and receipt reconciliation, and a Resend email platform with human-approval holds, delivery tracking and a branded template builder.',
        'Created **PRview**, a Claude Code plugin that auto-films a narrated 1080p walkthrough of every merged PR (Claude-planned script, Playwright capture, Deepgram/Kokoro voice, Whisper captions, FFmpeg), running in GitHub Actions to publish per-PR videos and a weekly release reel.',
      ] },
      { kind: 'sub', title: 'R&D Desk', desc: 'AI research workspace for venture fellows (formerly the Co-Build Hub)', bullets: [
        'Built per-fellow **RAG** and an “Ask” co-pilot on Convex vector search with OpenAI embeddings and tested tenant isolation, then extended it into a tool-calling **Concierge agent** (Vercel AI SDK, Claude & GPT models) with 4 specialist desks, memory, daily briefs and an eval harness.',
        'Built a **research engine**: scouts over arXiv, Semantic Scholar, OpenAlex, PubMed and ClinicalTrials.gov; Composio ingestion from Drive, Slack, Gmail and Linear; and a retrieval pipeline (query rewriting, reranking, chunk expansion) scoring **100% recall and 76% precision@5** on a gold eval set.',
        'Automated Co-Build fellow onboarding (Slack, Linear, Drive, DocuSign-gated welcome flow), added two-way **voice onboarding** with Deepgram/OpenAI speech, and generated journal-style research papers exportable to PDF and Google Docs.',
      ] },
      { kind: 'role', title: 'PROJECT MANAGEMENT INTERN', place: 'APU Career Centre – Kuala Lumpur, Malaysia', date: 'Jul 2024 – Nov 2024', gap: true, bullets: [
        'Developed an end-to-end survey pipeline (design, collection, cleaning, analysis) for 1,300+ students to deliver actionable insights.',
        'Analyzed student response data using Python, Excel, and Power BI to identify top-demanded industry certifications and programming languages, directly influencing curriculum planning and workshop development.',
        'Conducted market research on certification programs against current industry trends, benchmarking offerings against competitor institutions to identify gaps and opportunities.',
        'Contributed to performance analytics for 3+ career events, tracking engagement and satisfaction to optimize future events.',
        'Represented APU at NHCCE 2024 exhibition, networking with industry professionals to expand employer engagement opportunities for the career centre.',
      ] },
    ] },
    { title: 'PROJECTS', items: [
      { kind: 'project', title: 'UTOPIA OPS AGENT', date: 'May 2026', bullets: [
        'Built a zero-dependency Node.js onboarding operations agent that turns a fellow’s name and start date into an LLM-generated checklist with owners and due dates, pushes tasks to Linear, monitors completion and sends automated Slack reminders; deployed on Railway.',
      ] },
      { kind: 'project', title: 'QATAR MACROECONOMIC PERFORMANCE ANALYTICS', date: 'Jan 2026', bullets: [
        'Built a 3-layer medallion data warehouse (PostgreSQL, star schema) integrating 15 macroeconomic datasets (22,500+ records) for multi-dimensional analysis.',
        'Identified an 82.7B QR post-World Cup GDP decline driven by Manufacturing (-14%), Mining (-6%), and Transport through sectoral trend analysis (2019–2023).',
        'Discovered insights on sector growth (+18% Financial Services) and developed Power BI dashboards (DAX) to visualize GDP trends, Qatarization, and regional business patterns.',
      ] },
      { kind: 'project', title: 'YOUTUBE ML PREDICTION PLATFORM (PREPOST ANALYTICS)', date: 'Nov 2025', bullets: [
        'Built an ensemble ML system combining XGBoost, BERT (title sentiment and topic NLP) and CNN thumbnail analysis, trained on 51,888 videos, to predict views, engagement and CTR with 95.6% R² on test data.',
        'Built a full-stack analytics dashboard (React + FastAPI + SQL Server) with real-time YouTube API integration, JWT authentication, rate limiting, and scalable backend architecture.',
      ] },
      { kind: 'project', title: 'TRAFFIC SIGN RECOGNITION: CNN VS VISION TRANSFORMER', date: 'Mar 2026', bullets: [
        'Built a CNN and a Vision Transformer from scratch in TensorFlow for 43 sign classes, tuned with Keras Tuner and evaluated with ROC-AUC, confusion matrices and classification reports.',
      ] },
      { kind: 'project', title: 'BIG FIVE PERSONALITY PREDICTOR', date: 'Aug 2025', bullets: [
        'Trained 5 CatBoost models (one per OCEAN trait) behind a 25-question adaptive Streamlit app, with SHAP-ranked question selection and SHAP waterfall explanations for every prediction.',
      ] },
      { kind: 'project', title: 'DIGITAL MARKETING FUNNEL & WEB ANALYTICS', date: 'Sept 2025', bullets: [
        'Evaluated Amazon’s funnel across awareness, consideration, conversion and loyalty, and benchmarked traffic against eBay (33.9% vs 39.3% bounce rate) using Google Analytics data to recommend mobile drop-off fixes.',
      ] },
    ] },
  ],
};

const parse = (s) => s.split(/(\*\*[^*]+\*\*)/).filter(Boolean)
  .map((p) => (p.startsWith('**') ? { text: p.slice(2, -2), bold: true } : { text: p }));

// ---------- DOCX ----------
const FONT = 'Calibri', SIZE = 20, PAGE_W = 11906, MARGIN = 720, RIGHT = PAGE_W - MARGIN * 2;
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: SIZE, ...o });
const rich = (s, o = {}) => parse(s).map((p) => run(p.text, { bold: p.bold, ...o }));
const caps = (s) => run(s, { bold: true, characterSpacing: 20, size: 19 });
const dated = (left, date, spacing) => new Paragraph({
  spacing, tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
  children: [left, run('\t' + (date || ''))],
});
const bullet = (s) => new Paragraph({ numbering: { reference: 'dots', level: 0 }, spacing: { after: 15, line: 252 }, children: rich(s) });

const docxChildren = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
    children: [new TextRun({ text: CV.name, font: 'Cambria', bold: true, size: 34 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 10 },
    children: CV.contact.flatMap((c, i) => [
      ...(i ? [run(' | ')] : []),
      c.url ? new ExternalHyperlink({ link: c.url, children: [run(c.text, { underline: {} })] }) : run(c.text),
    ]) }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: rich(CV.meta) }),
];
for (const sec of CV.sections) {
  docxChildren.push(new Paragraph({
    spacing: { before: 140, after: 70 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 2 } },
    children: [run(sec.title, { bold: true, size: 23 })],
  }));
  sec.items.forEach((it, idx) => {
    const first = idx === 0;
    if (it.kind === 'degree') {
      docxChildren.push(dated(run(it.title, { bold: true, size: 19 }), it.date, { before: 40, after: 10 }));
      docxChildren.push(new Paragraph({ spacing: { after: 20 }, children: [run(it.place)] }));
    } else if (it.kind === 'role') {
      docxChildren.push(new Paragraph({ keepNext: true, pageBreakBefore: !!it.gap, spacing: { before: it.gap ? 0 : 40, after: 0 }, children: [caps(it.title)] }));
      docxChildren.push(dated(run(it.place), it.date, { after: 20 }));
    } else if (it.kind === 'sub') {
      docxChildren.push(new Paragraph({ spacing: { before: 60, after: 15 },
        children: [run(it.title, { bold: true, italics: true }), run(' — ' + it.desc, { italics: true })] }));
    } else if (it.kind === 'project') {
      docxChildren.push(dated(caps(it.title), it.date, { before: first ? 40 : 70, after: 10 }));
    }
    (it.bullets || []).forEach((s) => docxChildren.push(bullet(s)));
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
  numbering: { config: [{ reference: 'dots', levels: [{ level: 0, format: LevelFormat.BULLET, text: '●',
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } }, run: { size: 14 } } }] }] },
  sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 620, bottom: 620, left: MARGIN, right: MARGIN } } },
    children: docxChildren }],
});

// ---------- HTML (printed to PDF) ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = (s) => parse(s).map((p) => (p.bold ? `<b>${esc(p.text)}</b>` : esc(p.text))).join('');
const ul = (bs) => (bs && bs.length ? `<ul>${bs.map((b) => `<li>${html(b)}</li>`).join('')}</ul>` : '');
let body = `<h1>${CV.name}</h1>
<p class="c">${CV.contact.map((c) => (c.url ? `<a href="${c.url}">${c.text}</a>` : esc(c.text))).join(' | ')}</p>
<p class="c meta">${html(CV.meta)}</p>`;
for (const sec of CV.sections) {
  body += `<h2>${sec.title}</h2>`;
  for (const it of sec.items) {
    body += '<div class="item">';
    if (it.kind === 'degree') body += `<div class="row deg"><span>${esc(it.title)}</span><span>${it.date}</span></div><p>${esc(it.place)}</p>`;
    if (it.kind === 'role') body += `<div class="caps${it.gap ? ' gap' : ''}">${esc(it.title)}</div><div class="row"><span>${esc(it.place)}</span><span>${it.date}</span></div>`;
    if (it.kind === 'sub') body += `<div class="sub"><b>${esc(it.title)}</b> — ${esc(it.desc)}</div>`;
    if (it.kind === 'project') body += `<div class="row caps"><span>${esc(it.title)}</span><span class="d">${it.date}</span></div>`;
    body += ul(it.bullets) + '</div>';
  }
}
const page = `<!doctype html><html><head><meta charset="utf-8"><title>Haajar Saeed Archer — CV</title><style>
@page { size: A4; margin: 11mm 12.7mm; }
* { box-sizing: border-box; }
body { margin: 0; font: 9.6pt/1.32 Calibri, Carlito, "Segoe UI", Helvetica, Arial, sans-serif; color: #000; }
h1 { font: bold 17pt Cambria, Georgia, serif; text-align: center; margin: 0 0 2pt; letter-spacing: .02em; }
.c { text-align: center; margin: 0; } .meta { margin-bottom: 3pt; font-size: 8.9pt; }
.item { break-inside: avoid; }
a { color: #000; }
h2 { font-size: 11.2pt; margin: 8pt 0 4pt; padding-bottom: 1.5pt; border-bottom: 1px solid #000; }
.row { display: flex; justify-content: space-between; gap: 12pt; }
.row span:last-child, .d { white-space: nowrap; font-weight: normal; letter-spacing: 0; }
.deg span:first-child { font-weight: bold; font-size: 9.2pt; }
.caps { font-weight: bold; font-size: 9.2pt; letter-spacing: .06em; margin-top: 5pt; }
.caps.gap { margin-top: 8pt; }
.sub { font-style: italic; margin: 4pt 0 1pt; }
p { margin: 0 0 2pt; }
ul { margin: 1.5pt 0 0; padding-left: 15pt; }
li { margin: 0 0 1.2pt; padding-left: 2pt; }
li::marker { font-size: 7pt; }
</style></head><body>${body}</body></html>`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, NAME + '.html'), page);
Packer.toBuffer(doc).then((buf) => fs.writeFileSync(path.join(OUT_DIR, NAME + '.docx'), buf));
