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

  // ===== Sticky story: show left only during section + sync current step (no accumulation)
  const story = $(".sticky-story");
  const media = $(".sticky-story__media");
  const steps = $$("[data-step]", story || document);
  const leftItems = $$(".sticky-left__item", story || document);

  const activateLeft = (idx) => {
    leftItems.forEach((it) => it.classList.remove("is-active"));
    const el = leftItems.find((x) => Number(x.dataset.left) === idx);
    if (el) el.classList.add("is-active");
  };

  if (story && leftItems.length) {
    // Hide/show fixed left depending on section visibility
    const storyIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== story) return;

          if (entry.isIntersecting) {
            story.classList.add("is-inview");
            // Intro visible as soon as we enter the sticky section (and only there)
            activateLeft(0);
          } else {
            story.classList.remove("is-inview");
            // cleanup visible steps to avoid weird state when coming back
            steps.forEach((s) => s.classList.remove("is-visible"));
          }
        });
      },
      { threshold: 0.01 }
    );
    storyIO.observe(story);

    // Step observer: keep only ONE step bubble visible at a time
    if (steps.length) {
      let currentIdx = -1;

      const stepIO = new IntersectionObserver(
        (entries) => {
          // pick the most visible step
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

          if (!visible.length) return;

          const top = visible[0].target;
          const idx = steps.indexOf(top);
          if (idx === -1 || idx === currentIdx) return;

          currentIdx = idx;

          // show only current bubble
          steps.forEach((s) => s.classList.remove("is-visible"));
          steps[idx].classList.add("is-visible");

          // left sync (0 is intro)
          // step0->left1, step1->left2, step2->left3, step3(CTA)->left0
          if (idx === 0) activateLeft(1);
          else if (idx === 1) activateLeft(2);
          else if (idx === 2) activateLeft(3);
          else activateLeft(0);
        },
        {
          threshold: [0.25, 0.45, 0.6, 0.75],
          rootMargin: "-10% 0px -30% 0px",
        }
      );

      steps.forEach((el) => stepIO.observe(el));
    }

    // Optional: subtle blur dynamics on scroll (safe + light)
    if (media) {
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const rect = story.getBoundingClientRect();
          const vh = window.innerHeight || 1;

          // progress inside sticky section
          const start = vh * 0.05;
          const end = vh * 0.95;
          const t = (start - rect.top) / Math.max(1, (rect.height - (end - start)));
          const p = Math.min(1, Math.max(0, t));

          // blur goes from ~2px to 0px
          const blur = (1 - p) * 2;
          media.style.setProperty("--blur", `${blur.toFixed(2)}px`);
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }
})();
