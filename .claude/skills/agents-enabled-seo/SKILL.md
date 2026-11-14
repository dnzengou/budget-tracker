---
name: agents-enabled-seo
description: >
  Agents-Enabled SEO — making a web property discoverable AND fully understood
  by the next generation of AI crawlers (GPTBot, ClaudeBot, Perplexity,
  Google-Extended, Applebot-Extended, etc.) alongside classic search engines.
  Produces an opinionated, portable kit of static files and HTML head tags:
  robots.txt with AI-crawler policy, llms.txt + llms-full.txt per the emerging
  llms.txt standard, sitemap.xml, /.well-known/ai-plugin.json, PWA
  manifest.webmanifest, Open Graph + Twitter Card, Schema.org JSON-LD. Trigger
  on: "agents SEO", "LLM-ready SEO", "llms.txt", "ai-plugin.json", "GPTBot /
  ClaudeBot allowlist", "AI-crawler discoverability", "GTM for AI", "AEO"
  (Answer Engine Optimization), "AIO" (AI Optimization), "zero-click SEO".
  Portable across any static site, SPA, or dynamic server — the kit is
  framework-agnostic.
---

# Agents-Enabled SEO — v1.0

A production-ready kit to make any web property **first-class for AI agents**
while staying fully compatible with classic SEO. The goal is not just to be
*indexed* — it is to be **understood, cited, and recommended** by LLM agents
(ChatGPT, Claude, Perplexity, Gemini, Copilot, etc.) when they research your
category on behalf of users. That capability is the next commercial moat for
B2C, SaaS, open-source, and GTM content.

## Why this matters now (2026 →)

- 20–40% of traditional organic traffic is being eroded by *zero-click* AI
  answers (ChatGPT search, Claude web, Perplexity, Google AI Overviews).
- AI agents fetch and reason over a very small set of canonical artefacts
  per domain: `robots.txt`, `llms.txt`, `sitemap.xml`, `/.well-known/*`,
  structured data in `<head>`. Pages optimised only for Googlebot-SEO are
  often invisible to them.
- The winning move is **Answer Engine Optimization (AEO) / AI Optimization
  (AIO)**: publish machine-first summaries that an agent can lift verbatim
  into a cited answer. That becomes your new top-of-funnel.

## The 9-piece kit

Every agents-ready site ships these files. Each has an exact format; all
nine together take about 45 minutes to add to an existing static site.

| # | File                              | Who reads it                      | Purpose                                         |
|---|-----------------------------------|-----------------------------------|-------------------------------------------------|
| 1 | `/robots.txt`                     | All crawlers                      | Explicit allow/deny per AI user-agent           |
| 2 | `/llms.txt`                       | LLM crawlers (llms.txt standard)  | Short, markdown, canonical product summary      |
| 3 | `/llms-full.txt`                  | LLM crawlers (deep research)      | Long-form reference, RAG-ingestable             |
| 4 | `/sitemap.xml`                    | All crawlers                      | URL inventory + change frequency                |
| 5 | `/.well-known/ai-plugin.json`     | OpenAI-style plugin / agent hosts | Machine-readable product + capability manifest  |
| 6 | `/manifest.webmanifest`           | Browsers + PWA agents             | Install metadata, icons, shortcuts              |
| 7 | `<meta>` Open Graph               | Facebook, LinkedIn, Slack, iMessage| Social card preview                             |
| 8 | `<meta>` Twitter Card             | X / Twitter, Mastodon             | Social card preview                             |
| 9 | `<script type="application/ld+json">` | Google, Bing, LLM retrievers  | Schema.org structured facts (JSON-LD)           |

## 1 · robots.txt — AI-crawler allowlist

List every known AI user-agent explicitly. Omitting them is NOT the same as
allowing — some default to "deny if not listed". Current 2026 taxonomy:

