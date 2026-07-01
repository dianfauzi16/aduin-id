/**
 * Aduin.id Landing Page CMS Renderer
 * Membaca content.json dan merender konten landing page secara dinamis.
 * Ini adalah pengganti "PHP + MySQL" ala WordPress, tapi berbasis JavaScript.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDOK1MFqwmZXDjTjkA7BAvlYqFQwoPNUU",
  authDomain: "aduin-admin.firebaseapp.com",
  databaseURL: "https://aduin-admin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aduin-admin",
  storageBucket: "aduin-admin.firebasestorage.app",
  messagingSenderId: "758831242777",
  appId: "1:758831242777:web:c12ef02c40f213d0681488"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function loadData() {
  // 1. Coba load dari Cache lokal dulu (agar instan / bisa offline)
  const cachedData = localStorage.getItem("aduin_landing_cache");
  if (cachedData) {
    try {
      const parsedData = JSON.parse(cachedData);
      renderAllSections(parsedData);
    } catch (e) {
      console.warn("Cache rusak, mengabaikan cache.");
    }
  }

  // 2. Fetch data terbaru dari Firebase di background
  try {
    const dbRef = ref(db, '/');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Simpan ke cache untuk kunjungan berikutnya
      localStorage.setItem("aduin_landing_cache", JSON.stringify(data));
      
      // Render ulang dengan data terbaru
      renderAllSections(data);
    } else if (!cachedData) {
      console.warn("CMS Renderer: Data tidak ditemukan di database.");
      initScrollReveal();
    }
  } catch (err) {
    console.error("CMS Renderer: Gagal memuat data dari Firebase (Mungkin offline).", err);
    if (!cachedData) initScrollReveal();
  }
}

function renderAllSections(data) {
  renderHero(data.hero);
  renderLogos(data.logos);
  renderFeatures(data.features);
  renderHowItWorks(data.howItWorks);
  renderPricing(data.pricing);
  renderTestimonials(data.testimonials);
  renderCTA(data.cta);
  renderFooter(data.footer);

  // Re-init scroll reveal untuk elemen baru yang di-generate
  initScrollReveal();
}

loadData();

/* ========== RENDER FUNCTIONS ========== */

function renderHero(hero) {
  if (!hero) return;
  const section = document.querySelector("#hero");
  if (!section) return;

  const badge = section.querySelector(".hero-badge");
  if (badge) badge.innerHTML = '<span class="badge-dot"></span>' + hero.badge;

  const h1 = section.querySelector("h1");
  if (h1) h1.innerHTML = hero.title;

  const sub = section.querySelector(".hero-sub");
  if (sub) sub.textContent = hero.subtitle;

  // CTA buttons
  const actions = section.querySelector(".hero-actions");
  if (actions && hero.ctaPrimary && hero.ctaSecondary) {
    actions.innerHTML =
      `<a href="${hero.ctaPrimary.link}" class="btn-hero-primary">${hero.ctaPrimary.text}</a>` +
      `<a href="${hero.ctaSecondary.link}" class="btn-hero-outline">${hero.ctaSecondary.text}</a>`;
  }

  // Stats
  const statsContainer = section.querySelector(".hero-stats");
  if (statsContainer && hero.stats) {
    statsContainer.innerHTML = hero.stats
      .map(
        (s) =>
          `<div class="stat"><div class="stat-num">${s.value}</div><div class="stat-label">${s.label}</div></div>`
      )
      .join("");
  }
}

function renderLogos(logos) {
  if (!logos) return;
  const section = document.querySelector("#logos");
  if (!section) return;

  const label = section.querySelector(".logos-label");
  if (label) label.textContent = logos.label;

  const row = section.querySelector(".logos-row");
  if (row && logos.items) {
    row.innerHTML = logos.items
      .map((item) => `<span class="logo-item">${item}</span>`)
      .join("");
  }
}

function renderFeatures(features) {
  if (!features) return;
  const section = document.querySelector("#features");
  if (!section) return;

  const tag = section.querySelector(".section-tag");
  if (tag) tag.textContent = features.tag;

  const title = section.querySelector(".section-title");
  if (title) title.textContent = features.title;

  const sub = section.querySelector(".section-sub");
  if (sub) sub.textContent = features.subtitle;

  const grid = section.querySelector(".features-grid");
  if (grid && features.items) {
    grid.innerHTML = features.items
      .map(
        (f, i) =>
          `<div class="feature-card reveal reveal-delay-${(i % 3) + 1}">
            <div class="feature-icon ${f.color}">${f.icon}</div>
            <div class="feature-title">${f.title}</div>
            <div class="feature-desc">${f.desc}</div>
          </div>`
      )
      .join("");
  }
}

