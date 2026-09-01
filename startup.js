/* DinoRamtix startup animation v2 — starts as soon as the page DOM is ready. Visual only. */
(()=>{
  function run(){
    if(document.getElementById('dinoStartupOverlay'))return;
    const s=document.createElement('style');s.id='dinoStartupStyles';s.textContent=`
      #dinoStartupOverlay{position:fixed;inset:0;z-index:2147483640;background:#030611;display:grid;place-items:center;overflow:hidden;opacity:1;visibility:visible;pointer-events:none;transition:opacity .7s ease,visibility .7s ease}
      #dinoStartupOverlay.hide{opacity:0;visibility:hidden;pointer-events:none}
      #dinoStartupOverlay:before{content:"";position:absolute;width:55vmax;height:55vmax;border:1px solid rgba(57,217,255,.18);border-radius:50%;box-shadow:0 0 80px rgba(57,217,255,.08),inset 0 0 80px rgba(118,87,255,.06);animation:dinoOrbit 2.6s ease-out forwards}
      #dinoStartupOverlay:after{content:"";position:absolute;width:100%;height:1px;top:50%;left:-100%;background:linear-gradient(90deg,transparent,#39d9ff,transparent);box-shadow:0 0 25px #39d9ff;animation:dinoScan 1.2s .25s ease-out forwards}
      .dinoLogo{position:relative;text-align:center;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:clamp(42px,9vw,92px);font-weight:950;letter-spacing:-.07em;color:#fff;text-shadow:0 0 12px rgba(57,217,255,.6),0 0 42px rgba(118,87,255,.35);transform:scale(.78);opacity:0;animation:dinoLogo 1.1s .05s cubic-bezier(.16,1,.3,1) forwards}
      .dinoLogo span{background:linear-gradient(100deg,#fff,#39d9ff 45%,#9d72ff 75%,#ff4da6);-webkit-background-clip:text;background-clip:text;color:transparent}
      .dinoSub{font:700 11px Inter,system-ui,sans-serif;letter-spacing:.42em;color:#8aa0bd;margin-top:13px;opacity:0;animation:dinoSub .7s .55s ease forwards}
      @keyframes dinoLogo{to{transform:scale(1);opacity:1}}@keyframes dinoSub{to{opacity:1}}@keyframes dinoOrbit{from{transform:scale(.45) rotate(-25deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}@keyframes dinoScan{to{left:100%}}
    `;document.head.appendChild(s);
    const o=document.createElement('div');o.id='dinoStartupOverlay';o.innerHTML='<div><div class="dinoLogo"><span>DinoRamtix</span> 🦖</div><div class="dinoSub">SOCIAL NETWORK</div></div>';document.body.prepend(o);
    /* The overlay is visual only and can never intercept login clicks. */
    o.style.pointerEvents='none';
    setTimeout(()=>{o.classList.add('hide');setTimeout(()=>o.remove(),750)},1800);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
