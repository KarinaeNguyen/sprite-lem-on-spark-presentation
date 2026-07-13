const sections = [...document.querySelectorAll("main .panel")];
const navDots = [...document.querySelectorAll(".scroll-nav .nav-dot")];
const revealItems = [...document.querySelectorAll(".reveal")];
const timeline = document.querySelector(".timeline");
const chartBlocks = [...document.querySelectorAll(".chart-animate")];
const sparkleLayer = document.querySelector(".sparkle-layer");
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const canAnimateCursor = !prefersReducedMotion && !isCoarsePointer;

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

  const totalSparkles = window.innerWidth < 700 ? 10 : 22;

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

  const renderCursorGradient = () => {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;

    const x = (currentX / window.innerWidth) * 100;
    const y = (currentY / window.innerHeight) * 100;

    root.style.setProperty("--mx", `${x.toFixed(2)}%`);
    root.style.setProperty("--my", `${y.toFixed(2)}%`);

    rafId = requestAnimationFrame(renderCursorGradient);
  };

  root.style.setProperty("--cursor-strength", "0.55");

  const startGradient = () => {
    root.style.setProperty("--cursor-strength", "1");
    if (!rafId) {
      rafId = requestAnimationFrame(renderCursorGradient);
    }
  };

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    startGradient();
  });

  window.addEventListener("mouseenter", startGradient);

  window.addEventListener("mouseleave", () => {
    root.style.setProperty("--cursor-strength", "0.35");
  });

  startGradient();
} else {
  root.style.setProperty("--cursor-strength", "0");
}

const setActiveNav = (id) => {
  navDots.forEach((dot) => {
    dot.classList.toggle("is-active", dot.getAttribute("href") === `#${id}`);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  {
    threshold: 0.45,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

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

revealItems.forEach((item) => revealObserver.observe(item));

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
