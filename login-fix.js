/* DinoRamtix login fix — never duplicates auth(), never blocks the form. */
(()=>{
  const $=id=>document.getElementById(id);
  const AUTH_IDS=['auth','authBtn','email','pass','user'];
  function protect(){
    const auth=$('auth'),btn=$('authBtn');
    if(auth){auth.style.position='relative';auth.style.zIndex='2147483000';auth.style.pointerEvents='auto'}
    if(btn){btn.style.position='relative';btn.style.zIndex='2147483001';btn.style.pointerEvents='auto';btn.disabled=false;btn.removeAttribute('aria-disabled')}
    ['email','pass','user'].forEach(id=>{const el=$(id);if(el){el.style.pointerEvents='auto';el.style.position='relative';el.style.zIndex='2147483001'}})
    const overlay=$('dinoStartupOverlay');
    if(overlay){overlay.style.pointerEvents='none'}
  }
  function wire(){
    protect();
    const btn=$('authBtn');
    if(!btn)return;
    /* index.html already has onclick="auth()". Do NOT attach another auth listener. */
    btn.dataset.dinoLoginFix='active';
  }
  function boot(){wire();setTimeout(wire,50);setTimeout(wire,250);setTimeout(wire,800);setTimeout(wire,1600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  const observer=new MutationObserver(()=>wire());
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
