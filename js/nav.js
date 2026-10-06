(function () {
  document.querySelectorAll('.nav-hamburger').forEach(function (button) {
    var menu = document.getElementById(button.getAttribute('aria-controls'));
    if (!menu) return;

    function setOpen(open) {
      menu.classList.toggle('open', open);
      button.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    }

    button.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('open')) {
        setOpen(false);
        button.focus();
      }
    });
  });

  var fadeIns = document.querySelectorAll('.fade-in');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduceMotion) {
    fadeIns.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeIns.forEach(function (el) { observer.observe(el); });
})();
