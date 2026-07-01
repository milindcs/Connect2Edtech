(function () {
  const toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;

  const links = document.querySelector('.nav-links');
  if (!links) return;

  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', String(expanded));
    if (expanded) {
      toggle.removeAttribute('hidden');
      links.classList.add('is-open');
    } else {
      toggle.removeAttribute('hidden');
      links.classList.remove('is-open');
    }
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  const closeOnNavigate = () => setExpanded(false);
  links.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (anchor) closeOnNavigate();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setExpanded(false);
  });

  const mq = window.matchMedia('(min-width: 769px)');
  mq.addEventListener('change', (event) => {
    if (event.matches) setExpanded(false);
  });
})();