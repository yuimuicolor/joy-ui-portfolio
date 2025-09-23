// theme.mobile-safe.js (교체용)
const root = document.getElementById("main");
const secs = [...document.querySelectorAll("[data-section]")];
const links = [...document.querySelectorAll(".nav a")];

let lockTarget = null;
let ticking = false;

// 실제 스크롤 대상이 #main인지, window/body인지 판별
function getScroller() {
  // #main이 스크롤바가 있고 실제로 스크롤 값이 변하면 그걸 우선 사용
  if (root && root.scrollHeight > root.clientHeight) return root;
  return window; // 모바일 사파리 등에서 body가 스크롤 담당
}

// scroller별 유틸들
function getScrollTop(scroller) {
  return scroller === window
    ? window.pageYOffset || document.documentElement.scrollTop
    : scroller.scrollTop;
}
function scrollToY(scroller, top, behavior = "smooth") {
  if (scroller === window) {
    window.scrollTo({ top, behavior });
  } else {
    scroller.scrollTo({ top, behavior });
  }
}
// root 기준 상대좌표 → scroller 기준 절대 Y 계산
function getTargetTop(scroller, el) {
  const elRect = el.getBoundingClientRect();
  const baseRect =
    scroller === window
      ? document.documentElement.getBoundingClientRect() // (=0,0)
      : scroller.getBoundingClientRect();

  // scroller 현재 스크롤 + (엘리먼트 화면내 top - 스크롤컨테이너 화면내 top)
  return getScrollTop(scroller) + (elRect.top - baseRect.top);
}

function setActive(id) {
  links.forEach((a) => {
    const on = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("active", on);
    const old = a.querySelector(".nav-badge");
    if (old) old.remove();
    if (on) {
      const b = document.createElement("span");
      b.className = "nav-badge";
      b.setAttribute("aria-hidden", "true");
      a.appendChild(b);
    }
  });
  const el = document.getElementById(id);
  document.documentElement.setAttribute(
    "data-theme",
    el?.getAttribute("data-theme") || "home"
  );
  history.replaceState(null, "", `#${id}`);
}

function scanActive() {
  ticking = false;
  if (lockTarget) {
    setActive(lockTarget);
    return;
  }

  const scroller = getScroller();
  const mid =
    getScrollTop(scroller) +
    (scroller === window ? window.innerHeight / 2 : scroller.clientHeight / 2);

  let best = null;
  for (const s of secs) {
    const rect = s.getBoundingClientRect();
    const baseTop =
      scroller === window ? 0 : scroller.getBoundingClientRect().top;
    const top = getScrollTop(scroller) + (rect.top - baseTop);
    const bottom = top + s.offsetHeight;
    const dist = mid < top ? top - mid : mid > bottom ? mid - bottom : 0;
    if (!best || dist < best.dist) best = { id: s.id, dist };
  }
  if (best) setActive(best.id);
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(scanActive);
    ticking = true;
  }
}

// 스크롤 이벤트(둘 다 걸어 안전하게)
root?.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("scroll", onScroll, { passive: true });

// 내비 클릭
links.forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    const scroller = getScroller();
    lockTarget = id;
    setActive(id);

    // 스냅/모바일 흔들림 감안해 bounding 기반으로 목표 Y 계산
    const targetY = getTargetTop(scroller, el);
    scrollToY(scroller, targetY, "smooth");

    // 도착 감지(오차 여유 + 타임아웃)
    const threshold = 6; // 모바일에서 2px은 너무 빡셈
    let tries = 0;
    const watcher = setInterval(() => {
      const done = Math.abs(getScrollTop(scroller) - targetY) < threshold;
      if (done || ++tries > 40) {
        // ~2초
        clearInterval(watcher);
        lockTarget = null;
        scanActive();
      }
    }, 50);
  });
});

// 초기 상태
window.addEventListener("load", () => {
  const HOME_ID = "home";
  const scroller =
    root && root.scrollHeight > root.clientHeight ? root : window;

  // 1) 해시 무시하고 항상 home으로 세팅
  history.replaceState(null, "", `#${HOME_ID}`);
  setActive(HOME_ID);

  // 2) 일단 즉시 0으로 점프
  if (scroller === window) {
    window.scrollTo({ top: 0, behavior: "auto" });
  } else {
    scroller.scrollTo({ top: 0, behavior: "auto" });
  }

  // 3) 모바일에서 주소창/폰트 로드로 살짝 밀리는 걸 몇 프레임 고정
  let frames = 12;
  const pinTop = () => {
    frames--;
    if (scroller === window) {
      if (window.pageYOffset !== 0) window.scrollTo(0, 0);
    } else {
      if (scroller.scrollTop !== 0) scroller.scrollTop = 0;
    }
    if (frames > 0) requestAnimationFrame(pinTop);
    else scanActive(); // 안정화 후 최종 스캔
  };
  requestAnimationFrame(pinTop);
});
