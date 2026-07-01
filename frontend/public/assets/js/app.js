(function () {
  const links = Array.from(document.querySelectorAll('[data-nav]'));
  const current = window.location.pathname.split('/').pop() || 'index.html';

  // Highlight active nav link
  for (const a of links) {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href && (href === current || (current === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  }

  // Example: simple form submit handling
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks! Message prepared (demo).');
      contactForm.reset();
    });
  }
})();

