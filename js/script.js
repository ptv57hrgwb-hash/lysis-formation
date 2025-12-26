/* Lysis Formation — script.js */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ===== Mobile nav
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");
  if (navToggle && navMenu) {
    const closeMenu = () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    const openMenu = () => {
      navMenu.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
    };

    navToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = navMenu.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.classList.contains("is-open")) return;
      const t = e.target;
      const clickedInside = navMenu.contains(t) || navToggle.contains(t);
      if (!clickedInside) closeMenu();
    });

    $$("a", navMenu).forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // ===== Reveal on scroll (generic)
  const revealEls = $$("[data-reveal]");
  if (revealEls.length) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealIO.observe(el));
  }

  // ===== Level picker
  const levelHelper = $("#levelHelper");
  const metricLevel = $("#metricLevel");
  const metricFocus = $("#metricFocus");
  const metricResult = $("#metricResult");
  const heroChecklist = $("#heroChecklist");
  const levelBtns = $$(".seg-btn");

  const LEVELS = {
    debutant: {
      label: "Débutant",
      helper: "Bases solides + autonomie sur Logic Pro 11, avec une méthode simple et efficace.",
      focus: "Autonomie & workflow",
      result: "Un projet propre et clair",
      checklist: [
        "Interface & workflow Logic Pro",
        "Enregistrer / éditer proprement",
        "Structurer un morceau",
        "Exporter sans surprise",
      ],
    },
    intermediaire: {
      label: "Intermédiaire",
      helper: "Structurer la production et le mix : décisions plus rapides, rendu plus cohérent.",
      focus: "Équilibre & espace",
      result: "Un mix lisible et stable",
      checklist: [
        "Gain staging & équilibre",
        "Pan / profondeur",
        "Automation utile",
        "Organisation de session",
      ],
    },
    avance: {
      label: "Avancé / Pro",
      helper: "Cap finition : translation, cohérence, routine de validation et signature.",
      focus: "Finition & translation",
      result: "Un rendu qui tient partout",
      checklist: [
        "Balance tonale & références",
        "Glue / profondeur",
        "Contrôle et validation",
        "Pré-master propre",
      ],
    },
  };

  const setLevel = (key) => {
    const data = LEVELS[key];
    if (!data) return;

    levelBtns.forEach((b) => {
      const active = b.dataset.level === key;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (levelHelper) levelHelper.textContent = data.helper;
    if (metricLevel) metricLevel.textContent = data.label;
    if (metricFocus) metricFocus.textContent = data.focus;
    if (metricResult) metricResult.textContent = data.result;

    if (heroChecklist) {
      heroChecklist.innerHTML = data.checklist.map((t) => `<li>${t}</li>`).join("");
    }
  };

  levelBtns.forEach((btn) => {
    btn.addEventListener("click", () => setLevel(btn.dataset.level));
  });

  // ===== Sticky story (refonte claire : sommaire + chapitres)
  const story = $(".sticky-story");
  const media = $(".sticky-story__media");
  const steps = $$("[data-step]", story || document);

  const navItems = $$(".sticky-nav__item", story || document);
  const stickySub = $("#stickySub");

  const SUBS = [
    "On clarifie ton objectif et on trace un plan simple (priorités, ordre, routine).",
    "On installe des automatismes : workflow, équilibre, espace, décisions plus rapides.",
    "On valide le rendu partout : routine de contrôle, exports propres, checklist de fin.",
  ];

  const setProgress = (idx) => {
    // 3 étapes => 0%, 50%, 100%
    const pct = idx <= 0 ? 0 : idx === 1 ? 50 : 100;
    if (story) story.style.setProperty("--progress", `${pct}%`);
  };

  const activateLeft = (idx) => {
    navItems.forEach((it) => it.classList.remove("is-active"));
    const el = navItems.find((x) => Number(x.dataset.left) === idx);
    if (el) el.classList.add("is-active");

    if (stickySub && SUBS[idx]) stickySub.textContent = SUBS[idx];
    setProgress(idx);
  };

  if (story) {
    // Show/hide left panel only when story is in view
    const storyIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== story) return;

          if (entry.isIntersecting) {
            story.classList.add("is-inview");
            activateLeft(0);
            steps.forEach((s, i) => s.classList.toggle("is-visible", i === 0));
          } else {
            story.classList.remove("is-inview");
            steps.forEach((s) => s.classList.remove("is-visible"));
          }
        });
      },
      { threshold: 0.02 }
    );
    storyIO.observe(story);

    // Keep only ONE chapter visible at a time
    if (steps.length) {
      let currentIdx = -1;

      const stepIO = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

          if (!visible.length) return;

          const top = visible[0].target;
          const idx = steps.indexOf(top);
          if (idx === -1 || idx === currentIdx) return;

          currentIdx = idx;

          steps.forEach((s, i) => s.classList.toggle("is-visible", i === idx));
          activateLeft(idx);
        },
        {
          threshold: [0.25, 0.45, 0.6, 0.75],
          rootMargin: "-10% 0px -30% 0px",
        }
      );

      steps.forEach((el) => stepIO.observe(el));
    }

    // Click on left summary => scroll to chapter
    navItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetSel = btn.dataset.target;
        const target = targetSel ? $(targetSel) : null;
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    // Subtle blur dynamics
    if (media) {
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const rect = story.getBoundingClientRect();
          const vh = window.innerHeight || 1;

          const start = vh * 0.05;
          const end = vh * 0.95;
          const t = (start - rect.top) / Math.max(1, (rect.height - (end - start)));
          const p = Math.min(1, Math.max(0, t));

          const blur = (1 - p) * 2;
          media.style.setProperty("--blur", `${blur.toFixed(2)}px`);
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  // ===== Default level (safe)
  setLevel("debutant");
})();
