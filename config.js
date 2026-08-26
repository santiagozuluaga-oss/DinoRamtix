window.DINORAMTIX_CONFIG = {
  supabaseUrl: "https://aaoyqpiydwqobbtdmmno.supabase.co",
  supabasePublishableKey: "sb_publishable_5SAEn1z1PEtbGe6mNDjcaA_Kfwz-plG"
};

// DinoRamtix @mentions: turns @username text into clickable profile links.
(function(){
  function linkMentions(root){
    if(!root || root.nodeType!==1) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let n;
    while(n=walker.nextNode()){
      if(n.parentElement && n.parentElement.closest('button,a,input,textarea,script,style')) continue;
      if(/(^|\s)@[a-zA-Z0-9_.]{2,30}\b/.test(n.nodeValue)) nodes.push(n);
    }
    nodes.forEach(node=>{
      const text=node.nodeValue;
      const frag=document.createDocumentFragment();
      let last=0;
      const re=/(^|\s)(@[a-zA-Z0-9_.]{2,30})\b/g;
      let m;
      while((m=re.exec(text))){
        if(m.index>last) frag.appendChild(document.createTextNode(text.slice(last,m.index)));
        if(m[1]) frag.appendChild(document.createTextNode(m[1]));
        const a=document.createElement('a');
        a.href='#';
        a.textContent=m[2];
        a.style.cssText='color:#0095f6;font-weight:700;text-decoration:none;cursor:pointer';
        a.addEventListener('click',async e=>{
          e.preventDefault();
          const username=m[2].slice(1);
          try{
            const db=window.supabase?.createClient?.(window.DINORAMTIX_CONFIG.supabaseUrl,window.DINORAMTIX_CONFIG.supabasePublishableKey);
            if(!db) return;
            const r=await db.from('profiles').select('id').eq('username',username).maybeSingle();
            if(r.data?.id && typeof window.profile==='function') window.profile(r.data.id);
            else alert('No encontramos a @'+username);
          }catch(err){ alert('No se pudo abrir @'+username); }
        });
        frag.appendChild(a);
        last=re.lastIndex;
      }
      if(last<text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag,node);
    });
  }
  function start(){
    linkMentions(document.body);
    new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1) linkMentions(n)}))).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
