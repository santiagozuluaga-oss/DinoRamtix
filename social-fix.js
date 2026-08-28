/* DinoRamtix social/profile fixes */
(function(){
  const $=id=>document.getElementById(id);
  const UUID=/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
  const db=window.db||window.supabase?.createClient?.(window.DINORAMTIX_CONFIG?.supabaseUrl,window.DINORAMTIX_CONFIG?.supabasePublishableKey);
  function profileId(box){
    if(!box)return null;const h=box.innerHTML||'';
    const p=[/toggleFollow\(['\"]([0-9a-f-]{36})/i,/followUser\(['\"]([0-9a-f-]{36})/i,/unfollowUser\(['\"]([0-9a-f-]{36})/i,/data-user-id=["']([0-9a-f-]{36})/i];
    for(const r of p){const m=h.match(r);if(m)return m[1]}const m=h.match(UUID);return m?.[0]||null;
  }
  function clean(v){try{return decodeURIComponent(new URL(v,location.href).pathname).replace(/\/$/,'')}catch{return String(v||'').split(/[?#]/)[0]}}
  async function bindProfilePosts(){
    const box=$('profileBox');if(!box||!db)return;const uid=profileId(box);if(!uid)return;
    const r=await db.from('posts').select('id,media_url,media_type').eq('user_id',uid).order('created_at',{ascending:false});if(r.error)return;
    const byUrl=new Map((r.data||[]).map(p=>[clean(p.media_url),p.id]));const byFile=new Map((r.data||[]).map(p=>[clean(p.media_url).split('/').pop(),p.id]));
    box.querySelectorAll('img,video').forEach(m=>{if(m.closest('.avatar,.profileAvatar,.storyItem'))return;const src=m.currentSrc||m.src||m.getAttribute('src')||'';const id=byUrl.get(clean(src))||byFile.get(clean(src).split('/').pop());if(!id)return;m.dataset.postId=id;m.style.cursor='pointer';if(!m.dataset.socialBound){m.dataset.socialBound='1';m.addEventListener('click',e=>{if(e.target.closest('button,input,a'))return;e.preventDefault();e.stopPropagation();window.renderPostModal?.(id)},true)}});
  }
  async function current(){return db?(await db.auth.getSession()).data.session?.user:null}
  async function showFollowListFixed(uid,type){
    if(!uid)return alert('No se pudo identificar este perfil.');
    const key=type==='followers'?'following_id':'follower_id',idKey=type==='followers'?'follower_id':'following_id';
    const rel=await db.from('follows').select(idKey).eq(key,uid).order('created_at',{ascending:false});if(rel.error)return alert(rel.error.message);
    const ids=[...new Set((rel.data||[]).map(x=>x[idKey]).filter(Boolean))];let users=[];
    if(ids.length){const p=await db.from('profiles').select('id,username,avatar_url,verified').in('id',ids);if(p.error)return alert(p.error.message);const map=new Map((p.data||[]).map(x=>[x.id,x]));users=ids.map(id=>map.get(id)).filter(Boolean)}
    const rows=users.map(u=>{const un=String(u.username||'Usuario').replace(/[&<>\"']/g,'');const av=u.avatar_url?String(u.avatar_url).replace(/"/g,'&quot;'):'';return `<div class="dinoUser"><div>${av?`<img src="${av}">`:`<div class="dinoUserAvatar">${un[0]?.toUpperCase()||'?'}</div>`}</div><div class="grow"><b>@${un}</b>${u.verified?' 🟦✓':''}</div><button class="p" onclick="window.profile('${u.id}');window.closeFollowList?.()">Ver perfil</button></div>`}).join('');
    window.closeFollowList=()=>$( 'dinoFollowModal')?.classList.add('hidden');let m=$('dinoFollowModal');if(!m){m=document.createElement('div');m.id='dinoFollowModal';m.className='dinoModal';document.body.appendChild(m)}
    m.innerHTML=`<div class="dinoSheet"><div class="row"><button class="g" onclick="window.closeFollowList()">←</button><h2 style="margin:0">${type==='followers'?'👥 Seguidores':'➡️ Siguiendo'}</h2></div><p class="muted">${users.length} ${type==='followers'?'personas te siguen':'personas sigue este usuario'}</p><div class="dinoList">${rows||'<p class="muted">Todavía no hay usuarios aquí.</p>'}</div></div>`;m.classList.remove('hidden');
  }
  function findType(el){const t=(el.textContent||'').trim().toLowerCase();return t.includes('seguidores')?'followers':t.includes('siguiendo')?'following':null}
  function wireCounters(){['meBox','profileBox'].forEach(id=>{const box=$(id);if(!box)return;const uid=profileId(box);box.querySelectorAll('*').forEach(el=>{if(el.dataset.dinoFollowWired)return;const type=findType(el);if(!type||id==='profileBox'&&!uid)return;el.dataset.dinoFollowWired='1';el.classList.add('dinoCountLink');el.addEventListener('click',async e=>{const control=e.target.closest?.('button,a,[role="button"],input,textarea,select');if(control&&!control.classList.contains('dinoCountLink'))return;e.preventDefault();e.stopPropagation();const u=id==='meBox'?await current():null;await showFollowListFixed(u?.id||uid,type)},true)})})}
  function loadGames(){if(document.getElementById('dinoGamesRuntime'))return;const s=document.createElement('script');s.id='dinoGamesRuntime';s.src='./games-ui.js?v=fix2';s.defer=true;document.head.appendChild(s);s.addEventListener('load',()=>setTimeout(()=>{window.showDinoFollowList=showFollowListFixed;wireCounters()},50))}
  let installPrompt=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;window.__dinoInstallPrompt=e;const b=$('dinoInstallButton');if(b)b.style.display='flex'});
  window.addEventListener('appinstalled',()=>{installPrompt=null;window.__dinoInstallPrompt=null;$('dinoInstallButton')?.remove()});
  function installButton(){if(window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone)return;if($('dinoInstallButton'))return;const b=document.createElement('button');b.id='dinoInstallButton';b.type='button';b.innerHTML='<img src="/dinoramtix-icon.svg" style="width:34px;height:34px;border-radius:10px;vertical-align:middle;margin-right:8px">📲 Instalar DinoRamtix';b.style.cssText='position:fixed;right:16px;bottom:16px;z-index:99999;display:flex;align-items:center;border:0;border-radius:16px;padding:9px 13px;background:#fff;color:#111;font-weight:800;box-shadow:0 6px 24px rgba(0,0,0,.2);cursor:pointer';b.onclick=async()=>{if(installPrompt){installPrompt.prompt();try{await installPrompt.userChoice}catch(e){}installPrompt=null;window.__dinoInstallPrompt=null}else alert('Abre el menú ⋮ del navegador y pulsa “Instalar aplicación” o “Añadir a pantalla de inicio”.')};document.body.appendChild(b)}
  window.showDinoFollowList=showFollowListFixed;
  function boot(){loadGames();installButton();wireCounters();setInterval(()=>{wireCounters();loadGames()},1500);new MutationObserver(()=>wireCounters()).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
