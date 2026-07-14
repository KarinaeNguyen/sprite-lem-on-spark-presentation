const sections = [...document.querySelectorAll("main .panel")];
const sectionProgressLinks = [...document.querySelectorAll(".section-progress .progress-link")];
const mobileProgressLinks = [...document.querySelectorAll(".mobile-progress-link")];
const navLinks = [...sectionProgressLinks, ...mobileProgressLinks];
const progressFill = document.querySelector("#progress-fill");
const sectionProgress = document.querySelector(".section-progress");
const mobileProgressToggle = document.querySelector(".mobile-progress-toggle");
const mobileProgressMenu = document.querySelector("#mobile-progress-menu");
const sunScrubber = document.querySelector("[data-sun-scrubber]");
const sunTrack = document.querySelector("[data-sun-track]");
const sunLabel = document.querySelector("[data-sun-label]");
const demoToggle = document.querySelector(".demo-toggle");
const revealItems = [...document.querySelectorAll(".reveal")];
const timeline = document.querySelector(".timeline");
const chartBlocks = [...document.querySelectorAll(".chart-animate")];
const sparkleLayer = document.querySelector(".sparkle-layer");
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const canAnimateCursor = !prefersReducedMotion && !isCoarsePointer;
const sectionLabelMap = new Map(
  sectionProgressLinks.map((link) => [
    (link.getAttribute("href") || "").replace("#", ""),
    (link.querySelector(".progress-text")?.textContent || link.textContent || "").trim(),
  ])
);
let isSunDragging = false;

const closeMobileProgressMenu = () => {
  if (!mobileProgressMenu || !mobileProgressToggle) {
    return;
  }

  mobileProgressMenu.hidden = true;
  mobileProgressToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("mobile-menu-open");
};

const openMobileProgressMenu = () => {
  if (!mobileProgressMenu || !mobileProgressToggle) {
    return;
  }

  mobileProgressMenu.hidden = false;
  mobileProgressToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("mobile-menu-open");
};

const syncProgressNavMode = () => {
  const isCompact = window.innerWidth <= 980;
  document.body.classList.toggle("compact-progress-nav", isCompact);

  if (sunScrubber) {
    sunScrubber.hidden = !isCompact;
  }

  if (isCompact) {
    sectionProgress?.style.setProperty("display", "none", "important");
    mobileProgressToggle?.style.setProperty("display", "none", "important");
    mobileProgressMenu?.style.setProperty("display", "none", "important");
    closeMobileProgressMenu();
    return;
  }

  sectionProgress?.style.removeProperty("display");
  mobileProgressToggle?.style.setProperty("display", "none", "important");
  mobileProgressMenu?.style.setProperty("display", "none", "important");

  if (!isCompact) {
    closeMobileProgressMenu();
  }
};

const setProgressFillRatio = (ratio) => {
  if (!progressFill) {
    return;
  }

  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  progressFill.style.height = `${(clampedRatio * 100).toFixed(2)}%`;
};

const setSunProgressRatio = (ratio) => {
  if (!sunTrack) {
    return;
  }

  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  sunTrack.style.setProperty("--sun-progress", clampedRatio.toFixed(4));
};

const getSectionDisplayName = (sectionId) => {
  if (!sectionId) {
    return "";
  }

  const fromMap = sectionLabelMap.get(sectionId);
  if (fromMap) {
    return fromMap;
  }

  const section = document.getElementById(sectionId);
  if (!section) {
    return sectionId;
  }

  const title = section.querySelector(".section-title") || section.querySelector(".hero-title");
  if (title?.textContent?.trim()) {
    return title.textContent.trim();
  }

  return sectionId;
};

const promotePrefixHeadlines = () => {
  const candidates = [
    ...document.querySelectorAll(".bullet-list li"),
    ...document.querySelectorAll(".glass-card p"),
    ...document.querySelectorAll(".pillar p"),
    ...document.querySelectorAll(".milestone p"),
    ...document.querySelectorAll(".lead.compact"),
  ];

  const prefixPattern = /^([^:]{3,90}):\s*(.+)$/;

  candidates.forEach((node) => {
    if (node.dataset.prefixDone === "1") {
      return;
    }

    if (node.closest("[data-no-prefix='1']")) {
      return;
    }

    const text = node.textContent?.trim();
    if (!text) {
      return;
    }

    const match = text.match(prefixPattern);
    if (!match) {
      return;
    }

    const [, rawPrefix, rawRest] = match;
    const prefix = rawPrefix.trim();
    const rest = rawRest.trim();

    if (prefix.length < 3 || rest.length < 2) {
      return;
    }

    const head = document.createElement("span");
    head.className = "line-head";
    head.textContent = `${prefix}:`;

    node.textContent = "";
    node.appendChild(head);
    node.append(rest);
    node.dataset.prefixDone = "1";
  });
};

promotePrefixHeadlines();

