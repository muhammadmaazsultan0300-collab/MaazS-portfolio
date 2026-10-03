// ============================================================
// Scroll reveal — sections fade + slide into view as visitor scrolls
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var revealEls = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
});

// ============================================================
// Auto-crossfade thumbnails — any project/portfolio thumb with
// more than one .thumb-img cycles between them automatically.
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  var thumbs = document.querySelectorAll(".project-thumb, .portfolio-thumb");
  thumbs.forEach(function (thumb) {
    var imgs = thumb.querySelectorAll(".thumb-img");
    if (imgs.length <= 1) return;

    var idx = 0;
    setInterval(function () {
      imgs[idx].classList.remove("is-active");
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add("is-active");
    }, 2800);
  });
});

// ============================================================
// Filter tabs (Work page) — smooth re-filter with staggered reveal
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("portfolioGrid");
  var tabsWrap = document.getElementById("filterTabs");
  if (!grid || !tabsWrap) return;

  var tabs = tabsWrap.querySelectorAll(".tab-btn");
  var cards = grid.querySelectorAll(".portfolio-card[data-category]");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealVisibleCards() {
    var visible = Array.prototype.filter.call(cards, function (c) {
      return !c.classList.contains("is-hidden");
    });
    visible.forEach(function (card, i) {
      card.classList.remove("is-visible");
      void card.offsetWidth; // restart the transition
      var delay = prefersReducedMotion ? 0 : i * 70;
      setTimeout(function () {
        card.classList.add("is-visible");
      }, delay);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      var filter = tab.getAttribute("data-filter");
      cards.forEach(function (card) {
        if (card.getAttribute("data-category") === filter) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
          card.classList.remove("is-visible");
        }
      });
      revealVisibleCards();
    });
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          revealVisibleCards();
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(grid);
  } else {
    revealVisibleCards();
  }
});

// ============================================================
// Shared "Details" lightbox — works for any .project-card or
// .portfolio-card with a .details-btn inside it, on any page.
// Reads: the card's <h3> (title), data-full-desc, data-tech
// (comma-separated, optional), the thumb's .thumb-tag/.thumb-cat
// text, and all .thumb-img elements inside the card's thumb (for
// a manual gallery) — or falls back to a .thumb-fill icon block
// when there are no images.
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  var mediaEl = document.getElementById("lightboxMedia");
  var catEl = document.getElementById("lightboxCat");
  var titleEl = document.getElementById("lightboxTitle");
  var descEl = document.getElementById("lightboxDesc");
  var techEl = document.getElementById("lightboxTech");
  var closeBtn = document.getElementById("lightboxClose");
  var prevBtn = document.getElementById("lightboxPrev");
  var nextBtn = document.getElementById("lightboxNext");
  var countEl = document.getElementById("lightboxCount");

  var currentImages = [];
  var currentIndex = 0;
  var lastFocused = null;

  function renderImage() {
    if (!currentImages.length) return;
    mediaEl.innerHTML = '<img src="' + currentImages[currentIndex] + '" alt="" class="lightbox-img">';
    if (currentImages.length > 1) {
      countEl.textContent = (currentIndex + 1) + " / " + currentImages.length;
      countEl.style.display = "";
      prevBtn.style.display = "";
      nextBtn.style.display = "";
    } else {
      countEl.style.display = "none";
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  }

  function openLightboxFromCard(card) {
    var thumb = card.querySelector(".project-thumb, .portfolio-thumb");
    var imgs = thumb ? thumb.querySelectorAll(".thumb-img") : [];
    currentImages = Array.prototype.map.call(imgs, function (img) {
      return img.getAttribute("src");
    });
    currentIndex = 0;

    var tagEl = thumb ? thumb.querySelector(".thumb-tag, .thumb-cat") : null;
    catEl.textContent = tagEl ? tagEl.textContent : "";

    var h3 = card.querySelector("h3");
    titleEl.textContent = h3 ? h3.textContent : "";
    descEl.textContent = card.getAttribute("data-full-desc") || "";

    var techAttr = card.getAttribute("data-tech");
    techEl.innerHTML = "";
    if (techAttr) {
      techAttr.split(",").forEach(function (t) {
        var span = document.createElement("span");
        span.className = "tech-chip";
        span.textContent = t.trim();
        techEl.appendChild(span);
      });
      techEl.style.display = "";
    } else {
      techEl.style.display = "none";
    }

    if (currentImages.length) {
      renderImage();
    } else {
      var fallback = thumb ? thumb.querySelector(".thumb-fill") : null;
      mediaEl.innerHTML = fallback ? fallback.outerHTML : "";
      countEl.style.display = "none";
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }

    lastFocused = document.activeElement;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeLightboxFn() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".details-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var card = btn.closest(".project-card, .portfolio-card");
      if (card) openLightboxFromCard(card);
    });
  });

  closeBtn.addEventListener("click", closeLightboxFn);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightboxFn();
  });
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (!currentImages.length) return;
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      renderImage();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!currentImages.length) return;
      currentIndex = (currentIndex + 1) % currentImages.length;
      renderImage();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightboxFn();
    if (e.key === "ArrowRight" && currentImages.length > 1) {
      currentIndex = (currentIndex + 1) % currentImages.length;
      renderImage();
    }
    if (e.key === "ArrowLeft" && currentImages.length > 1) {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      renderImage();
    }
  });
});

// ============================================================
// Contact page — builds a wa.me link from the form fields
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contactForm");
  if (!form) return;

  var WHATSAPP_NUMBER = "923284727047"; // digits only, country code first

  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var messageInput = document.getElementById("message");
  var sendBtn = document.getElementById("sendWhatsapp");

  function updateState() {
    var ready = nameInput.value.trim() && messageInput.value.trim();
    sendBtn.classList.toggle("btn-disabled", !ready);
  }

  [nameInput, messageInput].forEach(function (el) {
    el.addEventListener("input", updateState);
  });
  updateState();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ready = nameInput.value.trim() && messageInput.value.trim();
    if (!ready) return;

    var lines = [
      "Hi, I'm " + nameInput.value.trim() + ".",
    ];
    if (emailInput.value.trim()) lines.push("My email: " + emailInput.value.trim());
    lines.push("");
    lines.push(messageInput.value.trim());

    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    window.open(url, "_blank", "noopener,noreferrer");
  });
});

// ============================================================
// Theme (light/dark glass) — applied immediately in <head> to
// avoid a flash; this just wires up the toggle button.
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  toggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    var next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* localStorage unavailable — theme just won't persist */
    }
  });
});

// ============================================================
// Mobile nav toggle
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");

  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    header.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
});
