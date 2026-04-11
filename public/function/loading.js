// Hide loading panel when page is ready
window.addEventListener('load', () => {
  const panel = document.getElementById('loading-panel');
  if (!panel) return;

  // Optional: minimum display time so it doesn't flash too fast
  const MIN_DISPLAY_MS = 1200;
  const startTime = performance.now();

  function hidePanel() {
    const elapsed = performance.now() - startTime;
    const delay = Math.max(0, MIN_DISPLAY_MS - elapsed);

    setTimeout(() => {
      panel.style.transition = 'opacity 0.8s ease';
      panel.style.opacity = '0';

      panel.addEventListener('transitionend', () => {
        panel.style.display = 'none';
      }, { once: true });
    }, delay);
  }

  hidePanel();
});