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
| `newsletterFormId` | Formspree form ID. Shows the two newsletter signup forms (premise section and Subscribe section). Together with `contactEmail` it also decides whether the hero "Get episode 1 by email" button and the premise-section signup block appear (see below). Only letters, digits, `_` and `-` are accepted. |
| `guestFormId` | Formspree form ID. The "Be a guest" form is always visible; this is what makes it submit to Formspree. If it is empty but `contactEmail` is set, submitting opens an email draft to `contactEmail` (subject "Ballast guest pitch") with the typed fields in the body. With neither, submitting shows "Guest requests aren't being collected online yet" and keeps what was typed. |
| `contactEmail` | Public address. If `newsletterFormId` is not set, the newsletter form is replaced by an "Email us" mailto button. It is also the fallback for the guest form (see `guestFormId`), and adds an "Email us directly" link to form error messages. |
| `appleUrl`, `spotifyUrl`, `youtubeUrl`, `rssUrl` | Each shows its button in the Subscribe section. The whole "Wherever you listen" column appears when at least one is set. URLs must start with `https://`. |
| `hostSurname` | Appended to "Hosted by Hans" in the About section. |
| `hostLinkedIn` | Shows the LinkedIn button (About) and the footer LinkedIn link. Must start with `https://`. |
| `hostAffiliation` | Shows a one-line disclosure under the bio, for example an employer or independence statement. |
| `newsStaleDays` | Soundings hides itself, and its nav link, when `NEWS.weekOf` is older than this many days (default 14). |
| `analytics` | `false` by default. Set to `true` only after Web Analytics is enabled in the Vercel project; `site.js` then loads `/_vercel/insights/script.js`. |

If neither a form ID nor a contact email is set for the newsletter, the hero "Get episode 1 by email" button and the premise-section signup block are hidden (so "Be a guest" stands alone), and the Subscribe section shows the single "Sign-ups open soon." note. The guest form is never hidden; see `guestFormId` above for what it does without a form ID. Once `newsletterFormId` or `contactEmail` is set, the hero button and the premise signup appear.

## Adding episodes

Add an object to the top of `EPISODES` in `site.js` (newest first). A commented example sits above the empty array.

```js
{ number: 1, date: "2026-11-03", title: "...", guest: "...", role: "CIO", company: "...", duration: "50 min", takeaway: "...", url: "https://..." },
```

While `EPISODES` is empty, the Episodes section, its nav link and the hero "Latest episode" strip are hidden. With one entry they appear, and the hero button changes from "Get episode 1 by email" to "Listen".

## Updating the news (Soundings)

Edit `NEWS` in `site.js` each week:

- `week`: the display label, for example `"Week of October 19, 2026"`.
- `weekOf`: the same week as an ISO date, `"2026-10-19"`. This drives the staleness guard.
- `items`: 4 or 5 items, newest first. Each has `date`, `source`, `title`, `url` and `why` (one line for a CIO reader).

Staleness guard: if `weekOf` is older than `SITE.newsStaleDays`, or `items` is empty, the whole Soundings section and its nav link are hidden. Forgetting to refresh therefore removes the section instead of showing old news. Update `weekOf` whenever you refresh.

The current Soundings items (week of October 19, 2026) have NOT been fact-checked. Before merging, verify every figure in `NEWS` in `site.js` (percentages, dollar amounts, counts, quotes) against its linked source, or set `NEWS.items` to `[]` so the section hides. Fact-check every Soundings figure the same way before each future weekly update.

## Deploying

The site is hosted on Vercel.

- Pushing to `main` deploys to production automatically.
- Pushing any other branch creates a preview deployment.
- The headers in `vercel.json` apply to every response. Because the CSP only allows `'self'` scripts, any new third-party script, form target or image host must be added to `vercel.json` first, or it will be blocked.
- Analytics: `site.js` sends named events through Vercel Web Analytics (`cta_episode1_email`, `newsletter_submit`, `guest_submit`, `platform_click`). To turn it on: enable Web Analytics in the Vercel project, then set `SITE.analytics` to `true` in `site.js`. While it is `false` the insights script is not requested at all, so there is no 404; the events are queued and discarded.
- Preview deployments: Vercel injects its `vercel.live` toolbar into preview deployments and the CSP blocks it, so CSP errors that mention `vercel.live` on previews are expected. They do not occur in production.
- `form-action` in the CSP is `'self'` because the forms submit with `fetch` (allowed by `connect-src https://formspree.io`). If a native form POST is ever added, `form-action` must also allow `https://formspree.io`.

## Checklist: values only the owner can provide

- [ ] Formspree form ID for the newsletter (`newsletterFormId`)
- [ ] Formspree form ID for the guest form (`guestFormId`)
- [ ] Public contact email (`contactEmail`)
- [ ] Apple Podcasts, Spotify, YouTube and RSS URLs
- [ ] Host surname (`hostSurname`)
- [ ] Host LinkedIn URL (`hostLinkedIn`)
- [ ] Affiliation or disclosure line (`hostAffiliation`)
- [ ] Confirm the bio facts in the About section (role, selling and team-building background, why Ballast started) before launch
- [ ] Guest roster: replace the placeholder companies and unhide the `.roster` block in `index.html` (remove its `hidden` attribute) only with real, permissioned names
- [ ] Enable Web Analytics in the Vercel project, then set `analytics: true` in `site.js`
- [ ] Soundings: the current items (week of October 19, 2026) have NOT been fact-checked. Before merging, verify every figure in `NEWS` against its linked source, or set `NEWS.items` to `[]` so the section hides
