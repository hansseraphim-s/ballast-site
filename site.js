/* Vercel Web Analytics queue shim: events buffer until /_vercel/insights/script.js loads (or never send if analytics is not enabled). */
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
const track = (name, props) => { try { if (typeof window.va === 'function') window.va('event', props ? { name, data: props } : { name }); } catch (_) { /* analytics must never break the page */ } };

/* ===== SITE — owner-supplied values. Empty string = unset; any control that needs it hides itself. ===== */
const SITE = {
  newsletterFormId: '',   /* Formspree form ID for the newsletter */
  guestEndpoint: 'https://script.google.com/macros/s/AKfycbzoU03VHEHcEkBHsz3vFTEDEjbir49gpV7tb5RDyKJmEOjAatPtcW-mndmFIvaHl3Yb/exec', /* Google Apps Script web app: logs to a Sheet, emails owner and guest. Takes priority over guestFormId */
  guestFormId: '',        /* Formspree form ID for the guest form */
  contactEmail: '',       /* public contact address, used for mailto fallbacks */
  spotifyUrl: '',
  rssUrl: '',
  hostSurname: '',
  hostLinkedIn: 'https://www.linkedin.com/in/hans-seraphim/',
  hostAffiliation: '',    /* e.g. an independence or employer disclosure line */
  newsStaleDays: 14,      /* Soundings hides itself when weekOf is older than this */
  analytics: false        /* set true only after Web Analytics is enabled in the Vercel project; loads /_vercel/insights/script.js */
};
if (SITE.analytics === true) {
  const va = document.createElement('script');
  va.defer = true; va.src = '/_vercel/insights/script.js';
  document.head.appendChild(va);
}
/* ===== EPISODES — newest first ===== */
/* date: YYYY-MM-DD. takeaway: one line, the decision or the number. */
/* Newest first. While this list is empty, the site shows a "coming soon" state.
   To add an episode, copy this line, remove the // and fill it in:
   // { number: 1, date: "2026-11-03", title: "…", guest: "…", role: "CIO", company: "…", duration: "50 min", takeaway: "…", url: "https://…" },
*/
const EPISODES = [
];
/* ===== NEWS — refresh weekly. Set week, swap the items (4-5 max, newest first).
   Each item: date shown as given, source name, url, and a one-line "why" for a CIO reader. ===== */
const NEWS = {
  weekOf: '2026-10-19',  /* ISO date of the week these items cover; drives the staleness guard (not shown on the page) */
  items: [
    {
      date: "Oct 22", source: "TechCrunch",
      title: "Uber puts all 30,000 employees on ChatGPT Work",
      url: "https://techcrunch.com/2026/10/22/uber-puts-all-30000-employees-on-chatgpt-work",
      why: "From a 1,000-person pilot to company-wide, and 80% of pilot users were non-engineers. No measured outcomes disclosed yet — the rollout is the bet, not the proof."
    },
    {
      date: "Oct 20", source: "CIO.com",
      title: "CIO 100 Chicago: CIOs reassess AI economics, governance, and leadership",
      url: "https://www.cio.com/article/4237910/cio-100-leadership-live-chicago-cios-reassess-ai-economics-governance-and-leadership.html",
      why: "The recurring theme: redesign the process, don't bolt on tools. Aon says AI cut proposal work from 40–50 hours to about 5; Brunswick reports $8–10M saved over 18 months."
    },
    {
      date: "Oct 19", source: "Gartner",
      title: "Only 13% of CIOs say their enterprise has realized significant value from AI",
      url: "https://gartner.com/en/newsroom/press-releases/2026-10-19-gartner-survey-finds-only-13-percent-of-cios-say-their-enterprise-has-realized-significant-or-transformational-value-from-ai",
      why: "Survey of 2,002 CIOs. Orgs with pilot-to-production guidelines are 2.3x more likely to get real value — and only 31% have them. Kill criteria matter even more: 2.6x."
    },
    {
      date: "Sep 29", source: "CIO.com",
      title: "Meta's enterprise AI bet runs into a trust question",
      url: "https://www.cio.com/article/4228508/metas-next-big-ai-bet-is-enterprise-its-biggest-hurdle-may-be-trust.html",
      why: "Still echoing: analysts point at Workplace's shutdown in May and a checkered data record. Their advice to buyers — start narrow, demand proof of long-term commitment."
    }
  ]
};

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* No episodes yet: hide the whole Episodes section, its nav link, and point "Listen"
   at Subscribe. All of it comes back on its own once EPISODES has an entry. */