const createSparkles = () => {
  if (!sparkleLayer || prefersReducedMotion) {
    return;
  }

  if (window.innerWidth <= 980) {
    return;
  }

  const totalSparkles = window.innerWidth < 1200 ? 14 : 20;

  for (let i = 0; i < totalSparkles; i += 1) {
    const spark = document.createElement("span");
    const size = (Math.random() * 3 + 1.2).toFixed(2);
    const left = (Math.random() * 100).toFixed(2);
    const top = (Math.random() * 100).toFixed(2);
    const delay = (Math.random() * 5).toFixed(2);
    const duration = (Math.random() * 3 + 2.2).toFixed(2);

    spark.className = "spark";
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${left}%`;
    spark.style.top = `${top}%`;
    spark.style.animationDelay = `${delay}s`;
    spark.style.animationDuration = `${duration}s`;

    sparkleLayer.appendChild(spark);
  }
};

createSparkles();

if (canAnimateCursor) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let rafId = null;
  let idleTimerId = null;
  let isCursorRunning = false;

  const renderCursorGradient = () => {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;

    const x = (currentX / window.innerWidth) * 100;
    const y = (currentY / window.innerHeight) * 100;

    root.style.setProperty("--mx", `${x.toFixed(2)}%`);
    root.style.setProperty("--my", `${y.toFixed(2)}%`);

    if (isCursorRunning) {
      rafId = requestAnimationFrame(renderCursorGradient);
    }
  };

  root.style.setProperty("--cursor-strength", "0.55");

  const stopGradient = () => {
    isCursorRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const scheduleIdleStop = () => {
    if (idleTimerId) {
      clearTimeout(idleTimerId);
    }

    idleTimerId = window.setTimeout(() => {
      root.style.setProperty("--cursor-strength", "0.5");
      stopGradient();
    }, 150);
  };

  const startGradient = () => {
    root.style.setProperty("--cursor-strength", "1");
    if (!isCursorRunning) {
      isCursorRunning = true;
      rafId = requestAnimationFrame(renderCursorGradient);
    }
  };

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    startGradient();
    scheduleIdleStop();
  });

  window.addEventListener("mouseenter", () => {
    startGradient();
    scheduleIdleStop();
  });

  window.addEventListener("mouseleave", () => {
    if (idleTimerId) {
      clearTimeout(idleTimerId);
    }
    root.style.setProperty("--cursor-strength", "0.35");
    stopGradient();
  });
} else {
  root.style.setProperty("--cursor-strength", "0");
}

const setActiveNav = (id) => {
  navLinks.forEach((dot) => {
    dot.classList.toggle("is-active", dot.getAttribute("href") === `#${id}`);
  });
};

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId) {
      setActiveNav(targetId);
    }

    closeMobileProgressMenu();
  });
});

const updateProgressFill = () => {
  if (!progressFill) {
    return;
  }

  const scroller = document.scrollingElement || document.documentElement;
  const scrollTop = scroller?.scrollTop || window.scrollY || window.pageYOffset || 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (maxScroll <= 0) {
    setProgressFillRatio(0);
    return;
  }

  setProgressFillRatio(scrollTop / maxScroll);
};

const getCurrentSectionId = () => {
  if (sections.length === 0) {
    return "";
  }

  const viewportAnchor = window.innerHeight * 0.45;
  let bestSection = sections[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top - viewportAnchor);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestSection = section;
    }
  });

  return bestSection.id;
};

const updateActiveNavByViewport = () => {
  const id = getCurrentSectionId();
  if (!id) {
    return;
  }

  setActiveNav(id);
};

const updateSunScrubber = () => {
  if (!sunTrack || !sunLabel) {
    return;
  }

  const scroller = document.scrollingElement || document.documentElement;
  const scrollTop = scroller?.scrollTop || window.scrollY || window.pageYOffset || 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;

  setSunProgressRatio(ratio);

  const currentId = getCurrentSectionId();
  if (!currentId) {
    return;
  }

  sunLabel.textContent = getSectionDisplayName(currentId);
};

const scrubScrollToClientX = (clientX) => {
  if (!sunTrack) {
    return;
  }

  const rect = sunTrack.getBoundingClientRect();
  const ratio = (clientX - rect.left) / rect.width;
  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
  const scroller = document.scrollingElement || document.documentElement;

  scroller.scrollTop = maxScroll * clampedRatio;
  setSunProgressRatio(clampedRatio);
  updateSunScrubber();
};

const setupSunScrubber = () => {
  if (!sunTrack || !sunScrubber) {
    return;
  }

  const endSunDrag = () => {
    if (!isSunDragging) {
      return;
    }

    isSunDragging = false;
    sunScrubber.classList.remove("is-active");
  };

  sunTrack.addEventListener("pointerdown", (event) => {
    if (window.innerWidth > 980) {
      return;
    }

    isSunDragging = true;
    sunScrubber.classList.add("is-active");
    sunTrack.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    scrubScrollToClientX(event.clientX);
  });

  window.addEventListener("pointermove", (event) => {
    if (!isSunDragging) {
      return;
    }

    event.preventDefault();
    scrubScrollToClientX(event.clientX);
  });

  window.addEventListener("pointerup", endSunDrag);
  window.addEventListener("pointercancel", endSunDrag);
};

