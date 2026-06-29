/* main.js */
// ── CURTAIN ──
window.addEventListener('load',()=>{
  setTimeout(()=>document.getElementById('curtain').classList.add('open'),100);
  fitHeroName();
});

// ── 카드뉴스 무한 슬라이더 + 드래그 ──
(function(){
  const wrap  = document.getElementById('cn-slider-wrap');
  const track = document.getElementById('cn-track');
  if(!track || !wrap) return;

  let x        = 0;
  let paused   = false;
  let dragging = false;
  let dragStartX   = 0;
  let dragStartOff = 0;
  const speed  = 0.6;
  let halfW    = 0;

  // DOM 완전 로드 후 절반 너비 측정
  function init(){
    halfW = track.scrollWidth / 2;
    wrap.style.cursor = 'grab';
    requestAnimationFrame(tick);
  }

  function loop(val){
    if(halfW <= 0) return val;
    val = val % halfW;
    if(val < 0) val += halfW;
    return val;
  }

  function tick(){
    if(!paused && !dragging){
      x = loop(x + speed);
      track.style.transform = `translateX(-${x}px)`;
    }
    requestAnimationFrame(tick);
  }

  // 로드 후 시작
  if(document.readyState === 'complete'){
    init();
  } else {
    window.addEventListener('load', init);
  }

  // hover → 멈춤
  wrap.addEventListener('mouseenter', ()=>{ paused = true; });
  wrap.addEventListener('mouseleave', ()=>{ if(!dragging) paused = false; });

  // 드래그 시작
  wrap.addEventListener('mousedown', e=>{
    dragging     = true;
    paused       = true;
    dragStartX   = e.clientX;
    dragStartOff = x;
    wrap.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // 드래그 중
  window.addEventListener('mousemove', e=>{
    if(!dragging) return;
    x = loop(dragStartOff + (dragStartX - e.clientX));
    track.style.transform = `translateX(-${x}px)`;
  });

  // 드래그 끝
  window.addEventListener('mouseup', ()=>{
    if(!dragging) return;
    dragging = false;
    paused   = false;
    wrap.style.cursor = 'grab';
  });

  // 터치
  wrap.addEventListener('touchstart', e=>{
    dragging     = true;
    paused       = true;
    dragStartX   = e.touches[0].clientX;
    dragStartOff = x;
  }, {passive:true});
  window.addEventListener('touchmove', e=>{
    if(!dragging) return;
    x = loop(dragStartOff + (dragStartX - e.touches[0].clientX));
    track.style.transform = `translateX(-${x}px)`;
  }, {passive:true});
  window.addEventListener('touchend', ()=>{
    dragging = false;
    paused   = false;
  });
})();

// ── 모달 ──
const modalData = [
  {no:'D — 01', title:'화장품 카드뉴스',              year:'2026', img:'images/cosmetic.png'},
  {no:'D — 02', title:'GYM UTO SUMMER',             year:'2026', img:'images/fitness.png'},
  {no:'D — 03', title:'FILA GLIO',                  year:'2025', img:'images/glio.png'},
  {no:'D — 04', title:'OWNIST Triple Collagen',     year:'2025', img:'images/ownist.png'},
  {no:'D — 05', title:'Sneakers Unboxed',           year:'2025', img:'images/sneakers.png'},
];
function openModal(idx){
  const d = modalData[idx % modalData.length];
  document.getElementById('modal-no').textContent    = d.no;
  document.getElementById('modal-title').textContent = d.title;
  document.getElementById('modal-desc').textContent  = d.year + ' · Card News · Visual Design';
  const imgEl = document.getElementById('modal-img-el');
  if(imgEl){ imgEl.src = d.img; }
  document.getElementById('cn-modal').classList.add('open');
  document.body.style.overflow = 'hidden'; // 바깥 스크롤 고정
}
function closeModal(e){
  if(e.target === document.getElementById('cn-modal')){
    document.getElementById('cn-modal').classList.remove('open');
    document.body.style.overflow = ''; // 바깥 스크롤 복원
  }
}
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    document.getElementById('cn-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
});
// 닫기 버튼도 동일하게
document.querySelector('.modal-close')?.addEventListener('click', ()=>{
  document.getElementById('cn-modal').classList.remove('open');
  document.body.style.overflow = '';
});

// 모달 밖 스크롤 → 모달 박스 안으로 전달
document.getElementById('cn-modal')?.addEventListener('wheel', e=>{
  const box = document.querySelector('.modal-box');
  if(box && !box.contains(e.target)){
    box.scrollTop += e.deltaY;
    e.preventDefault();
  }
}, {passive:false});

function fitHeroName(){
  const canvas = document.querySelector('.hero-canvas-body');
  const name   = document.querySelector('.hero-name-fill');
  if(!canvas || !name) return;
  // 캔버스 너비의 97%에 글자가 꽉 차도록 font-size 조정
  const target = canvas.clientWidth * 0.97;
  let size = 300;
  name.style.fontSize = size + 'px';
  while(name.scrollWidth > target && size > 10){ size -= 1; name.style.fontSize = size + 'px'; }
  while(name.scrollWidth < target && size < 800){ size += 1; name.style.fontSize = size + 'px'; }
}
window.addEventListener('resize', fitHeroName);

// ── NAV ──
const nav = document.getElementById('nav');

// ── HERO SCROLL BACKLIGHT ──
const heroWrap   = document.getElementById('hero-wrap');
const backlight  = document.getElementById('hero-backlight');
const canvasGlow = document.getElementById('hero-canvas-glow');

function updateHeroLight(){
  const viewH    = window.innerHeight;
  // phase1: scrollY 0 ~ viewH        → 조명 0~1
  // phase2: scrollY viewH ~ 1.5*viewH → 조명 1 고정 (멈춤)
  // phase3: scrollY > 1.5*viewH      → content-wrap이 올라와 덮음 (hero-wrap 끝나면 자연스럽게)
  const progress = Math.min(1, window.scrollY / viewH);

  // 조명 세기 — easeInOut
  const t = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  backlight.style.opacity  = t * 0.85;
  canvasGlow.style.opacity = t;

  // 캔버스 오버레이: 조명이 켜질수록 어두운 막이 걷힘
  const overlay = document.getElementById('hero-canvas-overlay');
  if(overlay){
    // 처음(t=0): opacity 0.82 (거의 불투명 — 어두워 보임)
    // 끝(t=1):   opacity 0    (완전 걷힘 — 흰 캔버스 드러남)
    overlay.style.opacity = (1 - t) * 0.82;
  }

  // nav 색상
  const contentTop = document.querySelector('.content-wrap').getBoundingClientRect().top;
  nav.classList.toggle('on-light', contentTop < 60);
}

window.addEventListener('scroll', updateHeroLight, {passive:true});
updateHeroLight();

// ── SCROLL REVEAL ──
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
},{threshold:0.07});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

// ── BACKLIGHT: 세로 작품 (Room A, C) ──
const vItems = document.querySelectorAll('.v-item');
const appShowcase = document.querySelectorAll('.app-showcase');

const backlightObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('lit');
    } else {
      e.target.classList.remove('lit');
    }
  });
},{
  threshold:[0.3, 0.5],
  rootMargin:'-12% 0px -12% 0px'
});

vItems.forEach(el=>backlightObs.observe(el));
appShowcase.forEach(el=>backlightObs.observe(el));