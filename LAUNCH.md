# Vero — Launch Playbook

Everything you need to publish and promote. Work through each section in order.

---

## Step 1 — Chrome Web Store

### Before you submit

1. **Pay the $5 developer fee** at https://chrome.google.com/webstore/devconsole
2. **Take 5 screenshots** at exactly 1280×800 pixels (Chrome DevTools → device toolbar helps):
   - Screenshot 1: Google search page with AI Overview visible → then with it hidden (side by side or before/after)
   - Screenshot 2: The popup UI showing all 4 toggles on
   - Screenshot 3: A search result with the spam-demoted dim effect visible
   - Screenshot 4: A search result with the forum badge visible on a Reddit result
   - Screenshot 5: The popup tooltip hover in action
3. **Take a 440×280 promo tile** screenshot or design one (Figma/Canva) — blue/indigo gradient with "Vero" wordmark

### Store listing copy

**Name:** Vero

**Short description (132 chars max):**
```
Search like it's 2016. Hides AI Overviews, blocks SEO spam, and surfaces real results — one click.
```

**Full description:**
```
Remember when Google just gave you links?

AI Overviews push real results below the fold. Content farms and SEO spam crowd the first page. The discussions and opinions you're actually looking for — on Reddit, Hacker News, forums — get buried under AI-generated noise.

Vero brings back search the way it used to work. Four features, all toggleable, no account required:

🔵 Hide AI Overviews
Removes the AI summary box from the top of search results. Real links appear first again.

🔵 Force Web-only mode
Appends udm=14 to every Google search — Google's own parameter that bypasses AI features entirely and shows pure web results.

🔵 Demote spam domains
Visually dims results from known SEO farms and content mills. Real sources stand out.

🔵 Boost forum results
Highlights Reddit, Hacker News, and forum posts with a subtle badge so you can find real human discussions fast.

PRIVACY FIRST
Vero makes zero network requests. No analytics. No tracking. No account. Your searches stay private. Settings are stored locally in chrome.storage.sync.

OPEN SOURCE
Every line of code is on GitHub. Read it, audit it, fork it.

Works on Chrome 120+. Instant setup — install and it works.
```

**Category:** Productivity

**Language:** English

**Privacy policy URL:** https://YOUR_DOMAIN/privacy.html
*(Host the landing/privacy.html page first — see Step 2)*

---

## Step 2 — Landing page + email list

### Host on GitHub Pages (free, 5 minutes)

1. Create a new GitHub repo named `vero` (or push this project)
2. Go to **Settings → Pages → Source → Deploy from branch → main → /landing**
3. Your site will be live at `https://YOUR_USERNAME.github.io/vero`
4. Optional: buy `getvero.com` or `usevero.com` (~$12/yr on Namecheap) and point it there

### Wire up email capture

1. Sign up free at **https://buttondown.email** (free up to 100 subscribers)
2. Your username becomes `buttondown.email/YOUR_USERNAME`
3. In `landing/index.html`, replace `YOUR_USERNAME` in the form action:
   ```
   action="https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME"
   ```
4. That's it — Buttondown handles the confirmation email, list management, and sending

### Update placeholder links in landing/index.html

Replace these three strings:
- `STORE_ID` → your Chrome Web Store extension ID (found in the store URL after publishing)
- `YOUR_USERNAME` → your Buttondown username (in the form action)
- `YOUR_USERNAME/vero` → your GitHub handle/repo (in the GitHub link)

---

## Step 3 — Launch posts

Post these on the same day, ideally Tuesday–Thursday 9–11am US Eastern.

---

### Reddit — r/degoogle

**Title:**
```
I built a free Chrome extension that makes Google Search feel like 2016 again — called Vero
```

**Body:**
```
Remember when you searched for something and Google just... gave you links?

Over the past few years that's been replaced with AI-generated summaries at the top, SEO spam dominating the first page, and the real discussions you're looking for buried three scrolls down.

I built Vero to fix this. It's a free Chrome extension with four toggles:

- **Hide AI Overviews** — removes the AI summary box entirely, real results move up
- **Force Web-only mode** — appends udm=14 to every search (Google's own param that bypasses AI entirely)
- **Demote spam domains** — dims known SEO farms so real sources stand out
- **Boost forum results** — badges Reddit, HN, and forum posts so they're easy to spot

No account, no tracking, zero network requests. Open source. Install and it just works.

Chrome Web Store: [link]
GitHub: [link]

Happy to answer questions — and if you want features added, open an issue.
```

---

### Reddit — r/chrome

**Title:**
```
Vero — free extension that makes Google Search feel like 2016 again (hides AI Overviews, demotes spam, boosts forums)
```

