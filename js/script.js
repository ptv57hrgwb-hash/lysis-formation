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
      navMenu.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.classList.contains("is-open")) return;
      const t = e.target;
      if (!(navMenu.contains(t) || navToggle.contains(t))) closeMenu();
    });

    $$("a", navMenu).forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  }

  // ===== Reveal on scroll (generic)
  const revealEls = $$("[data-reveal]");
  if (revealEls.length) {
    const revealIO = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
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
      helper: "Bases solides + autonomie sur Logic Pro 11, avec une progression claire.",
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
      helper: "Décisions plus rapides, session plus propre, rendu plus cohérent.",
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
      helper: "Finition : translation, cohérence, routine de validation et exports propres.",
      focus: "Finition & validation",
      result: "Un rendu fiable",
      checklist: [
        "Balance tonale & références",
        "Contrôle et validation",
        "Exports (stems / versions)",
        "Routine de fin",
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

    if (heroChecklist) heroChecklist.innerHTML = data.checklist.map((t) => `<li>${t}</li>`).join("");
  };

  levelBtns.forEach((btn) => btn.addEventListener("click", () => setLevel(btn.dataset.level)));
  setLevel("debutant");

  // ===== Method section: Desktop “super” / Mobile “light + tabs”
  const story = $(".sticky-story");
  const media = $(".sticky-story__media");
  const steps = $$("[data-step]", story || document);

  const navItems = $$(".sticky-nav__item", story || document);
  const stickySub = $("#stickySub");

  const mobileTabs = $$(".method-tab", story || document);
  const mobileSub = $("#methodMobileSub");

  const SUBS = [
    "Diagnostic, progression, puis validation : un processus clair, sans dispersion.",
    "Automatismes : stabilité du workflow, cohérence du rendu, décisions plus rapides.",
    "Validation et exports : translation, checklist finale, livrables prêts.",
  ];

  const mmMobile = window.matchMedia("(max-width: 760px)");

  const setProgress = (idx) => {
    const pct = idx <= 0 ? 0 : idx === 1 ? 50 : 100;
    if (story) {
      story.style.setProperty("--progress", `${pct}%`);   // desktop progress (left)
      story.style.setProperty("--mprogress", `${pct}%`);  // mobile progress bar
    }
  };

  const activateDesktopLeft = (idx) => {
    navItems.forEach((it) => it.classList.remove("is-active"));
    const el = navItems.find((x) => Number(x.dataset.left) === idx);
    if (el) el.classList.add("is-active");
    if (stickySub && SUBS[idx]) stickySub.textContent = SUBS[idx];
  };

  const activateMobileTabs = (idx) => {
    mobileTabs.forEach((t) => {
      const active = Number(t.dataset.step) === idx;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (mobileSub && SUBS[idx]) mobileSub.textContent = SUBS[idx];
  };

  const activateStepUI = (idx) => {
    setProgress(idx);
    activateDesktopLeft(idx);
    activateMobileTabs(idx);
  };

  // Click => scroll to panel (both desktop left and mobile tabs)
  const bindScrollButtons = (btns) => {
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetSel = btn.dataset.target;
        const target = targetSel ? $(targetSel) : null;
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };
  bindScrollButtons(navItems);
  bindScrollButtons(mobileTabs);

  if (story && steps.length) {
    // show/hide desktop left panel (only relevant desktop)
    const storyIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== story) continue;
          if (entry.isIntersecting) story.classList.add("is-inview");
          else story.classList.remove("is-inview");
        }
      },
      { threshold: 0.01 }
    );
    storyIO.observe(story);

    let raf = 0;
    let currentIdx = -1;

    const pickActiveStep = () => {
      // Choose the panel whose center is closest to viewport center
      const mid = (window.innerHeight || 1) * 0.52;

      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < steps.length; i++) {
        const r = steps[i].getBoundingClientRect();
        const center = r.top + r.height * 0.5;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      return bestIdx;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        if (!story.classList.contains("is-inview")) return;

        const idx = pickActiveStep();
        if (idx !== currentIdx) {
          currentIdx = idx;

          // Desktop: only one panel visible
          if (!mmMobile.matches) {
            steps.forEach((s, i) => s.classList.toggle("is-visible", i === idx));
          } else {
            // Mobile: all panels visible
            steps.forEach((s) => s.classList.add("is-visible"));
          }

          activateStepUI(idx);
        }

        // Desktop-only blur dynamics (disable on mobile)
        if (media && !mmMobile.matches) {
          const rect = story.getBoundingClientRect();
          const vh = window.innerHeight || 1;
          const start = vh * 0.05;
          const end = vh * 0.95;
          const t = (start - rect.top) / Math.max(1, (rect.height - (end - start)));
          const p = Math.min(1, Math.max(0, t));
          const blur = (1 - p) * 2;
          media.style.setProperty("--blur", `${blur.toFixed(2)}px`);
        } else if (media) {
          media.style.setProperty("--blur", "0px");
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // init
    if (mmMobile.matches) steps.forEach((s) => s.classList.add("is-visible"));
    else steps.forEach((s, i) => s.classList.toggle("is-visible", i === 0));
    activateStepUI(0);
    onScroll();
  }
})();
