// DinoRamtix: MiniJuegos, comprar verificado y saldo de monedas visible
(() => {
  const db = window.supabase?.createClient?.(DINORAMTIX_CONFIG.supabaseUrl, DINORAMTIX_CONFIG.supabasePublishableKey);
  const $ = id => document.getElementById(id);

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

  function addControls() {
    const app = $('app');
    const tabs = document.querySelector('#app>.tabs');
    if (!app || !tabs) return;

    if (!$('dinoGamesTab')) {
      const b = document.createElement('button');
      b.id = 'dinoGamesTab';
      b.className = 'g';
      b.textContent = '🎮 MiniJuegos';
      b.onclick = () => {
        if (typeof window.openDinoGames === 'function') window.openDinoGames();
        else if (typeof window.gameMenu === 'function') window.gameMenu();
        else alert('Los MiniJuegos se están cargando. Recarga la página e inténtalo de nuevo.');
      };
      tabs.appendChild(b);
    }

    if (!$('dinoVerifiedTab')) {
      const b = document.createElement('button');
      b.id = 'dinoVerifiedTab';
      b.className = 'g';
      b.textContent = '🟦 Comprar verificado';
      b.onclick = buyVerified;
      tabs.appendChild(b);
    }

    if (!$('dinoCoinsPill')) {
      const p = document.createElement('span');
      p.id = 'dinoCoinsPill';
      p.className = 'pill';
      p.style.cssText = 'font-weight:700;display:inline-flex;align-items:center;justify-content:center;min-width:130px;';
      p.textContent = '🪙 0 monedas';
      const host = document.querySelector('#app>.tabs');
      host?.appendChild(p);
    }
    refreshCoins();
  }

  async function buyVerified() {
    const u = await currentUser();
    if (!u) return alert('Inicia sesión para comprar el verificado.');
    const r = await db.from('profiles').select('coins,verified').eq('id', u.id).maybeSingle();
    const coins = Number(r.data?.coins || 0);
    if (r.data?.verified) return alert('Tu cuenta ya está verificada 🟦✓');
    if (coins < 7000000) return alert(`Necesitas 7.000.000 🪙. Tienes ${coins.toLocaleString('es-CO')} 🪙.`);
    if (!confirm('¿Comprar la insignia de verificado por 7.000.000 🪙?')) return;
    const q = await db.rpc('buy_verified_with_coins');
    if (q.error) return alert(q.error.message);
    await refreshCoins();
    alert('¡Listo! Tu cuenta ahora está verificada 🟦✓');
    if (typeof window.my === 'function') window.my();
  }

  window.refreshDinoCoins = refreshCoins;
  window.buyDinoVerified = buyVerified;

  function boot() {
    addControls();
    refreshCoins();
    setInterval(() => { addControls(); refreshCoins(); }, 8000);
    new MutationObserver(addControls).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