function renderHowItWorks(how) {
  if (!how) return;
  const section = document.querySelector("#how");
  if (!section) return;

  const tag = section.querySelector(".section-tag");
  if (tag) tag.textContent = how.tag;

  const title = section.querySelector(".section-title");
  if (title) title.textContent = how.title;

  const sub = section.querySelector(".section-sub");
  if (sub) sub.textContent = how.subtitle;

  const row = section.querySelector(".steps-row");
  if (row && how.steps) {
    row.innerHTML = how.steps
      .map(
        (s, i) =>
          `<div class="step-card reveal reveal-delay-${i + 1}">
            <div class="step-icon-wrap">${s.icon}</div>
            <div class="step-number-ring">${s.number}</div>
            <div class="step-title">${s.title}</div>
            <div class="step-desc">${s.desc}</div>
          </div>`
      )
      .join("");
  }
}

function renderPricing(pricing) {
  if (!pricing) return;
  const section = document.querySelector("#pricing");
  if (!section) return;

  const tag = section.querySelector(".section-tag");
  if (tag) tag.textContent = pricing.tag;

  const title = section.querySelector(".section-title");
  if (title) title.textContent = pricing.title;

  const sub = section.querySelector(".section-sub");
  if (sub) sub.textContent = pricing.subtitle;

  const grid = section.querySelector(".pricing-grid");
  if (grid && pricing.plans) {
    grid.innerHTML = pricing.plans
      .map((plan, i) => {
        const featuresHTML = plan.features
          .map((f) => {
            if (f.included) {
              return `<div class="price-feature"><span class="check-icon">✓</span>${f.text}</div>`;
            } else {
              return `<div class="price-feature" style="color:var(--muted)"><span style="color:#cbd5e1">✗</span>${f.text}</div>`;
            }
          })
          .join("");

        const btnClass =
          plan.buttonStyle === "primary"
            ? "price-btn-primary"
            : plan.buttonStyle === "dark"
            ? "price-btn-dark"
            : "price-btn-outline";

        const suffix = plan.priceSuffix
          ? `<span>${plan.priceSuffix}</span>`
          : "";

        const popularBadge = plan.popular
          ? `<div class="popular-badge">${plan.popularBadge}</div>`
          : "";

        return `<div class="price-card ${plan.popular ? "popular" : ""} reveal reveal-delay-${i + 1}">
          ${popularBadge}
          <div class="price-name">${plan.name}</div>
          <div class="price-amount">${plan.price}${suffix}</div>
          <div class="price-period">${plan.period}</div>
          <div class="price-divider"></div>
          ${featuresHTML}
          <a href="${plan.link}" class="price-btn ${btnClass}">${plan.buttonText}</a>
        </div>`;
      })
      .join("");
  }
}

function renderTestimonials(testi) {
  if (!testi) return;
  const section = document.querySelector("#testimonials");
  if (!section) return;

  const tag = section.querySelector(".section-tag");
  if (tag) tag.textContent = testi.tag;

  const title = section.querySelector(".section-title");
  if (title) title.textContent = testi.title;

  const sub = section.querySelector(".section-sub");
  if (sub) sub.textContent = testi.subtitle;

  const grid = section.querySelector(".testi-grid");
  if (grid && testi.items) {
    grid.innerHTML = testi.items
      .map(
        (t, i) =>
          `<div class="testi-card reveal reveal-delay-${i + 1}">
            <div class="testi-stars">${"★".repeat(t.stars)}${"☆".repeat(5 - t.stars)}</div>
            <div class="testi-text">"${t.text}"</div>
            <div class="testi-author">
              <div class="testi-avatar" style="background:${t.avatarBg}">${t.avatarEmoji}</div>
              <div>
                <div class="testi-name">${t.name}</div>
                <div class="testi-role">${t.role}</div>
              </div>
            </div>
          </div>`
      )
      .join("");
  }
}

function renderCTA(cta) {
  if (!cta) return;
  const section = document.querySelector("#cta");
  if (!section) return;

  const tag = section.querySelector(".section-tag");
  if (tag) tag.textContent = cta.tag;

  const title = section.querySelector(".cta-title");
  if (title) title.textContent = cta.title;

  const sub = section.querySelector(".cta-sub");
  if (sub) sub.textContent = cta.subtitle;

  const actions = section.querySelector(".cta-actions");
  if (actions && cta.primary && cta.secondary) {
    actions.innerHTML =
      `<a href="${cta.primary.link}" class="btn-cta-primary">${cta.primary.text}</a>` +
      `<a href="${cta.secondary.link}" class="btn-cta-outline">${cta.secondary.text}</a>`;
  }
}

function renderFooter(footer) {
  if (!footer) return;
  const footerEl = document.querySelector("footer");
  if (!footerEl) return;

  const tagline = footerEl.querySelector(".footer-tagline");
  if (tagline) tagline.textContent = footer.tagline;

  const copy = footerEl.querySelector(".footer-copy");
  if (copy) copy.textContent = footer.copyright;

  // Update contact column
  if (footer.contact) {
    const contactCol = footerEl.querySelectorAll(".footer-col")[2];
    if (contactCol) {
      const links = contactCol.querySelectorAll("a");
      if (links[0]) links[0].textContent = footer.contact.email;
      if (links[1]) links[1].textContent = footer.contact.phone;
      if (links[2]) links[2].textContent = footer.contact.address;
    }
  }
}

/* ========== SCROLL REVEAL RE-INIT ========== */

function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal:not(.visible)");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => observer.observe(el));
}
