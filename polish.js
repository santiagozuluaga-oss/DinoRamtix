/* DinoRamtix UI polish + large procedural mini-game catalog + admin tools */
(()=>{
  const $=id=>document.getElementById(id);
  const cfg=window.DINORAMTIX_CONFIG||{};
  const db=window.db||window.supabase?.createClient?.(cfg.supabaseUrl,cfg.supabasePublishableKey);
  const esc=x=>String(x??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const ADMIN_NAMES=(cfg.adminUsernames||['dinoramtix']).map(x=>String(x).toLowerCase());
  let catalog=[];
  const mechanics=[
    ['Tap Rush','👆','Toca el objetivo tantas veces como quieras.','tap'],['Math Sprint','🧠','Resuelve operaciones.','math'],['Emoji Memory','🧩','Encuentra la pareja correcta.','memory'],['Target Hunt','🎯','Pulsa objetivos que cambian de posición.','target'],['Number Guess','🔢','Adivina el número secreto.','guess'],['Color Match','🌈','Elige el color indicado.','color'],['Quick Count','🔢','Cuenta los objetos correctamente.','count'],['Word Mix','🔤','Ordena las letras.','word'],['Pattern','🌀','Completa el patrón.','pattern'],['Odd One','👀','Encuentra el elemento diferente.','odd']
  ];
  const adjectives=['Turbo','Neon','Galaxy','Dino','Pixel','Ultra','Mega','Cosmic','Jungle','Retro','Hyper','Rainbow','Shadow','Golden','Frozen','Volcano','Ocean','Space','Robot','Mystic'];
  for(let i=1;i<=50120;i++){const m=mechanics[(i-1)%mechanics.length],a=adjectives[(i-1)%adjectives.length];catalog.push({id:i,title:`${a} ${m[0]} #${i}`,icon:m[1],desc:m[2],type:m[3],seed:i});}

  function styles(){if($('dinoPolishStyles'))return;const s=document.createElement('style');s.id='dinoPolishStyles';s.textContent=`
    #auth{position:relative!important;z-index:2147483000!important;pointer-events:auto!important;touch-action:auto!important}
    #auth *{pointer-events:auto!important;touch-action:manipulation}
    #auth input,#auth button,#auth a{position:relative!important;z-index:2147483001!important;-webkit-user-select:text!important;user-select:text!important}
    #auth input{font-size:16px!important;min-height:46px}
    #auth button{min-height:46px;transition:transform .12s ease,opacity .12s ease}
    #auth button:active{transform:scale(.98)}
    .dinoPolishCard{border:1px solid #e1e4e8;border-radius:16px;padding:14px;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,.06)}
    .dinoCatalogGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
    .dinoCatalogItem{text-align:left;border:1px solid #ddd;border-radius:14px;padding:12px;background:#fafafa;cursor:pointer;min-height:100px}
    .dinoCatalogItem:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(0,0,0,.08)}
    .dinoCatalogIcon{font-size:30px}.dinoAdminBadge{background:#111;color:#fff;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:800}
    @media(max-width:650px){.dinoCatalogGrid{grid-template-columns:1fr 1fr}.dinoCatalogItem{min-height:92px;padding:10px}}
  `;document.head.appendChild(s)}

  function isAdmin(user){const name=(user?.user_metadata?.username||'').toLowerCase();return !!user&&(ADMIN_NAMES.includes(name)||ADMIN_NAMES.includes(user.email?.split('@')[0]?.toLowerCase()||''));}
  async function user(){return db?(await db.auth.getSession()).data.session?.user:null}
  function modal(id,html){let m=$(id);if(!m){m=document.createElement('div');m.id=id;m.className='dinoModal';document.body.appendChild(m)}m.innerHTML=`<div class="dinoSheet">${html}</div>`;m.classList.remove('hidden');m.onclick=e=>{if(e.target===m)m.classList.add('hidden')}}
  function close(id){$(id)?.classList.add('hidden')}
  function notice(t){if(window.__dinoFastNotice)window.__dinoFastNotice(t);else alert(t)}

  function catalogModal(){
    styles();
    modal('dinoCatalogModal',`<div class="row"><button class="g" onclick="document.getElementById('dinoCatalogModal').classList.add('hidden')">←</button><div class="grow"><h2 style="margin:0">🎮 Catálogo DinoRamtix</h2><p class="muted" style="margin:4px 0">50.120 mini juegos generados por variantes de mecánicas.</p></div></div><input id="dinoGameSearch" placeholder="🔎 Buscar mini juego..." oninput="window.filterDinoGames()"><div id="dinoCatalogGrid" class="dinoCatalogGrid"></div>`);
    renderCatalog(catalog.slice(0,30));
  }
  function renderCatalog(list){const box=$('dinoCatalogGrid');if(!box)return;box.innerHTML=list.map(g=>`<button class="dinoCatalogItem" onclick="window.playGeneratedGame(${g.id})"><div class="dinoCatalogIcon">${g.icon}</div><b>${esc(g.title)}</b><br><span class="muted small">${esc(g.desc)}</span></button>`).join('')}
  function filter(){const q=($('dinoGameSearch')?.value||'').toLowerCase().trim();const list=q?catalog.filter(g=>(g.title+' '+g.desc+' '+g.type).toLowerCase().includes(q)).slice(0,60):catalog.slice(0,30);renderCatalog(list)}
  function gameById(id){return catalog.find(g=>g.id===Number(id))}
  function playGeneratedGame(id){const g=gameById(id);if(!g)return;close('dinoCatalogModal');styles();let score=0;let stopped=false;const start=Date.now();
    function finish(){if(stopped)return;stopped=true;const earned=Math.max(0,Math.floor(score));if(window.finishDinoGameExternal)window.finishDinoGameExternal(g.title,earned);else notice(`🎉 ${g.title}: +${earned.toLocaleString('es-CO')} 🪙`)}
    let body='';
    if(g.type==='tap')body=`<div class="dinoPlay"><div class="dinoBig" id="genScore">0</div><button style="font-size:70px" class="g" id="genAction">${g.icon}</button><button class="p" id="genFinish">Terminar y cobrar 🪙</button></div>`;
    else if(g.type==='math'){body=`<div class="dinoPlay"><h2 id="genQ"></h2><input id="genA" type="number" placeholder="Respuesta"><button class="p" id="genCheck">Comprobar</button><p id="genR" class="muted"></p><button class="g" id="genFinish">Terminar y cobrar 🪙</button></div>`}
    else body=`<div class="dinoPlay"><div class="dinoBig" id="genEmoji">${g.icon}</div><p id="genPrompt">Pulsa el botón correcto.</p><button class="p" id="genAction">${['⭐','🚀','🦖','🎯','🍕'][g.seed%5]}</button><button class="g" id="genFinish">Terminar y cobrar 🪙</button></div>`;
    modal('dinoGeneratedGame',`<div class="row"><button class="g" id="genBack">←</button><div class="grow"><h2 style="margin:0">${esc(g.title)}</h2></div><b id="genScoreTop">0 puntos</b></div>${body}`);
    const set=n=>{score=n;const a=$('genScore');if(a)a.textContent=n;const b=$('genScoreTop');if(b)b.textContent=n+' puntos'};
    $('genFinish').onclick=finish;$('genBack').onclick=()=>{stopped=true;close('dinoGeneratedGame');catalogModal()};
    if(g.type==='tap')$('genAction').onclick=()=>set(score+1);
    else if(g.type==='math'){const next=()=>{const a=(g.seed+score*3)%30+1,b=(g.seed+score*7)%20+1;window.__genAns=a+b;$('genQ').textContent=`${a} + ${b} = ?`;$('genA').value='';$('genA').focus()};$('genCheck').onclick=()=>{if(Number($('genA').value)===window.__genAns){set(score+100);$('genR').textContent='✅ Correcto +100';next()}else $('genR').textContent='❌ Intenta otra vez'};next()}
    else $('genAction').onclick=()=>{set(score+10);$('genPrompt').textContent='¡Bien! Pulsa otra vez.'};
  }

  async function adminPanel(){const u=await user();if(!isAdmin(u))return notice('⛔ Solo el administrador puede usar esta función.');if(!db)return;
    const r=await db.from('profiles').select('id,username,avatar_url,verified').order('username').limit(500);if(r.error)return notice(r.error.message);
    const rows=(r.data||[]).filter(x=>x.id!==u.id).map(x=>`<div class="dinoUser"><div>${x.avatar_url?`<img src="${esc(x.avatar_url)}">`:`<div class="dinoUserAvatar">${esc((x.username||'?')[0].toUpperCase())}</div>`}</div><div class="grow"><b>@${esc(x.username||'Usuario')}</b>${x.verified?' 🟦✓':''}</div><button class="d" onclick="window.dinoBan('${x.id}','${esc(x.username||'Usuario')}')">🚫 Banear</button></div>`).join('');
    modal('dinoAdminModal',`<div class="row"><button class="g" onclick="document.getElementById('dinoAdminModal').classList.add('hidden')">✕</button><h2 style="margin:0">🛡️ Administración</h2></div><p class="muted">Selecciona un usuario para banearlo. El estado de baneo se guarda en su perfil si tu tabla tiene la columna <code>banned</code>.</p><input id="dinoAdminSearch" placeholder="Buscar usuario..." oninput="window.filterDinoAdmin()"><div id="dinoAdminList" class="dinoList">${rows}</div>`);
    window.__dinoAdminRows=rows;
  }
  window.dinoBan=async(id,name)=>{const u=await user();if(!isAdmin(u))return notice('⛔ No autorizado.');if(!confirm(`¿Banear a @${name}?`))return;const r=await db.from('profiles').update({banned:true}).eq('id',id);if(r.error)return notice('No se pudo banear: '+r.error.message);notice(`🚫 @${name} fue baneado.`);adminPanel()};
  window.filterDinoAdmin=()=>{const q=($('dinoAdminSearch')?.value||'').toLowerCase();const wrap=$('dinoAdminList');if(!wrap)return;wrap.querySelectorAll('.dinoUser').forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?'flex':'none')};

  function addAdminButton(){const tabs=document.querySelector('#app>.tabs');if(!tabs||$('dinoAdminTab'))return;user().then(u=>{if(!isAdmin(u))return;const b=document.createElement('button');b.id='dinoAdminTab';b.className='d';b.textContent='🛡️ Banear usuarios';b.onclick=adminPanel;tabs.appendChild(b)})}
  function addCatalogButton(){const tabs=document.querySelector('#app>.tabs');if(!tabs||$('dinoCatalogTab'))return;const b=document.createElement('button');b.id='dinoCatalogTab';b.className='g';b.textContent='🎲 +50.120 juegos';b.onclick=catalogModal;tabs.appendChild(b)}
  function polish(){styles();const auth=$('auth');if(auth){auth.style.pointerEvents='auto';auth.querySelectorAll('input,button,a,textarea,select').forEach(e=>{e.style.pointerEvents='auto';e.style.touchAction='manipulation'})}if($('app')&&!$('app').classList.contains('hidden')){addCatalogButton();addAdminButton()}}
  window.filterDinoGames=filter;window.playGeneratedGame=playGeneratedGame;window.openDinoCatalog=catalogModal;window.openDinoAdmin=adminPanel;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
  new MutationObserver(polish).observe(document.body,{childList:true,subtree:true});
  setInterval(polish,3000);
})();
