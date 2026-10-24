/* Vercel Web Analytics queue shim: events buffer until /_vercel/insights/script.js loads (or never send if analytics is not enabled). */
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
const track = (name, props) => { try { if (typeof window.va === 'function') window.va('event', props ? { name, data: props } : { name }); } catch (_) { /* analytics must never break the page */ } };

/* ===== SITE — owner-supplied values. Empty string = unset; any control that needs it hides itself. ===== */
const SITE = {
  newsletterFormId: '',   /* Formspree form ID for the newsletter */
  guestEndpoint: 'https://script.google.com/macros/s/AKfycbwTXTXfGqwpt3dnEq5X_G4zZOl1TubB4nbVLvMt87gRnpD_CbMnxWv6JKGtSg7QQg7xNg/exec', /* Google Apps Script web app: logs to a Sheet, emails owner and guest. Takes priority over guestFormId */
  guestFormId: '',        /* Formspree form ID for the guest form */
  contactEmail: '',       /* public contact address, used for mailto fallbacks */
  appleUrl: '',
  spotifyUrl: '',
  youtubeUrl: '',
  rssUrl: '',
  hostSurname: '',
  hostLinkedIn: '',
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
  week: "Week of October 19, 2026",
  weekOf: '2026-10-19',  /* ISO date of the week above; drives the staleness guard */
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
/* Hero CTA: pre-launch it points at the newsletter; once episodes exist it becomes Listen. */
(function () {
  const cta = document.getElementById('hero-cta');
  if (!EPISODES.length) return;
  cta.href = '#episodes';
  cta.querySelector('span').textContent = 'Listen';
  cta.querySelector('svg').outerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
})();
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
  document.getElementById('news-week').textContent = NEWS.week + '.';
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

/* ===== Tide chart waveform ===== */
(function tide() {
  const svg = document.getElementById('tide');
  const W = 1000, H = 160, N = 120;
  const ns = 'http://www.w3.org/2000/svg';
  const el = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const grid = el('g', { class: 'grid' });
  for (let x = 0; x <= W; x += 100) grid.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: H }));
  [40, 80, 120].forEach(y => grid.appendChild(el('line', { x1: 0, y1: y, x2: W, y2: y })));
  svg.appendChild(grid);
  const fill = el('path', { class: 'fill' }), wave = el('path', { class: 'wave' });
  svg.appendChild(fill); svg.appendChild(wave);
  svg.appendChild(el('line', { class: 'loadline', x1: 0, y1: 80, x2: W, y2: 80 }));
  const lbl = el('text', { class: 'lbl', x: 6, y: 74 }); lbl.textContent = 'LOAD LINE'; svg.appendChild(lbl);
  const seeds = Array.from({ length: N }, () => Math.random() * 6.28);
  let t = 0, last = 0, tabVisible = true, heroVisible = true, looping = false;
  const running = () => tabVisible && heroVisible;
  function start() { if (!looping && running()) { looping = true; requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; start(); });
  /* Pause the loop while the hero is off-screen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { heroVisible = es[es.length - 1].isIntersecting; start(); }).observe(svg);
  }
  function frame(now = 0) {
    if (!running()) { looping = false; return; }
    if (now - last < 33) { requestAnimationFrame(frame); return; } /* ~30fps cap */
    last = now;
    let d = '';
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * W;
      const y = 80 + Math.sin(i * .35 + t) * 18 + Math.sin(i * .11 - t * .6 + seeds[i] * .3) * 22 + Math.sin(i * 1.3 + t * 1.7) * 4;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    wave.setAttribute('d', d);
    fill.setAttribute('d', d + `L${W} ${H}L0 ${H}Z`);
    if (!reduceMotion) { t += .018; requestAnimationFrame(frame); } else looping = false;
  }
  looping = true; frame();
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
/* Email-signup entry points (hero button and the premise signup block) exist only when a signup path does. */
const hasSignupPath = !!safeId(SITE.newsletterFormId) || !!CONTACT;
document.getElementById('signup').hidden = !hasSignupPath;
document.getElementById('hero-cta').hidden = !(EPISODES.length || hasSignupPath);
function setLink(id, url) {
  const el = document.getElementById(id), u = safeUrl(url);
  if (!el) return false;
  if (u) { el.href = u; el.hidden = false; }
  return !!u;
}
const anyPlatform = [
  setLink('pl-apple', SITE.appleUrl), setLink('pl-spotify', SITE.spotifyUrl),
  setLink('pl-youtube', SITE.youtubeUrl), setLink('pl-rss', SITE.rssUrl)
].some(Boolean);
document.getElementById('platforms-col').hidden = !anyPlatform;
document.querySelector('.sub-grid').classList.toggle('solo', !anyPlatform);
setLink('host-linkedin', SITE.hostLinkedIn);
setLink('footer-linkedin', SITE.hostLinkedIn);
if (SITE.hostSurname.trim()) document.getElementById('host-surname').textContent = ' ' + SITE.hostSurname.trim();
if (SITE.hostAffiliation.trim()) {
  const af = document.getElementById('host-affil');
  af.textContent = SITE.hostAffiliation.trim(); af.hidden = false;
}

/* ===== Forms: Formspree if an ID is set, else mailto, else an honest "opens soon" note ===== */
function wireForm(block, formId, subject, okText, eventName) {
  const form = block.querySelector('form'), msg = block.querySelector('.form-msg');
  const alt = block.querySelector('[data-alt]'), closed = block.querySelector('[data-closed]');
  const id = safeId(formId);
  if (id) {
    form.action = 'https://formspree.io/f/' + id;
    form.hidden = false;
  } else if (CONTACT) {
    alt.href = 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(subject);
    alt.hidden = false;
    return;
  } else {
    closed.hidden = false;
    return;
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const b = form.querySelector('button[type=submit]'); b.disabled = true; msg.className = 'form-msg'; msg.textContent = 'Sending…';
    try {
      const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!r.ok) throw 0;
      msg.className = 'form-msg ok'; msg.textContent = okText; form.reset(); track(eventName);
    } catch {
      msg.className = 'form-msg err'; msg.textContent = 'Something broke.';
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
  });
}
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
document.querySelectorAll('[data-nl]').forEach(block => {
  wireForm(block, SITE.newsletterFormId, 'Ballast newsletter signup', "You're on the list.", 'newsletter_submit');
});
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Analytics events (no-ops if analytics is absent) ===== */
document.getElementById('hero-cta').addEventListener('click', () => { if (document.getElementById('hero-cta').getAttribute('href') === '#signup') track('cta_episode1_email'); });
['apple', 'spotify', 'youtube', 'rss'].forEach(p => {
  const el = document.getElementById('pl-' + p);
  if (el) el.addEventListener('click', () => track('platform_click', { platform: p }));
});
