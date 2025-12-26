/* Lysis Formation — script.js (Safari Mac: click 1/2/3 => step 1/2/3 visible immediately) */
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

  // ===== Sticky story (Méthode)
  const story = $(".sticky-story");
  if (!story) return;

  const media = $(".sticky-story__media", story);
  const steps = $$("article.story-panel[data-step]", story);

  const header = $("#siteHeader");
  const methodMobile = $("#methodMobile");
  const mmMobile = window.matchMedia("(max-width: 760px)");

  // Desktop nav 1/2/3
  const navItems = $$(".sticky-nav__item", story);
  const stickySub = $("#stickySub");

  // Mobile tabs
  const mobileTabs = $$(".method-tab", story);
  const mobileSub = $("#methodMobileSub");

  const SUBS = [
    "Diagnostic, progression, puis validation : un processus clair, sans dispersion.",
    "Automatismes : stabilité du workflow, cohérence du rendu, décisions plus rapides.",
    "Validation et exports : translation, checklist finale, livrables prêts.",
  ];

  let currentIdx = 0;

  // Lock scroll-sync after click (so click shows immediately, not overwritten)
  let lockUntil = 0;
  const nowMs = () => (window.performance?.now?.() || Date.now());
  const lockFor = (ms = 900) => (lockUntil = nowMs() + ms);
  const isLocked = () => nowMs() < lockUntil;

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

  const setProgress = (idx) => {
    const pct = idx <= 0 ? 0 : idx === 1 ? 50 : 100;
    story.style.setProperty("--progress", `${pct}%`);
    story.style.setProperty("--mprogress", `${pct}%`);
  };

  const activateDesktop = (idx) => {
    navItems.forEach((it) => it.classList.remove("is-active"));
    const el = navItems.find((x) => Number(x.dataset.left) === idx);
    if (el) el.classList.add("is-active");
    if (stickySub && SUBS[idx]) stickySub.textContent = SUBS[idx];
  };

  const activateMobile = (idx) => {
    mobileTabs.forEach((t) => {
      const active = Number(t.dataset.step) === idx;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (mobileSub && SUBS[idx]) mobileSub.textContent = SUBS[idx];
  };

  const activateUI = (idx) => {
    setProgress(idx);
    activateDesktop(idx);
    activateMobile(idx);
  };

  const setPanelsVisibility = (idx) => {
    if (!steps.length) return;

    if (!mmMobile.matches) {
      // Desktop: only one panel visible
      steps.forEach((s, i) => s.classList.toggle("is-visible", i === idx));
    } else {
      // Mobile: keep them all visible (light version)
      steps.forEach((s) => s.classList.add("is-visible"));
    }
  };

  // Click => show NOW + scroll to it
  const goToStep = (idx) => {
    idx = Math.max(0, Math.min(steps.length - 1, idx));
    currentIdx = idx;

    // Ensure the section feels active immediately
    story.classList.add("is-inview");

    // Show immediately (no waiting for scroll)
    setPanelsVisibility(idx);
    activateUI(idx);

    // Avoid scroll-sync overriding right after click
    lockFor(950);

    // Safari-friendly: scroll + nudge
    requestAnimationFrame(() => {
      scrollToEl(steps[idx]);
      setTimeout(() => scrollToEl(steps[idx]), 80);
    });
  };

  // Bind desktop 1/2/3 (data-left = 0/1/2)
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

  // Bind mobile tabs (data-step = 0/1/2)
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

  // Scroll-sync (when user scrolls normally)
  let raf = 0;

  const computeInView = () => {
    const rect = story.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // Enters later, exits earlier (Safari friendly)
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

      // Do not override after click
      if (isLocked()) return;

      const idx = pickActiveStep();
      if (idx !== currentIdx) {
        currentIdx = idx;
        setPanelsVisibility(idx);
        activateUI(idx);
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
  activateUI(0);
  computeInView();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("orientationchange", () => setTimeout(onScroll, 80));
  onScroll();
})();
