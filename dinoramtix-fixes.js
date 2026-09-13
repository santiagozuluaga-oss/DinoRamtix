/* DinoRamtix fixes - 2026-09-13 */
(function(){
  const db=window.__dinoDB||window.supabase?.createClient?.(window.DINORAMTIX_CONFIG?.supabaseUrl,window.DINORAMTIX_CONFIG?.supabasePublishableKey);
  const $=id=>document.getElementById(id);
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  if(!db)return;
  async function sessionUser(){return (await db.auth.getSession()).data.session?.user||null}

  // The August 30 code used the wrong shape for getSession(), leaving `me` null
  // after a page refresh. Restore the global lexical variable used by index.html.
  async function restoreSession(){
    const u=await sessionUser();
    if(!u)return;
    me=u;
    if(typeof start==='function')start();
  }

  // Load profile data without PostgREST relationship embedding.
  window.profile=async function(id){
    if(!id)return;
    const r=await db.from('profiles').select('id,username,bio,avatar_url,verified,followers_count,following_count').eq('id',id).maybeSingle();
    if(r.error)return alert(r.error.message);
    if(!r.data)return alert('Este usuario todavía no tiene perfil.');
    const u=r.data;
    ['feed','explore','reels','create','me'].forEach(x=>$(x)?.classList.add('hidden'));
    $('profile')?.classList.remove('hidden');
    const current=await sessionUser();
    let follow='';
    if(current&&current.id!==id){
      const f=await db.from('follows').select('follower_id').eq('follower_id',current.id).eq('following_id',id).maybeSingle();
      if(f.error)return alert(f.error.message);
      follow=`<button class="${f.data?'g':'p'}" onclick="toggleFollow('${id}',${!!f.data})">${f.data?'Siguiendo':'Seguir'}</button>`;
    }
    $('profileBox').innerHTML=`<div class="card"><div class="profile">${u.avatar_url?`<div class="avatar"><img src="${esc(u.avatar_url)}"></div>`:`<div class="avatar">${esc((u.username||'?')[0].toUpperCase())}</div>`}<div class="grow"><h2>${esc(u.username||'Usuario')}${u.verified?' <span class="verified">✓</span>':''}</h2><div class="actions"><button class="pill" onclick="showFollowList('${id}','followers')">${u.followers_count||0} seguidores</button><button class="pill" onclick="showFollowList('${id}','following')">${u.following_count||0} siguiendo</button></div><p>${esc(u.bio||'')}</p>${follow}</div></div></div><h3>Publicaciones</h3><div id="pgrid" class="grid"></div>`;
    const ps=await db.from('posts').select('media_url,media_type').eq('user_id',id).order('created_at',{ascending:false});
    if(ps.error)return alert(ps.error.message);
    $('pgrid').innerHTML=(ps.data||[]).map(p=>p.media_type==='video'?`<video src="${esc(p.media_url)}" controls></video>`:`<img src="${esc(p.media_url)}">`).join('')||'<p>Sin publicaciones.</p>';
  };

  // Publish Story using the real authenticated session instead of the stale `me`.
  window.publishStory=async function(){
    const u=await sessionUser();
    if(!u)return alert('Inicia sesión para publicar');
    const f=$('storyFile')?.files?.[0];
    if(!f)return alert('Selecciona una imagen o video.');
    try{
      if(f.size>50*1024*1024)throw new Error('El archivo debe pesar menos de 50 MB.');
      const ext=(f.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'');
      const path=`${u.id}/story-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const up=await db.storage.from('media').upload(path,f,{contentType:f.type,upsert:false,cacheControl:'31536000'});
      if(up.error)throw up.error;
      const url=db.storage.from('media').getPublicUrl(path).data.publicUrl;
      const r=await db.from('stories').insert({user_id:u.id,media_url:url,media_type:f.type.startsWith('video/')?'video':'image',caption:$('storyCaption').value.trim()});
      if(r.error)throw r.error;
      $('storyFile').value='';$('storyPreview').innerHTML='';$('storyCaption').value='';
      alert('Story publicada por 24 horas');
      if(typeof go==='function')go('feed');
    }catch(e){alert(e.message||String(e))}
  };

  // Stories: fetch story rows and profiles separately, avoiding ambiguous relationships.
  window.stories=async function(){
    const r=await db.from('stories').select('id,user_id,media_url,media_type,caption,created_at,expires_at').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(50);
    if(r.error)return $('stories').innerHTML=`<b>Stories</b><p class="muted">${esc(r.error.message)}</p>`;
    if(!r.data?.length)return $('stories').innerHTML='<b>Stories</b><p class="muted">Todavía no hay stories.</p>';
    const ids=[...new Set(r.data.map(s=>s.user_id).filter(Boolean))];
    const pr=ids.length?await db.from('profiles').select('id,username,avatar_url,verified').in('id',ids):{data:[],error:null};
    if(pr.error)return $('stories').innerHTML=`<b>Stories</b><p class="muted">${esc(pr.error.message)}</p>`;
    const map=new Map((pr.data||[]).map(p=>[p.id,p]));
    const seen=new Set();let html='<b>Stories</b><div class="storybar">';
    for(const s of r.data){
      if(seen.has(s.user_id))continue;seen.add(s.user_id);
      const p=map.get(s.user_id)||{username:'Usuario'};
      html+=`<div class="storyItem" onclick="openStory('${s.user_id}')"><div class="storyRing"><div class="avatar">${p.avatar_url?`<img src="${esc(p.avatar_url)}">`:esc((p.username||'?')[0].toUpperCase())}</div></div><div>${esc(p.username)}</div></div>`;
    }
    html+='</div>';$('stories').innerHTML=html;
  };

  // Fix the session before any user action is used.
  setTimeout(restoreSession,100);
  db.auth.onAuthStateChange((event,session)=>{
    if(session){me=session.user;}
  });
})();
