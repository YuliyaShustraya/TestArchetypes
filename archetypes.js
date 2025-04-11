(function () {
  const container =
    document.getElementById("my-graph-container") || document.body;

  const canvas = document.createElement("canvas");
  canvas.id = "myCanvas";
  container.appendChild(canvas);

  const tooltip = document.createElement("div");
  tooltip.id = "tooltip";
  container.appendChild(tooltip);

  Object.assign(tooltip.style, {
    position: "fixed",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "14px",
    pointerEvents: "none",
    display: "none",
    zIndex: "100",
    whiteSpace: "nowrap",
  });
  document.body.appendChild(tooltip);

  Object.assign(document.body.style, {
    backgroundColor: "#1d1d1d",
    margin: "0",
    padding: "0",
    fontFamily: "Arial, sans-serif",
  });

  Object.assign(canvas.style, {
    width: "100%",
    maxWidth: "700px",
    aspectRatio: "1 / 1",
    display: "block",
    margin: "0 auto",
  });

  if (window.innerWidth > 600) {
    canvas.addEventListener("mouseenter", () => {
      canvas.style.cursor = "help";
    });
  }

  const ctx = adjustCanvasSize(canvas);
  const BASE_SIZE = 700;
  const canvasRect = canvas.getBoundingClientRect();
  const canvasSize = canvasRect.width;
  const scale = canvasSize / BASE_SIZE;
  const margin = 20 * scale;
  const ringThickness = 35 * scale;
  const diagramSize = canvasSize - margin * 2;
  const centerX = margin + diagramSize / 2;
  const centerY = margin + diagramSize / 2;
  const outerRadius = diagramSize / 2;
  const curvedTextRadius = outerRadius - ringThickness / 2;
  const countTextRadius = outerRadius - 70 * scale;

  const sectorGapBefore = [
    0.165, 0.01, 0.01, 0.165, 0.01, 0.01, 0.165, 0.01, 0.01, 0.165, 0.01, 0.01,
  ];
  const sectorGapAfter = [
    0.01, 0.01, 0.165, 0.01, 0.01, 0.165, 0.01, 0.01, 0.165, 0.01, 0.01, 0.165,
  ];
  const totalGap =
    sectorGapBefore.reduce((s, g) => s + g, 0) +
    sectorGapAfter.reduce((s, g) => s + g, 0);

  const params = new URLSearchParams(window.location.search);

  const archetypesMap = [
    {
      name: "Ребенок",
      key: "c1",
      desc: "Ребенок, невинный, идеолог, простодушный",
    },
    { name: "Мудрец", key: "c11", desc: "Мудрец, эксперт, философ" },
    {
      name: "Искатель",
      key: "c5",
      desc: "Искатель, исследователь, странник, индивидуалист",
    },
    { name: "Воин", key: "c3", desc: "Воин, лидер, солдат, чемпион" },
    { name: "Маг", key: "c10", desc: "Маг, волшебник, визионер" },
    { name: "Бунтарь", key: "c6", desc: "Бунтарь, разрушитель, революционер" },
    {
      name: "Любовник",
      key: "c7",
      desc: "Любовник, коммуникатор, любящий, соблазнитель",
    },
    {
      name: "Славный малый",
      key: "c2",
      desc: "Славный малый, партнер, сирота, свой парень",
    },
    { name: "Шут", key: "c12", desc: "Шут, спикер, дурак, трикстер, шоумен" },
    { name: "Монах", key: "c4", desc: "Монах, ментор, наставник, опекун" },
    { name: "Правитель", key: "c9", desc: "Правитель, управленец" },
    { name: "Творец", key: "c8", desc: "Творец, создатель, новатор" },
  ];

  const archetypeData = archetypesMap.map(({ name, key }) => {
    const count = +params.get(key);
    return {
      name,
      count,
      color: count <= 21 ? "#F5DD3F" : count <= 25 ? "#DE800C" : "#9C1F2D",
    };
  });

  const arcAngle = (2 * Math.PI - totalGap) / archetypeData.length;
  const maxRadius = outerRadius - ringThickness / 2;

  let pieStart = -Math.PI / 2;
  archetypeData.forEach((item, i) => {
    pieStart += sectorGapBefore[i];
    const pieEnd = pieStart + arcAngle;
    const valueRadius = item.count * 10 * scale;

    drawPieSlice(ctx, centerX, centerY, maxRadius, pieStart, pieEnd, "#222");
    drawPieSlice(
      ctx,
      centerX,
      centerY,
      valueRadius,
      pieStart,
      pieEnd,
      item.color
    );

    pieStart = pieEnd + sectorGapAfter[i];
  });

  ctx.beginPath();
  ctx.fillStyle = "#222";
  ctx.arc(centerX, centerY, 65 * scale, 0, 2 * Math.PI);
  ctx.fill();

  const zoneColors = ["#9C1F2D", " #9C1F2D", "#fff", "#fff"];
  let angleStart = -Math.PI / 2;
  archetypeData.forEach((_, i) => {
    const start = angleStart + sectorGapBefore[i];
    const end = start + arcAngle;
    const zoneIndex = Math.floor(i / 3);
    ctx.beginPath();
    ctx.strokeStyle = zoneColors[zoneIndex];
    ctx.lineWidth = ringThickness;
    ctx.arc(centerX, centerY, outerRadius - ringThickness / 2, start, end);
    ctx.stroke();
    angleStart = end + sectorGapAfter[i];
  });

  ctx.beginPath();
  ctx.strokeStyle = "#f5dd3f";
  ctx.lineWidth = 1;
  ctx.moveTo(centerX, centerY - outerRadius);
  ctx.lineTo(centerX, centerY + outerRadius);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.moveTo(centerX - outerRadius, centerY);
  ctx.lineTo(centerX + outerRadius, centerY);
  ctx.stroke();

  let numberAngle = -Math.PI / 2;
  archetypeData.forEach((item, i) => {
    numberAngle += sectorGapBefore[i];
    const mid = numberAngle + arcAngle / 2;
    const x = centerX + countTextRadius * Math.cos(mid);
    const y = centerY + countTextRadius * Math.sin(mid);
    const textColor = "#fff";

    drawLabel(
      ctx,
      item.count.toString(),
      x,
      y,
      0,
      "center",
      24 * scale,
      textColor
    );
    numberAngle = mid + arcAngle / 2 + sectorGapAfter[i];
  });

  const baseArchetypeFont = canvasSize < 500 ? 10 : 14;
  const baseSpecialFont = canvasSize < 500 ? 9 : 13;

  let labelAngle = -Math.PI / 2;
  archetypeData.forEach((item, i) => {
    labelAngle += sectorGapBefore[i];
    const mid = labelAngle + arcAngle / 2;
    const x = centerX + curvedTextRadius * Math.cos(mid);
    const y = centerY + curvedTextRadius * Math.sin(mid);
    let rotation = mid + Math.PI / 2;

    if (
      ["Шут", "Славный малый", "Любовник", "Бунтарь", "Маг", "Воин"].includes(
        item.name
      )
    ) {
      rotation += Math.PI;
    }

    if (item.name === "Славный малый") {
      const text = item.name.toUpperCase();
      const radius = curvedTextRadius + 5 * scale;
      const fontSize = baseSpecialFont * scale;
      ctx.font = `${fontSize}px Arial`;
      const textWidth = ctx.measureText(text).width;
      const totalAngle = textWidth / radius;
      const adjustedAngle = mid - (totalAngle / 2) * -0.06;
      drawCurvedText(
        ctx,
        text,
        centerX,
        centerY,
        radius,
        adjustedAngle,
        false,
        fontSize,
        "#000"
      );
    } else {
      let textColor = "#000";
      if (
        ["Ребенок", "Мудрец", "Искатель", "Воин", "Маг", "Бунтарь"].includes(
          item.name
        )
      ) {
        textColor = "#fff";
      }
      drawLabel(
        ctx,
        item.name.toUpperCase(),
        x,
        y,
        rotation,
        "center",
        baseArchetypeFont * scale,
        textColor
      );
    }

    labelAngle = mid + arcAngle / 2 + sectorGapAfter[i];
  });
  drawLabel(
    ctx,
    `${+params.get("stabc")} СТАБИЛЬНОСТЬ`,
    centerX - 10 * scale,
    centerY - 250 * scale,
    -Math.PI / 2 + Math.PI,
    "center",
    15 * scale,
    "#f5dd3f"
  );
  drawLabel(
    ctx,
    `${+params.get("indc")} ИНДИВИДУАЛИЗМ `,
    centerX + 330 * scale,
    centerY - 10 * scale,
    0,
    "right",
    15 * scale,
    "#fff"
  );
  drawLabel(
    ctx,
    `${+params.get("chanc")} ИЗМЕНЕНИЯ`,
    centerX + 10 * scale,
    centerY + 265 * scale,
    Math.PI / 2,
    "center",
    15 * scale,
    "#f5dd3f"
  );
  drawLabel(
    ctx,
    ` ПРИНАДЛЕЖНОСТЬ ${+params.get("belc")}`,
    centerX - 330 * scale,
    centerY + 10 * scale,
    0,
    "left",
    15 * scale,
    "#fff"
  );

  drawCurvedText(
    ctx,
    "АРХЕТИПЫ ПОДАЧИ",
    centerX,
    centerY,
    outerRadius + 10 * scale,
    Math.PI,
    true,
    14 * scale,
    " #fff"
  );
  drawCurvedText(
    ctx,
    "АРХЕТИПЫ СОДЕРЖАНИЯ",
    centerX,
    centerY,
    outerRadius + 20 * scale,
    Math.PI * -0.0001,
    false,
    14 * scale,
    "#fff"
  );

  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    outerRadius + 5 * scale,
    Math.PI * 0.51,
    Math.PI * 1.49
  );
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    outerRadius + 5 * scale,
    Math.PI * 1.51,
    Math.PI * 2.49
  );
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  if (window.innerWidth > 600) {
    const sectors = [
      [-1.4958, -1.0555],
      [-1.0055, -0.5653],
      [-0.5153, -0.075],
      [0.075, 0.5153],
      [0.5653, 1.0055],
      [1.0555, 1.4958],
      [1.6458, 2.0861],
      [2.1361, 2.5763],
      [2.6263, 3.0666],
      [3.2166, 3.6569],
      [3.7069, 4.1471],
      [4.1971, 4.6374],
    ];

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > maxRadius || distance < 25 * scale) {
        tooltip.style.display = "none";
        return;
      }
      const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
      for (let i = 0; i < sectors.length; i++) {
        const [start, end] = sectors[i];
        if (
          normalizedAngle >= (start + 2 * Math.PI) % (2 * Math.PI) &&
          normalizedAngle <= (end + 2 * Math.PI) % (2 * Math.PI)
        ) {
          tooltip.innerText = `${archetypesMap[i].desc}`;
          tooltip.style.left = e.clientX + 10 + "px";
          tooltip.style.top = e.clientY + 10 + "px";
          tooltip.style.display = "block";
          return;
        }
      }
      tooltip.style.display = "none";
    });

    canvas.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  }

  function adjustCanvasSize(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return ctx;
  }

  function drawPieSlice(ctx, cx, cy, radius, start, end, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();
  }

  function drawLabel(
    ctx,
    text,
    x,
    y,
    angle = 0,
    align = "center",
    fontSize = 17,
    color = "white",
    bg = null
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    if (bg) {
      const w = ctx.measureText(text).width;
      const pad = 6;
      ctx.fillStyle = bg;
      ctx.fillRect(
        align === "center"
          ? -w / 2 - pad
          : align === "right"
          ? -w - 2 * pad
          : 0,
        -fontSize / 2 - 3,
        w + pad * 2,
        fontSize + 6
      );
    }
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  function drawCurvedText(
    ctx,
    text,
    centerX,
    centerY,
    radius,
    startAngle,
    clockwise = true,
    fontSize = 14,
    color = "#000"
  ) {
    ctx.save();
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;

    const chars = text.split("");
    const charWidths = chars.map((ch) => ctx.measureText(ch).width);
    const anglePerPixel = 1 / radius;
    const totalAngle = charWidths.reduce((a, b) => a + b, 0) * anglePerPixel;
    let angle = startAngle - (clockwise ? totalAngle / 2 : -totalAngle / 2);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const w = charWidths[i];
      const halfWidthAngle = (clockwise ? w : -w) * anglePerPixel * 0.5;
      const charAngle = angle + (clockwise ? w / 2 : -w / 2) * anglePerPixel;

      ctx.save();
      ctx.translate(
        centerX + radius * Math.cos(charAngle),
        centerY + radius * Math.sin(charAngle)
      );

      ctx.rotate(charAngle + (clockwise ? Math.PI / 2 : -Math.PI / 2));
      ctx.fillText(char, 0, 0);
      ctx.restore();
      angle += (clockwise ? w : -w) * anglePerPixel;
    }
    ctx.restore();
  }
})();
