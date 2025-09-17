// loader.js  (ESM)
async function loadText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return await res.text();
}

// 컴포넌트 한 개 로드: HTML/ CSS/ JS 순서로 로드
async function mountComponent(hostEl, compPath) {
  const base = `/components/${compPath}`;

  // 1) HTML
  try {
    const html = await loadText(`${base}/index.html`);
    // Shadow DOM으로 스타일 스코프 격리 (선택: 원하면 일반 DOM으로 바꿔도 됨)
    const shadow = hostEl.attachShadow({ mode: "open" });
    // 2) CSS (optional)
    let css = "";
    try {
      css = await loadText(`${base}/style.css`);
    } catch (_) {}
    shadow.innerHTML = `
      <style>${css}</style>
      <div class="comp-root">${html}</div>
    `;

    // 3) JS (optional)
    try {
      const mod = await import(`${base}/script.js`);
      if (typeof mod.mount === "function") {
        // mount(shadowRoot or shadow.querySelector('.comp-root'))
        mod.mount(shadow.querySelector(".comp-root"), { host: hostEl, shadow });
      }
    } catch (_) {
      /* JS 없는 컴포넌트면 무시 */
    }
  } catch (e) {
    hostEl.textContent = `컴포넌트 로드 실패: ${compPath}`;
    console.error(e);
  }
}

// 페이지 내 모든 섹션 로드
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-component]").forEach((el) => {
    const path = el.getAttribute("data-component");
    mountComponent(el, path);
  });
});
