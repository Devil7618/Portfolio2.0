document.addEventListener("DOMContentLoaded", () => {

  const pages = [...document.querySelectorAll(".page")];
  const total = pages.length;

  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const progressBar = document.getElementById("progressBar");

  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menuBtn");
  const closeMenu = document.getElementById("closeMenu");

  let current = 0;
  let changing = false;

  totalPages.textContent = String(total).padStart(2, "0");

  function updateUI() {
    currentPage.textContent = String(current + 1).padStart(2, "0");

    const progress = ((current + 1) / total) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function showPage(target, direction = "next") {

    if (target < 0 || target >= total || target === current || changing) {
      return;
    }

    changing = true;

    const oldPage = pages[current];
    const newPage = pages[target];

    pages.forEach(page => {
      page.classList.remove("active", "previous");
    });

    if (direction === "next") {
      oldPage.classList.add("previous");
      newPage.style.transform = "translateX(100%)";
    } else {
      oldPage.style.transform = "translateX(100%)";
      newPage.style.transform = "translateX(-100%)";
    }

    newPage.classList.add("active");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newPage.style.transform = "translateX(0)";
      });
    });

    current = target;
    updateUI();

    closeNavigation();

    setTimeout(() => {
      pages.forEach(page => {
        page.style.transform = "";
      });

      changing = false;
    }, 700);
  }

  function nextPage() {
    if (current < total - 1) {
      showPage(current + 1, "next");
    }
  }

  function previousPage() {
    if (current > 0) {
      showPage(current - 1, "prev");
    }
  }

  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", nextPage);
  });

  document.querySelectorAll("[data-prev]").forEach(button => {
    button.addEventListener("click", previousPage);
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      const target = Number(button.dataset.go);

      if (target > current) {
        showPage(target, "next");
      } else {
        showPage(target, "prev");
      }
    });
  });

  menuBtn.addEventListener("click", () => {
    menu.classList.add("open");
  });

  closeMenu.addEventListener("click", closeNavigation);

  function closeNavigation() {
    menu.classList.remove("open");
  }

  // Keyboard navigation
  document.addEventListener("keydown", event => {

    if (event.key === "ArrowRight") {
      nextPage();
    }

    if (event.key === "ArrowLeft") {
      previousPage();
    }

    if (event.key === "Escape") {
      closeNavigation();
      closeLightbox();
    }
  });


  // Mobile / touch swipe
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener("touchstart", event => {
    if (event.touches.length !== 1) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", event => {

    if (event.changedTouches.length !== 1) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    const horizontal = Math.abs(dx);
    const vertical = Math.abs(dy);

    // Only horizontal swipes change pages.
    // Vertical swipes remain normal scrolling.
    if (horizontal > 70 && horizontal > vertical * 1.25) {

      if (dx < 0) {
        nextPage();
      } else {
        previousPage();
      }
    }

  }, { passive: true });


  // Photo lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeLightboxButton = document.getElementById("closeLightbox");

  document.querySelectorAll(".photo-card img").forEach(img => {

    img.parentElement.addEventListener("click", event => {
      event.stopPropagation();

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;

      lightbox.classList.add("show");
      document.body.style.overflow = "hidden";
    });

  });

  function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
  }

  closeLightboxButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });


  // Missing image handling
  document.querySelectorAll("img").forEach(img => {

    img.addEventListener("error", () => {

      img.style.opacity = "0";

      const parent = img.closest(".photo-card, .spider-frame");

      if (parent && !parent.querySelector(".missing-image")) {

        const message = document.createElement("div");
        message.className = "missing-image";
        message.textContent = "ADD IMAGE";

        message.style.position = "absolute";
        message.style.inset = "0";
        message.style.display = "grid";
        message.style.placeItems = "center";
        message.style.color = "#77717f";
        message.style.fontSize = "10px";
        message.style.fontWeight = "800";
        message.style.letterSpacing = "3px";

        parent.appendChild(message);
      }

    });

  });


  // Loader
  const loader = document.getElementById("loader");
  const loaderName = document.getElementById("loaderName");

  const name = "Malik Abdul Moiz";
  let index = 0;

  function typeName() {

    if (index <= name.length) {

      loaderName.textContent = name.slice(0, index);
      index++;

      setTimeout(typeName, 65);

    }

  }

  typeName();

  function hideLoader() {
    loader.classList.add("hide");
  }

  setTimeout(hideLoader, 1500);

  // Absolute fallback
  setTimeout(hideLoader, 3000);

  updateUI();

});