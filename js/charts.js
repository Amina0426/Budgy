import { getItem } from "./storage.js";

export function track() {
  const exp = getItem("expenses");
  const inc = getItem("incomes");

  const totalInc = inc.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExp = exp.reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalInc - totalExp;

  const incTotalEl = document.getElementById("incomeTotal");
  const expTotalEl = document.getElementById("expenseTotal");
  const balTotalEl = document.getElementById("balanceTotal");

  if (incTotalEl) incTotalEl.innerText = totalInc;
  if (expTotalEl) expTotalEl.innerText = totalExp;
  if (balTotalEl) balTotalEl.innerText = balance;

  drawDonutCanvas(exp);
}

function drawDonutCanvas(expenses) {
  const canvas = document.getElementById("donutCanvas");
  const tooltip = document.getElementById("canvasTooltip");
  if (!canvas || !tooltip) return;

  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();

  const tagData = getTopFrequentTagsWithOthers(expenses);
  const total = tagData.reduce((sum, [_, value]) => sum + value, 0);

  const colors = [
    "#a78bfa",
    "#7dd3fc",
    "#fb7185",
    "#facc15",
    "#4ade80",
    "#9ca3af",
  ];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 100;
  const innerRadius = 55;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (tagData.length === 0 && total === 0) {
    ctx.fillStyle = "#d1d5db"; // gray
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // cut donut hole
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Optional: show "No data" tooltip on hover
    canvas.onmousemove = () => {
      tooltip.textContent = "No data";
      tooltip.classList.remove("hidden");
    };
    canvas.onmouseleave = () => tooltip.classList.add("hidden");

    return; // stop the rest of the drawing
  }
  let startAngle = -Math.PI / 2;
  const slices = [];

  for (let i = 0; i < tagData.length; i++) {
    const [tag, value] = tagData[i];
    const angle = (value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const color = colors[i % colors.length];

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    slices.push({
      start: startAngle,
      end: endAngle,
      label: `${tag}: ₹${value}`,
      color,
    });

    startAngle = endAngle;
  }

  // cut donut hole
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // hover detection
  canvas.onmousemove = (e) => {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    if (dist < innerRadius || dist > radius) {
      tooltip.classList.add("hidden");
      return;
    }

    const normAngle = angle < -Math.PI / 2 ? angle + 2 * Math.PI : angle;
    for (let slice of slices) {
      if (normAngle >= slice.start && normAngle < slice.end) {
        tooltip.textContent = slice.label;
        tooltip.style.left = `10px`;
        tooltip.style.top = `10px`;
        tooltip.classList.remove("hidden");
        return;
      }
    }
    tooltip.classList.add("hidden");
  };

  canvas.onmouseleave = () => {
    tooltip.classList.add("hidden");
  };
}

export function getTopFrequentTagsWithOthers(expenses, topN = 5) {
  const tagCounts = {};
  const tagTotals = {};

  for (let item of expenses) {
    const tag = item.tag || "Other";
    const amt = Math.abs(Number(item.amount));
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    tagTotals[tag] = (tagTotals[tag] || 0) + amt;
  }

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const topTags = sortedTags.slice(0, topN);
  const others = sortedTags.slice(topN);

  let result = topTags.map(([tag]) => [tag, tagTotals[tag]]);
  if (others.length > 0) {
    const othersTotal = others.reduce((sum, [tag]) => sum + tagTotals[tag], 0);
    result.push(["Others", othersTotal]);
  }

  return result;
}
