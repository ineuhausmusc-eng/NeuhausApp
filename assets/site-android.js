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
  
