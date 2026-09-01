/* DinoRamtix login interaction fix — keeps the existing auth logic, only restores pointer/click behavior. */
(()=>{
  const $=id=>document.getElementById(id);
  function protect(){
    const auth=$('auth'), btn=$('authBtn');
    if(!auth||!btn)return;
    auth.style.position='relative';
    auth.style.zIndex='2147483000';
    auth.style.pointerEvents='auto';
    btn.style.position='relative';
    btn.style.zIndex='2147483001';
    btn.style.pointerEvents='auto';
    btn.disabled=false;
    btn.removeAttribute('aria-disabled');
  }
  function wire(){
    protect();
    const btn=$('authBtn');
    if(!btn||btn.dataset.dinoLoginFix)return;
    btn.dataset.dinoLoginFix='1';
    btn.addEventListener('click',()=>{
      protect();
      if(typeof window.auth==='function')window.auth();
    },{capture:false});
    ['email','pass','user'].forEach(id=>{
      const el=$(id); if(el){el.style.pointerEvents='auto';el.style.position='relative';el.style.zIndex='2147483001'}
    });
  }
  function removeBlockingOverlay(){
    const o=$('dinoStartupOverlay');
    if(o){o.style.pointerEvents='none';}
  }
  function boot(){wire();removeBlockingOverlay();setTimeout(wire,100);setTimeout(wire,600);setTimeout(wire,1500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  new MutationObserver(()=>{wire();removeBlockingOverlay()}).observe(document.documentElement,{subtree:true,childList:true});
})();