if (EPISODES.length === 0) {
  document.getElementById('episodes').hidden = true;
  document.querySelectorAll('a[href="#episodes"]').forEach(a => {
    const li = a.closest('li');
    if (li) li.hidden = true; else a.href = '#subscribe';
  });
} else {
  document.getElementById('episodes').hidden = false;
  document.querySelectorAll('li > a[href="#episodes"]').forEach(a => { a.closest('li').hidden = false; });
}
document.getElementById('episode-list').innerHTML = EPISODES.map((ep, i) => `
  <article class="ep reveal">
    <div class="no"><small>Episode</small>${String(ep.number).padStart(2,'0')}</div>
    <div>
      <p class="stamp">${fmtDate(ep.date)}${i === 0 ? ' <b>Latest</b>' : ''}</p>
      <h3>${esc(ep.title)}</h3>
      <p class="who"><b>${esc(ep.guest)}</b> · ${esc(ep.role)}, ${esc(ep.company)}</p>
      ${ep.takeaway ? `<p class="take">${esc(ep.takeaway)}</p>` : ''}
    </div>
    <div class="side"><span class="dur">${esc(ep.duration)}</span>
      <a class="play" href="${esc(ep.url)}" aria-label="Play episode ${ep.number}: ${esc(ep.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></a></div>
  </article>`).join('');

/* News render; hides itself and its nav link when NEWS.items is empty or weekOf is older than SITE.newsStaleDays */
const newsAgeDays = (() => {
  const d = new Date(NEWS.weekOf + 'T00:00:00');
  return isNaN(d) ? Infinity : Math.floor((Date.now() - d.getTime()) / 86400000);
})();
const newsStale = newsAgeDays > SITE.newsStaleDays;
if (!NEWS.items.length || newsStale) {
  document.getElementById('news').hidden = true;
  document.querySelectorAll('a[href="#news"]').forEach(a => { const li = a.closest('li'); if (li) li.hidden = true; });
} else {
  document.getElementById('news').hidden = false;
  document.querySelectorAll('li > a[href="#news"]').forEach(a => { a.closest('li').hidden = false; });
  document.getElementById('news-list').innerHTML = NEWS.items.map(n => `
    <article class="nitem reveal">
      <div class="nd"><span><b>${esc(n.date)}</b></span><span>${esc(n.source)}</span></div>
      <div>
        <h3><a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a></h3>
        <p class="why">${esc(n.why)}</p>
      </div>
    </article>`).join('');
}

/* Latest-episode strip in the hero */
(function () {
  const ep = EPISODES[0];
  /* No episodes yet: hide the strip. It reappears on its own once EPISODES has an entry. */
  if (!ep) { document.getElementById('latest').hidden = true; return; }
  document.getElementById('latest').hidden = false;
  document.getElementById('latest').href = ep.url && ep.url !== '#' ? ep.url : '#episodes';
  document.getElementById('latest-title').textContent = ep.title;
  document.getElementById('latest-meta').textContent = `${ep.guest} · ${ep.role}, ${ep.company} · ${ep.duration}`;
})();

/* ===== Reveal ===== */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .1 });
  els.forEach(e => io.observe(e));
})();

