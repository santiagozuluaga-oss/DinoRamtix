/* Guarantees the post-login UI activates immediately after authentication, even when login happens before dynamically loaded UI scripts finish loading. */
(()=>{
  let hooked=false;
  const activate=()=>{
    document.dispatchEvent(new CustomEvent('dinoramtix:login-complete'));
    window.__dinoApplyPostLoginUI?.();
    window.__dinoEnsureCountdown?.();
    document.body.classList.add('dino-modern');
    if(window.innerWidth<=600) document.body.classList.add('dino-mobile');
  };
  function hook(){
    if(hooked||typeof window.auth!=='function') return;
    const original=window.auth;
    window.auth=async function(...args){
      const result=await original.apply(this,args);
      setTimeout(activate,0);
      setTimeout(activate,150);
      setTimeout(activate,600);
      return result;
    };
    hooked=true;
  }
  function boot(){
    hook();
    if(hooked) clearInterval(timer);
  }
  const timer=setInterval(boot,50);
  boot();
  document.addEventListener('dinoramtix:login-complete',()=>{
    setTimeout(()=>window.__dinoApplyPostLoginUI?.(),0);
    setTimeout(()=>window.__dinoEnsureCountdown?.(),0);
  });
})();
