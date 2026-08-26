(function(){
function start(){
  const $=id=>document.getElementById(id);
  document.addEventListener('click',function(e){
    const media=e.target.closest('#feedList .media');
    if(media){
      const btn=media.closest('article')?.querySelector('button[onclick*="like("]');
      const m=btn?.getAttribute('onclick')?.match(/like\('([^']+)'/);
      if(m&&window.renderPostModal){e.preventDefault();e.stopPropagation();window.renderPostModal(m[1]);}
    }
  },true);
  let busy=false;
  const refresh=()=>{
    if(busy||!window.renderReels)return;
    const box=$('reelList');
    if(box && !$('reels')?.classList.contains('hidden') && (!box.querySelector('.reelCard') || box.dataset.enhanced!=='1')){
      busy=true;box.dataset.enhanced='1';window.renderReels().finally(()=>{busy=false});
    }
  };
  const obs=new MutationObserver(()=>setTimeout(refresh,100));
  if(document.body)obs.observe(document.body,{childList:true,subtree:true});
  setInterval(refresh,1200);setTimeout(refresh,600);
  document.addEventListener('click',e=>{
    const story=e.target.closest('.storyItem');
    if(story && window.renderStoryViewer){
      const onclick=story.getAttribute('onclick')||'';const m=onclick.match(/(?:openStory|renderStoryViewer)\('([^']+)'\)/);
      if(m){e.preventDefault();e.stopPropagation();window.renderStoryViewer(m[1]);}
    }
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