/* ===== Nav ===== */
(function () {
  const btn = document.querySelector('.nav-toggle'), links = document.getElementById('nav-links');
  btn.addEventListener('click', () => { const o = links.dataset.open === 'true'; links.dataset.open = String(!o); btn.setAttribute('aria-expanded', String(!o)); });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { links.dataset.open = 'false'; btn.setAttribute('aria-expanded', 'false'); }));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || links.dataset.open !== 'true') return;
    links.dataset.open = 'false'; btn.setAttribute('aria-expanded', 'false'); btn.focus();
  });
})();

/* ===== Config-driven links ===== */
const safeUrl = u => /^https:\/\/[^\s"'<>]+$/i.test(u) ? u : '';
const safeEmail = e => /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(e) ? e : '';
const safeScriptUrl = u => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u) ? u : '';
const safeId = i => /^[A-Za-z0-9_-]+$/.test(i) ? i : '';
const CONTACT = safeEmail(SITE.contactEmail);
const safeLinkedInUrl = u => /^https:\/\/www\.linkedin\.com\/in\/[^\s"'<>]+$/i.test(u) ? u : '';
const safeSpotifyUrl = u => /^https:\/\/open\.spotify\.com\/[^\s"'<>]+$/i.test(u) ? u : '';
const ENDPOINT = safeScriptUrl(SITE.guestEndpoint);
const NL_ID = safeId(SITE.newsletterFormId);
/* Newsletter signup UI (Subscribe form) shows only when a delivery path exists. */
const hasSignupPath = !!ENDPOINT || !!NL_ID || !!CONTACT;
function setLink(id, url) {
  const el = document.getElementById(id), u = safeUrl(url);
  if (!el) return false;
  if (u) { el.href = u; el.hidden = false; }
  return !!u;
}
/* "Wherever you listen": the Spotify button always shows. With no valid spotifyUrl it stays dimmed and unlinked (and "Coming soon" shows) until the URL is set. RSS shows only when rssUrl is set. */
const spotifyLink = safeSpotifyUrl(SITE.spotifyUrl);
if (spotifyLink) {
  const a = document.getElementById('pl-spotify');
  a.href = spotifyLink; a.removeAttribute('aria-disabled'); a.removeAttribute('role');
}
document.getElementById('soon-note').hidden = !!spotifyLink;
setLink('pl-rss', SITE.rssUrl);
/* Hero "Listen": smooth-scroll to the Subscribe section (instant under reduced motion) and move focus to its heading. */
document.getElementById('hero-listen').addEventListener('click', e => {
  e.preventDefault();
  const heading = document.getElementById('subscribe-title');
  document.getElementById('subscribe').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
  history.replaceState(null, '', '#subscribe');
});
setLink('host-linkedin', safeLinkedInUrl(SITE.hostLinkedIn));
setLink('footer-linkedin', safeLinkedInUrl(SITE.hostLinkedIn));
if (SITE.hostSurname.trim()) document.getElementById('host-surname').textContent = ' ' + SITE.hostSurname.trim();
if (SITE.hostAffiliation.trim()) {
  const af = document.getElementById('host-affil');
  af.textContent = SITE.hostAffiliation.trim(); af.hidden = false;
}

/* ===== Newsletter signup (Subscribe form): Apps Script endpoint, else Formspree, else a mailto: draft ===== */
function wireNewsletter(form, msg) {
  const say = (cls, text) => { msg.className = 'form-msg' + (cls ? ' ' + cls : ''); msg.textContent = text; };
  if (!ENDPOINT && NL_ID) form.action = 'https://formspree.io/f/' + NL_ID;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const b = form.querySelector('button[type=submit]');
    if (ENDPOINT || NL_ID) {
      b.disabled = true; say('', 'Sending…');
      try {
        let r, okText;
        if (ENDPOINT) {
          /* No custom headers: stays a CORS simple request (no preflight). The script answers 302 then JSON. */
          r = await fetch(ENDPOINT, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
          const data = await r.json();
          if (!data || data.ok !== true) throw 0;
          okText = "You're on the list. Check your inbox for a confirmation.";
        } else {
          r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!r.ok) throw 0;
          okText = "You're on the list.";
        }
        say('ok', okText); form.reset(); track('newsletter_submit');
      } catch {
        say('err', 'Something went wrong \u2014 please try again in a minute.');
      }
      finally { b.disabled = false; }
    } else if (CONTACT) {
      const a = document.createElement('a');
      a.href = 'mailto:' + CONTACT + '?subject=' + encodeURIComponent('Ballast newsletter signup') + '&body=' + encodeURIComponent('Please add me to the Ballast email list.\r\nEmail: ' + form.elements.email.value.trim());
      document.body.appendChild(a); a.click(); a.remove();
      say('ok', 'Your email app should open with your details. Send it from there.');
    }
  });
}
document.getElementById('newsletter-wrap').hidden = !hasSignupPath;
document.querySelector('#newsletter-block [data-closed]').hidden = hasSignupPath;
wireNewsletter(document.getElementById('newsletter-form'), document.getElementById('nl-msg'));

