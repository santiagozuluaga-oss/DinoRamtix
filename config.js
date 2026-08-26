window.DINORAMTIX_CONFIG = {
  supabaseUrl: "https://aaoyqpiydwqobbtdmmno.supabase.co",
  supabasePublishableKey: "sb_publishable_5SAEn1z1PEtbGe6mNDjcaA_Kfwz-plG"
};

(function(){
  function linkMentions(root){if(!root||root.nodeType!==1)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let n;while(n=w.nextNode()){if(n.parentElement&&n.parentElement.closest('button,a,input,textarea,script,style'))continue;if(/(^|\s)@[a-zA-Z0-9_.]{2,30}\b/.test(n.nodeValue))nodes.push(n)}nodes.forEach(node=>{const text=node.nodeValue,frag=document.createDocumentFragment();let last=0,m;const re=/(^|\s)(@[a-zA-Z0-9_.]{2,30})\b/g;while((m=re.exec(text))){if(m.index>last)frag.appendChild(document.createTextNode(text.slice(last,m.index)));if(m[1])frag.appendChild(document.createTextNode(m[1]));const a=document.createElement('a');a.href='#';a.textContent=m[2];a.style.cssText='color:#0095f6;font-weight:700;text-decoration:none;cursor:pointer';const username=m[2].slice(1);a.onclick=async e=>{e.preventDefault();try{const db=window.supabase?.createClient?.(window.DINORAMTIX_CONFIG.supabaseUrl,window.DINORAMTIX_CONFIG.supabasePublishableKey);const r=await db?.from('profiles').select('id').eq('username',username).maybeSingle();if(r?.data?.id&&typeof window.profile==='function')window.profile(r.data.id);else alert('No encontramos a @'+username)}catch(err){alert('No se pudo abrir @'+username)}};frag.appendChild(a);last=re.lastIndex}if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));node.parentNode.replaceChild(frag,node)})}
  function start(){linkMentions(document.body);new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)linkMentions(n)}))).observe(document.body,{childList:true,subtree:true})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

(function(){
  const esc=x=>String(x??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  let adminDb=null,installed=false;const $=id=>document.getElementById(id);
  async function install(){
    if(installed||!window.supabase)return false;
    adminDb=window.supabase.createClient(DINORAMTIX_CONFIG.supabaseUrl,DINORAMTIX_CONFIG.supabasePublishableKey);
    const {data:{session}}=await adminDb.auth.getSession();if(!session?.user)return false;
    const {data:me,error}=await adminDb.from('profiles').select('id,username,is_admin').eq('id',session.user.id).maybeSingle();
    if(error||!me?.is_admin)return true;
    const tabs=document.querySelector('#app>.tabs');if(!tabs)return false;
    if(!$('adminVerifyTab')){const b=document.createElement('button');b.id='adminVerifyTab';b.className='g';b.textContent='🛡️ Verificar usuarios';b.onclick=openAdmin;tabs.appendChild(b)}
    if(!$('adminVerify')){const sec=document.createElement('section');sec.id='adminVerify';sec.className='hidden';sec.innerHTML='<div class="card"><h2>🛡️ Verificar usuarios</h2><p class="muted">Selecciona una cuenta para darle o quitarle el verificado.</p><input id="verifySearch" placeholder="Buscar usuario..." oninput="loadVerifyUsers()"><div id="verifyUsers"><p class="muted">Cargando usuarios...</p></div></div>';document.querySelector('#app').appendChild(sec)}
    installed=true;return true;
  }
  async function loadVerifyUsers(){if(!adminDb||!$('verifyUsers'))return;const q=($('verifySearch')?.value||'').trim();let req=adminDb.from('profiles').select('id,username,avatar_url,followers_count,verified').order('username').limit(100);if(q)req=req.ilike('username','%'+q+'%');const {data,error}=await req;if(error){$('verifyUsers').innerHTML='<p>'+esc(error.message)+'</p>';return}$('verifyUsers').innerHTML=(data||[]).map(u=>`<div class="card row" style="margin:8px 0">${u.avatar_url?`<img src="${esc(u.avatar_url)}" style="width:48px;height:48px;border-radius:50%;object-fit:cover">`:`<div class="avatar">${esc((u.username||'?')[0].toUpperCase())}</div>`}<div class="grow"><b>@${esc(u.username)}</b><div class="muted">${u.followers_count||0} seguidores</div></div><span>${u.verified?'🟦 Verificado':'Sin verificar'}</span><button class="${u.verified?'g':'p'}" onclick="setVerified('${u.id}',${!u.verified})">${u.verified?'Quitar verificado':'✓ Verificar'}</button></div>`).join('')||'<p class="muted">No hay usuarios.</p>'}
  async function setVerified(id,value){if(!adminDb)return;const {error}=await adminDb.rpc('admin_set_verified',{target_user:id,new_value:value});if(error){alert(error.message);return}await loadVerifyUsers()}
  function openAdmin(){['feed','explore','reels','create','me','profile','chat'].forEach(x=>$(x)?.classList.add('hidden'));$('adminVerify')?.classList.remove('hidden');loadVerifyUsers()}
  window.loadVerifyUsers=loadVerifyUsers;window.setVerified=setVerified;window.openAdmin=openAdmin;
  let tries=0;const timer=setInterval(async()=>{const ok=await install();if(ok||++tries>40)clearInterval(timer)},500)
})();