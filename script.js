document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const pages = [...document.querySelectorAll(".page")];
  const total = pages.length;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const ui = {
    current: document.getElementById("currentPage"), total: document.getElementById("totalPages"),
    progress: document.getElementById("progressBar"), counterProgress: document.getElementById("counterProgress"),
    title: document.getElementById("chapterTitle"), prev: document.getElementById("prevPage"), next: document.getElementById("nextPage"),
    menu: document.getElementById("menu"), menuBtn: document.getElementById("menuBtn"), closeMenu: document.getElementById("closeMenu"), shade: document.getElementById("menuShade")
  };
  let current = 0;
  let changing = false;
  let lastFocus = null;
  let touch = null;

  ui.total.textContent = String(total).padStart(2, "0");

  const updateUI = () => {
    const ratio = ((current + 1) / total) * 100;
    ui.current.textContent = String(current + 1).padStart(2, "0");
    ui.progress.style.width = `${ratio}%`;
    ui.counterProgress.style.width = `${ratio}%`;
    ui.title.textContent = pages[current].dataset.title.toUpperCase();
    ui.prev.disabled = current === 0;
    ui.next.disabled = current === total - 1;
    document.querySelectorAll(".menu-links [data-go]").forEach((button, index) => {
      button.classList.toggle("current", index === current);
      if (index === current) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  };

  const pauseHiddenMedia = activePage => {
    document.querySelectorAll("video").forEach(video => {
      if (!activePage.contains(video) && !video.paused) video.pause();
    });
  };

  const showPage = (target, direction) => {
    if (target < 0 || target >= total || target === current || changing) return;
    changing = true;
    const oldPage = pages[current];
    const newPage = pages[target];
    const forward = direction ? direction === "next" : target > current;

    oldPage.classList.remove("entered");
    oldPage.classList.add(forward ? "previous" : "leaving-right");
    oldPage.classList.remove("active");
    newPage.classList.remove("previous", "leaving-right", "entered");
    newPage.style.transition = "none";
    newPage.style.transform = forward ? "translate3d(100%,0,0)" : "translate3d(-18%,0,0)";
    newPage.classList.add("active");
    newPage.getBoundingClientRect();
    newPage.style.transition = "";
    newPage.style.transform = "";
    current = target;
    newPage.querySelector(".scroll").scrollTop = 0;
    pauseHiddenMedia(newPage);
    updateUI();
    closeNavigation(false);
    requestAnimationFrame(() => newPage.classList.add("entered"));

    setTimeout(() => {
      pages.forEach((page, index) => {
        if (index !== current) page.classList.remove("previous", "leaving-right", "active", "entered");
        page.style.transform = "";
        page.style.transition = "";
      });
      changing = false;
    }, reduceMotion ? 30 : 820);
  };

  const nextPage = () => showPage(current + 1, "next");
  const previousPage = () => showPage(current - 1, "prev");
  document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", nextPage));
  document.querySelectorAll("[data-prev]").forEach(button => button.addEventListener("click", previousPage));
  document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => {
    const target = Number(button.dataset.go);
    if (target === current) { closeNavigation(); return; }
    showPage(target);
  }));

  const openNavigation = () => {
    lastFocus = document.activeElement;
    ui.menu.classList.add("open"); ui.shade.classList.add("open");
    ui.menu.setAttribute("aria-hidden", "false"); ui.menuBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("modal-open");
    setTimeout(() => ui.closeMenu.focus(), 100);
  };
  function closeNavigation(restore = true) {
    ui.menu.classList.remove("open"); ui.shade.classList.remove("open");
    ui.menu.setAttribute("aria-hidden", "true"); ui.menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("modal-open");
    if (restore && lastFocus) lastFocus.focus();
  }
  ui.menuBtn.addEventListener("click", openNavigation);
  ui.closeMenu.addEventListener("click", () => closeNavigation());
  ui.shade.addEventListener("click", () => closeNavigation());

  // Horizontal intent must be decisive; vertical touch remains native page scrolling.
  document.addEventListener("touchstart", event => {
    if (event.touches.length !== 1 || event.target.closest("video,.lightbox,.menu")) return;
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, time: performance.now() };
  }, { passive: true });
  document.addEventListener("touchend", event => {
    if (!touch || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    const elapsed = performance.now() - touch.time;
    touch = null;
    if (elapsed < 900 && Math.abs(dx) > 78 && Math.abs(dx) > Math.abs(dy) * 1.55) dx < 0 ? nextPage() : previousPage();
  }, { passive: true });

  // Keyboard chapter navigation never captures typing or media controls.
  document.addEventListener("keydown", event => {
    const tag = event.target.tagName;
    if (["INPUT", "TEXTAREA", "SELECT", "VIDEO"].includes(tag)) return;
    if (lightbox.classList.contains("open")) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") changePhoto(-1);
      if (event.key === "ArrowRight") changePhoto(1);
      return;
    }
    if (ui.menu.classList.contains("open")) {
      if (event.key === "Escape") closeNavigation();
      return;
    }
    if (event.key === "ArrowRight") nextPage();
    if (event.key === "ArrowLeft") previousPage();
  });

  // Interest readout.
  const interests = {
    technology: ["01 / TECHNOLOGY", "Computers, software, websites and discovering what technology can actually do."],
    gaming: ["02 / GAMING", "Minecraft and other games are not only entertainment; they inspire creativity and experimentation."],
    cars: ["03 / CARS", "Performance, design and the feeling of being behind the wheel are things I genuinely enjoy."],
    spiderman: ["04 / SPIDER-MAN", "Among all characters, Spider-Man is my favourite — for his personality, responsibility and determination."],
    creative: ["05 / CREATIVE PROJECTS", "Turning an idea into something visible, useful and real is one of the best ways I learn."]
  };
  const interestLabel = document.getElementById("interestLabel");
  const interestText = document.getElementById("interestText");
  document.querySelectorAll(".interest-node").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".interest-node").forEach(node => node.classList.remove("active"));
    button.classList.add("active");
    const [label, copy] = interests[button.dataset.interest];
    interestLabel.textContent = label; interestText.textContent = copy;
    interestText.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 330, easing: "ease-out" });
  }));

  // Accessible editorial lightbox.
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxCounter = document.getElementById("lightboxCounter");
  const photoButtons = [...document.querySelectorAll(".gallery [data-photo]")];
  let activePhoto = 0;
  const renderPhoto = () => {
    const source = photoButtons[activePhoto].querySelector("img");
    lightboxImg.src = source.currentSrc || source.src;
    lightboxImg.alt = source.alt;
    lightboxCaption.textContent = photoButtons[activePhoto].querySelector("span").textContent.trim();
    lightboxCounter.textContent = `${String(activePhoto + 1).padStart(2, "0")} / ${String(photoButtons.length).padStart(2, "0")}`;
  };
  const openLightbox = index => {
    lastFocus = document.activeElement; activePhoto = index; renderPhoto();
    lightbox.classList.add("open"); lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.getElementById("closeLightbox").focus();
  };
  function closeLightbox() {
    lightbox.classList.remove("open"); lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open"); lightboxImg.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }
  function changePhoto(delta) { activePhoto = (activePhoto + delta + photoButtons.length) % photoButtons.length; renderPhoto(); }
  photoButtons.forEach((button, index) => button.addEventListener("click", () => openLightbox(index)));
  document.getElementById("closeLightbox").addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", () => changePhoto(-1));
  document.getElementById("lightboxNext").addEventListener("click", () => changePhoto(1));
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });

  // Subtle desktop-only depth and magnetic response.
  if (finePointer && !reduceMotion) {
    const cursor = document.getElementById("cursor");
    window.addEventListener("pointermove", event => {
      cursor.classList.add("show");
      cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`;
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
      const px = (event.clientX / innerWidth - .5) * 16;
      const py = (event.clientY / innerHeight - .5) * 16;
      pages[current].querySelectorAll(".parallax").forEach(item => item.style.translate = `${px}px ${py}px`);
    }, { passive: true });
    document.querySelectorAll(".magnetic").forEach(element => {
      element.addEventListener("pointermove", event => {
        const rect = element.getBoundingClientRect();
        element.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .15}px,${(event.clientY - rect.top - rect.height / 2) * .15}px)`;
      });
      element.addEventListener("pointerleave", () => element.style.transform = "");
    });
    document.querySelectorAll(".tilt").forEach(element => {
      element.addEventListener("pointermove", event => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        element.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      element.addEventListener("pointerleave", () => element.style.transform = "");
    });
  }

  // Broken assets remain visible as an explicit diagnostic instead of collapsing layout.
  document.querySelectorAll("img,video").forEach(media => media.addEventListener("error", () => {
    media.closest("button,figure,.video-frame")?.classList.add("asset-error");
  }));

  updateUI();
  requestAnimationFrame(() => pages[0].classList.add("entered"));
  const hideLoader = () => document.getElementById("loader").classList.add("hide");
  if (document.readyState === "complete") setTimeout(hideLoader, reduceMotion ? 0 : 120);
  else window.addEventListener("load", () => setTimeout(hideLoader, reduceMotion ? 0 : 120), { once: true });
  setTimeout(hideLoader, 1200);
});
