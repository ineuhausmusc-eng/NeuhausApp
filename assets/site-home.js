    const menuButton = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('#mobile-menu');
    function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); mobileMenu.hidden = true; }
    menuButton.addEventListener('click', () => {
      const opening = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(opening));
      menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
      mobileMenu.hidden = !opening;
    });
    mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    const search = document.querySelector('#app-search');
    const cards = [...document.querySelectorAll('[data-app]')];
    const count = document.querySelector('#app-count');
    const empty = document.querySelector('#empty-results');
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const searchable = [card.querySelector('h3')?.textContent, card.querySelector('p')?.textContent].join(' ').toLocaleLowerCase();
        const match = searchable.includes(query);
        card.hidden = !match;
        if (match) visible++;
      });
      count.textContent = '(' + visible + ')';
      empty.hidden = visible !== 0;
    });
    document.querySelectorAll('[data-focus-search]').forEach(link => link.addEventListener('click', () => {
      setTimeout(() => search.focus({ preventScroll: true }), 350);
    }));
  