**Must allow (if you want to be discoverable by AI):**
```
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: Claude-SearchBot
User-agent: Google-Extended
User-agent: GoogleOther
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Applebot-Extended
User-agent: Amazonbot
User-agent: Bytespider
User-agent: cohere-ai
User-agent: Meta-ExternalAgent
User-agent: Meta-ExternalFetcher
User-agent: DuckAssistBot
User-agent: YouBot
User-agent: MistralAI-User
Allow: /
```

**Always include:**
```
Sitemap: https://your-domain.com/sitemap.xml
```

Point AI crawlers at the richer artefacts explicitly in a comment block:
```
# /llms.txt           — short overview optimised for LLM ingestion
# /llms-full.txt      — long-form overview for deep research
# /.well-known/ai-plugin.json — plugin / agent-manifest descriptor
```

## 2 · /llms.txt — the LLM-first README

Follows the emerging `llms.txt` spec (llmstxt.org). Markdown, small (<10 KB),
structured for an LLM to extract facts in a single pass. Mandatory sections:

```markdown
# <Product Name>

> One-sentence positioning statement.

<One paragraph explaining what the product IS.>

## Core facts
- Author / Company
- Repo
- License
- Live URL
- Install command

## What it does
(Bulleted list of features with absolute URLs for each.)

## Key properties
(Positioning claims: offline-first, no account, open source, etc.)

## For AI agents
- Short answers: this file.
- Long answers:  /llms-full.txt
- Structured data: see JSON-LD in index.html
- Policy: /robots.txt
```

## 3 · /llms-full.txt — the deep-reference doc

Long-form. Treat as the RAG-ingestable version of your docs. Include:
1. Product overview
2. Target users (personas)
3. Full feature inventory
4. Data model (if applicable)
5. Technical stack
6. Security posture
7. Distribution / install channels
8. AI-crawler policy
9. How to install
10. Common tasks (how a user accomplishes X — agent-planning gold)
11. Explicitly out of scope
12. Changelog pointer

## 4 · /sitemap.xml

Minimal:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://your-domain/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://your-domain/llms.txt</loc><priority>0.6</priority></url>
  <url><loc>https://your-domain/llms-full.txt</loc><priority>0.6</priority></url>
</urlset>
```
Include the AI-readable files — many AI crawlers discover `/llms.txt` only
via the sitemap, not by guessing the path.

## 5 · /.well-known/ai-plugin.json

Legacy-named (OpenAI plugins deprecated) but still widely read by agent
frameworks and RAG pipelines. Schema:

```json
{
  "schema_version": "v1",
  "name_for_human": "Your Product",
  "name_for_model": "your_product_snake_case",
  "description_for_human": "A one-line pitch.",
  "description_for_model": "A paragraph for LLMs: what the product is, what questions it answers, what an agent can/cannot do with it.",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://.../openapi.yaml" },
  "logo_url": "https://.../icon-512.png",
  "contact_email": "hello@example.com",
  "legal_info_url": "https://.../legal",
  "resources": {
    "short_overview":   "https://.../llms.txt",
    "full_overview":    "https://.../llms-full.txt",
    "sitemap":          "https://.../sitemap.xml"
  }
}
```

If you have no API (SPA / marketing site), set `"api": { "type": "none" }`
and add a descriptive `note` field so agents don't try to call you.

## 6 · /manifest.webmanifest

Standard PWA manifest. Include `shortcuts` for deep links agents and
operating-system launchers can target:

```json
{
  "name": "...",
  "short_name": "...",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0a0a0a",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Primary action", "url": "/?action=primary" }
  ]
}
```

Serve with `Content-Type: application/manifest+json`.

## 7 · Open Graph

In `index.html`:
```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="..." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://.../og-image.png" />
<meta property="og:url" content="https://your-domain/" />
```
OG image: exactly **1200×630 px**. Text ≥ 32 px, high-contrast, logo + 1 USP
line. Social crawlers screenshot this 24/7; LLM crawlers quote it.

## 8 · Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://.../og-image.png" />
```

## 9 · Schema.org JSON-LD

