/* DinoRamtix social interactions for feed, profile posts, reels and stories */
(function(){
  const $=id=>document.getElementById(id);
  const UUID=/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
  function profileUserId(){
    const box=$('profileBox'); if(!box)return null;
    const html=box.innerHTML||'';
    const patterns=[
      /toggleFollow\(['\"]([^'\"]+)/i,
      /followUser\(['\"]([^'\"]+)/i,
      /unfollowUser\(['\"]([^'\"]+)/i,
      /profile\(['\"]([^'\"]+)/i,
      /data-user-id\s*=\s*["']([^"']+)/i
    ];
    for(const re of patterns){const m=html.match(re);if(m&&m[1])return m[1]}
    const m=html.match(UUID);return m?m[0]:null;
  }
  function cleanUrl(v){try{const u=new URL(v,location.href);return decodeURIComponent(u.pathname).replace(/\/$/,'')}catch{return String(v||'').split(/[?#]/)[0]}}
  async function bindProfilePosts(){
    const box=$('profileBox'); if(!box)return;
    const uid=profileUserId(); if(!uid)return;
    const db=window.db||window.supabase?.createClient?.(window.DINORAMTIX_CONFIG?.supabaseUrl,window.DINORAMTIX_CONFIG?.supabasePublishableKey);
    if(!db)return;
    const r=await db.from('posts').select('id,user_id,media_url,media_type').eq('user_id',uid).order('created_at',{ascending:false});
    if(r.error)return;
    const byUrl=new Map((r.data||[]).map(p=>[cleanUrl(p.media_url),p.id]));
    const byFile=new Map((r.data||[]).map(p=>[cleanUrl(p.media_url).split('/').pop(),p.id]));
    box.querySelectorAll('img,video').forEach(media=>{
      if(media.closest('.avatar,.profileAvatar,.storyItem'))return;
      const src=media.currentSrc||media.src||media.getAttribute('src')||media.getAttribute('data-src')||'';
      const id=byUrl.get(cleanUrl(src))||byFile.get(cleanUrl(src).split('/').pop());
      if(!id)return;
      media.dataset.postId=id;
      media.style.cursor='pointer';
      media.title='Abrir publicación';
      if(!media.dataset.socialBound){
        media.dataset.socialBound='1';
        media.addEventListener('click',e=>{
          if(e.target.closest('button,input,a,[contenteditable="true"]'))return;
          e.preventDefault();e.stopPropagation();
          if(window.renderPostModal)window.renderPostModal(media.dataset.postId);
        },true);
      }
    });
  }
  function bindAnyPostMedia(){
    document.querySelectorAll('#profileBox [data-post-id]').forEach(media=>{media.style.cursor='pointer';});
  }
  function start(){
    let timer;
    const run=()=>{clearTimeout(timer);timer=setTimeout(()=>{bindProfilePosts().then(bindAnyPostMedia)},150)};
    document.addEventListener('click',e=>{if(e.target.closest?.('#profileBox'))run()},true);
    new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
    run();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* DinoRamtix visible PWA install button */
(function(){
  let deferredPrompt=null;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  function addStyles(){
    if(document.getElementById('dinoInstallStyles'))return;
    const s=document.createElement('style');
    s.id='dinoInstallStyles';
    s.textContent='#dinoInstallButton{position:fixed;right:18px;bottom:18px;z-index:99999;display:flex;align-items:center;gap:10px;border:0;border-radius:18px;padding:10px 15px 10px 10px;background:#fff;color:#111;font-weight:800;font-size:15px;box-shadow:0 8px 28px rgba(0,0,0,.22);cursor:pointer}#dinoInstallButton img{width:38px;height:38px;border-radius:12px;object-fit:cover;image-rendering:auto}#dinoInstallButton small{display:block;font-size:11px;font-weight:400;color:#666;margin-top:2px}@media(max-width:600px){#dinoInstallButton{right:12px;bottom:12px;padding-right:12px}}';
    document.head.appendChild(s);
  }
  function showButton(){
    if(standalone())return;
    addStyles();
    let b=document.getElementById('dinoInstallButton');
    if(b)return;
    b=document.createElement('button');
    b.id='dinoInstallButton';
    b.type='button';
    b.setAttribute('aria-label','Instalar aplicación DinoRamtix');
    b.innerHTML='<img src="/dinoramtix-icon.svg" alt="Icono de DinoRamtix"><span>📲 Instalar DinoRamtix<small>Usar como aplicación</small></span>';
    b.addEventListener('click',installApp);
    document.body.appendChild(b);
  }
  async function installApp(){
    if(deferredPrompt){
      deferredPrompt.prompt();
      try{await deferredPrompt.userChoice}catch(e){}
      deferredPrompt=null;
      return;
    }
    const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    if(isiOS){alert('En iPhone o iPad: pulsa Compartir y luego “Añadir a pantalla de inicio”.');}
    else{alert('Si no aparece la ventana de instalación, abre el menú ⋮ del navegador y pulsa “Instalar aplicación” o “Añadir a pantalla de inicio”.');}
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;showButton()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;document.getElementById('dinoInstallButton')?.remove()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showButton);else showButton();
})();

/* DinoRamtix extra controls: MiniJuegos, Comprar verificado y saldo de monedas */
(function(){
  const db=window.supabase?.createClient?.(window.DINORAMTIX_CONFIG?.supabaseUrl,window.DINORAMTIX_CONFIG?.supabasePublishableKey);
  const $=id=>document.getElementById(id);
  async function user(){return db?(await db.auth.getSession()).data.session?.user:null}
  async function refreshCoins(){
    const pill=$('dinoCoinsPill'),u=await user(); if(!pill)return;
    if(!u){pill.textContent='🪙 0 monedas';return}
    const r=await db.from('profiles').select('coins').eq('id',u.id).maybeSingle();
    const n=Number(r.data?.coins||0);
    pill.textContent=`🪙 ${n.toLocaleString('es-CO')} ${n===1?'moneda':'monedas'}`;
  }
  async function buyVerified(){
    const u=await user();if(!u)return alert('Inicia sesión para comprar el verificado.');
    const r=await db.from('profiles').select('coins,verified').eq('id',u.id).maybeSingle();
    const n=Number(r.data?.coins||0);
    if(r.data?.verified)return alert('Tu cuenta ya está verificada 🟦✓');
    if(n<7000000)return alert(`Necesitas 7.000.000 🪙. Tienes ${n.toLocaleString('es-CO')} 🪙.`);
    if(!confirm('¿Comprar el verificado por 7.000.000 🪙?'))return;
    const q=await db.rpc('buy_verified_with_coins');
    if(q.error)return alert(q.error.message);
    await refreshCoins();alert('¡Listo! Tu cuenta ahora está verificada 🟦✓');
    if(typeof window.my==='function')window.my();
  }
  function addControls(){
    const tabs=document.querySelector('#app>.tabs');if(!tabs)return;
    if(!$('dinoGamesTab')){
      const b=document.createElement('button');b.id='dinoGamesTab';b.className='g';b.textContent='🎮 MiniJuegos';
      b.onclick=()=>{if(typeof window.openDinoGames==='function')window.openDinoGames();else alert('Los MiniJuegos se están cargando. Recarga la página e inténtalo de nuevo.')};tabs.appendChild(b);
    }
    if(!$('dinoVerifiedTab')){
      const b=document.createElement('button');b.id='dinoVerifiedTab';b.className='g';b.textContent='🟦 Comprar verificado';b.onclick=buyVerified;tabs.appendChild(b);
    }
    if(!$('dinoCoinsPill')){
      const p=document.createElement('span');p.id='dinoCoinsPill';p.className='pill';p.style.cssText='font-weight:700;display:inline-flex;align-items:center;justify-content:center;min-width:130px;';p.textContent='🪙 0 monedas';tabs.appendChild(p);
    }
    refreshCoins();
  }
  window.refreshDinoCoins=refreshCoins;window.buyDinoVerified=buyVerified;
  function boot(){addControls();refreshCoins();setInterval(()=>{addControls();refreshCoins()},8000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
