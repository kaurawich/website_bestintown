/* =========================================================
   ตั้งค่าหลัก
   - phone: เบอร์ที่ฟอร์มจะส่งข้อความ (SMS) ไปหา
   - lineId: ใส่ LINE OA จริง เช่น '@bestintown' แล้วปุ่ม/ลิงก์ LINE จะแสดงเอง
             และฟอร์มจะเปลี่ยนไปส่งทาง LINE แทน SMS (ปล่อยว่าง = ซ่อน LINE)
   ========================================================= */
const CONFIG = {
  phone: '0656624264',
  phoneDisplay: '065-662-4264',
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
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
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
const navLinks = $$('.nav a[href^="#"]');
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

// stagger chat bubbles in the FAQ
$$('.chat-body .reveal').forEach((el, i) => el.style.setProperty('--d', `${Math.min(i * 0.06, 0.6)}s`));

/* ---------- ON AIR sign lights up when contact is visible ---------- */
const onairSign = $('#onairSign');
if (onairSign) {
  new IntersectionObserver(([entry]) => {
    onairSign.classList.toggle('on', entry.isIntersecting);
  }, { threshold: 0.6 }).observe(onairSign);
}

/* ---------- Services accordion: keep one open ---------- */
const crewItems = $$('.crew-item');
crewItems.forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) crewItems.forEach(other => { if (other !== item) other.open = false; });
  });
});

/* ---------- Hero: simulated live stream ---------- */
(() => {
  const hero = $('.hero');
  if (!hero) return;

  let heroVisible = true;
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
  const running = () => heroVisible && !document.hidden;

  // REC timer
  const recEl = $('#recTime');
  let recSeconds = rand(2400, 6600);
  const renderRec = () => {
    const h = Math.floor(recSeconds / 3600);
    const m = Math.floor((recSeconds % 3600) / 60);
    const s = recSeconds % 60;
    recEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  renderRec();
  setInterval(() => { recSeconds++; if (running()) renderRec(); }, 1000);

  // chat
  const chat = $('#chat');
  const users = ['nam.beauty', 'ploy_ploy', 'jane2539', 'mookmik', 'aom.aom', 'fern_fern', 'toey.t', 'bam_bam', 'kwan.k', 'mint2020'];
  const messages = [
    'CF 2 ชิ้นค่า 💕', 'ผิวแพ้ง่ายใช้ได้ไหมคะ', 'โอนแล้วนะคะ 🙏', 'ส่งฟรีไหมคะ', 'รับ 1 ค่ะ',
    'ขอดูเนื้อครีมใกล้ ๆ หน่อยค่ะ', 'ใช้มาแล้ว ดีจริง!', 'มีโค้ดลดเพิ่มไหมคะ', 'F 3 ค่ะ',
    'พูดเก่งมาก 😂', 'ซื้อ 2 แถม 1 ถึงกี่โมงคะ', 'ตามมาจากคลิปค่ะ', 'ของแท้ไหมคะ', 'กดสั่งแล้วค่า ✨',
  ];
  let msgIndex = 0;
  setInterval(() => {
    if (!running()) return;
    const li = document.createElement('li');
    if (Math.random() < 0.2) {
      li.className = 'sys';
      li.textContent = `🛒 ${pick(users)} เพิ่งสั่งซื้อ ${rand(1, 3)} ชิ้น`;
    } else {
      const name = document.createElement('b');
      name.textContent = pick(users);
      li.append(name, messages[msgIndex++ % messages.length]);
    }
    chat.append(li);
    while (chat.children.length > 8) chat.firstElementChild.remove();
  }, 1500);

  // floating hearts
  const heartsBox = $('#hearts');
  const heartColors = ['#FF4130', '#D6F14A', '#FFFFFF', '#FFB1D8', '#9CD9FF', '#FFE266'];
  if (!reduceMotion) {
    setInterval(() => {
      if (!running()) return;
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.style.color = pick(heartColors);
      heart.style.setProperty('--x', `${rand(-26, 18)}px`);
      heart.innerHTML = '<svg class="ic"><use href="#i-heart"/></svg>';
      heart.addEventListener('animationend', () => heart.remove());
      heartsBox.append(heart);
    }, 420);
  }

  // viewer count
  const viewerEl = $('#viewerCount');
  let viewers = 12480;
  setInterval(() => {
    if (!running()) return;
    viewers = Math.max(9800, viewers + rand(-60, 140));
    viewerEl.textContent = fmt(viewers);
  }, 1800);

  // sales ticker
  const salesEl = $('#salesCount');
  let sales = 128450;
  setInterval(() => {
    if (!running()) return;
    sales += 299 * rand(1, 3);
    salesEl.textContent = fmt(sales);
  }, 2200);

  // new-order toast
  const orderCard = $('.float-order');
  const orderText = $('#orderText');
  const buyers = ['คุณ P***', 'คุณ N***', 'คุณ M***', 'คุณ J***', 'คุณ A***', 'คุณ T***', 'คุณ K***'];
  setInterval(() => {
    if (!running()) return;
    orderText.textContent = `${pick(buyers)} · ${rand(1, 3)} ชิ้น`;
    orderCard.classList.remove('pop');
    void orderCard.offsetWidth; // restart animation
    orderCard.classList.add('pop');
  }, 4000);
})();

/* ---------- Category reels scroller ---------- */
const reels = $('#reels');
$$('[data-scroll]').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = reels.firstElementChild;
    const gap = parseFloat(getComputedStyle(reels).columnGap) || 22;
    const distance = card.getBoundingClientRect().width + gap;
    reels.scrollBy({ left: distance * Number(btn.dataset.scroll), behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

/* ---------- Pricing → preselect package in form ---------- */
const packageSelect = $('#f-package');
$$('[data-package]').forEach(btn => {
  btn.addEventListener('click', () => { packageSelect.value = btn.dataset.package; });
});

/* ---------- Lead form ----------
   ไม่มี backend: กดส่งแล้วเปิด LINE (ถ้าตั้ง lineId) หรือแอป SMS ไปที่เบอร์ร้าน
   พร้อมข้อความที่กรอกไว้ หากต้องการเก็บข้อมูลลงระบบ ให้ส่ง FormData ไป Google Sheets / Formspree ตรงนี้ */
const form = $('#leadForm');
const formCard = form.closest('.form-card');
let lastMessage = '';

if (CONFIG.lineId) {
  $('#formNote').textContent = 'กดส่งแล้ว ระบบจะเปิด LINE พร้อมข้อมูลที่กรอก เพื่อส่งถึงทีมงานทันที';
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
    'สวัสดีครับ/ค่ะ สนใจบริการไลฟ์สดของ Best In Town',
    `ชื่อ: ${value('name')}`,
    `ร้าน/แบรนด์: ${value('brand')}`,
    `เบอร์โทร: ${value('phone')}`,
    `สินค้า: ${value('category')}`,
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
    label.textContent = 'คัดลอกไม่ได้ ลองโทรแทนนะ';
  }
  setTimeout(() => { label.textContent = 'คัดลอกข้อความ'; }, 2500);
});

$('#formReset').addEventListener('click', () => {
  form.reset();
  formCard.classList.remove('sent');
});

/* ---------- Footer year ---------- */
$('#year').textContent = new Date().getFullYear();
