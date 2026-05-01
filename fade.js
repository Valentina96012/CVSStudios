document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     FADE TEXT ON SCROLL
  ========================= */

  const fadeElements = document.querySelectorAll(".fade-text");

  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px 0px 0px"
      }
    );

    fadeElements.forEach((element) => {
      fadeObserver.observe(element);
    });

    setTimeout(() => {
      fadeElements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        const isVisible =
          rect.top < window.innerHeight &&
          rect.bottom > 0;

        if (isVisible && !element.classList.contains("visible")) {
          element.classList.add("visible");
          fadeObserver.unobserve(element);
        }
      });
    }, 300);
  }

  /* =========================
     IMAGE OVERLAY
  ========================= */

  const clickableImages = document.querySelectorAll(".img-frame img");

  const overlay = document.querySelector(".img-overlay");
  const overlayClose = document.querySelector(".overlay-close");

  const overlayImg = document.querySelector(".overlay-img");
  const overlayTitle = document.querySelector(".overlay-title");
  const overlayDimensions = document.querySelector(".overlay-dimensions");
  const overlayPrice = document.querySelector(".overlay-price");

  const overlayExists =
    overlay &&
    overlayClose &&
    overlayImg &&
    overlayTitle &&
    overlayDimensions &&
    overlayPrice;

  if (clickableImages.length > 0 && overlayExists) {
    clickableImages.forEach((image) => {
      image.addEventListener("click", () => {
        const imgSrc = image.getAttribute("src");
        const imgAlt = image.getAttribute("alt");

        const title = image.dataset.title || imgAlt || "Untitled artwork";
        const dimensions =
          image.dataset.dimensions || "Dimensions available on request";
        const price = image.dataset.price || "Price available on request";

        overlayImg.src = imgSrc;
        overlayImg.alt = imgAlt || title;

        overlayTitle.textContent = title;
        overlayDimensions.textContent = dimensions;
        overlayPrice.textContent = price;

        overlay.classList.add("active");
        document.body.classList.add("no-scroll");
      });
    });

    function closeOverlay() {
      overlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }

    overlayClose.addEventListener("click", closeOverlay);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("active")) {
        closeOverlay();
      }
    });
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav");

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");

    navToggle.classList.toggle("is-hidden", isOpen);

    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  // Close menu when clicking a link
  navMenu.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-hidden");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  // Close menu with Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-hidden");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    const clickedInsideNav = navMenu.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-hidden");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    }
  });
});