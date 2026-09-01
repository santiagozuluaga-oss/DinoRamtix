/* DinoRamtix startup: no text intro. Halloween countdown only. */
(()=>{
  const TARGET=new Date('2026-10-31T23:59:59');
  function run(){
    // Remove every legacy text-intro/overlay so it can never block login or buttons.
    document.getElementById('dinoStartupOverlay')?.remove();
    document.getElementById('dinoStartupStyles')?.remove();
    document.getElementById('dinoIntro')?.remove();
    document.querySelectorAll('[data-dino-intro],.dino-intro,.startup-overlay,.intro-overlay').forEach(x=>x.remove());
    if(document.getElementById('dinoHalloweenCountdown'))return;
    const s=document.createElement('style');s.id='dinoHalloweenStyles';s.textContent=`#dinoHalloweenCountdown{display:flex;align-items:center;justify-content:center;gap:8px;margin:8px auto 16px;padding:10px 16px;border:1px solid rgba(255,140,40,.24);border-radius:14px;background:rgba(255,120,20,.06);color:#fff;font:800 14px Inter,system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.18);max-width:fit-content}#dinoHalloweenCountdown .dinoCount{color:#ffad5a;font-size:16px;text-shadow:0 0 14px rgba(255,130,40,.35)}@media(max-width:700px){#dinoHalloweenCountdown{width:calc(100% - 24px);font-size:13px;margin:6px 12px 12px}}`;document.head.appendChild(s);
    const e=document.createElement('div');e.id='dinoHalloweenCountdown';e.innerHTML='🎃 <span class="dinoCount">0</span> días para la mega actualización!';
    const host=document.getElementById('app')||document.body;host.prepend(e);
    function tick(){const d=Math.max(0,TARGET-Date.now()),n=e.querySelector('.dinoCount');if(n)n.textContent=Math.ceil(d/86400000);if(d<=0){e.textContent='🎃 ¡La mega actualización ya llegó!';clearInterval(window.__dinoCountdownTimer)}}
    tick();window.__dinoCountdownTimer=setInterval(tick,60000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
