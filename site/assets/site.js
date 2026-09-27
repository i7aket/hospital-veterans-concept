// Shared chrome (utility bar, header, footer, mobile action bar, phone sheet, icon sprite) and small
// helpers for the pages. Loaded synchronously at the top of <body>, so the header paints with the page.
(() => {
  // '/' locally, '/<repo>/' on GitHub Pages: site.js always lives at <root>/assets/site.js
  const ROOT = new URL('../', document.currentScript.src).pathname;
  const UP = 'https://hospital-veterans.lviv.ua/wp-content/uploads/';

  // One source of truth for contacts; every number carries what it is for (source: /kontakty/, /zapys-na-poslugy-za-programoyu-pmg/).
  const C = {
    urgent:   {tel: '+380322961140', label: 'Невідкладна допомога, цілодобово'},
    clinic:   {tel: '+380322590267', label: 'Реєстратура консультативної поліклініки'},
    booking:  {tel: '+380954051611', label: 'Запис на обстеження (ПМГ)'},
    director: {tel: '+380322961145', label: 'Приймальня генерального директора'},
    cardioReg:{tel: '+380322581032', label: 'Кардіоцентр — реєстратура'},
    cardioEr: {tel: '+380322383092', label: 'Кардіоцентр — приймальне відділення'},
    email: 'logivr@gmail.com',
    online: 'https://portal-doctor3.eleks.com/web/HospitalVeteransYuriiaLypy/registration.html',
    facebook: 'https://www.facebook.com/shpytal',
    instagram: 'https://instagram.com/hospital.veterans.vynnyky',
    addr: 'вул. Івасюка, 31, м. Винники (Львів)',
    cardioAddr: 'вул. Кульпарківська, 35, м. Львів',
    map: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('вул. Івасюка 31, Винники, Львівська область'),
    cardioMap: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('вул. Кульпарківська 35, Львів'),
    original: 'https://hospital-veterans.lviv.ua/',
  };

  const ICONS = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    siren: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1zM21 12h1M18.5 4.5 18 5M2 12h1M12 2v1M4.93 4.93l.7.7"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v6M9 11h6"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="m7 21 3-7 3 3v5M10 14l-1-5 5 2 3 4M8 9l-3 3"/>',
    scalpel: '<path d="M3 21 14.5 9.5M14.5 9.5l3-3a2.12 2.12 0 0 1 3 3l-3 3zM9 15l3 3"/>',
    brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
    steth: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    bus: '<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lab: '<path d="M9 3h6M10 3v6.5L4.5 19A2 2 0 0 0 6.2 22h11.6a2 2 0 0 0 1.7-3L14 9.5V3M7 15h10"/>',
    building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  };
  const icon = (n, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const NAV = [
    [ROOT + 'patsiientam/', 'Пацієнтам'],
    [ROOT + 'veteranam/', 'Ветеранам'],
    [ROOT + 'viddilennia/', 'Відділення'],
    [ROOT + 'kardiocentr/', 'Кардіоцентр'],
    [ROOT + 'pro-hospital/', 'Про госпіталь'],
    [ROOT + 'novyny/', 'Новини'],
    [ROOT + 'kontakty/', 'Контакти'],
  ];
  const here = location.pathname.replace(/index\.html$/, '');
  const links = NAV.map(([h, l]) => `<a href="${h}"${here.startsWith(h) ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  // +380322961140 -> "(032) 296-11-40" (Lviv landline), +380954051611 -> "095 405 16 11" (mobile)
  const telText = t => {
    const d = t.replace(/^\+380/, '');
    return d.startsWith('32') ? `(032) ${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`
                              : `0${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
  };

  const LOGO = UP + '2023/09/cropped-logo-color-lightblue-00badf-270x270.png';
  document.currentScript.insertAdjacentHTML('beforebegin', `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, p]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${p}</symbol>`).join('')}</svg>
<a class="skip" href="#main">Перейти до змісту</a>
<div class="concept">Концепт редизайну — не офіційний сайт. Офіційний сайт госпіталю: <a href="${C.original}">hospital-veterans.lviv.ua</a></div>
<div class="util"><div class="wrap">
  <a class="urgent" href="tel:${C.urgent.tel}"><span class="dot"></span>Невідкладна допомога 24/7: ${telText(C.urgent.tel)}</a>
  <a class="hide-s" href="tel:${C.clinic.tel}">${icon('phone')}Поліклініка: ${telText(C.clinic.tel)}</a>
  <span class="soc"><a href="${C.facebook}" target="_blank" rel="noopener">Facebook</a><a href="${C.instagram}" target="_blank" rel="noopener">Instagram</a></span>
</div></div>
<header class="top"><div class="wrap">
  <a class="brand" href="${ROOT}"><img src="${LOGO}" alt="" width="46" height="46"><span><b>Госпіталь ветеранів<br>ім. Юрія Липи</b><span>Львівський обласний · Винники</span></span></a>
  <nav class="nav" aria-label="Основне меню">${links}</nav>
  <a class="btn btn-primary btn-sm" href="${ROOT}patsiientam/#zapys">${icon('cal')}Записатися</a>
  <details class="menu"><summary>${icon('menu')}Меню</summary><nav class="nav" aria-label="Основне меню">${links}<a href="${ROOT}patsiientam/#zapys">Записатися на прийом</a></nav></details>
</div></header>`);

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', `
<footer class="foot">
  <div class="wrap main">
    <div>
      <div class="brandline"><img src="${LOGO}" alt="" width="48" height="48"><p class="name">КНП ЛОР «Львівський обласний госпіталь ветеранів війн та репресованих імені Юрія Липи»</p></div>
      <p>${C.addr}<br>Кардіоцентр: ${C.cardioAddr}</p>
    </div>
    <div><h3>Пацієнтам</h3><ul>
      <li><a href="${ROOT}patsiientam/#zapys">Запис на прийом</a></li>
      <li><a href="${ROOT}patsiientam/#pmg">Обстеження за ПМГ</a></li>
      <li><a href="${ROOT}patsiientam/#ciny">Платні послуги та ціни</a></li>
      <li><a href="${ROOT}viddilennia/">Відділення та лікарі</a></li>
      <li><a href="${ROOT}veteranam/">Ветеранам і родинам</a></li>
    </ul></div>
    <div><h3>Госпіталь</h3><ul>
      <li><a href="${ROOT}pro-hospital/">Про госпіталь</a></li>
      <li><a href="${ROOT}kardiocentr/">Кардіологічний центр</a></li>
      <li><a href="${ROOT}novyny/">Новини</a></li>
      <li><a href="https://hospital-veterans.lviv.ua/publichna-informacziya/" target="_blank" rel="noopener">Публічна інформація</a></li>
      <li><a href="https://hospital-veterans.lviv.ua/publichna-oferta/" target="_blank" rel="noopener">Публічна оферта</a></li>
    </ul></div>
    <div><h3>Контакти</h3><ul>
      <li><a href="tel:${C.urgent.tel}">${telText(C.urgent.tel)}</a> — невідкладна</li>
      <li><a href="tel:${C.clinic.tel}">${telText(C.clinic.tel)}</a> — поліклініка</li>
      <li><a href="tel:${C.director.tel}">${telText(C.director.tel)}</a> — приймальня генерального директора</li>
      <li><a href="mailto:${C.email}">${C.email}</a></li>
      <li><a href="${C.facebook}" target="_blank" rel="noopener">Facebook</a> · <a href="${C.instagram}" target="_blank" rel="noopener">Instagram</a></li>
    </ul></div>
  </div>
  <div class="wrap copy"><span>© 2026 Львівський обласний госпіталь ветеранів війн та репресованих ім. Ю. Липи</span><span>Концепт нового сайту · дані з <a href="${C.original}" target="_blank" rel="noopener">hospital-veterans.lviv.ua</a></span></div>
</footer>
<nav class="abar" aria-label="Швидкі дії">
  <a class="main-act" href="${ROOT}patsiientam/#zapys">${icon('cal')}Запис</a>
  <button type="button" data-phones>${icon('phone')}Подзвонити</button>
  <a href="${ROOT}kontakty/#yak-diistatysia">${icon('pin')}Як дістатися</a>
</nav>
<dialog class="sheet" id="phones" aria-labelledby="phones-h"><div class="in">
  <button class="x" type="button" data-close aria-label="Закрити">${icon('x')}</button>
  <h2 id="phones-h">Куди телефонувати</h2>
  <p class="muted">Оберіть, з якого питання.</p>
  <div class="phones" style="margin-top:16px">${H.phoneList(['urgent', 'clinic', 'booking', 'cardioEr', 'cardioReg', 'director'])}</div>
  <p class="note">При загрозі життю телефонуйте 103.</p>
</div></dialog>`);
    const sheet = document.getElementById('phones');
    document.addEventListener('click', e => {
      if (e.target.closest('[data-phones]')) sheet.showModal();
      if (e.target.closest('[data-close]') || e.target === sheet) sheet.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('details.menu[open]').forEach(d => d.open = false); });
    // portrait images (event posters) in landscape cards: show them whole instead of cropping
    document.addEventListener('load', e => {
      const img = e.target;
      if (img.tagName === 'IMG' && img.closest('.pcard .ph') && img.naturalHeight > img.naturalWidth * 1.05) img.classList.add('poster');
    }, true);
  });

  // ---- helpers shared by pages ----
  const cache = {};
  const H = window.H = {
    C, UP, icon, telText,
    esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])),
    data: name => cache[name] || (cache[name] = fetch(`${ROOT}data/${name}.json`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(err => {
        delete cache[name];                       // let a retry fetch again
        const main = document.getElementById('main');
        if (main && !main.querySelector('.loaderr')) main.insertAdjacentHTML('afterbegin', `<div class="wrap"><div class="loaderr" role="alert">
          <h2>Не вдалося завантажити дані</h2><p class="muted">Перевірте з’єднання та спробуйте ще раз. Або зателефонуйте в реєстратуру: <a href="tel:${C.clinic.tel}">${telText(C.clinic.tel)}</a></p>
          <button class="btn btn-primary btn-sm" style="margin-top:16px" type="button" onclick="location.reload()">Спробувати ще раз</button></div></div>`);
        throw err;
      })),
    param: k => new URLSearchParams(location.search).get(k),
    num: n => Number(n).toLocaleString('uk-UA'),                       // 28554 -> "28 554" (nbsp)
    // plural('фахівець', n): 1 фахівець, 2 фахівці, 5 фахівців
    plural: (n, one, few, many) => ({one, few, many}[new Intl.PluralRules('uk').select(n)] || many),
    // keep keyboard focus on the same control after a list of buttons is re-rendered
    keepFocus: (box, attr, render) => { const v = document.activeElement?.closest?.(`[${attr}]`)?.getAttribute(attr); render(); if (v != null) box.querySelector(`[${attr}="${CSS.escape(v)}"]`)?.focus(); },
    date: d => new Date(d + 'T12:00:00').toLocaleDateString('uk-UA', {day: 'numeric', month: 'long', year: 'numeric'}),
    phone: (key, cls = '') => {
      const p = C[key];
      return `<a class="phone ${cls}" href="tel:${p.tel}"><span class="ico">${icon(key === 'urgent' ? 'siren' : 'phone')}</span><span><b>${telText(p.tel)}</b><small>${p.label}</small></span></a>`;
    },
    phoneList: keys => keys.map(k => H.phone(k, k === 'urgent' ? 'phone--urgent' : '')).join(''),
    // text blocks from the extractor: [['h'|'p'|'li', text], ...] -> html
    blocks: text => {
      let out = '', inList = false;
      for (const [k, t] of text) {
        if (k === 'li' && !inList) { out += '<ul>'; inList = true; }
        if (k !== 'li' && inList) { out += '</ul>'; inList = false; }
        out += k === 'h' ? `<h3>${H.esc(t)}</h3>` : k === 'li' ? `<li>${H.esc(t)}</li>` : `<p>${H.esc(t)}</p>`;
      }
      return out + (inList ? '</ul>' : '');
    },
  };
})();
