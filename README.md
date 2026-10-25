# Ballast site

Static landing page for the Ballast podcast. No build step.

| File | Purpose |
|------|---------|
| `index.html` | Markup and CSS |
| `site.js` | All behavior: the `SITE` config, `EPISODES`, `NEWS`, forms, nav, tide animation, analytics events |
| `js-flag.js` | One line that adds the `js` class to `<html>` so no-JS visitors see all content |
| `host.jpg` | Host photo (440x440) |
| `vercel.json` | Security headers, including the Content-Security-Policy |
| `og.png`, `favicon.ico`, `apple-touch-icon.png`, `robots.txt`, `sitemap.xml` | Share image, icons, crawler files |

## SITE config (top of `site.js`)

Every field is an empty string until the owner fills it in. A control that needs a value stays hidden until it has one.

| Field | What it unlocks |
|-------|-----------------|
| `newsletterFormId` | Formspree form ID, a fallback used for the newsletter only when `guestEndpoint` is empty. |
| `guestEndpoint` | Google Apps Script web app URL, already set. Must look like `https://script.google.com/macros/s/<id>/exec` or it is ignored. The guest form and the newsletter form (Subscribe section) POST to it (form-encoded, no custom headers) and expect JSON `{"ok":true}`. The newsletter forms send an extra hidden `form=newsletter` field; the guest form sends no `form` field, so the script treats it as a guest request. The script logs each submission to a Google Sheet and emails the guest or subscriber (and, for guest requests, the owner). It reads the fields `name, title, company, email, linkedin, form, _gotcha`, so keep those `name` attributes. Takes priority over `newsletterFormId`, `guestFormId` and `contactEmail`. Newsletter priority is endpoint, then `newsletterFormId`, then a `contactEmail` mailto draft. |
| `guestFormId` | Formspree form ID. Used only when `guestEndpoint` is empty. The "Be a guest" form is always visible; this is what makes it submit to Formspree. If it is empty but `contactEmail` is set, submitting opens an email draft to `contactEmail` (subject "Ballast guest pitch") with the typed fields in the body. With neither, submitting shows "Guest requests aren't being collected online yet" and keeps what was typed. |
| `contactEmail` | Public address. Last-resort fallback: the guest and newsletter forms open an email draft to it when neither an endpoint nor a form ID is set. Also used for error-message email links in the Formspree guest path. |
| `spotifyUrl`, `rssUrl` | The "Wherever you listen" buttons in the Subscribe section (the hero "Listen" button scrolls there). The Spotify button always shows; with no valid `spotifyUrl` it stays dimmed and unlinked, and a "Coming soon" line shows under it until the URL is set. `spotifyUrl` must be `https://open.spotify.com/...`. The RSS button appears only when `rssUrl` is set (any `https://` URL). |
| `hostSurname` | Appended to "Hosted by Hans" in the About section. |
| `hostLinkedIn` | LinkedIn profile URL, already set. Must start with `https://www.linkedin.com/in/`. Drives the About button and the footer link. |
| `hostAffiliation` | Shows a one-line disclosure under the bio, for example an employer or independence statement. |
| `newsStaleDays` | Soundings hides itself, and its nav link, when `NEWS.weekOf` is older than this many days (default 14). |
| `analytics` | `false` by default. Set to `true` only after Web Analytics is enabled in the Vercel project; `site.js` then loads `/_vercel/insights/script.js`. |

The newsletter signup (the Subscribe-section form) is visible whenever a delivery path exists: a valid `guestEndpoint`, a `newsletterFormId`, or a `contactEmail`. With none of them, the Subscribe section shows the single "Sign-ups open soon." note. The guest form is never hidden; see `guestEndpoint` and `guestFormId` for what it does without them. Under the newsletter form a short line promises one email per episode plus the weekly picks and unsubscribe by replying; keep that true.

## Adding episodes

Add an object to the top of `EPISODES` in `site.js` (newest first). A commented example sits above the empty array.

```js
{ number: 1, date: "2026-11-03", title: "...", guest: "...", role: "CIO", company: "...", duration: "50 min", takeaway: "...", url: "https://..." },
```

While `EPISODES` is empty, the Episodes section, its nav link and the hero "Latest episode" strip are hidden. With one entry they appear.

## Updating the news (Soundings)

Edit `NEWS` in `site.js` each week:

