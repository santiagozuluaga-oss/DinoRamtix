/* DinoRamtix manual refresh button */
(()=>{
  const BUTTON_ID='dinoRefreshButton';
  const STYLE_ID='dinoRefreshButtonStyles';
  function install(){
    const app=document.getElementById('app');
    if(!app || app.classList.contains('hidden') || document.getElementById(BUTTON_ID)) return;
    if(!document.getElementById(STYLE_ID)){
      const s=document.createElement('style');
      s.id=STYLE_ID;
      s.textContent=`#${BUTTON_ID}{position:fixed;right:18px;top:18px;z-index:2147483000;border:1px solid rgba(95,220,255,.35);border-radius:14px;padding:11px 16px;background:linear-gradient(135deg,#7657ff,#39d9ff);color:#fff;font:800 13px Inter,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.28);cursor:pointer;transition:transform .15s,filter .15s}#${BUTTON_ID}:hover{transform:translateY(-2px);filter:brightness(1.08)}#${BUTTON_ID}:active{transform:scale(.96)}@media(max-width:600px){#${BUTTON_ID}{right:10px;top:10px;padding:9px 12px;font-size:12px}}`;
      document.head.appendChild(s);
    }
    const b=document.createElement('button');
    b.id=BUTTON_ID;
    b.type='button';
    b.textContent='🔄 Aplicar cambios';
    b.title='Recarga DinoRamtix';
    b.addEventListener('click',()=>{
      b.disabled=true;
      b.style.display='none';
      try{sessionStorage.setItem('dinoManualRefresh','1')}catch(e){}
      window.location.reload();
    });
    document.body.appendChild(b);
  }
  window.__dinoInstallRefreshButton=install;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  new MutationObserver(install).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(install,1000);
})();
