document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Swap the placeholder "M" crest for a real logo image, if one is set in Club Info
  fetch('/api/settings').then(r => r.json()).then(settings => {
    if (settings.crest_url) {
      document.querySelectorAll('.crest-mark').forEach(el => {
        el.innerHTML = `<img src="${settings.crest_url}" alt="Club crest" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      });
    }
    const yearEl = document.getElementById('crest-year');
    if (yearEl && settings.founded_year) yearEl.textContent = settings.founded_year;
  }).catch(() => {});
});
