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
}

document.addEventListener("DOMContentLoaded", () => {
  initExitIntent();

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
  if (testimonialGrid && googleReviews.length > 3) {
    const cards = Array.from(testimonialGrid.querySelectorAll(".testimonial-card"));
    let offset = 3;

    setInterval(() => {
      cards.forEach((card) => card.classList.add("fade"));

      setTimeout(() => {
        cards.forEach((card, i) => {
          const review = googleReviews[(offset + i) % googleReviews.length];
          card.querySelector("p").innerHTML = `&ldquo;${review.text}&rdquo;`;
          card.querySelector(".testimonial-name").textContent = `${review.name} — Google review`;
          card.classList.remove("fade");
        });
        offset = (offset + 3) % googleReviews.length;
      }, 350);
    }, 12000);
  }
});
