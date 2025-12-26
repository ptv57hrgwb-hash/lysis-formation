/* Lysis Formation — script.js */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ===== Mobile nav
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");

  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    // Close on link click
    $$("#navMenu a").forEach((a) => a.addEventListener("click", closeMenu));

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!navMenu.classList.contains("is-open")) return;
      const target = e.target;
      if (target instanceof Node && !navMenu.contains(target) && !navToggle.contains(target)) closeMenu();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // ===== Reveal on scroll
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealIO.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealIO.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ===== Level picker (hero)
  const helper = $("#levelHelper");
  const metricLevel = $("#metricLevel");
  const metricFocus = $("#metricFocus");
  const metricResult = $("#metricResult");
  const checklist = $("#heroChecklist");

  const levels = {
    debutant: {
      label: "Débutant",
      helper: "Bases solides + autonomie sur Logic Pro 11, avec une méthode simple et efficace.",
      focus: "Autonomie & workflow",
      result: "Un projet propre et clair",
      items: [
        "Interface & workflow Logic Pro",
        "Enregistrer / éditer proprement",
        "Structurer un morceau",
        "Exporter sans surprise",
      ],
    },
    intermediaire: {
      label: "Intermédiaire",
      helper: "Méthode de production + mix : décisions plus rapides, sessions plus propres, rendu plus cohérent.",
      focus: "Mix & structure",
      result: "Un rendu cohérent",
      items: [
        "Gain staging & équilibre",
        "Espace (pan / depth)",
        "Automation utile",
        "Organisation de session",
      ],
    },
    avance: {
      label: "Avancé / Pro",
      helper: "Cap pro : translation, cohérence, finition. Méthode réutilisable sur tous tes projets.",
      focus: "Finition & signature",
      result: "Un rendu qui tient partout",
      items: [
        "Balance tonale & translation",
        "Glue & profondeur",
        "Routine de contrôle",
        "Pré-master propre",
      ],
    },
  };

  const setLevel = (key) => {
    const data = levels[key];
    if (!data) return;

    // buttons
    $$(".seg-btn").forEach((b) => {
      const active = b.dataset.level === key;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });

    // text
    if (helper) helper.textContent = data.helper;
    if (metricLevel) metricLevel.textContent = data.label;
    if (metricFocus) metricFocus.textContent = data.focus;
    if (metricResult) metricResult.textContent = data.result;

    // list
    if (checklist) {
      checklist.innerHTML = "";
      data.items.forEach((txt) => {
        const li = document.createElement("li");
        li.textContent = txt;
        checklist.appendChild(li);
      });
    }
  };

  $$(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLevel(btn.dataset.level));
  });

  // ===== Email links (keeps your displayed text, builds a working mailto)
  const normalizeEmailForMailto = (raw) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    // If user writes "lysis.asso.gmail.com" we convert to "lysis.asso@gmail.com" for mailto only.
    if (s.includes("@")) return s;
    if (s.endsWith(".gmail.com")) return s.replace(".gmail.com", "@gmail.com");
    return s;
  };

  const setMailto = (el, emailRaw, subject, body) => {
    const email = normalizeEmailForMailto(emailRaw);
    if (!email) return;

    let href = `mailto:${encodeURIComponent(email)}`;
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${body}`); // body is already url-encoded in HTML dataset
    if (params.length) href += `?${params.join("&")}`;
    el.setAttribute("href", href);
  };

  $$(".js-email-link").forEach((a) => {
    setMailto(a, a.dataset.email);
  });

  $$(".js-email-cta").forEach((a) => {
    setMailto(a, a.dataset.email, a.dataset.subject || "", a.dataset.body || "");
  });

  // ===== Sticky story: show left overlay ONLY during sticky photo + sync with steps
  const stickySection = $(".sticky-story");
  const stickyMedia = $(".sticky-story__media");
  const steps = $$("[data-step]");
  const leftItems = $$(".sticky-left__item");

  const activateLeft = (idx) => {
    leftItems.forEach((it) => it.classList.remove("is-active"));
    const el = leftItems.find((x) => Number(x.dataset.left) === idx);
    if (el) el.classList.add("is-active");
  };

  if (stickySection && stickyMedia && "IntersectionObserver" in window) {
    const sectionIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stickySection.classList.add("is-inview");
            activateLeft(0); // Intro uniquement à l'entrée de la 2e photo
          } else {
            stickySection.classList.remove("is-inview");
            leftItems.forEach((it) => it.classList.remove("is-active"));
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px -45% 0px",
      }
    );

    sectionIO.observe(stickyMedia);
  } else if (stickySection) {
    // fallback
    stickySection.classList.add("is-inview");
    activateLeft(0);
  }

  if ("IntersectionObserver" in window) {
    const stepIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          const idx = steps.indexOf(entry.target);
          if (idx === 0) activateLeft(1);
          else if (idx === 1) activateLeft(2);
          else if (idx === 2) activateLeft(3);
          else activateLeft(3); // CTA : on garde étape 3 (pas de retour intro)
        });
      },
      { threshold: 0.55 }
    );

    steps.forEach((el) => stepIO.observe(el));
  } else {
    steps.forEach((el) => el.classList.add("is-visible"));
  }
})();
