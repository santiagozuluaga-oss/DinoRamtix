/* DinoRamtix manual refresh button: reloads the page like F5, then removes itself before reload. */
(()=>{
  const ID='dinoRefreshButton';
  const STYLE='dinoRefreshButtonStyles';
  function install(){
    const app=document.getElementById('app');
    if(!app || app.classList.contains('hidden') || document.getElementById(ID)) return;
    if(!document.getElementById(STYLE)){
      const s=document.createElement('style');
      s.id=STYLE;
      s.textContent=`#${ID}{position:fixed;right:18px;top:18px;z-index:10000;border:1px solid rgba(95,220,255,.35);border-radius:14px;padding:11px 16px;background:linear-gradient(135deg,#7657ff,#39d9ff);color:#fff;font:800 13px Inter,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.28);cursor:pointer;transition:transform .15s,filter .15s}#${ID}:hover{transform:translateY(-2px);filter:brightness(1.08)}#${ID}:active{transform:scale(.96)}@media(max-width:600px){#${ID}{right:10px;top:10px;padding:9px 12px;font-size:12px}}`;
      document.head.appendChild(s);
    }
    const b=document.createElement('button');
    b.id=ID;
    b.type='button';
    b.textContent='✨ Aplicar actualización';
    b.title='Recarga DinoRamtix como si presionaras F5';
    b.addEventListener('click',()=>{
      b.disabled=true;
      b.remove();
      try{sessionStorage.setItem('dinoManualRefresh','1')}catch(e){}
      location.reload();
    });
    document.body.appendChild(b);
  }
  window.__dinoInstallRefreshButton=install;
  const check=()=>install();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
  const mo=new MutationObserver(check);
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  setInterval(check,1000);
})();
