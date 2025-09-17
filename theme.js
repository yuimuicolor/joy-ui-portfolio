// theme.js
const sections = [...document.querySelectorAll("[data-section]")];
const navLinks = [...document.querySelectorAll(".nav a")];


let navLockId = null;     // 내비 클릭 중 잠금: 이 동안 IO 무시
let ioDebounce = null;    // 자연 스크롤 디바운스용
let pendingId = null;


function setActiveLink(id){
  navLinks.forEach(a => {
    const ok = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("active", ok);

    // 뱃지는 오직 active 하나만
    const old = a.querySelector(".nav-badge");
    if (old) old.remove();
    if (ok) {
      const b = document.createElement("span");
      b.className = "nav-badge";
      b.setAttribute("aria-hidden","true");
      a.appendChild(b);
    }
  });
}

// IO: 스크롤 중간중간 들어오는 이벤트는 디바운스 적용
const io = new IntersectionObserver((entries) => {
  if (navLockId) return;                // 내비 클릭 중이면 무시

  const vis = entries
    .filter(e => e.isIntersecting)
    .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!vis) return;

  pendingId = vis.target.id;
  clearTimeout(ioDebounce);
  ioDebounce = setTimeout(() => {
    // 스크롤이 잠깐 멈췄을 때만 최종 섹션을 active
    history.replaceState(null, "", `#${pendingId}`);
    document.documentElement.setAttribute("data-theme",
      document.getElementById(pendingId).getAttribute("data-theme") || "light");
    setActiveLink(pendingId);
  }, 120); // 100~180ms 사이 취향대로
}, { threshold: [0.7], rootMargin: "0px 0px -10% 0px" }); // 살짝 보수적으로

sections.forEach(s => io.observe(s));

// 내비 클릭: 목표만 즉시 active, 중간 섹션 무시
navLinks.forEach(a => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    navLockId = id;                                 // 잠금 시작
    setActiveLink(id);
    document.documentElement.setAttribute("data-theme",
      document.getElementById(id).getAttribute("data-theme") || "light");
    history.replaceState(null, "", `#${id}`);

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

    // 스크롤 끝나면 잠금 해제 (scrollend 지원 + 타임아웃 폴백)
    const unlock = () => { navLockId = null; };
    const onEnd = () => { unlock(); window.removeEventListener("scrollend", onEnd); };
    window.addEventListener("scrollend", onEnd, { once: true });
    setTimeout(unlock, 900); // 폴백(브라우저별)
  });
});

// 새로고침/직접 해시 접근 시 초기 상태 세팅
window.addEventListener("load", () => {
  const id = (location.hash || "#"+sections[0].id).slice(1);
  document.getElementById(id)?.scrollIntoView({ block: "start" });
  document.documentElement.setAttribute("data-theme",
    document.getElementById(id).getAttribute("data-theme") || "light");
  setActiveLink(id);
});
