(() => {
  const chartRefs = {
    market: null,
    position: null,
    budget: null,
  };

  const parsePercent = (value) => {
    const numeric = Number(String(value || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const parseNumber = (value) => {
    const numeric = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const buildMarketShareChart = () => {
    const host = document.querySelector("#market-share-chart");
    if (!host || typeof Chart === "undefined") {
      return;
    }

    const canvas = document.querySelector("#market-share-canvas");
    if (!canvas) {
      return;
    }

    const rows = [...host.querySelectorAll("tbody tr")];
    if (!rows.length) {
      return;
    }

    const labels = [];
    const values = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const brand = cells[0]?.textContent?.trim() || "Unknown";
      const share = parsePercent(cells[1]?.textContent);

      if (share > 0) {
        labels.push(brand);
        values.push(share);
      }
    });

    if (!values.length) {
      return;
    }

    chartRefs.market?.destroy();

    const palette = ["#8fff00", "#42f39a", "#d7ff4b", "#d6ff9d", "#95f56c", "#a8ffd5"];

    chartRefs.market = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "Market share",
            data: values,
            backgroundColor: labels.map((_, i) => palette[i % palette.length]),
            borderColor: "rgba(5, 10, 12, 0.82)",
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "58%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#e4ffe8",
              font: {
                family: "Be Vietnam Pro",
                size: 12,
                weight: "600",
              },
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });
  };

  const buildPositionMapChart = () => {
    const host = document.querySelector("#position-map");
    const canvas = document.querySelector("#position-map-canvas");
    if (!host || !canvas || typeof Chart === "undefined") {
      return;
    }

    const rows = [...host.querySelectorAll("tbody tr")];
    if (!rows.length) {
      return;
    }

    const points = rows
      .map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          label: cells[0]?.textContent?.trim() || "Unknown",
          x: parseNumber(cells[1]?.textContent),
          y: parseNumber(cells[2]?.textContent),
        };
      })
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

    if (!points.length) {
      return;
    }

    chartRefs.position?.destroy();

    chartRefs.position = new Chart(canvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Perceptual map",
            data: points,
            backgroundColor: "#8fff00",
            borderColor: "#e9ffe3",
            borderWidth: 1.2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            min: -10,
            max: 10,
            grid: {
              color: "rgba(143, 255, 84, 0.16)",
            },
            ticks: {
              color: "#e4ffe8",
            },
            title: {
              display: true,
              text: "Sweetness",
              color: "#e4ffe8",
            },
          },
          y: {
            min: -10,
            max: 10,
            grid: {
              color: "rgba(143, 255, 84, 0.16)",
            },
            ticks: {
              color: "#e4ffe8",
            },
            title: {
              display: true,
              text: "Flavor Perception",
              color: "#e4ffe8",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw.label}: (${ctx.raw.x}, ${ctx.raw.y})`,
            },
          },
        },
      },
    });
  };

  const buildBudgetChart = () => {
    const host = document.querySelector("#budget-breakdown");
    if (!host || typeof Chart === "undefined") {
      return;
    }

    const canvas = document.querySelector("#budget-breakdown-canvas");
    if (!canvas) {
      return;
    }

    const rows = [...host.querySelectorAll("tbody tr")];
    if (!rows.length) {
      return;
    }

    const labels = [];
    const values = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const label = cells[0]?.textContent?.trim() || "Unknown";
      const percent = parsePercent(cells[1]?.textContent);

      if (percent > 0) {
        labels.push(label);
        values.push(percent);
      }
    });

    if (!values.length) {
      return;
    }

    chartRefs.budget?.destroy();

    const palette = ["#ffe45c", "#8fff00", "#42f39a", "#d7ff4b", "#9cd45d"];

    chartRefs.budget = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "Budget allocation",
            data: values,
            backgroundColor: labels.map((_, i) => palette[i % palette.length]),
            borderColor: "rgba(5, 10, 12, 0.82)",
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "56%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#e4ffe8",
              font: {
                family: "Be Vietnam Pro",
                size: 12,
                weight: "600",
              },
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });
  };

  const initPatchedCharts = () => {
    buildMarketShareChart();
    buildPositionMapChart();
    buildBudgetChart();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPatchedCharts, { once: true });
  } else {
    initPatchedCharts();
  }
})();
