/* Lysis Formation — script.js */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const onReady = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  onReady(() => {
    // ===== Year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // ===== Mobile nav
    const navToggle = $(".nav-toggle");
    const navMenu = $("#navMenu");
    const navLinks = navMenu ? $$("a", navMenu) : [];

    const closeMenu = () => {
      if (!navMenu || !navToggle) return;
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      if (!navMenu || !navToggle) return;
      navMenu.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
    };

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.contains("is-open");
        if (isOpen) closeMenu();
        else openMenu();
      });

      navLinks.forEach((a) => a.addEventListener("click", closeMenu));

      document.addEventListener("click", (e) => {
        if (!navMenu.classList.contains("is-open")) return;
        const t = e.target;
        if (t === navToggle || navToggle.contains(t)) return;
        if (t === navMenu || navMenu.contains(t)) return;
        closeMenu();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
      });
    }

    // ===== Reveal (sections + hero)
    const revealEls = $$("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => io.observe(el));

 // ===== Story steps reveal + sync left stack (only visible during sticky section)
const stickySection = $(".sticky-story");
const steps = $$("[data-step]");
const leftItems = $$(".sticky-left__item");

const activateLeft = (idx) => {
  leftItems.forEach((it) => it.classList.remove("is-active"));
  const el = leftItems.find((x) => Number(x.dataset.left) === idx);
  if (el) el.classList.add("is-active");
};

// Affiche/masque le texte de gauche uniquement pendant la section sticky (2e photo)
if (stickySection) {
  const sectionIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stickySection.classList.add("is-inview");
          activateLeft(0); // "Comprendre. Pratiquer. Finaliser." seulement à l'entrée de la 2e photo
        } else {
          stickySection.classList.remove("is-inview");
          leftItems.forEach((it) => it.classList.remove("is-active"));
        }
      });
    },
    { threshold: 0.15, rootMargin: "-10% 0px -70% 0px" }
  );

  sectionIO.observe(stickySection);
}

// Change le texte au scroll des bulles (et évite de revenir sur l'intro au CTA)
const stepIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      const idx = steps.indexOf(entry.target);
      if (idx === 0) activateLeft(1);
      else if (idx === 1) activateLeft(2);
      else if (idx === 2) activateLeft(3);
      else activateLeft(3); // CTA : on garde l'étape 3 (pas de retour à l'intro)
    });
  },
  { threshold: 0.55 }
);

steps.forEach((el) => stepIO.observe(el));

    // ===== Level picker
    const levelBtns = $$(".seg-btn");
    const levelHelper = $("#levelHelper");
    const metricLevel = $("#metricLevel");
    const metricFocus = $("#metricFocus");
    const metricResult = $("#metricResult");
    const checklist = $("#heroChecklist");

    const DATA = {
      debutant: {
        helper: "Bases solides + autonomie sur Logic Pro 11, avec une méthode simple et efficace.",
        level: "Débutant",
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
        helper: "Structurer ton mix : équilibre, espace, automation. Tu gagnes en vitesse et en cohérence.",
        level: "Intermédiaire",
        focus: "Mix & méthode",
        result: "Un mix plus stable",
        checklist: [
          "Gain staging & équilibre",
          "Espace (pan / profondeur)",
          "Automation utile",
          "Organisation + références",
        ],
      },
      avance: {
        helper: "Cap pro : translation, décisions rapides, cohérence artistique et finition.",
        level: "Avancé / Pro",
        focus: "Finition & signature",
        result: "Un rendu qui tient partout",
        checklist: [
          "Balance tonale & glue",
          "Contrôle translation",
          "Routine de validation",
          "Pré-master propre",
        ],
      },
    };

    const renderLevel = (key) => {
      const d = DATA[key];
      if (!d) return;

      if (levelHelper) levelHelper.textContent = d.helper;
      if (metricLevel) metricLevel.textContent = d.level;
      if (metricFocus) metricFocus.textContent = d.focus;
      if (metricResult) metricResult.textContent = d.result;

      if (checklist) {
        checklist.innerHTML = "";
        d.checklist.forEach((txt) => {
          const li = document.createElement("li");
          li.textContent = txt;
          checklist.appendChild(li);
        });
      }
    };

    if (levelBtns.length) {
      levelBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          levelBtns.forEach((b) => {
            b.classList.remove("is-active");
            b.setAttribute("aria-selected", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-selected", "true");
          renderLevel(btn.dataset.level);
        });
      });

      // init from current active
      const active = levelBtns.find((b) => b.classList.contains("is-active"));
      renderLevel(active?.dataset.level || "debutant");
    }
  });
})();