**Body:**
```
Built a small extension called Vero that strips out everything that's made Google worse over the past few years. Four features:

1. Hides AI Overviews (MutationObserver-based, works even on back navigation)
2. Forces web-only mode via udm=14 — Google's own parameter, not a hack
3. Dims known spam/SEO-farm domains
4. Badges Reddit/forum results so they're easy to find

Free, open source, zero network requests. No account needed. Just links again.

Store: [link] | GitHub: [link]
```

---

### Reddit — r/privacy

**Title:**
```
Vero: open source Chrome extension that fixes Google Search and makes zero network requests
```

**Body:**
```
I wanted to bring back real Google Search results without sacrificing privacy. Most extensions phone home with analytics or require an account.

Vero does neither. It:
- Makes zero network requests (auditable on GitHub)
- Stores settings only in chrome.storage.sync — never touches our servers
- Requires no account, no sign-up, no email
- Is fully open source

It also actually fixes search: hides AI Overviews, forces web-only mode (udm=14), demotes SEO spam, and badges forum results. Basically search like it's 2016, without the privacy tradeoff.

GitHub: [link] | Chrome Web Store: [link]
```

---

### Hacker News — Show HN

**Title:**
```
Show HN: Vero – Chrome extension that makes Google Search feel like 2016 again
```

**Body:**
```
Google Search quality has degraded a lot. AI Overviews push organic results down, SEO farms dominate rankings, and forums (which often have the most useful answers) get buried. It used to just give you links.

I built Vero to fix this. It's a Chrome MV3 extension with four toggleable features:

1. Hide AI Overviews – MutationObserver-based, persists across Google's History API navigation
2. Force web-only mode – appends udm=14 (Google's own param, not a hack)
3. Demote spam domains – visual dimming of a curated blocklist, user-extensible
4. Boost forum results – badge overlay on Reddit, HN, and forum domains

Technical notes:
- TypeScript + Vite, two-pass build (ESM for popup/SW, IIFE for content script)
- Zero network requests, no analytics, no account
- MV3 compliant, uses only storage + activeTab permissions
- Content script CSS is standalone (no @import) for Chrome injection compatibility

Chrome Web Store: [link]
GitHub: [link]

The udm=14 trick is the most immediately impactful — it's Google's own internal parameter that routes around their AI features entirely. Happy to discuss the implementation.
```

---

### Product Hunt

**Name:** Vero

**Tagline (60 chars):**
```
Search like it's 2016. No AI slop, just results.
```

**Description:**
```
Remember when Google just gave you links?

AI Overviews push real results below the fold. SEO farms crowd the first page. The Reddit threads and forum discussions you actually want are buried under AI-generated noise.

Vero is a free Chrome extension that brings back search the way it used to work — four toggles, no account required:

🔵 Hide AI Overviews — removes the AI summary box so real links appear first
🔵 Force Web-only mode — uses Google's own udm=14 parameter to bypass AI entirely
🔵 Demote spam domains — dims known content farms so real sources stand out
🔵 Boost forum results — badges Reddit, HN, and forum posts for easy scanning

Zero network requests. No account. No tracking. Open source.

Works on Chrome 120+. Install and it just works.
```

**First comment (post this yourself right after launch):**
```
Hey PH! Built this out of frustration — every Google search had become a fight through AI summaries and SEO garbage before you could find a real result.

The most immediately useful feature is "Force Web-only mode" — it appends ?udm=14 to every search, which is Google's own internal parameter that routes you to their classic web index. No AI, no personalization, just links. It's like a time machine to when search was good.

Happy to answer questions about how it works or what's coming next. Cross-device sync is in the works — join the email list on the site if you want to know when it ships.
```

---

## Step 4 — After launch

**Day 1:**
- Post all three Reddit threads + HN + Product Hunt simultaneously
- Reply to every comment within the first 2 hours (this drives algorithm ranking)
- Post on X/Twitter: `Just launched Vero — search like it's 2016. Free Chrome extension that hides AI Overviews, blocks spam, and surfaces real results. Zero tracking. [store link]`

**Day 3–7:**
- Check for bug reports, fix fast, reply publicly "fixed in v1.0.1 — thanks for the report"
- Ask 5 people you know to leave a Chrome Web Store review

**At 1,000 email subscribers:**
- Introduce the $3/month "Vero Sync" tier: cross-device blocklist sync, custom domain rules, early access to new features
- Email your list first with a founder discount (e.g. $2/month locked forever)
- Use Stripe + a small Cloudflare Worker for the sync backend (total infra cost: ~$0–5/month)
