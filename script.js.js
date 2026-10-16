document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress = document.querySelector(".page-progress i");
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = range > 0 ? Math.min(100, (scrollY / range) * 100) + "%" : "100%";
  };
  updateProgress();
  addEventListener("scroll", updateProgress, { passive: true });
  addEventListener("resize", updateProgress, { passive: true });

  const reveals = [...document.querySelectorAll(".reveal")];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(item => item.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(item => observer.observe(item));
  }

  const photo = document.getElementById("friendPhoto");
  const frame = document.querySelector(".photo-frame");
  if (photo && frame) {
    const showPlaceholder = () => frame.classList.add("missing");
    photo.addEventListener("error", showPlaceholder);
    if (photo.complete && !photo.naturalWidth) showPlaceholder();

    if (matchMedia("(pointer:fine)").matches && !reducedMotion) {
      frame.addEventListener("pointermove", event => {
        const rect = frame.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        frame.style.transform = "rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 8) + "deg) translateY(-4px)";
      });
      frame.addEventListener("pointerleave", () => frame.style.transform = "");
    }
  }

  document.querySelectorAll("[data-year]").forEach(item => {
    item.textContent = String(new Date().getFullYear());
  });
});