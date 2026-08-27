// DinoRamtix PWA install button
(() => {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const button = document.getElementById('installAppButton');
    if (button) button.remove();
  });

  function showInstallButton() {
    if (document.getElementById('installAppButton') || window.matchMedia('(display-mode: standalone)').matches) return;
    const button = document.createElement('button');
    button.id = 'installAppButton';
    button.type = 'button';
    button.textContent = '📱 Instalar DinoRamtix';
    button.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:9999;border:0;border-radius:999px;padding:13px 18px;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.25);background:#0095f6;color:#fff;';
    button.addEventListener('click', async () => {
      if (!deferredPrompt) {
        alert('Para instalar DinoRamtix, abre el menú del navegador y elige “Instalar aplicación” o “Añadir a pantalla de inicio”.');
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      button.remove();
    });
    document.body.appendChild(button);
  }

  document.addEventListener('DOMContentLoaded', showInstallButton);
})();