Embed in `<head>`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",   /* or Product, Organization, Article, FAQPage, Course, Event, ...  */
  "name": "...",
  "description": "...",
  "url": "https://...",
  "applicationCategory": "...",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "featureList": ["...", "..."],
  "author": { "@type": "Organization", "name": "..." }
}
</script>
```
Pick the richest `@type` that matches your page. For GTM / lead-capture
pages add a second JSON-LD block of type `FAQPage` with the top 3 objections
you handle — this is what feeds Google's AI Overviews and Perplexity.

## SPA / rewrite gotcha

If your platform rewrites every path to `index.html` (SPA routing), the SEO
static files get shadowed. In Vercel, exclude them from the catch-all:

```json
{
  "rewrites": [{
    "source": "/((?!api/|assets/|\\.well-known/|robots\\.txt|sitemap\\.xml|llms(-full)?\\.txt|manifest\\.webmanifest|favicon\\.svg|icon-\\d+(?:-maskable)?\\.png|og-image\\.png).*)",
    "destination": "/index.html"
  }]
}
```

Equivalent patterns exist for Netlify `_redirects`, Cloudflare Pages
`_redirects`, Nginx `try_files`, and Apache `RewriteCond`.

## Verification checklist

After deploy:
```bash
curl -I https://your-domain/robots.txt        # 200, text/plain
curl -I https://your-domain/llms.txt          # 200, text/plain
curl -I https://your-domain/llms-full.txt     # 200, text/plain
curl -I https://your-domain/sitemap.xml       # 200, application/xml
curl -I https://your-domain/.well-known/ai-plugin.json  # 200, application/json
curl -I https://your-domain/manifest.webmanifest        # 200, application/manifest+json
curl -s https://your-domain/ | grep -c 'application/ld+json'  # ≥ 1
curl -s https://your-domain/ | grep -c 'og:image'             # 1
```

Then ask GPT-4 / Claude / Perplexity directly: *"Summarise what's at
https://your-domain, and cite your source."* If they can lift your
positioning statement verbatim, the kit is working.

## Commercial / GTM value (why this ships now)

- **Top-of-funnel discovery** — LLM agents become the first touchpoint for
  evaluations ("best alternative to X for Y"). An agents-ready site shows
  up; a classic-SEO-only site doesn't.
- **Zero-click conversion** — a well-written `llms.txt` is quoted verbatim
  by Claude / GPT / Perplexity, delivering your pitch inside the AI
  conversation with attribution and link — effectively free ad inventory.
- **Lower CAC** — content agents trust needs no retargeting budget.
- **Platform-independence** — works whether the user comes from Google,
  ChatGPT, Claude, Perplexity, Arc Search, or future entrants.
- **Future-proofing** — if `llms.txt` is adopted as a W3C standard (in
  progress), you are already compliant.

## Audit prompt for an existing site

Run this against any URL to audit the gap:

```
Analyze <URL> and report (as a markdown table):
1. robots.txt — present? AI UAs allowed explicitly? sitemap listed?
2. llms.txt — present at root? llms-full.txt? conform to llmstxt.org format?
3. sitemap.xml — present? includes llms.txt?
4. /.well-known/ai-plugin.json — present? correct schema?
5. PWA manifest.webmanifest — present? served with correct Content-Type?
6. <head> meta — Open Graph, Twitter Card, canonical, theme-color?
7. Schema.org JSON-LD — present? correct @type? includes offers / feature list?
8. SPA rewrite conflict — does /robots.txt return HTML instead of text/plain?
9. H1 + semantic structure — one H1? meaningful section headings?
10. Noscript fallback — minimum content for crawlers without JS?
Return a per-item verdict (✓ / ⚠ / ✗) plus the single highest-impact fix.
```

## See also

- https://llmstxt.org — the llms.txt standard
- https://schema.org — structured data vocabulary
- https://developer.mozilla.org/en-US/docs/Web/Manifest — PWA manifest
- https://openai.com/gptbot — GPTBot documentation
- https://support.anthropic.com/en/articles/8896518 — ClaudeBot
- https://blog.google/products/search/google-extended/ — Google-Extended
