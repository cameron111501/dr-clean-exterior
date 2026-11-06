function initExitIntent() {
  if (document.body.hasAttribute("data-no-exit-modal")) return;
  if (sessionStorage.getItem("drcleanExitShown")) return;

  const overlay = document.createElement("div");
  overlay.className = "exit-modal-overlay";
  overlay.innerHTML = `
    <div class="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exit-modal-title">
      <button class="exit-modal-close" aria-label="Close">&times;</button>
      <img src="images/logo-full.png" alt="Dr. Clean Exterior Services" class="exit-modal-logo">
      <span class="exit-modal-eyebrow">Wait &mdash; Before You Go</span>
      <h3 id="exit-modal-title">Your Free Screen Cleaning Is Ready</h3>
      <p>Consider this doctor's orders: get your window screens cleaned free with your first Dr. Clean visit. Boerne's best-reviewed exterior care, one estimate away.</p>
      <a href="free-estimate.html" class="btn btn-primary exit-modal-cta">Claim My Free Screen Cleaning</a>
      <button class="exit-modal-dismiss">No thanks, I'll pass on the prescription</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dismiss = () => overlay.classList.remove("active");
  const trigger = () => {
    if (sessionStorage.getItem("drcleanExitShown")) return;
    overlay.classList.add("active");
    sessionStorage.setItem("drcleanExitShown", "1");
  };

  overlay.querySelector(".exit-modal-close").addEventListener("click", dismiss);
  overlay.querySelector(".exit-modal-dismiss").addEventListener("click", dismiss);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) dismiss();
  });

  let armed = false;
  setTimeout(() => { armed = true; }, 6000);

  document.addEventListener("mouseout", (e) => {
    if (!armed) return;
    if (e.clientY <= 0 && !e.relatedTarget) trigger();
  });

  history.pushState({ drcleanExitGuard: true }, "");
  window.addEventListener("popstate", () => trigger());

  setTimeout(trigger, 90000);
}

function initScrollReveal() {
  if (!("IntersectionObserver" in window)) return;

  const selector = [
    ".service-card", ".reason-card", ".plan-card", ".plan-step", ".testimonial-card",
    ".value-card", ".case-file", ".contact-info-card", ".form-card",
    ".section-head", ".services-grid", ".hero-grid", ".page-hero > .container",
    ".area-wrap", ".diff-wrap", ".photo-tile",
  ].join(", ");
  const els = Array.from(document.querySelectorAll(selector));
  if (!els.length) return;

  els.forEach((el) => {
    el.classList.add("reveal");
    const siblingIndex = Array.from(el.parentElement.children).indexOf(el);
    el.style.transitionDelay = `${Math.min(siblingIndex * 0.08, 0.32)}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

  els.forEach((el) => observer.observe(el));
}

function initPromoBar() {
  if (document.body.hasAttribute("data-no-exit-modal")) return;

  const messages = [
    "<b>&#10010; Pure Water:</b> spot-free, streak-free glass every visit",
    "<b>Gentle soft-wash</b> that protects your home &mdash; results that last",
    "Locally owned in Boerne &mdash; <b>every home treated like our own</b>",
    "Boerne's best-reviewed exterior care &mdash; <b>5.0 &#9733; on Google</b>",
  ];
  const group = messages.map((m) => `<span>${m}</span>`).join("");

  const bar = document.createElement("div");
  bar.className = "promo-bar";
  bar.setAttribute("role", "note");
  bar.innerHTML = `<div class="promo-track">${group.repeat(4)}</div>`;
  document.body.insertBefore(bar, document.body.firstChild);
}

// Tell the CSS how tall the promo bar + header are so the homepage hero can fill exactly the rest of the screen.
function initHeroFull() {
  if (!document.querySelector(".hero")) return;
  const set = () => {
    const promo = document.querySelector(".promo-bar");
    const header = document.querySelector(".site-header");
    const h = (promo ? promo.offsetHeight : 0) + (header ? header.offsetHeight : 0);
    document.documentElement.style.setProperty("--chrome", h + "px");
  };
  set();
  window.addEventListener("resize", set);
  window.addEventListener("load", set);
}

