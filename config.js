window.DINORAMTIX_CONFIG = {
  supabaseUrl: "https://aaoyqpiydwqobbtdmmno.supabase.co",
  supabasePublishableKey: "sb_publishable_5SAEn1z1PEtbGe6mNDjcaA_Kfwz-plG"
};

// DinoRamtix @mentions: turns @username text into clickable profile links.
(function(){
  function linkMentions(root){
    if(!root || root.nodeType!==1) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[]; let n;
    while(n=walker.nextNode()){
      if(n.parentElement && n.parentElement.closest('button,a,input,textarea,script,style')) continue;
      if(/(^|\s)@[a-zA-Z0-9_.]{2,30}\b/.test(n.nodeValue)) nodes.push(n);
    }
    nodes.forEach(node=>{
      const text=node.nodeValue, frag=document.createDocumentFragment(); let last=0, m;
      const re=/(^|\s)(@[a-zA-Z0-9_.]{2,30})\b/g;
      while((m=re.exec(text))){
        if(m.index>last) frag.appendChild(document.createTextNode(text.slice(last,m.index)));
        if(m[1]) frag.appendChild(document.createTextNode(m[1]));
        const a=document.createElement('a'); a.href='#'; a.textContent=m[2];
        a.style.cssText='color:#0095f6;font-weight:700;text-decoration:none;cursor:pointer';
        const username=m[2].slice(1);
        a.addEventListener('click',async e=>{e.preventDefault();try{const db=window.supabase?.createClient?.(window.DINORAMTIX_CONFIG.supabaseUrl,window.DINORAMTIX_CONFIG.supabasePublishableKey);if(!db)return;const r=await db.from('profiles').select('id').eq('username',username).maybeSingle();if(r.data?.id&&typeof window.profile==='function')window.profile(r.data.id);else alert('No encontramos a @'+username);}catch(err){alert('No se pudo abrir @'+username);}});
        frag.appendChild(a); last=re.lastIndex;
      }
      if(last<text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag,node);
    });
  }
  function start(){linkMentions(document.body);new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)linkMentions(n)}))).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

  function installProfilePhotoEditor(){
    if(typeof window.editProfile!=='function' || typeof window.saveProfile!=='function' || !window.db || !window.me) return false;
    const originalMy=window.my;
    window.editProfile=async function(){
      const {data:u,error}=await window.db.from('profiles').select('*').eq('id',window.me.id).single();
      if(error)return alert(error.message);
      $('meBox').innerHTML=`<div class="card"><h2>Editar perfil</h2><div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">${window.av(u)}<div><b>Foto de perfil</b><div class="muted">Elige una imagen desde tu dispositivo.</div></div></div><input id="avatarFile" type="file" accept="image/png,image/jpeg,image/webp" onchange="previewAvatar(this)"><div id="avatarPreview" style="margin:10px 0"></div><label>Nombre de usuario</label><input id="eu" value="${window.esc(u.username)}"><label>Biografía</label><textarea id="eb">${window.esc(u.bio||'')}</textarea><button class="p" onclick="saveProfile()">Guardar cambios</button><button class="g" onclick="my()">Cancelar</button></div>`;
    };
    window.previewAvatar=function(input){const file=input.files?.[0];if(!file)return;if(file.size>8*1024*1024)return alert('La imagen debe pesar menos de 8 MB.');const reader=new FileReader();reader.onload=e=>{const img=new Image();img.onload=()=>{const max=256,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/jpeg',.82);window._pendingAvatar=data;$('avatarPreview').innerHTML=`<div class="avatar" style="width:90px;height:90px"><img src="${data}"></div>`;};img.src=e.target.result;};reader.readAsDataURL(file)};
    window.saveProfile=async function(){const username=$('eu').value.trim(),bio=$('eb').value.trim();if(!username)return alert('Escribe un nombre de usuario.');const patch={username,bio};if(window._pendingAvatar)patch.avatar_url=window._pendingAvatar;const r=await window.db.from('profiles').update(patch).eq('id',window.me.id);if(r.error)return alert(r.error.message);window._pendingAvatar=null;await originalMy()};
    return true;
  }
  let tries=0;const timer=setInterval(()=>{if(installProfilePhotoEditor()||++tries>20)clearInterval(timer)},500);

  // Load the social feature layer after the main app has loaded.
  function loadSocialFeatures(){if(document.getElementById('dinoSocialFeatures'))return;const s=document.createElement('script');s.id='dinoSocialFeatures';s.src='./social-features.js?v=2';s.defer=true;document.head.appendChild(s)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadSocialFeatures);else loadSocialFeatures();
})();
