// theme.js (교체용)
const root   = document.getElementById('main');
const secs   = [...document.querySelectorAll('[data-section]')];
const links  = [...document.querySelectorAll('.nav a')];

let lockTarget = null;      // 내비 클릭 중 목표 섹션 id (중간 섹션 무시)
let ticking    = false;     // rAF 중복 방지

function setActive(id){
  links.forEach(a=>{
    const on = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('active', on);
    const old = a.querySelector('.nav-badge'); if (old) old.remove();
    if (on) {
      const b = document.createElement('span');
      b.className = 'nav-badge'; b.setAttribute('aria-hidden','true');
      a.appendChild(b);
    }
  });
  const el = document.getElementById(id);
  document.documentElement.setAttribute(
    'data-theme', el?.getAttribute('data-theme') || 'home'
  );
  history.replaceState(null, '', `#${id}`);
}

function scanActive(){
  ticking = false;

  // 내비 클릭 잠금 상태면 목표만 활성화하고 끝
  if (lockTarget) { setActive(lockTarget); return; }

  // 컨테이너 중앙에 가장 가까운 섹션을 active로
  const mid = root.scrollTop + root.clientHeight / 2;
  let best = null;
  for (const s of secs){
    const top = s.offsetTop;
    const bottom = top + s.offsetHeight;
    const dist = (mid < top) ? top - mid : (mid > bottom ? mid - bottom : 0);
    if (!best || dist < best.dist) best = { id: s.id, dist };
  }
  if (best) setActive(best.id);
}

root.addEventListener('scroll', () => {
  if (!ticking){
    window.requestAnimationFrame(scanActive);
    ticking = true;
  }
}, { passive:true });

// 내비 클릭: 목표 섹션만 즉시 활성화 + 스무스 스크롤, 도착 후 잠금 해제
links.forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    lockTarget = id;                 // 🔒 중간 섹션 무시
    setActive(id);                   // 즉시 UI 반영
    root.scrollTo({ top: el.offsetTop, behavior: 'smooth' });

    // 스크롤이 사실상 도착하면 잠금 해제
    const watcher = setInterval(()=>{
      const done = Math.abs(root.scrollTop - el.offsetTop) < 2;
      if (done){
        clearInterval(watcher);
        lockTarget = null;           // 🔓 해제
        scanActive();                // 최종 스캔으로 안정화
      }
    }, 50);
    setTimeout(()=>{ clearInterval(watcher); lockTarget = null; }, 1500); // 안전 해제
  });
});

// 초기 상태
window.addEventListener('load', ()=>{
  const id = (location.hash || `#${secs[0].id}`).slice(1);
  const el = document.getElementById(id);
  if (el) root.scrollTo({ top: el.offsetTop });
  setActive(id);
  scanActive();
});