function initMobileCta() {
  if (document.body.hasAttribute("data-no-exit-modal")) return;
  if (location.pathname.endsWith("free-estimate.html")) return;

  const bar = document.createElement("div");
  bar.className = "mobile-cta";
  bar.innerHTML = `
    <a href="free-estimate.html" class="btn btn-primary">Free Estimate</a>
    <button type="button" class="btn btn-secondary mobile-cta-contact" aria-haspopup="true" aria-expanded="false">Call/Text Now</button>
    <div class="mobile-cta-menu" role="menu" hidden>
      <a href="tel:2107846009" class="btn btn-primary" role="menuitem">Call 210-784-6009</a>
      <a href="sms:2107846009" class="btn btn-secondary" role="menuitem">Text 210-784-6009</a>
    </div>
  `;
  document.body.appendChild(bar);
  document.body.classList.add("has-mobile-cta");

  // Call/Text button opens a small call-or-text chooser above the bar.
  const contactBtn = bar.querySelector(".mobile-cta-contact");
  const menu = bar.querySelector(".mobile-cta-menu");
  const setMenu = (open) => {
    menu.hidden = !open;
    contactBtn.setAttribute("aria-expanded", String(open));
  };
  contactBtn.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", () => setTimeout(() => setMenu(false), 0));
  document.addEventListener("click", (e) => { if (!bar.contains(e.target)) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Keep the bar out of the way until the visitor scrolls past the hero.
  const hero = document.querySelector(".hero, .page-hero");
  if (!hero || !("IntersectionObserver" in window)) {
    bar.classList.add("show");
    return;
  }
  new IntersectionObserver((entries) => {
    const e = entries[entries.length - 1];
    const show = !e.isIntersecting && e.boundingClientRect.bottom <= 0;
    bar.classList.toggle("show", show);
    if (!show) setMenu(false);
  }, { threshold: 0 }).observe(hero);
}

// Any link marked data-call-text opens a small "Call or Text" chooser instead of dialing straight away.
// Without JavaScript the link is still a normal tel: link.
function initCallText() {
  const triggers = Array.from(document.querySelectorAll("[data-call-text]"));
  if (!triggers.length) return;

  const pop = document.createElement("div");
  pop.className = "calltext-pop";
  pop.setAttribute("role", "menu");
  pop.hidden = true;
  pop.innerHTML = `
    <a href="tel:2107846009" class="btn btn-outline" role="menuitem">Call 210-784-6009</a>
    <a href="sms:2107846009" class="btn btn-outline" role="menuitem">Text 210-784-6009</a>
  `;
  document.body.appendChild(pop);

  let current = null;
  const close = () => {
    pop.hidden = true;
    if (current) current.setAttribute("aria-expanded", "false");
    current = null;
  };
  const place = (btn) => {
    const r = btn.getBoundingClientRect();
    const width = Math.max(r.width, 240);
    const left = Math.min(Math.max(12, r.left + r.width / 2 - width / 2), window.innerWidth - width - 12);
    pop.style.width = width + "px";
    pop.style.left = left + window.scrollX + "px";
    pop.style.top = r.bottom + window.scrollY + 8 + "px";
  };

  triggers.forEach((btn) => {
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (current === btn) { close(); return; }
      current = btn;
      btn.setAttribute("aria-expanded", "true");
      place(btn);
      pop.hidden = false;
    });
  });
  pop.addEventListener("click", () => setTimeout(close, 0));
  document.addEventListener("click", (e) => {
    if (current && !pop.contains(e.target) && !current.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  window.addEventListener("resize", close);
}

function initHeroSlides() {
  const hero = document.querySelector(".hero");
  const slides = hero ? Array.from(hero.querySelectorAll(".hero-slide")) : [];
  if (slides.length < 2) return;

  const dots = document.createElement("div");
  dots.className = "hero-dots";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show photo ${i + 1}`);
    dot.addEventListener("click", () => { show(i); restart(); });
    dots.appendChild(dot);
  });
  hero.appendChild(dots);

  // Slides after the first carry data-bg and are loaded once the page is ready,
  // so the homepage isn't waiting on every hero photo up front.
  const load = (s) => {
    if (s.dataset.bg) {
      const phone = window.matchMedia("(max-width: 720px)").matches;
      const src = phone ? s.dataset.bg.replace("images/", "images/m/") : s.dataset.bg;
      s.style.backgroundImage = `url('${src}')`;
      if (s.dataset.pos) s.style.backgroundPosition = `${s.dataset.pos} 60%`;
      delete s.dataset.bg;
    }
  };
  const loadAll = () => slides.forEach(load);
  if (document.readyState === "complete") setTimeout(loadAll, 300);
  else window.addEventListener("load", () => setTimeout(loadAll, 300));

  let current = 0;
  let timer;
  const show = (i) => {
    current = i;
    load(slides[i]);
    slides.forEach((s, n) => s.classList.toggle("active", n === i));
    Array.from(dots.children).forEach((d, n) => d.classList.toggle("active", n === i));
  };
  const restart = () => {
    clearInterval(timer);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = setInterval(() => show((current + 1) % slides.length), 6000);
    }
  };
  show(0);
  restart();

  // Swipe the photos with a finger on touch screens (no arrows; dots handle desktop clicks).
  let sx = 0, sy = 0, tracking = false;
  hero.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) { tracking = false; return; }
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });
  hero.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    // Mostly-horizontal swipe only, so normal page scrolling still works.
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    show((current + (dx < 0 ? 1 : slides.length - 1)) % slides.length);
    restart();
  }, { passive: true });
  hero.addEventListener("touchcancel", () => { tracking = false; }, { passive: true });
}

function initLightbox() {
  const tiles = Array.from(document.querySelectorAll(".photo-tile"));
  if (!tiles.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img alt="">';
  document.body.appendChild(box);
  const big = box.querySelector("img");
  const close = () => box.classList.remove("open");

  tiles.forEach((tile) => {
    tile.addEventListener("click", (e) => {
      e.preventDefault();
      big.src = tile.href;
      big.alt = tile.querySelector("img").alt;
      box.classList.add("open");
    });
  });
  box.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

// Before/after rows: clone the cards enough times to fill any screen, then drift slowly (rows run opposite ways).
function initBaMarquee() {
  const box = document.querySelector(".ba-marquee");
  if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const SPEED = 26; // px per second
  const screenW = Math.max(window.screen.width || 0, window.innerWidth);
  box.querySelectorAll(".ba-track").forEach((track) => {
    const originals = Array.from(track.children);
    const unit = track.scrollWidth; // exact: cards are fixed width with a right margin
    if (!unit) return;
    const copies = Math.ceil(screenW / unit) + 1;
    for (let c = 0; c < copies; c++) {
      originals.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelector("a").tabIndex = -1;
        track.appendChild(clone);
      });
    }
    track.style.setProperty("--ba-shift", unit + "px");
    track.style.setProperty("--ba-dur", Math.round(unit / SPEED) + "s");
  });
  box.classList.add("is-live");
}

// Homepage quote section (desktop): the silent looping video only loads and plays while it is on screen, so it never
// slows the page down. It stays on its poster image if the visitor prefers reduced motion, and it is never fetched on phones
// (the video is hidden there and has preload="none").
function initQuoteVideo() {
  const video = document.querySelector(".quote-video");
  if (!video) return;
  // the poster image is only fetched when the video is actually showing (desktop), never on phones
  if (video.offsetParent !== null && video.dataset.poster) video.poster = video.dataset.poster;
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  video.muted = true;
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const p = video.play();
        if (p && p.catch) p.catch(() => {}); // autoplay refused: the poster image simply stays
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 }).observe(video);
}

function initTrustStrip() {
  const track = document.querySelector(".trust-strip .trust-track");
  if (track) track.innerHTML = track.innerHTML.repeat(4);
}

document.addEventListener("DOMContentLoaded", () => {
  initPromoBar();
  initHeroFull();
  initMobileCta();
  initTrustStrip();
  initHeroSlides();
  initCallText();
  initBaMarquee();
  initQuoteVideo();
  initLightbox();
  initExitIntent();
  initScrollReveal();

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          links?.classList.remove("open");
        }
      }
    });
  });

  // Real reviews from the Dr. Clean Exterior Services Google Business Profile:
  // https://www.google.com/maps?cid=7467233303242866438
  const googleReviews = [
    { name: "Amy Fulton", text: "We had Dr Clean Exterior Services come out before listing our house for sale, and Cameron did an amazing job! He washed all of our windows inside and out, including the screens, and they honestly sparkled for the real estate photos." },
    { name: "Keith Wurzbach", text: "Cameron has cleaned all my windows and power washed my porch, driveway, and sidewalks three times now. Every time the job has been fantastic and competitively priced!" },
    { name: "Sherrie Klein", text: "Our second floor windows hadn't been cleaned in years due to the height — they were filthy! He didn't complain and pressed right on with the work." },
    { name: "Tyler Durm", text: "He did a fantastic job! Great communication, extremely friendly, and knows his stuff when it comes to exterior cleaning. Very thorough with top-notch attention to detail — I'll be using him again!" },
    { name: "Kara Thomsen", text: "Couldn't be happier with the service! They showed up on time, were super professional, and left my windows sparkling clean inside and out. Friendly, reliable, and very reasonably priced." },
    { name: "clubkidcarlos", text: "What an awesome job! Right on time, great communication, professional and friendly demeanor. Windows and screens are clean clean clean!" },
    { name: "Kimberly Hobrecht", text: "Cameron did a FANTASTIC job on our windows. We live in Boerne and have had other companies come out, but he did the best by far! Highly recommend!" },
    { name: "Carol S", text: "Cameron came out today to clean our windows. They all look great! He did a really good job at a reasonable rate." },
    { name: "Diana Adkison", text: "Cameron did an amazing job! Cleaned windows, removed a bird's nest, and power washed the area clean. Highly recommend." },
    { name: "Fiona Begonia", text: "Cameron did a thorough, awesome job pressure washing our sidewalks and cleaning our windows. Highly recommend him and his work!" },
  ];

  const testimonialGrid = document.querySelector("#testimonial-grid");
  const testimonialCards = testimonialGrid ? testimonialGrid.querySelectorAll(".testimonial-card") : [];
  if (testimonialGrid && googleReviews.length > testimonialCards.length) {
    const cards = Array.from(testimonialCards);
    let offset = cards.length;

    setInterval(() => {
      cards.forEach((card) => card.classList.add("fade"));

      setTimeout(() => {
        cards.forEach((card, i) => {
          const review = googleReviews[(offset + i) % googleReviews.length];
          card.querySelector("p").innerHTML = `&ldquo;${review.text}&rdquo;`;
          card.querySelector(".testimonial-name").textContent = `${review.name} — Google review`;
          card.classList.remove("fade");
        });
        offset = (offset + cards.length) % googleReviews.length;
      }, 350);
    }, 12000);
  }

  // ---- Quote wizard (free-estimate.html) ----
  const qwForm = document.querySelector("#quote-form");
  const qwCard = document.querySelector("#quote-wizard");
  if (qwForm && qwCard) {
    qwCard.classList.add("js-wizard");
    const steps = qwForm.querySelectorAll(".qw-step");
    const dots = qwCard.querySelectorAll(".qw-dot");
    const stepLabel = qwCard.querySelector("#qw-step-label");
    const labels = ["Step 1 of 2 · Tell us about your property", "Step 2 of 2 · How should we reach you?"];
    const $ = (sel) => qwForm.querySelector(sel);

    const showStep = (n) => {
      steps.forEach((s, i) => s.classList.toggle("active", i === n));
      dots.forEach((d, i) => d.classList.toggle("active", i === n));
      stepLabel.textContent = labels[n];
      if (qwCard.getBoundingClientRect().top < 0) qwCard.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const showError = (id, msg, fields = []) => {
      const box = $(id);
      qwForm.querySelectorAll(".qw-invalid").forEach((f) => f.classList.remove("qw-invalid"));
      if (!msg) { box.hidden = true; return true; }
      box.textContent = msg;
      box.hidden = false;
      fields.forEach((f) => f.classList.add("qw-invalid"));
      if (fields[0]) fields[0].focus();
      return false;
    };

    // Category chips open their sub-option panels
    qwForm.querySelectorAll('input[name="category"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        document.getElementById(cb.dataset.panel).hidden = !cb.checked;
      });
    });

    // Conditional fields
    $("#timeline").addEventListener("change", (e) => {
      $("#qw-date-field").hidden = e.target.value !== "Specific Date";
    });
    $("#referral").addEventListener("change", (e) => {
      $("#qw-referrer-field").hidden = e.target.value !== "Referral / Word of Mouth";
    });

    const checked = (name) =>
      Array.from(qwForm.querySelectorAll(`input[name="${name}"]:checked`)).map((c) => c.value);

    const selectedServices = () => {
      const cats = checked("category");
      let list = [];
      if (cats.includes("Window Cleaning")) {
        const w = checked("window_services");
        list = list.concat(w.length ? w : ["Window Cleaning"]);
      }
      if (cats.includes("Washing")) {
        const p = checked("washing_services");
        list = list.concat(p.length ? p : ["Soft / Pressure Washing"]);
      }
      return list;
    };

    const validateStep1 = () => {
      if (!checked("category").length) return showError("#qw-error-1", "Pick at least one service.");
      const addr = $("#address");
      if (addr.value.trim().length < 5) return showError("#qw-error-1", "Please enter your service address.", [addr]);
      return showError("#qw-error-1", "");
    };

    const validateStep2 = () => {
      const fname = $("#first_name"), phone = $("#phone"), email = $("#email");
      if (!fname.value.trim()) return showError("#qw-error-2", "Please enter your first name.", [fname]);
      if (phone.value.replace(/\D/g, "").length < 10) return showError("#qw-error-2", "Please enter a valid phone number.", [phone]);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return showError("#qw-error-2", "Please enter a valid email address.", [email]);
      return showError("#qw-error-2", "");
    };

    qwForm.querySelector(".qw-next").addEventListener("click", () => { if (validateStep1()) showStep(1); });
    qwForm.querySelector(".qw-back").addEventListener("click", () => showStep(0));

    // "Ask About This Plan" buttons preselect the frequency
    document.querySelectorAll("[data-plan]").forEach((btn) => {
      btn.addEventListener("click", () => { $("#frequency").value = btn.dataset.plan; });
    });

    qwForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateStep1()) { showStep(0); return; }
      if (!validateStep2()) return;

      const data = new FormData(qwForm);
      ["category", "window_services", "washing_services", "_next"].forEach((k) => data.delete(k));
      data.set("services", selectedServices().join(", "));
      data.set("name", `${$("#first_name").value} ${$("#last_name").value}`.trim());
      data.set("email_optin", $('input[name="email_optin"]').checked ? "yes" : "no");
      if ($("#qw-date-field").hidden) data.delete("preferred_date");
      if ($("#qw-referrer-field").hidden) data.delete("referrer");

      const submitBtn = qwForm.querySelector(".qw-submit");
      const idleLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      try {
        const res = await fetch(qwForm.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.status);
        window.location.href = "thank-you.html";
      } catch (err) {
        showError("#qw-error-2", "Something went wrong sending your request. Please call or text 210-784-6009.");
        submitBtn.disabled = false;
        submitBtn.textContent = idleLabel;
      }
    });
  }
});