let progressRafId = null;

const requestProgressFillUpdate = () => {
  updateProgressFill();
  updateActiveNavByViewport();
  updateSunScrubber();

  if (typeof requestAnimationFrame !== "function") {
    return;
  }

  if (progressRafId) {
    return;
  }

  progressRafId = requestAnimationFrame(() => {
    progressRafId = null;
    updateProgressFill();
    updateActiveNavByViewport();
    updateSunScrubber();
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
        requestProgressFillUpdate();
      }
    });
  },
  {
    threshold: 0.45,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

if (mobileProgressToggle && mobileProgressMenu) {
  mobileProgressToggle.addEventListener("click", () => {
    const isOpen = mobileProgressToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMobileProgressMenu();
    } else {
      openMobileProgressMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      mobileProgressMenu.hidden ||
      mobileProgressMenu.contains(event.target) ||
      mobileProgressToggle.contains(event.target)
    ) {
      return;
    }

    closeMobileProgressMenu();
  });
}

syncProgressNavMode();
setupSunScrubber();

if (demoToggle) {
  const params = new URLSearchParams(window.location.search);
  const demoFromUrl = params.get("demo") === "1";
  const demoFromStorage = window.localStorage.getItem("spriteDeckDemoMode") === "1";
  const shouldEnableDemo = demoFromUrl || demoFromStorage;

  const setDemoMode = (enabled) => {
    document.body.classList.toggle("demo-mode", enabled);
    demoToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    window.localStorage.setItem("spriteDeckDemoMode", enabled ? "1" : "0");

    const url = new URL(window.location.href);
    if (enabled) {
      url.searchParams.set("demo", "1");
    } else {
      url.searchParams.delete("demo");
    }

    window.history.replaceState({}, "", url.toString());
  };

  setDemoMode(shouldEnableDemo);

  demoToggle.addEventListener("click", () => {
    const next = demoToggle.getAttribute("aria-pressed") !== "true";
    setDemoMode(next);
  });
}

window.addEventListener("scroll", requestProgressFillUpdate, { passive: true });
window.addEventListener("resize", () => {
  syncProgressNavMode();
  requestProgressFillUpdate();
});
window.addEventListener("hashchange", () => {
  const hashId = window.location.hash.replace("#", "");
  if (hashId) {
    setActiveNav(hashId);
  }

  requestProgressFillUpdate();
});
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    requestProgressFillUpdate();
  }
});

requestProgressFillUpdate();

const initialHashId = window.location.hash.replace("#", "");
if (initialHashId) {
  setActiveNav(initialHashId);
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -8% 0px",
  }
);

if (isCoarsePointer) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  revealItems.forEach((item) => revealObserver.observe(item));
}

if (timeline) {
  const timelineObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        timeline.classList.add("is-live");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.35,
    }
  );

  timelineObserver.observe(timeline);
}

const formatCompactNumber = (value) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }

  return `${value}`;
};

const animateCounter = (counter) => {
  const target = Number(counter.dataset.target || 0);
  const suffix = counter.dataset.suffix || "";
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    counter.textContent = `${formatCompactNumber(value)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const counters = [...document.querySelectorAll(".counter")];

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.5,
  }
);

counters.forEach((counter) => counterObserver.observe(counter));

chartBlocks.forEach((chart) => {
  chart.querySelectorAll(".mix-fill").forEach((bar) => {
    bar.style.setProperty("--bar", bar.dataset.bar || "0");
  });
});

const chartObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-live");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.35,
  }
);

chartBlocks.forEach((chart) => chartObserver.observe(chart));

const setupJourney = () => {
  const shell = document.querySelector("[data-journey]");
  if (!shell) {
    return;
  }

  const track = shell.querySelector(".journey-track");
  const phases = [...shell.querySelectorAll(".journey-phase")];
  const prevBtn = shell.querySelector(".journey-nav.prev");
  const nextBtn = shell.querySelector(".journey-nav.next");
  const dots = [...document.querySelectorAll(".journey-dot")];

  if (!track || phases.length === 0) {
    return;
  }

  let index = 0;

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    phases.forEach((phase, i) => {
      phase.classList.toggle("is-active", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
  };

  prevBtn?.addEventListener("click", () => {
    index = (index - 1 + phases.length) % phases.length;
    render();
  });

  nextBtn?.addEventListener("click", () => {
    index = (index + 1) % phases.length;
    render();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      index = i;
      render();
    });
  });

  render();
};

setupJourney();
