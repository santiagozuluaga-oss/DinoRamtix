/* DinoRamtix social interactions for feed, profile posts, reels and stories */
(function(){
  const $=id=>document.getElementById(id);
  async function profileUserId(){
    const box=$('profileBox'); if(!box)return null;
    const follow=[...box.querySelectorAll('button')].find(b=>/seguir|siguiendo/i.test(b.textContent||''));
    const m=(follow?.getAttribute('onclick')||'').match(/toggleFollow\(['\"]([^'\"]+)/);
    if(m)return m[1];
    const p=box.querySelector('[data-user-id]'); if(p)return p.dataset.userId;
    return null;
  }
  async function bindProfilePosts(){
    const box=$('profileBox'); if(!box)return;
    const uid=await profileUserId(); if(!uid)return;
    const db=window.db||window.supabase?.createClient?.(window.DINORAMTIX_CONFIG?.supabaseUrl,window.DINORAMTIX_CONFIG?.supabasePublishableKey);
    if(!db)return;
    const r=await db.from('posts').select('id,user_id,media_url,media_type').eq('user_id',uid).order('created_at',{ascending:false});
    if(r.error)return;
    const byUrl=new Map((r.data||[]).map(p=>[p.media_url,p.id]));
    box.querySelectorAll('img,video').forEach(media=>{
      if(media.closest('.avatar,.profileAvatar,.storyItem'))return;
      const src=media.currentSrc||media.src||media.getAttribute('src');
      const id=byUrl.get(src);
      if(!id)return;
      media.dataset.postId=id;
      media.style.cursor='pointer';
      media.title='Abrir publicación';
      if(!media.dataset.socialBound){
        media.dataset.socialBound='1';
        media.addEventListener('click',e=>{
          e.preventDefault();e.stopPropagation();
          if(window.renderPostModal)window.renderPostModal(media.dataset.postId);
        },true);
      }
      const card=media.closest('article,.post,.card,div');
      if(card && !card.dataset.postInteractive){
        card.dataset.postInteractive='1';
        card.style.cursor='pointer';
      }
    });
  }
  function start(){
    const run=()=>setTimeout(bindProfilePosts,100);
    document.addEventListener('click',e=>{
      if(e.target.closest('#profileBox'))run();
    },true);
    new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
    run();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
