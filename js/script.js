/* Lysis Formation — script.js (Safari Mac: click 1/2/3 shows steps immediately) */
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

  // ===== Reveal on scroll
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
      checklist: ["Gain staging & équilibre", "Pan / profondeur", "Automation utile", "Organisation de session"],
    },
    avance: {
      label: "Avancé / Pro",
      helper: "Finition : translation, cohérence, routine de validation et exports propres.",
      focus: "Finition & validation",
      result: "Un rendu fiable",
      checklist: ["Balance tonale & références", "Contrôle et validation", "Exports (stems / versions)", "Routine de fin"],
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

  // ===== Méthode (sticky) — clicks + scroll sync
  const story = $(".sticky-story");
  const media = $(".sticky-story__media");
  const steps = $$("[data-step]", story || document);

  const header = $("#siteHeader");
  const methodMobile = $("#methodMobile");
  const mmMobile = window.matchMedia("(max-width: 760px)");

  // Desktop buttons 1/2/3 (new layout)
  const navItems = $$(".sticky-nav__item", story || document);
  const stickySub = $("#stickySub");

  // Mobile tabs
  const mobileTabs = $$(".method-tab", story || document);
  const mobileSub = $("#methodMobileSub");

  const SUBS = [
    "Diagnostic, progression, puis validation : un processus clair, sans dispersion.",
    "Automatismes : stabilité du workflow, cohérence du rendu, décisions plus rapides.",
    "Validation et exports : translation, checklist finale, livrables prêts.",
  ];

  // If your HTML is still the older version, you can also add buttons with data-step-jump="0|1|2"
  const compatJumpBtns = $$("[data-step-jump]", story || document);

  const setProgress = (idx) => {
    const pct = idx <= 0 ? 0 : idx === 1 ? 50 : 100;
    if (story) {
      story.style.setProperty("--progress", `${pct}%`);
      story.style.setProperty("--mprogress", `${pct}%`);
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

  const getScrollOffset = () => {
    const h = header ? Math.round(header.getBoundingClientRect().height) : 0;
    const m = mmMobile.matches && methodMobile ? Math.round(methodMobile.getBoundingClientRect().height) : 0;
    return h + m + 14;
  };

  const scrollToEl = (el) => {
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - getScrollOffset();
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, y), behavior: smooth ? "smooth" : "auto" });
  };

  let currentIdx = 0;

  const setPanelsVisibility = (idx) => {
    if (!steps.length) return;
    if (!mmMobile.matches) {
      steps.forEach((s, i) => s.classList.toggle("is-visible", i === idx));
    } else {
      steps.forEach((s) => s.classList.add("is-visible"));
    }
  };

  // ===== IMPORTANT FIX:
  // After clicking 1/2/3, prevent scroll-sync from overriding the chosen step until scroll finishes.
  let lockUntil = 0;
  const lockFor = (ms = 900) => {
    lockUntil = (window.performance?.now?.() || Date.now()) + ms;
  };
  const isLocked = () => {
    const now = window.performance?.now?.() || Date.now();
    return now < lockUntil;
  };

  const goToStep = (idx) => {
    idx = Math.max(0, Math.min(steps.length - 1, idx));
    currentIdx = idx;

    // Show immediately
    setPanelsVisibility(idx);
    activateStepUI(idx);

    // Ensure left is visible instantly (no need to wait for next scroll tick)
    if (story) story.classList.add("is-inview");

    // Lock sync for a moment so user sees the change right away
    lockFor(950);

    // Scroll with offset (Safari friendly) + one extra nudge
    requestAnimationFrame(() => {
      scrollToEl(steps[idx]);
      setTimeout(() => scrollToEl(steps[idx]), 60);
    });
  };

  // Desktop nav 1/2/3: map index directly via data-left
  if (navItems.length) {
    navItems.forEach((btn) => {
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = Number(btn.dataset.left);
        if (!Number.isFinite(idx)) return;
        goToStep(idx);
      };
      btn.addEventListener("click", handler);
      btn.addEventListener("pointerup", handler);
    });
  }

  // Mobile tabs: map index via data-step
  if (mobileTabs.length) {
    mobileTabs.forEach((btn) => {
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = Number(btn.dataset.step);
        if (!Number.isFinite(idx)) return;
        goToStep(idx);
      };
      btn.addEventListener("click", handler);
      btn.addEventListener("pointerup", handler);
    });
  }

  // Compatibility: any element with data-step-jump="0|1|2"
  if (compatJumpBtns.length) {
    compatJumpBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const idx = Number(btn.dataset.stepJump);
        if (!Number.isFinite(idx)) return;
        goToStep(idx);
      });
    });
  }

  if (story && steps.length) {
    let raf = 0;

    const computeInView = () => {
      const rect = story.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // Enters slightly later, exits earlier (nice on Safari)
      const enterLine = vh * 0.22;
      const leaveLine = vh * 0.80;

      const inview = rect.top <= enterLine && rect.bottom >= leaveLine;
      story.classList.toggle("is-inview", inview);
      return inview;
    };

    const pickActiveStep = () => {
      const mid = (window.innerHeight || 1) * 0.52;
      let best = 0;
      let bestDist = Infinity;

      for (let i = 0; i < steps.length; i++) {
        const r = steps[i].getBoundingClientRect();
        const center = r.top + r.height * 0.5;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      return best;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;

        const inview = computeInView();
        if (!inview) return;

        // While locked (after click), do NOT override selected step
        if (isLocked()) return;

        const idx = pickActiveStep();
        if (idx !== currentIdx) {
          currentIdx = idx;
          setPanelsVisibility(idx);
          activateStepUI(idx);
        }

        // Blur dynamics (desktop only)
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

    // Init
    setPanelsVisibility(0);
    activateStepUI(0);
    computeInView();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }
})();
