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
    document.querySelectorAll('#profileBox [data-post-id]').forEach(media=>{
      media.style.cursor='pointer';
    });
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