const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
document.body.insertAdjacentHTML('beforeend', '<div class="progress"></div><div class="glow"></div><div class="dot"></div>');
const ring = $('.cursor'), dot = $('.dot'), glow = $('.glow'), prog = $('.progress'), hbg = $('.hero-bg');

// ===== كيرسور الماوس بتاعك + بقعة الضوء =====
addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`;
  if (!rm) hbg.style.transform = `translate(${(mx / innerWidth - .5) * -40}px,${(my / innerHeight - .5) * -24}px)`;
});
(function loop() { rx += (mx - rx) * .15; ry += (my - ry) * .15; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; glow.style.transform = `translate(${rx - 300}px,${ry - 300}px)`; requestAnimationFrame(loop); })();
document.addEventListener('mouseover', e => ring.classList.toggle('big', !!e.target.closest('a,.card')));
addEventListener('scroll', () => prog.style.width = scrollY / (document.body.scrollHeight - innerHeight) * 100 + '%');

// ===== أدوات: كتابة / فك شفرة / عدّاد =====
function typeIt() { const t = $('.type'), s = t.dataset.text; let i = 0; (function f() { if (i <= s.length) { t.textContent = s.slice(0, i++); setTimeout(f, 35); } })(); }
function scramble(el) {
  const f = el.dataset.f || el.textContent; el.dataset.f = f; let n = 0; const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&';
  const id = setInterval(() => { el.textContent = [...f].map((c, k) => c === ' ' || k < n ? c : ch[Math.random() * ch.length | 0]).join(''); n += .5; if (n > f.length) { el.textContent = f; clearInterval(id); } }, 40);
}
function count(b) { const n = parseInt(b.textContent); if (!n) return; let v = 0; const id = setInterval(() => { v += Math.ceil(n / 40); if (v >= n) { v = n; clearInterval(id); } b.textContent = v; }, 30); }
const nm = $('.hero h1 span'); if (!rm) nm.addEventListener('mouseenter', () => scramble(nm));

// ===== العملاء (Agents) - نسخة سريعة ودقيقة =====
// تعديل التنسيق والترانزيشن من هنا (بيتحط بعد style.css فبيغلب عليه)
document.head.insertAdjacentHTML('beforeend','<style>.ag{transition:none}.sel{transition:none;box-shadow:0 0 18px color-mix(in srgb,var(--c) 50%,transparent)}.built{animation:pop .55s cubic-bezier(.2,.8,.2,1) backwards}@keyframes pop{0%{opacity:0;filter:blur(12px) brightness(2.4);clip-path:inset(0 100% 0 0)}55%{opacity:1;filter:blur(3px) brightness(1.6)}100%{opacity:1;filter:none;clip-path:inset(0 0 0 0)}}</style>');
const FLY = 300, DRAG = 250; // ✏️ سرعة الطيران والسحب بالمللي ثانية (أقل = أسرع)
const ease = t => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
// ✏️ 17: أسماء العملاء وألوانهم - غيّر الاسم أو اللون زي ما تحب
const AG = [['Layout', '#4da3ff'], ['Design', '#ff5d8f'], ['Copy', '#ffc83d'], ['Motion', '#3dffb0'], ['Code', '#b06bff']].map(([n, c]) => {
  const e = document.createElement('div'); e.className = 'ag'; e.style.setProperty('--c', c); e.innerHTML = `<i></i><b>${n} agent</b>`;
  const x = Math.random() * innerWidth, y = Math.random() * innerHeight * .8;
  if (!rm) document.body.appendChild(e); return { e, c, x, y, tx: x, ty: y, busy: 0, job: null };
});
const T = $$('nav,.hero-bg,.hello,.hero h1 span,.type,.hero .btn,.hero .stats,.marquee,.photo,.about>div,section>h2,.card,.contact p,.links');
let done = 0, total = T.length;
document.body.insertAdjacentHTML('beforeend', `<div class="dock">${AG.map(a => `<s style="background:${a.c}"></s>`).join('')}<span id="st"></span></div>`);
const upd = () => $('#st').textContent = done >= total ? `${AG.length} agents · build complete ✓` : `${AG.length} agents · building ${done}/${total} layers`;
function built(el) {
  el.classList.remove('pre'); if (!rm) el.classList.add('built');
  if (el.matches('.type')) typeIt();
  if (!rm && el.matches('h2,.hero h1 span')) scramble(el);
  if (el.matches('.stats,.card')) el.querySelectorAll('b').forEach(count);
  done++; upd();
}
// الكيرسور والمربع بيتابعوا العنصر في كل فريم، فحتى لو سكرولت مبيغلطوش
function build(el, a) {
  return new Promise(res => {
    const r0 = el.getBoundingClientRect();
    if (!r0.width || !r0.height) { built(el); return res(); }
    const s = document.createElement('div'); s.className = 'sel'; s.style.setProperty('--c', a.c); s.style.opacity = 0;
    s.dataset.l = `${Math.round(r0.width)} × ${Math.round(r0.height)}`; document.body.appendChild(s);
    const sx = a.x, sy = a.y, t0 = performance.now();
    a.job = now => {
      const r = el.getBoundingClientRect(), t = now - t0;
      s.style.left = r.left + 'px'; s.style.top = r.top + 'px';
      if (t < FLY) { const k = ease(t / FLY); a.x = sx + (r.left - sx) * k; a.y = sy + (r.top - sy) * k; }
      else {
        const p = ease((t - FLY) / DRAG); s.style.opacity = 1; s.style.width = r.width * p + 'px'; s.style.height = r.height * p + 'px';
        a.x = r.left + r.width * p; a.y = r.top + r.height * p;
        if (t >= FLY + DRAG) { a.job = null; a.tx = a.x; a.ty = a.y; built(el); s.style.transition = 'opacity .25s'; s.style.opacity = 0; setTimeout(() => s.remove(), 300); res(); }
      }
    };
  });
}
const q = [];
function pump() { AG.forEach(async a => { if (a.busy) return; a.busy = 1; while (q.length) await build(q.shift(), a); a.busy = 0; }); }
(function tick(now) {
  AG.forEach(a => { if (a.job) a.job(now); else { a.x += (a.tx - a.x) * .05; a.y += (a.ty - a.y) * .05; } a.e.style.transform = `translate(${a.x}px,${a.y}px)`; });
  requestAnimationFrame(tick);
})(performance.now());
upd();
if (rm) { T.forEach(built); } else {
  T.forEach(el => el.classList.add('pre'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); q.push(e.target); pump(); } }), { threshold: 0, rootMargin: '0px 0px -4% 0px' });
  T.forEach(el => io.observe(el));
  setInterval(() => AG.forEach(a => { if (!a.busy) { a.tx = Math.random() * innerWidth; a.ty = Math.random() * innerHeight; } }), 2000);
}

// ===== كروت: ميلان 3D + إضاءة =====
$$('.card').forEach(c => {
  c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; c.style.setProperty('--x', x + 'px'); c.style.setProperty('--y', y + 'px'); if (!rm) c.style.transform = `perspective(800px) rotateX(${(.5 - y / r.height) * 6}deg) rotateY(${(x / r.width - .5) * 6}deg)`; });
  c.addEventListener('mouseleave', () => c.style.transform = '');
});
$$('.btn').forEach(b => {
  b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); if (!rm) b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; });
  b.addEventListener('mouseleave', () => b.style.transform = '');
});

// ===== خلفية النقط =====
const cv = $('#bg'), x = cv.getContext('2d'); let W, H;
const P = Array.from({ length: 70 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 }));
function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; } size(); addEventListener('resize', size);
(function draw() {
  x.clearRect(0, 0, W, H);
  P.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
    const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy) || 1; if (d < 150) { p.x += dx / d * 1.5; p.y += dy / d * 1.5; }
    x.fillStyle = 'rgba(225,29,46,.7)'; x.fillRect(p.x, p.y, 2, 2);
    for (let j = i + 1; j < P.length; j++) { const q2 = P[j], e = Math.hypot(p.x - q2.x, p.y - q2.y); if (e < 110) { x.strokeStyle = `rgba(225,29,46,${.18 * (1 - e / 110)})`; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q2.x, q2.y); x.stroke(); } }
  });
  requestAnimationFrame(draw);
})();

// ===== أسهم قسم التواصل =====
const ct = $('#contact');
const A = Array.from({ length: 14 }, () => { const e = document.createElement('i'); e.className = 'arrow'; ct.appendChild(e); return { e, x: Math.random(), y: Math.random(), a: Math.random() * 6.28 }; });
(function fl() {
  const r = ct.getBoundingClientRect();
  A.forEach(o => { o.a += .003; let px = o.x * r.width + Math.cos(o.a) * 20, py = o.y * r.height + Math.sin(o.a) * 20; const dx = px - (mx - r.left), dy = py - (my - r.top), d = Math.hypot(dx, dy) || 1; if (d < 160) { px += dx / d * (160 - d); py += dy / d * (160 - d); } o.e.style.transform = `translate(${px}px,${py}px) rotate(${Math.atan2(dy, dx) + 2.4}rad)`; });
  requestAnimationFrame(fl);
})();
// ===== زرار الإيميل =====
const mb = $('#mailBtn'), mail = mb.getAttribute('href').replace('mailto:', '').split('?')[0], sub = encodeURIComponent('Portfolio inquiry');
if (/Android|iPhone|iPad/i.test(navigator.userAgent)) mb.href = `mailto:${mail}?subject=${sub}`;
else { mb.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${mail}&su=${sub}`; mb.target = '_blank'; mb.rel = 'noopener'; }