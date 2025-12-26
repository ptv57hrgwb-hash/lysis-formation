/* ============ MENU MOBILE ============ */
(function () {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Ferme le menu quand on clique un lien
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============ HERO : NIVEAUX ============ */
(function () {
  const pills = document.querySelectorAll('.pill');
  const levelText = document.getElementById('levelText');
  const miniLevel = document.getElementById('miniLevel');
  const miniFocus = document.getElementById('miniFocus');
  const miniResult = document.getElementById('miniResult');
  const miniBullets = document.getElementById('miniBullets');

  if (!pills.length || !levelText || !miniLevel || !miniFocus || !miniResult || !miniBullets) return;

  const data = {
    debutant: {
      label: 'Débutant',
      text: "On pose des bases solides et on rend autonome sur Logic Pro 11, avec une méthode simple et efficace.",
      focus: "Autonomie & workflow",
      result: "Un projet propre et clair",
      bullets: [
        "Interface & workflow Logic Pro",
        "Enregistrer / éditer proprement",
        "Structurer un morceau",
        "Exporter sans surprise"
      ]
    },
    intermediaire: {
      label: 'Intermédiaire',
      text: "On structure le mix et la production : équilibre, espace, organisation, automatisations utiles.",
      focus: "Mix & structure",
      result: "Un mix cohérent",
      bullets: [
        "Gain staging & équilibre",
        "Espace (pan / depth)",
        "Automations",
        "Organisation de session"
      ]
    },
    avance: {
      label: 'Avancé / Pro',
      text: "On vise la finition : translation, cohérence, direction artistique et routine de contrôle.",
      focus: "Finition & signature",
      result: "Un rendu pro",
      bullets: [
        "Glue & profondeur",
        "Balance tonale",
        "Translation (tous systèmes)",
        "Pré-master propre"
      ]
    }
  };

  function setLevel(key){
    const d = data[key] || data.debutant;

    pills.forEach(p => p.classList.toggle('is-active', p.dataset.level === key));
    levelText.textContent = d.text;
    miniLevel.textContent = d.label;
    miniFocus.textContent = d.focus;
    miniResult.textContent = d.result;

    miniBullets.innerHTML = '';
    d.bullets.forEach(t => {
      const s = document.createElement('span');
      s.textContent = t;
      miniBullets.appendChild(s);
    });
  }

  pills.forEach(p => p.addEventListener('click', () => setLevel(p.dataset.level)));
  setLevel('debutant');
})();

/* ============ REVEAL AU SCROLL ============ */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-in');
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();

/* ============ CORRECTION #1 : TEXTE UNIQUEMENT SI PHOTO VIDE ============ */
/*
  Fonctionnement :
  - .hero-bg possède data-hero-image="./assets/hero.jpg"
  - On tente de charger cette image.
     - si elle charge : on applique background-image + on cache overlay
     - si elle échoue / absent : overlay affiché (photo "vide")
*/
(function () {
  const heroBg = document.querySelector('.hero-bg');
  const overlay = document.querySelector('.hero-photo-text[data-empty-only="true"]');
  if (!heroBg || !overlay) return;

  const src = heroBg.getAttribute('data-hero-image');

  // Si pas de src => "photo vide"
  if (!src) {
    overlay.classList.add('is-visible');
    return;
  }

  const img = new Image();
  img.onload = () => {
    heroBg.style.backgroundImage = `url("${src}")`;
    overlay.classList.remove('is-visible'); // ✅ overlay OFF si photo OK
  };
  img.onerror = () => {
    overlay.classList.add('is-visible');    // ✅ overlay ON si photo vide / erreur
  };
  img.src = src;
})();

/* ============ Bonus : léger blur au scroll (optionnel, propre) ============ */
(function () {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const blur = Math.min(10, y / 120);         // 0 → 10
      const scale = 1.02 + Math.min(0.04, y / 4000);
      heroBg.style.filter = `saturate(1.05) contrast(1.02) blur(${blur}px)`;
      heroBg.style.transform = `scale(${scale})`;
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
