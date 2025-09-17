// theme.js
const io=new IntersectionObserver(es=>{
  const v=es.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(!v) return;
  const sec=v.target;
  history.replaceState(null,"",`#${sec.id}`);
  document.documentElement.setAttribute("data-theme", sec.getAttribute("data-theme")||"light");
},{threshold:[0.6]});
document.querySelectorAll("[data-section]").forEach(s=>io.observe(s));
