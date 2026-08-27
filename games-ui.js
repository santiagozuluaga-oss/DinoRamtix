// DinoRamtix: MiniJuegos, comprar verificado, monedas y listas reales de seguidores
(() => {
  const db = window.supabase?.createClient?.(DINORAMTIX_CONFIG.supabaseUrl, DINORAMTIX_CONFIG.supabasePublishableKey);
  const $ = id => document.getElementById(id);
  const esc = x => String(x ?? '').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  let gameTimer=null, gameScore=0, gameRunning=false;

  async function currentUser() {
    if (!db) return null;
    return (await db.auth.getSession()).data.session?.user || null;
  }

  async function refreshCoins() {
    const u = await currentUser();
    const pill = $('dinoCoinsPill');
    if (!pill) return;
    if (!u) { pill.textContent = '🪙 0 monedas'; return; }
    const r = await db.from('profiles').select('coins').eq('id', u.id).maybeSingle();
    const coins = Number(r.data?.coins || 0);
    pill.textContent = `🪙 ${coins.toLocaleString('es-CO')} ${coins === 1 ? 'moneda' : 'monedas'}`;
  }

  function addStyles(){
    if($('dinoGamesStyles'))return;
    const s=document.createElement('style');s.id='dinoGamesStyles';s.textContent=`
      .dinoModal{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:1000;display:flex;align-items:center;justify-content:center;padding:14px}
      .dinoSheet{width:min(760px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:20px;padding:18px;color:#111}
      .dinoGameGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .dinoGameCard{border:1px solid #ddd;border-radius:15px;padding:14px;text-align:left;background:#fafafa;cursor:pointer}
      .dinoGameCard:hover{transform:translateY(-1px)}
      .dinoPlay{min-height:280px;border:2px dashed #ccd0d5;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px;position:relative;overflow:hidden;background:#f7f9fb}
      .dinoTarget{position:absolute;border-radius:50%;font-size:28px;width:64px;height:64px;padding:0}
      .dinoBig{font-size:56px;font-weight:800}
      .dinoList{display:grid;gap:8px;max-height:55vh;overflow:auto}
      .dinoUser{display:flex;align-items:center;gap:10px;border:1px solid #e1e4e8;border-radius:12px;padding:9px}
      .dinoUser img{width:44px;height:44px;border-radius:50%;object-fit:cover}.dinoUserAvatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#e9edf1;font-weight:700}
      .dinoCountLink{cursor:pointer;text-decoration:underline;text-underline-offset:3px}
      @media(max-width:650px){.dinoGameGrid{grid-template-columns:1fr}.dinoSheet{padding:12px}}
    `;document.head.appendChild(s);
  }

  function modal(id,html){addStyles();let m=$(id);if(!m){m=document.createElement('div');m.id=id;m.className='dinoModal';document.body.appendChild(m)}m.innerHTML=`<div class="dinoSheet">${html}</div>`;m.classList.remove('hidden');m.onclick=e=>{if(e.target===m)m.classList.add('hidden')}}
  function closeModal(id){$(id)?.classList.add('hidden')}

  function fastNotice(message){
    let n=$('dinoFastNotice');
    if(!n){
      n=document.createElement('div'); n.id='dinoFastNotice';
      n.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100000;background:#111;color:#fff;padding:13px 18px;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.3);font-weight:700;text-align:center;max-width:min(90vw,520px);transition:opacity .18s ease';
      document.body.appendChild(n);
    }
    n.textContent=message; n.style.opacity='1'; clearTimeout(window.__dinoNoticeTimer);
    window.__dinoNoticeTimer=setTimeout(()=>{n.style.opacity='0'},2600);
  }

  async function buyVerified() {
    const u = await currentUser();
    if (!u) return fastNotice('Inicia sesión para comprar el verificado.');
    const r = await db.from('profiles').select('coins,verified').eq('id', u.id).maybeSingle();
    const coins = Number(r.data?.coins || 0);
    if (r.data?.verified) return fastNotice('Tu cuenta ya está verificada 🟦✓');
    if (coins < 7000000) return fastNotice(`Necesitas 7.000.000 🪙. Tienes ${coins.toLocaleString('es-CO')} 🪙.`);
    if (!confirm('¿Comprar la insignia de verificado por 7.000.000 🪙?')) return;
    const q = await db.rpc('buy_verified_with_coins');
    if (q.error) return fastNotice(q.error.message);
    fastNotice('¡Listo! Tu cuenta ahora está verificada 🟦✓');
    refreshCoins();
    if (typeof window.my === 'function') window.my();
  }

  function gameMenu(){
    modal('dinoGamesModal',`<button class="g" onclick="window.closeDinoGames()">✕ Cerrar</button><h2>🎮 MiniJuegos</h2><p class="muted">Sin límite de tiempo. Termina cuando quieras. Tu puntuación se convierte en la misma cantidad de 🪙 monedas.</p><div class="dinoGameGrid">
      <button class="dinoGameCard" onclick="window.startDinoTap()"><b>🦖 Dino Tap</b><br><span class="muted">Toca el dinosaurio tantas veces como quieras.</span></button>
      <button class="dinoGameCard" onclick="window.startMathGame()"><b>🧠 Reto Matemático</b><br><span class="muted">Resuelve operaciones y suma puntos.</span></button>
      <button class="dinoGameCard" onclick="window.startTargetGame()"><b>🎯 Caza el objetivo</b><br><span class="muted">Acierta al objetivo para sumar puntos.</span></button>
    </div>`)
  }

  function gameShell(title,body){
    modal('dinoGameModal',`<div class="row"><button class="g" onclick="window.stopDinoGame()">← Juegos</button><div class="grow"><h2 style="margin:0">${title}</h2></div><b id="gameScore">0 puntos</b></div><div style="margin-top:14px">${body}</div>`);
    gameRunning=true;gameScore=0;
  }
  async function finishGame(game){
    if(!gameRunning)return;gameRunning=false;clearInterval(gameTimer);gameTimer=null;
    const u=await currentUser();if(!u){fastNotice('Inicia sesión para guardar las monedas.');return}
    const score=Math.max(0,Math.floor(gameScore));
    const r=await db.rpc('add_game_coins',{p_game:game,p_score:score});
    if(r.error){fastNotice(r.error.message);return}
    const earned=Number(r.data||score);
    // Mostrar la confirmación sin esperar otra consulta de Supabase.
    fastNotice(`🎉 ¡Partida terminada! +${earned.toLocaleString('es-CO')} 🪙 monedas`);
    refreshCoins();
    setTimeout(gameMenu,120);
  }
  function setScore(n){gameScore=n;const el=$('gameScore');if(el)el.textContent=`${n} puntos`}
  function stopDinoGame(){gameRunning=false;clearInterval(gameTimer);gameTimer=null;closeModal('dinoGameModal');gameMenu()}
  function startDinoTap(){gameShell('🦖 Dino Tap',`<div class="dinoPlay"><div class="dinoBig">${gameScore}</div><button style="font-size:70px;padding:12px" onclick="window.tapDino()">🦖</button><button class="p" onclick="window.finishDinoTap()">Terminar y cobrar 🪙</button></div>`)}
  function tapDino(){if(!gameRunning)return;setScore(gameScore+1)}
  function finishDinoTap(){finishGame('dino_tap')}
  function newMath(){const a=Math.floor(Math.random()*20)+1,b=Math.floor(Math.random()*20)+1,ops=['+','-','×'],op=ops[Math.floor(Math.random()*ops.length)];let ans=op==='+'?a+b:op==='-'?a-b:a*b;$('mathQuestion').textContent=`${a} ${op} ${b} = ?`;$('mathAnswer').value='';$('mathAnswer').focus();window.mathAnswer=ans}
  function startMathGame(){gameShell('🧠 Reto Matemático',`<div class="dinoPlay"><h2 id="mathQuestion"></h2><input id="mathAnswer" type="number" style="max-width:260px" placeholder="Respuesta" onkeydown="if(event.key==='Enter')window.checkMath()"><button class="p" onclick="window.checkMath()">Comprobar</button><p id="mathResult" class="muted"></p><button class="g" onclick="window.finishMathGame()">Terminar y cobrar 🪙</button></div>`);newMath()}
  function checkMath(){if(!gameRunning)return;const v=Number($('mathAnswer').value);if(v===window.mathAnswer){setScore(gameScore+100);$('mathResult').textContent='✅ Correcto +100';setTimeout(newMath,250)}else{$('mathResult').textContent='❌ Incorrecto, intenta otra vez'}}
  function finishMathGame(){finishGame('reto_matematico')}
  function moveTarget(){const area=$('targetArea'),t=$('targetButton');if(!area||!t)return;const maxX=Math.max(0,area.clientWidth-70),maxY=Math.max(0,area.clientHeight-70);t.style.left=Math.floor(Math.random()*maxX)+'px';t.style.top=Math.floor(Math.random()*maxY)+'px'}
  function startTargetGame(){gameShell('🎯 Caza el objetivo',`<div id="targetArea" class="dinoPlay"><button id="targetButton" class="dinoTarget p" onclick="window.hitTarget()">🎯</button><button class="g" onclick="window.finishTargetGame()">Terminar y cobrar 🪙</button></div>`);moveTarget()}
  function hitTarget(){if(!gameRunning)return;setScore(gameScore+10);moveTarget()}

  function profileIdFromBox(box){
    if(!box)return null;
    const h=box.innerHTML||'';
    const patterns=[/toggleFollow\(['\"]([0-9a-f-]{36})/i,/followUser\(['\"]([0-9a-f-]{36})/i,/unfollowUser\(['\"]([0-9a-f-]{36})/i,/profile\(['\"]([0-9a-f-]{36})/i,/data-user-id=["']([0-9a-f-]{36})/i];
    for(const r of patterns){const m=h.match(r);if(m)return m[1]}
    return null;
  }
  async function showFollowList(uid,type){
    if(!uid)return fastNotice('No se pudo identificar este perfil.');
    const col=type==='followers'?'follower_id':'following_id';
    const rel=type==='followers'?'profiles!follows_follower_id_fkey':'profiles!follows_following_id_fkey';
    const title=type==='followers'?'👥 Seguidores':'➡️ Siguiendo';
    const r=await db.from('follows').select(`${col}, ${rel}(id,username,avatar_url,verified)`).eq(type==='followers'?'following_id':'follower_id',uid).order('created_at',{ascending:false});
    if(r.error)return fastNotice(r.error.message);
    const users=(r.data||[]).map(x=>x[rel]);
    const unique=[];const seen=new Set();for(const u of users){if(u&&!seen.has(u.id)){seen.add(u.id);unique.push(u)}}
    const rows=unique.map(u=>`<div class="dinoUser"><div>${u.avatar_url?`<img src="${esc(u.avatar_url)}">`:`<div class="dinoUserAvatar">${esc((u.username||'?')[0].toUpperCase())}</div>`}</div><div class="grow"><b>@${esc(u.username||'Usuario')}</b>${u.verified?' 🟦✓':''}</div><button class="p" onclick="window.profile('${u.id}');window.closeFollowList()">Ver perfil</button></div>`).join('');
    modal('dinoFollowModal',`<div class="row"><button class="g" onclick="window.closeFollowList()">←</button><h2 style="margin:0">${title}</h2></div><p class="muted">${unique.length} ${type==='followers'?'personas te siguen':'personas sigue este usuario'}</p><div class="dinoList">${rows||'<p class="muted">Todavía no hay usuarios aquí.</p>'}</div>`)
  }
  function closeFollowList(){closeModal('dinoFollowModal')}
  function wireFollowCounters(){
    ['meBox','profileBox'].forEach(id=>{const box=$(id);if(!box)return;const uid=id==='meBox'?null:profileIdFromBox(box);box.querySelectorAll('button,span,b,strong,div').forEach(el=>{
      if(el.dataset.followWired)return;const txt=(el.textContent||'').trim().toLowerCase();let type=txt.includes('seguidores')?'followers':(txt.includes('siguiendo')?'following':null);if(!type)return;
      const owner=uid||null;if(id==='profileBox'&&!owner)return;el.dataset.followWired='1';el.classList.add('dinoCountLink');el.title=type==='followers'?'Ver quién sigue a este usuario':'Ver a quién sigue este usuario';el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(id==='meBox'){currentUser().then(u=>u&&showFollowList(u.id,type))}else showFollowList(owner,type)},true);
    })})
  }

  function addControls() {
    const app = $('app'); const tabs = document.querySelector('#app>.tabs'); if (!app || !tabs) return;
    addStyles();
    if (!$('dinoGamesTab')) {const b=document.createElement('button');b.id='dinoGamesTab';b.className='g';b.textContent='🎮 MiniJuegos';b.onclick=()=>gameMenu();tabs.appendChild(b)}
    if (!$('dinoVerifiedTab')) {const b=document.createElement('button');b.id='dinoVerifiedTab';b.className='g';b.textContent='🟦 Comprar verificado';b.onclick=buyVerified;tabs.appendChild(b)}
    if (!$('dinoCoinsPill')) {const p=document.createElement('span');p.id='dinoCoinsPill';p.className='pill';p.style.cssText='font-weight:700;display:inline-flex;align-items:center;justify-content:center;min-width:130px;';p.textContent='🪙 0 monedas';tabs.appendChild(p)}
    refreshCoins();wireFollowCounters();
  }

  window.openDinoGames=gameMenu;window.closeDinoGames=()=>closeModal('dinoGamesModal');window.startDinoTap=startDinoTap;window.tapDino=tapDino;window.finishDinoTap=finishDinoTap;window.startMathGame=startMathGame;window.checkMath=checkMath;window.finishMathGame=finishMathGame;window.startTargetGame=startTargetGame;window.hitTarget=hitTarget;window.finishTargetGame=finishGame;window.stopDinoGame=stopDinoGame;window.buyDinoVerified=buyVerified;window.closeFollowList=closeFollowList;window.showDinoFollowList=showFollowList;
  window.refreshDinoCoins=refreshCoins;
  function boot(){addControls();setInterval(()=>{addControls();wireFollowCounters()},5000);new MutationObserver(()=>{addControls();wireFollowCounters()}).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();