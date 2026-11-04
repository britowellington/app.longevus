/* Apresentação em formato de livro digital (virada de página).
   Motor compartilhado pelas 3 apresentações do Projeto Condomínios.
   Personalização por parâmetros do link: c (condomínio), b (bairro), r (responsável),
   m (mensagem de abertura), a (ação proposta), d (data AAAA-MM-DD), w (WhatsApp), print=1. */
(function () {
  'use strict';

  /* ======================================================
     CONFIGURAÇÃO EDITÁVEL
     ====================================================== */
  const CONFIG = {
    whatsappPadrao: '5511977431011',   // usado só se o link não trouxer o parâmetro w
    instagram: { label: '@britowellington', href: 'https://www.instagram.com/britowellington' }
  };

  /* ---------- Ícones ---------- */
  const SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<symbol id="ill-gym" viewBox="0 0 400 240" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="18" width="150" height="112" rx="2"/><path d="M74 18v112M124 18v112M24 74h150M0 204h400M252 204V34M352 204V34M252 34h100"/><circle cx="270" cy="48" r="7"/><circle cx="334" cy="48" r="7"/><path d="M270 55v40M334 55v40M262 95h16M326 95h16"/><rect x="287" y="118" width="30" height="86" rx="2"/><path d="M287 132h30M287 146h30M287 160h30M287 174h30M287 188h30M302 34v84M56 168h116M70 168v36M158 168v36M150 168l34-40"/><circle cx="204" cy="196" r="8"/><circle cx="234" cy="196" r="8"/><path d="M212 196h14M370 204v-58M362 146h16M364 160h12M364 174h12M364 188h12"/></symbol>' +
    '<symbol id="i-dumbbell" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12"/></symbol>' +
    '<symbol id="i-plan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="17" rx="2.5"/><path d="M9 3v3M15 3v3M8 11h8M8 15h5"/></symbol>' +
    '<symbol id="i-group" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8" r="3"/><circle cx="5" cy="10" r="2.2"/><circle cx="19" cy="10" r="2.2"/><path d="M6.5 20a5.5 5.5 0 0 1 11 0M1.8 18.5a3.4 3.4 0 0 1 4.6-3.2M22.2 18.5a3.4 3.4 0 0 0-4.6-3.2"/></symbol>' +
    '<symbol id="i-couple" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8.5" cy="8" r="3"/><circle cx="16.5" cy="8" r="3"/><path d="M3 20a5.5 5.5 0 0 1 11 0M10.5 20a5.5 5.5 0 0 1 10.5 0"/></symbol>' +
    '<symbol id="i-person" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20a7 7 0 0 1 14 0"/></symbol>' +
    '<symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM8 7h8M8 11h6"/></symbol>' +
    '<symbol id="i-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></symbol>' +
    '<symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-opacity=".45"/><path d="m8 12.3 2.6 2.6L16 9.5"/></symbol>' +
    '<symbol id="i-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></symbol>' +
    '<symbol id="i-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></symbol>' +
    '<symbol id="i-swipe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H5M9 7l-5 5 5 5"/></symbol>' +
    '<symbol id="i-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></symbol>' +
    '<symbol id="i-print" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V3h10v6M7 17H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-3"/><rect x="7" y="14" width="10" height="7" rx="1"/></symbol>' +
    '<symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3a8.5 8.5 0 1 1 15.5-4.6Z"/></symbol>' +
    '<symbol id="i-insta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/></symbol>' +
    '<symbol id="i-share" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="18" cy="18" r="2.6"/><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6"/></symbol>' +
    '</defs></svg>';
  document.body.insertAdjacentHTML('afterbegin', SPRITE);

  /* ---------- Personalização pelo link ---------- */
  const q = new URLSearchParams(location.search);
  const g = function (k, max) { return (q.get(k) || '').trim().slice(0, max || 280); };
  const P = { c: g('c', 120), b: g('b', 80), r: g('r', 80), m: g('m', 280), a: g('a', 120), d: g('d', 10), w: g('w', 15).replace(/\D/g, '') };
  const fmtDate = function (s) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; };
  const fmtPhone = function (n) {
    const d = n.replace(/^55/, '');
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '+' + n;
  };
  const have = { condo: !!P.c, bairro: !!P.b, resp: !!P.r, msg: !!P.m, acao: !!P.a, data: !!fmtDate(P.d) };
  const vals = { condo: P.c, bairro: P.b, resp: P.r, msg: P.m, acao: P.a, data: fmtDate(P.d) };
  document.querySelectorAll('[data-page-if]').forEach(function (el) { if (!have[el.getAttribute('data-page-if')]) el.remove(); });
  document.querySelectorAll('[data-fill]').forEach(function (el) { el.textContent = vals[el.getAttribute('data-fill')] || ''; });
  document.querySelectorAll('[data-show]').forEach(function (el) {
    const on = have[el.getAttribute('data-show')];
    el.style.display = on ? (el.tagName === 'SPAN' || el.tagName === 'B' ? 'inline' : 'block') : 'none';
  });
  if (P.c) document.title = document.title + ' | ' + P.c;

  /* ---------- Contatos ---------- */
  (function renderContacts() {
    const ul = document.getElementById('contacts'); if (!ul) return;
    const num = P.w || CONFIG.whatsappPadrao;
    const baseMsg = document.body.getAttribute('data-wa') || 'Olá, Wellington! Vi sua apresentação e gostaria de conversar.';
    const wa = function (txt) { return 'https://wa.me/' + num + '?text=' + encodeURIComponent(txt + (P.c ? ' (Condomínio ' + P.c + ')' : '')); };
    const add = function (icon, label, href, cls, aria) {
      const li = document.createElement('li'); if (cls) li.className = cls;
      const a = document.createElement('a'); a.href = href;
      if (!/^mailto:/.test(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.setAttribute('aria-label', aria || label);
      a.innerHTML = '<svg aria-hidden="true"><use href="#' + icon + '"/></svg>'; a.appendChild(document.createTextNode(label));
      li.appendChild(a); ul.appendChild(li);
    };
    add('i-phone', fmtPhone(num), wa(baseMsg), '', 'WhatsApp');
    const ex = document.body.getAttribute('data-wa-extra');
    const ex2 = document.body.getAttribute('data-wa-extra2');
    if (ex2) add('i-person', document.body.getAttribute('data-wa-extra2-label') || 'Sou síndico ou administrador', wa(ex2), 'alt');
    if (ex) add('i-heart', document.body.getAttribute('data-wa-extra-label') || 'Falar sobre meus pais', wa(ex), 'alt');
    add('i-insta', CONFIG.instagram.label, CONFIG.instagram.href, '', 'Instagram');
    if (document.body.hasAttribute('data-share')) {
      const li = document.createElement('li'); li.className = 'share';
      const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<svg aria-hidden="true" style="width:1.15em;height:1.15em;color:var(--orange)"><use href="#i-share"/></svg>Encaminhar este link';
      b.addEventListener('click', function () {
        const data = { title: document.title, url: location.href.split('#')[0] };
        if (navigator.share) { navigator.share(data).catch(function () {}); }
        else if (navigator.clipboard) { navigator.clipboard.writeText(data.url).then(function () { b.lastChild.textContent = 'Link copiado'; }); }
      });
      li.appendChild(b); ul.appendChild(li);
    }
  })();

  /* ---------- Estado ---------- */
  const book = document.getElementById('book');
  const pages = Array.prototype.slice.call(book.querySelectorAll('.page'));
  const total = pages.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DUR = 820, EASE = 'cubic-bezier(.55,.05,.3,1)';
  const pnum = document.getElementById('pnum'), pttl = document.getElementById('pttl');
  const bar = document.querySelector('.progress i');
  const btnPrev = document.getElementById('btnPrev'), btnNext = document.getElementById('btnNext');
  let idx = 0, busy = false;

  pages.forEach(function (p, i) {
    const s = document.createElement('div'); s.className = 'shade'; s.setAttribute('aria-hidden', 'true'); p.appendChild(s);
    p.setAttribute('aria-roledescription', 'página');
    p.setAttribute('aria-label', 'Página ' + (i + 1) + ' de ' + total + ': ' + p.dataset.title);
  });

  const pad = function (n) { return String(n).padStart(2, '0'); };

  function setActive(i) {
    pages.forEach(function (p, j) {
      const on = j === i;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      if ('inert' in p) p.inert = !on;
    });
  }

  function updateUI(i) {
    pnum.innerHTML = pad(i + 1) + ' <em>/ ' + pad(total) + '</em>';
    pttl.textContent = pages[i].dataset.title;
    bar.style.width = ((i + 1) / total * 100) + '%';
    btnPrev.disabled = i === 0;
    btnNext.disabled = i === total - 1;
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
  }

  /* ======================================================
     VIRADA DE PÁGINA
     Avançar: a página atual gira sobre a lombada (esquerda)
     revelando a próxima. Voltar: a anterior volta por cima.
     ====================================================== */
  function go(delta) {
    const to = idx + delta;
    if (busy || to < 0 || to >= total) return;
    flip(idx, to, delta > 0 ? 1 : -1);
  }

  function flip(from, to, dir) {
    busy = true;
    updateUI(to);
    const A = pages[from], B = pages[to];
    if ('inert' in B) B.inert = false;
    let finished = false;
    let anims = [];
    const done = function (top, under) {
      if (finished) return; finished = true;
      idx = to; setActive(to);
      top.classList.remove('is-turning'); under.classList.remove('is-under');
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      busy = false;
    };

    // Movimento reduzido ou navegador sem Web Animations: transição simples
    if (reduced.matches || !A.animate) {
      A.classList.add('is-under'); B.classList.add('is-turning');
      if (B.animate) {
        const a = B.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
        anims = [a]; a.finished.then(function () { done(B, A); });
        setTimeout(function () { done(B, A); }, 600);
      } else { done(B, A); }
      return;
    }

    const top = dir > 0 ? A : B, under = dir > 0 ? B : A;
    under.classList.add('is-under'); top.classList.add('is-turning');
    const opt = { duration: DUR, easing: EASE, fill: 'forwards' };
    const open = 'perspective(2400px) rotateY(0deg)', shut = 'perspective(2400px) rotateY(-102deg)';
    const a1 = top.animate(dir > 0 ? [{ transform: open }, { transform: shut }] : [{ transform: shut }, { transform: open }], opt);
    const a2 = top.querySelector('.shade').animate(dir > 0 ? [{ opacity: 0 }, { opacity: .6 }] : [{ opacity: .6 }, { opacity: 0 }], opt);
    const a3 = under.querySelector('.shade').animate(dir > 0 ? [{ opacity: .55 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: .55 }], opt);
    anims = [a1, a2, a3];
    Promise.all([a1.finished, a2.finished, a3.finished]).then(function () { done(top, under); }, function () { done(top, under); });
    setTimeout(function () { done(top, under); }, DUR + 500); // garante que nunca fique preso
  }

  /* ---------- Gestos (toque e arraste com mouse) ----------
     Arrastar para a esquerda: avança. Arrastar para a direita: volta.
     Toque/clique simples em qualquer ponto da página: avança.
     Links e botões não disparam a troca de página. */
  let sx = 0, sy = 0, st = 0, tracking = false;
  book.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    if (e.target.closest('a,button')) return;
    tracking = true; sx = e.clientX; sy = e.clientY; st = Date.now();
  }, { passive: true });
  window.addEventListener('pointerup', function (e) {
    if (!tracking) return; tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) { go(dx < 0 ? 1 : -1); return; }
    const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - st < 500;
    if (isTap && !e.target.closest('a,button,.controls')) go(1);
  }, { passive: true });
  window.addEventListener('pointercancel', function () { tracking = false; });

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); go(1); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); go(-1); break;
      case 'Home': e.preventDefault(); if (idx > 0) flip(idx, 0, -1); break;
      case 'End': e.preventDefault(); if (idx < total - 1) flip(idx, total - 1, 1); break;
    }
  });

  btnPrev.addEventListener('click', function () { go(-1); });
  btnNext.addEventListener('click', function () { go(1); });

  /* ---------- Tela cheia e impressão ---------- */
  const root = document.documentElement, btnFull = document.getElementById('btnFull');
  const canFull = !!(root.requestFullscreen || root.webkitRequestFullscreen);
  if (!canFull) btnFull.hidden = true;
  btnFull.addEventListener('click', function () {
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
    else { const r = (root.requestFullscreen || root.webkitRequestFullscreen).call(root); if (r && r.catch) r.catch(function () {}); }
  });
  document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });

  /* ======================================================
     AJUSTE AUTOMÁTICO DE ENQUADRAMENTO
     Se algum conteúdo não couber, reduz levemente a escala
     (--k) daquela página, com limite mínimo de legibilidade.
     ====================================================== */
  const MIN_K = 0.8;
  const overflows = function (el) { return el.scrollHeight - el.clientHeight > 1 || el.scrollWidth - el.clientWidth > 1; };
  function fitPage(p) {
    const inner = p.querySelector('.pg-inner');
    const checks = [inner].concat(Array.prototype.slice.call(inner.querySelectorAll('.fit')));
    let k = 1; inner.style.setProperty('--k', '1');
    for (let n = 0; n < 12 && checks.some(overflows) && k > MIN_K; n++) {
      k = Math.max(MIN_K, +(k - 0.025).toFixed(3));
      inner.style.setProperty('--k', String(k));
    }
    p.dataset.k = k.toFixed(3);
  }
  function fitAll() { pages.forEach(fitPage); focusAll(); }

  /* ---------- Enquadramento das fotos: centraliza o ponto focal (rosto/corpo) ---------- */
  const imgCache = {};
  function focusPhoto(el) {
    const fx = parseFloat(el.dataset.fx), fy = parseFloat(el.dataset.fy), ar = parseFloat(el.dataset.ar);
    const cw = el.clientWidth, ch = el.clientHeight;
    if (!cw || !ch || !ar || isNaN(fx) || isNaN(fy)) return;
    const s = Math.max(cw / ar, ch / 1);           // imagem normalizada: altura 1, largura ar
    const dw = ar * s, dh = s;
    const x = Math.min(0, Math.max(cw - dw, cw / 2 - fx * dw));
    const y = Math.min(0, Math.max(ch - dh, ch / 2 - fy * dh));
    el.style.backgroundPosition = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
  }
  function focusAll() { document.querySelectorAll('.ph.has-img[data-fx]').forEach(focusPhoto); }
  let rt = 0;
  function scheduleFit() { clearTimeout(rt); rt = setTimeout(fitAll, 120); }
  window.addEventListener('resize', scheduleFit);
  window.addEventListener('orientationchange', function () { setTimeout(fitAll, 300); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleFit);

  /* ---------- Início ---------- */
  const m = location.hash.match(/^#(\d+)$/);
  if (m) idx = Math.min(total - 1, Math.max(0, parseInt(m[1], 10) - 1));
  setActive(idx); updateUI(idx); fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener('load', fitAll);


  if (q.get('print') === '1') window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 900); });
  window.Livro = { go: go, fitAll: fitAll, pages: pages };
})();
