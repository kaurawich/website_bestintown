/* =========================================================
   ตั้งค่าหลัก
   - phone: เบอร์ที่ฟอร์มจะส่งข้อความ (SMS) ไปหา
   - lineId: ใส่ LINE OA จริง เช่น '@bestintown' แล้วลิงก์ LINE จะแสดงเอง
             และฟอร์มจะเปลี่ยนไปส่งทาง LINE แทน SMS (ปล่อยว่าง = ซ่อน LINE)
   ========================================================= */
const CONFIG = {
  phone: '0656624264',
  lineId: '',
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => n.toLocaleString('th-TH');
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pad = n => String(n).padStart(2, '0');

/* ---------- LINE (only when configured) ---------- */
if (CONFIG.lineId) {
  const lineAddUrl = `https://line.me/R/ti/p/${encodeURIComponent(CONFIG.lineId)}`;
  $$('[data-line-item]').forEach(el => { el.hidden = false; });
  $$('[data-line]').forEach(a => {
    a.href = lineAddUrl;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-line-id]').forEach(el => { el.textContent = CONFIG.lineId; });
}

/* ---------- Header ---------- */
const header = $('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Mobile nav ---------- */
const nav = $('#nav');
const navToggle = $('.nav-toggle');
const setNav = open => {
  nav.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
};
navToggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setNav(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
});

/* ---------- Active menu link ---------- */
const navLinks = $$('.nav a[href^="#"]:not(.nav-cta)');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(l => {
  const section = $(l.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Hero: simulated live control room ---------- */
(() => {
  const hero = $('.hero');
  if (!hero) return;

  let heroVisible = true;
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
  const running = () => heroVisible && !document.hidden;

  // live timer
  const timerEl = $('#liveTimer');
  let seconds = 1 * 3600 + 12 * 60 + 8;
  setInterval(() => {
    seconds++;
    if (!running()) return;
    timerEl.textContent = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
  }, 1000);

  // viewers
  const viewerEls = [$('#cViewers'), $('#pViewers')];
  let viewers = 1284;
  setInterval(() => {
    if (!running()) return;
    viewers = Math.max(900, viewers + rand(-25, 40));
    viewerEls.forEach(el => { el.textContent = fmt(viewers); });
  }, 1800);

  // orders, sales and order feed
  const ordersEl = $('#cOrders');
  const salesEl = $('#cSales');
  const feed = $('.feed');
  const feedText = $('#orderFeed');
  const buyers = ['คุณ P***', 'คุณ N***', 'คุณ M***', 'คุณ J***', 'คุณ A***', 'คุณ T***', 'คุณ K***'];
  const products = [['เซรั่มหน้าใส', 299], ['ครีมกันแดด SPF50', 259], ['เซ็ตคู่ เซรั่ม + กันแดด', 499]];
  let orders = 86;
  let sales = 25734;
  setInterval(() => {
    if (!running()) return;
    const [name, price] = pick(products);
    const qty = rand(1, 3);
    orders += 1;
    sales += price * qty;
    ordersEl.textContent = fmt(orders);
    salesEl.textContent = fmt(sales);
    feedText.textContent = `${pick(buyers)} สั่ง${name} ${qty} ชิ้น`;
    feed.classList.remove('pop');
    void feed.offsetWidth; // restart animation
    feed.classList.add('pop');
  }, 3200);
})();

/* ---------- Pricing: build phone-friendly plan cards from the table ---------- */
(() => {
  const table = $('.price-table');
  const target = $('#planCards');
  if (!table || !target) return;
  const heads = $$('thead th', table).slice(1);
  const rows = $$('tbody tr', table);
  const actions = $$('tfoot td', table);
  heads.forEach((th, i) => {
    const card = document.createElement('article');
    card.className = 'plan-card' + (th.classList.contains('hot') ? ' hot' : '');
    card.innerHTML = th.innerHTML;
    const list = document.createElement('ul');
    rows.forEach(row => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = row.querySelector('th').textContent;
      const value = document.createElement('b');
      value.innerHTML = row.querySelectorAll('td')[i].innerHTML;
      li.append(label, value);
      list.append(li);
    });
    card.append(list);
    const btn = actions[i] && actions[i].querySelector('.btn');
    if (btn) card.append(btn.cloneNode(true));
    target.append(card);
  });
  table.closest('.container').classList.add('has-cards');
})();

/* ---------- Pricing → preselect package in form ---------- */
const packageSelect = $('#f-package');
$$('[data-package]').forEach(btn => {
  btn.addEventListener('click', () => { packageSelect.value = btn.dataset.package; });
});

/* ---------- Lead form ----------
   ไม่มี backend: กดส่งแล้วเปิดแอป SMS ไปที่เบอร์ร้าน (หรือ LINE ถ้าตั้ง lineId)
   พร้อมข้อความที่กรอกไว้ หากต้องการเก็บข้อมูลลงระบบ ให้ส่ง FormData ไป Google Sheets / Formspree ตรงนี้ */
const form = $('#leadForm');
const formCard = form.closest('.form-card');
let lastMessage = '';

if (CONFIG.lineId) {
  $('#formNote').textContent = 'เมื่อกดส่ง ระบบจะเปิด LINE พร้อมข้อมูลที่กรอกไว้ เพื่อส่งถึงทีมงานทันที';
  $('#successText').textContent = 'กดส่งข้อความในหน้าต่าง LINE ที่เปิดขึ้นมา ถ้า LINE ไม่เปิด คัดลอกข้อความไว้ส่งเอง หรือโทรหาเราได้เลย';
}

const validateField = input => {
  const valid = input.checkValidity() && input.value.trim() !== '';
  input.closest('.field').classList.toggle('invalid', !valid);
  return valid;
};

form.addEventListener('submit', e => {
  e.preventDefault();
  const invalid = $$('[required]', form).filter(input => !validateField(input));
  if (invalid.length) { invalid[0].focus(); return; }

  const data = new FormData(form);
  const value = key => (data.get(key) || '').toString().trim() || '-';
  lastMessage = [
    'สวัสดีครับ/ค่ะ สนใจบริการไลฟ์ขายสินค้าของ Best In Town',
    `ชื่อ: ${value('name')}`,
    `แบรนด์/ร้านค้า: ${value('brand')}`,
    `เบอร์โทร: ${value('phone')}`,
    `หมวดสินค้า: ${value('category')}`,
    `แพ็กเกจที่สนใจ: ${value('package')}`,
    `แพลตฟอร์ม: ${data.getAll('platform').join(', ') || '-'}`,
    `รายละเอียด: ${value('detail')}`,
  ].join('\n');

  formCard.classList.add('sent');
  formCard.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

  if (CONFIG.lineId) {
    const url = `https://line.me/R/oaMessage/${encodeURIComponent(CONFIG.lineId)}/?${encodeURIComponent(lastMessage)}`;
    window.open(url, '_blank', 'noopener');
  } else {
    // "?&body=" works on both iOS and Android
    window.location.href = `sms:${CONFIG.phone}?&body=${encodeURIComponent(lastMessage)}`;
  }
});

form.addEventListener('input', e => {
  if (e.target.closest('.field.invalid') && e.target.matches('[required]')) validateField(e.target);
});

const copyBtn = $('#copyMsg');
copyBtn.addEventListener('click', async () => {
  const label = $('span', copyBtn);
  try {
    await navigator.clipboard.writeText(lastMessage);
    label.textContent = 'คัดลอกแล้ว ✓';
  } catch {
    label.textContent = 'คัดลอกไม่ได้ ลองโทรแทน';
  }
  setTimeout(() => { label.textContent = 'คัดลอกข้อความ'; }, 2500);
});

$('#formReset').addEventListener('click', () => {
  form.reset();
  formCard.classList.remove('sent');
});

/* ---------- Footer year ---------- */
$('#year').textContent = new Date().getFullYear();