- `weekOf`: the week the items cover, as an ISO date, `"2026-10-19"`. It is not shown on the page; it only drives the staleness guard.
- `items`: 4 or 5 items, newest first. Each has `date`, `source`, `title`, `url` and `why` (one line for a CIO reader).

Staleness guard: if `weekOf` is older than `SITE.newsStaleDays`, or `items` is empty, the whole Soundings section and its nav link are hidden. Forgetting to refresh therefore removes the section instead of showing old news. Update `weekOf` whenever you refresh.

The current Soundings items (week of October 19, 2026) have NOT been fact-checked. Before merging, verify every figure in `NEWS` in `site.js` (percentages, dollar amounts, counts, quotes) against its linked source, or set `NEWS.items` to `[]` so the section hides. Fact-check every Soundings figure the same way before each future weekly update.

## Deploying

The site is hosted on Vercel.

- Pushing to `main` deploys to production automatically.
- Pushing any other branch creates a preview deployment.
- The headers in `vercel.json` apply to every response. Because the CSP only allows `'self'` scripts, any new third-party script, form target or image host must be added to `vercel.json` first, or it will be blocked.
- Analytics: `site.js` sends named events through Vercel Web Analytics (`newsletter_submit`, `guest_submit`, `platform_click`, with a `platform` property of spotify or rss). To turn it on: enable Web Analytics in the Vercel project, then set `SITE.analytics` to `true` in `site.js`. While it is `false` the insights script is not requested at all, so there is no 404; the events are queued and discarded.
- Preview deployments: Vercel injects its `vercel.live` toolbar into preview deployments and the CSP blocks it, so CSP errors that mention `vercel.live` on previews are expected. They do not occur in production.
- The CSP `connect-src` allows `https://script.google.com` plus `https://script.googleusercontent.com` (the Apps Script URL answers with a redirect to `script.googleusercontent.com`, so both origins must be allowed) for the guest and newsletter forms, and `https://formspree.io` for the optional Formspree fallbacks. If the Apps Script deployment changes, only `guestEndpoint` needs updating. If you use a Formspree fallback instead of the endpoint, also update the Privacy note in `index.html`, which currently describes Google only.
- `form-action` in the CSP is `'self'` because the forms submit with `fetch` (allowed by `connect-src https://formspree.io`). If a native form POST is ever added, `form-action` must also allow `https://formspree.io`.

## Checklist: values only the owner can provide

- [ ] Spotify show URL (`spotifyUrl`) to switch the "Wherever you listen" button on
- [ ] Optional: Formspree form ID for the newsletter (`newsletterFormId`) as a fallback
- [ ] Keep the Google Apps Script deployment live and set to allow anyone to POST (`guestEndpoint`); optionally a Formspree ID for the guest form (`guestFormId`) as a fallback
- [ ] Public contact email (`contactEmail`)
- [ ] Apple Podcasts, Spotify, YouTube and RSS URLs
- [ ] Host surname (`hostSurname`)
- [ ] Host LinkedIn URL (`hostLinkedIn`)
- [ ] Affiliation or disclosure line (`hostAffiliation`)
- [ ] Confirm the bio facts in the About section (role, selling and team-building background, why Ballast started) before launch
- [ ] Guest roster: replace the placeholder companies and unhide the `.roster` block in `index.html` (remove its `hidden` attribute) only with real, permissioned names
- [ ] Enable Web Analytics in the Vercel project, then set `analytics: true` in `site.js`
- [ ] Soundings: the current items (week of October 19, 2026) have NOT been fact-checked. Before merging, verify every figure in `NEWS` against its linked source, or set `NEWS.items` to `[]` so the section hides

## Brand icon sources

The Spotify logo on the "Wherever you listen" button is a brand mark and must be used unmodified. Follow the brand guidelines.

| Icon | File | Source |
|------|------|--------|
| Spotify | `spotify.svg` | Official icon (`Primary_Logo_Green_RGB.svg`) from the "Download Icon" zip on https://developer.spotify.com/documentation/design (https://developer.spotify.com/images/guidelines/design/2024-spotify-logo-icon.zip). Spotify allows the green icon on black or white backgrounds (it sits on the navy section here), asks for a clear space of half the icon height, and a minimum of 21px. |
| LinkedIn | `linkedin.png` | Unused since the hero logo row was removed (About and footer use a plain glyph). Official "In" bug from https://brand.linkedin.com/downloads; safe to delete. |
