document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('#gallery .grid-item');

  items.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;

    // Caption from data-caption or alt text
    const caption = img.getAttribute('data-caption') || img.alt || '';

    // Build overlay node
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<p>${caption}</p>`;
    item.appendChild(overlay);

    // Mobile/touch: tap to toggle
    item.addEventListener('click', () => {
      // If there are links/buttons later, you might want event delegation instead
      item.classList.toggle('show-overlay');
    });
  });

  // Optional: close others when one is opened (mobile)
  document.addEventListener('click', (e) => {
    const isItem = e.target.closest('#gallery .grid-item');
    document.querySelectorAll('#gallery .grid-item.show-overlay').forEach(openItem => {
      if (openItem !== isItem) openItem.classList.remove('show-overlay');
    });
  });
});
