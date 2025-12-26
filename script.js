// ----- Mobile nav
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#navMenu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Close menu when clicking a link (mobile)
  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ----- Reveal on scroll (repeatable)
const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

function applyVisibility() {
  const vh = window.innerHeight || 0;
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    const visible = rect.top < vh * 0.88 && rect.bottom > vh * 0.12;
    el.classList.toggle("is-visible", visible);
  });
}

window.addEventListener("scroll", applyVisibility, { passive: true });
window.addEventListener("resize", applyVisibility);
applyVisibility();

// ----- Year in footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// ----- Level picker (Hero)
const levelButtons = Array.from(document.querySelectorAll(".seg-btn"));
const helper = document.getElementById("levelHelper");
const metricLevel = document.getElementById("metricLevel");
const metricFocus = document.getElementById("metricFocus");
const metricResult = document.getElementById("metricResult");
const heroChecklist = document.getElementById("heroChecklist");

const copyByLevel = {
  debutant: {
    helper: "On pose des bases solides et on rend autonome sur Logic Pro 11, avec une méthode simple et efficace.",
    level: "Débutant",
    focus: "Autonomie & workflow",
    result: "Un projet propre et clair",
    list: [
      "Interface & workflow Logic Pro",
      "Enregistrer / éditer proprement",
      "Structurer un morceau",
      "Exporter sans surprise"
    ]
  },
  intermediaire: {
    helper: "Méthode, organisation, rendu plus cohérent : décider plus vite et arrêter de tâtonner.",
    level: "Intermédiaire",
    focus: "Méthode & décisions",
    result: "Un rendu plus cohérent",
    list: [
      "Gain staging & équilibre",
      "Espace (pan / depth)",
      "Automation & transitions",
      "Organisation de session"
    ]
  },
  avance: {
    helper: "Cap pro : translation, profondeur, glue, signature. Un mix qui tient partout et une méthode durable.",
    level: "Avancé / Pro",
    focus: "Finition & signature",
    result: "Mix final “tient partout”",
    list: [
      "Translation & références",
      "Balance tonale & profondeur",
      "Glue / cohésion",
      "Pré-master propre"
    ]
  }
};

function setChecklist(items) {
  if (!heroChecklist) return;
  heroChecklist.innerHTML = items.map(i => `<li>${i}</li>`).join("");
}

function setActiveLevel(level) {
  levelButtons.forEach(btn => {
    const active = btn.dataset.level === level;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  const data = copyByLevel[level] || copyByLevel.debutant;

  if (helper) helper.textContent = data.helper;
  if (metricLevel) metricLevel.textContent = data.level;
  if (metricFocus) metricFocus.textContent = data.focus;
  if (metricResult) metricResult.textContent = data.result;
  setChecklist(data.list);
}

levelButtons.forEach(btn => {
  btn.addEventListener("click", () => setActiveLevel(btn.dataset.level));
});

setActiveLevel("debutant");

// ===== Sticky story blur + intro replacement =====
const story = document.querySelector(".sticky-story");
if (story) {
  const steps = Array.from(story.querySelectorAll("[data-step]"));

  // Steps appear (arrive par le bas) : observer
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.target.classList.toggle("is-visible", e.isIntersecting));
  }, { threshold: 0.25 });
  steps.forEach(s => io.observe(s));

  let ticking = false;

  function updateStory() {
    ticking = false;

    const rect = story.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    const total = rect.height - vh;
    const raw = (-rect.top) / (total <= 0 ? 1 : total);
    const t = Math.max(0, Math.min(1, raw));

    // courbe douce
    const eased = t * t * (3 - 2 * t);

    // Flou image (ajuste ici si tu veux)
    const blurPx = 22 * eased; // 0..22px
    story.style.setProperty("--blur", `${blurPx}px`);

    // Intro overlay : monte + s'efface (remplacé par les steps)
    const introAlpha = 1 - Math.min(1, eased * 1.25);
    const introLift = 34 * eased;
    story.style.setProperty("--introAlpha", `${introAlpha}`);
    story.style.setProperty("--introLift", `${introLift}px`);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateStory);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateStory();
}
