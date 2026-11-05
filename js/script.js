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
      <h3 id="exit-modal-title">Your $25 Prescription Is Ready</h3>
      <p>Consider this doctor's orders: take $25 off your first Dr. Clean visit. Boerne's best-reviewed exterior care, one estimate away.</p>
      <a href="free-estimate.html" class="btn btn-primary exit-modal-cta">Claim My $25 Off</a>
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
    ".area-wrap", ".diff-wrap",
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
    "<b>&#10010; Rx:</b> $25 off your first visit &mdash; mention it on your free estimate",
    "Boerne's best-reviewed exterior care &mdash; <b>5.0 &#9733; on Google</b>",
  ];
  const group = messages.map((m) => `<span>${m}</span>`).join("");

  const bar = document.createElement("div");
  bar.className = "promo-bar";
  bar.setAttribute("role", "note");
  bar.innerHTML = `<div class="promo-track">${group.repeat(4)}</div>`;
  document.body.insertBefore(bar, document.body.firstChild);
}

function initMobileCta() {
  if (document.body.hasAttribute("data-no-exit-modal")) return;
  if (location.pathname.endsWith("free-estimate.html")) return;

  const bar = document.createElement("div");
  bar.className = "mobile-cta";
  bar.innerHTML = `
    <a href="free-estimate.html" class="btn btn-primary">Free Estimate</a>
    <a href="tel:2107846009" class="btn btn-secondary">Call Now</a>
  `;
  document.body.appendChild(bar);
  document.body.classList.add("has-mobile-cta");
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

  let current = 0;
  let timer;
  const show = (i) => {
    current = i;
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
}

function initTrustStrip() {
  const track = document.querySelector(".trust-strip .trust-track");
  if (track) track.innerHTML = track.innerHTML.repeat(4);
}

document.addEventListener("DOMContentLoaded", () => {
  initPromoBar();
  initMobileCta();
  initTrustStrip();
  initHeroSlides();
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
});
