/* DinoRamtix login fix — protects the form and guarantees UI activation after auth. */
(()=>{
  const $=id=>document.getElementById(id);
  let authHooked=false;
  function activate(){
    document.dispatchEvent(new CustomEvent('dinoramtix:login-complete'));
    window.__dinoApplyPostLoginUI?.();
    window.__dinoEnsureCountdown?.();
    const app=$('app');
    if(app&&!app.classList.contains('hidden')){
      document.body.classList.add('dino-modern');
      if(innerWidth<=600)document.body.classList.add('dino-mobile');
    }
  }
  function protect(){
    const auth=$('auth'),btn=$('authBtn');
    if(auth){auth.style.position='relative';auth.style.zIndex='2147483000';auth.style.pointerEvents='auto'}
    if(btn){btn.style.position='relative';btn.style.zIndex='2147483001';btn.style.pointerEvents='auto';btn.disabled=false;btn.removeAttribute('aria-disabled')}
    ['email','pass','user'].forEach(id=>{const el=$(id);if(el){el.style.pointerEvents='auto';el.style.position='relative';el.style.zIndex='2147483001'}})
    const overlay=$('dinoStartupOverlay');if(overlay)overlay.style.pointerEvents='none';
  }
  function hookAuth(){
    if(authHooked||typeof window.auth!=='function')return;
    const original=window.auth;
    window.auth=async function(...args){
      const result=await original.apply(this,args);
      setTimeout(activate,0);setTimeout(activate,150);setTimeout(activate,600);setTimeout(activate,1500);
      return result;
    };
    authHooked=true;
  }
  function wire(){protect();hookAuth()}
  function boot(){wire();[50,250,800,1600,3000].forEach(t=>setTimeout(wire,t))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  const observer=new MutationObserver(()=>wire());
  observer.observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('resize',()=>{const app=$('app');if(app&&!app.classList.contains('hidden'))activate()},{passive:true});
})();
