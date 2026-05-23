const tabButtons = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".tab-panel");
const faqItems = document.querySelectorAll(".faq-item");
const navLinks = document.querySelectorAll("[data-nav-link]");
const langToggleButtons = document.querySelectorAll("[data-lang-toggle]");
const scrollProgress = document.querySelector(".scroll-progress span");
const backToTop = document.querySelector(".back-to-top");
const toast = document.getElementById("toast");
const pageKey = document.body?.dataset.page || "index";

function getLanguage() {
  const stored = localStorage.getItem("pu-lang");
  return stored === "en" ? "en" : "zh";
}

function applyLanguage(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";

  document.querySelectorAll("[data-zh][data-en]").forEach((el) => {
    el.textContent = lang === "en" ? el.dataset.en : el.dataset.zh;
  });

  langToggleButtons.forEach((button) => {
    button.textContent = lang === "en" ? "中" : "EN";
  });
}

function setLanguage(lang) {
  localStorage.setItem("pu-lang", lang);
  applyLanguage(lang);
}

applyLanguage(getLanguage());

langToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = getLanguage() === "zh" ? "en" : "zh";
    setLanguage(next);
  });
});

navLinks.forEach((link) => {
  const isActive = link.dataset.nav === pageKey;
  link.classList.toggle("active", isActive);
});

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;

    tabButtons.forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === target);
    });
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    const lang = getLanguage();

    try {
      await navigator.clipboard.writeText(value);
      showToast(lang === "en" ? `Copied: ${value.slice(0, 10)}...` : `已复制：${value.slice(0, 10)}...`);
    } catch (error) {
      showToast(lang === "en" ? "Copy failed, please copy manually" : "复制失败，请手动复制地址");
    }
  });
});

faqItems.forEach((item) => {
  item.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    faqItems.forEach((otherItem) => {
      otherItem.classList.remove("active");
    });

    if (!isActive) {
      item.classList.add("active");
    }
  });
});

window.addEventListener("load", () => {
  const sparkline = document.querySelector(".sparkline-line");
  if (sparkline) {
    sparkline.style.animationDelay = "150ms";
  }
});

function updateScrollUI() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min((scrollTop / maxScroll) * 100, 100);

  if (scrollProgress) {
    scrollProgress.style.width = `${progress}%`;
  }

  if (backToTop) {
    backToTop.classList.toggle("show", scrollTop > 600);
  }
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const navTargets = ["overview", "issuance", "market", "faq", "links"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const hashNavLinks = Array.from(navLinks).filter((link) => (link.getAttribute("href") || "").startsWith("#"));

if (navTargets.length && hashNavLinks.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      hashNavLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        const isActive = href === `#${visible.target.id}`;
        link.classList.toggle("active", isActive);
      });
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75],
    }
  );

  navTargets.forEach((section) => navObserver.observe(section));
}