/* ===== Guest form: always visible. Formspree if an ID is set, else a mailto: draft, else an honest note ===== */
(function wireGuestForm() {
  const form = document.getElementById('guest-form'), msg = document.getElementById('form-msg');
  const endpoint = safeScriptUrl(SITE.guestEndpoint);
  const id = safeId(SITE.guestFormId);
  if (id && !endpoint) form.action = 'https://formspree.io/f/' + id;
  const say = (cls, text) => { msg.className = 'form-msg' + (cls ? ' ' + cls : ''); msg.textContent = text; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (endpoint) {
      const b = form.querySelector('button[type=submit]'); b.disabled = true; say('', 'Sending…');
      try {
        /* No custom headers: stays a CORS simple request (no preflight). The script answers 302 then JSON. */
        const r = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
        const data = await r.json();
        if (!data || data.ok !== true) throw 0;
        say('ok', "Thanks \u2014 you're in. Check your inbox for a confirmation."); form.reset(); track('guest_submit');
      } catch {
        say('err', 'Something went wrong sending that. Please try again in a minute.');
      }
      finally { b.disabled = false; }
    } else if (id) {
      const b = form.querySelector('button[type=submit]'); b.disabled = true; say('', 'Sending…');
      try {
        const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!r.ok) throw 0;
        say('ok', "Got it. If it's a fit, you'll hear from us within a week."); form.reset(); track('guest_submit');
      } catch {
        say('err', 'Something broke.');
        if (CONTACT) {
          msg.append(' ');
          const a = document.createElement('a');
          a.href = 'mailto:' + CONTACT; a.textContent = 'Email us directly instead.';
          msg.append(a);
        } else {
          msg.append(' Please try again later.');
        }
      }
      finally { b.disabled = false; }
    } else if (CONTACT) {
      const lines = [...form.querySelectorAll('input[id]')].map(f => {
        const label = form.querySelector('label[for="' + f.id + '"]');
        return label ? label.textContent.trim() + ': ' + f.value.trim() : null;
      }).filter(Boolean);
      const a = document.createElement('a');
      a.href = 'mailto:' + CONTACT + '?subject=' + encodeURIComponent('Ballast guest pitch') + '&body=' + encodeURIComponent(lines.join('\r\n'));
      document.body.appendChild(a); a.click(); a.remove();
      say('ok', 'Your email app should open with your details. Send it from there.');
    } else {
      say('err', "Guest requests aren't being collected online yet \u2014 please check back soon.");
    }
  });
})();
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Analytics events (no-ops if analytics is absent) ===== */
['spotify', 'rss'].forEach(p => {
  const el = document.getElementById('pl-' + p);
  if (el) el.addEventListener('click', () => track('platform_click', { platform: p }));
});
