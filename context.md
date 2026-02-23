You are Cursor. Work inside this repository.

GOAL
Create a “clean parked authority shell” for corydo.com on GitHub Pages for 1+ year pause.
We do NOT preserve old URLs (old format like /btc-prediction/). Domain currently has no SEO weight and most indexed pages dropped due to duplicate indexing of lab.corydo.com and thin content.
This is a “stop-the-bleeding” static sandbox, not a growth/SEO push.

HARD RULES
- Keep existing /index.html (already exists with styles + minimal structure). Reuse it; do not redesign from scratch.
- Do NOT generate mass pages (no 850 coins, no auto-generated /{coin}-signals/ pages).
- No “best crypto to buy now”, no “price prediction”, no “buy now” phrasing anywhere.
- Keep the site small: 5–7 pages total.
- Avoid doorway/thin content patterns. Each page must have real text and clear purpose.
- Keep it safe for “signals” niche (YMYL): strong disclaimer + neutral research framing.
- Provide robots.txt + sitemap.xml.
- Ensure GitHub Pages readiness (relative asset paths, no server dependencies).

SITE STRUCTURE (CREATE THESE PAGES)
- /index.html (already exists) — update copy/sections to reflect “Crypto Signals Research” and “Project paused”.
- /signals/index.html
- /about/index.html
- /methodology/index.html
- /disclaimer/index.html
- /privacy/index.html
- /terms/index.html
- /robots.txt
- /sitemap.xml

CONTENT REQUIREMENTS (COPY)
Tone: clear, neutral, non-promotional. No promises. No financial advice.
Use wording like:
- “Crypto signals research”
- “signal modeling”
- “market microstructure signals”
- “trade imbalance / liquidity pressure (research)”
Avoid “best”, “guaranteed”, “profit”, “buy now”.

Index page must include:
- H1: “Crypto Signals Research (Corydo)” (or equivalent)
- Status banner: “Project paused” + last updated month/year
- Short explanation (what the project explored) in bullet list:
  - market signals
  - trade imbalance modeling
  - liquidity pressure tracking
- A “Future direction” note: signals instead of predictions, but paused
- Prominent disclaimer summary with link to /disclaimer/
- Navigation links to all pages

Signals page (/signals/):
- Explain what “signals” means here (research concept, not trade advice)
- Describe categories of signals in plain language (e.g., momentum, liquidity shifts, imbalance)
- Clearly state: no real-time signals offered during pause
- Link to methodology + disclaimer

Methodology page (/methodology/):
- High-level outline of how signals would be derived (no proprietary details required)
- Emphasize: research, not advice, data can be noisy, no guarantees
- Include “what we do NOT do” list (no insider info, no guaranteed outcomes)

Disclaimer page (/disclaimer/):
- Strong “Not financial advice” + “No investment recommendations”
- Risk warnings: crypto volatility, losses possible
- “Use at your own risk”
- “Educational/research purposes”
- If applicable, note that site may contain outdated information during pause

Privacy + Terms:
- Minimal but legitimate templates.
- If no data collection: state “we do not actively collect personal data” (only if true).
- Mention GitHub Pages hosting, basic server logs possible.

TECHNICAL REQUIREMENTS
- Create a simple shared header/nav/footer across pages by copying the structure from existing index.html (no build tools).
- Reuse existing CSS/styles from index.html. If styles are inline, keep them; if separate, keep links consistent.
- All internal links must be relative and work on GitHub Pages.
- Add canonical tag on each page pointing to https://corydo.com/{path}/ (ensure trailing slash consistency for directory index pages).
- Add meta description per page (short, neutral).

robots.txt
- Allow indexing:
  User-agent: *
  Allow: /
- Include Sitemap: https://corydo.com/sitemap.xml

sitemap.xml
- Include only the 5–7 pages above, with <loc>, <lastmod> (today’s date is 2026-02-23), and <changefreq> “yearly”.

DELIVERABLES
1) Implement the full file structure and content.
2) Ensure no broken links.
3) Provide a short report in the final message:
   - files created/modified
   - key copy choices (proof you removed “buy now/prediction”)
   - any assumptions made (e.g., privacy data collection)

IMPORTANT CONTEXT
Old URLs should not be preserved. We are not doing redirects here. This repo is only the static parked shell.