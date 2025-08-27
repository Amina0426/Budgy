export function openSetModal() {
  document.getElementById("set-modal").style.display = "block";
  document.getElementById("mode").checked =
    document.body.classList.contains("dark");
}
export function closeModal() {
  document.getElementById("set-modal").style.display = "none";
}
export function toggleMode() {
  document.body.classList.toggle("dark");
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);
}
export function monthlyLimit() {
  const budgetInput = document.getElementById("monthlyBudget");
  budgetInput.addEventListener("input", () => {
    localStorage.setItem("monthlyBudget", budgetInput.value);
  });

  window.addEventListener("DOMContentLoaded", () => {
    const savedBudget = localStorage.getItem("monthlyBudget");
    if (savedBudget) {
      budgetInput.value = savedBudget;
    }
  });
}
export function downloadData() {
  let expenses = [];

  try {
    expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  } catch (e) {
    console.error("Could not parse expenses", e);
    expenses = [];
  }

  const sanitizedExpenses = expenses.map((e) => ({
    amount: e.amount,
    tag: e.tag,
    date: e.date,
    ...(e.img ? { img: "[image omitted]" } : {}),
  }));

  const data = {
    budget: localStorage.getItem("monthlyBudget") || "Not set",
    expenses: sanitizedExpenses,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "finance-data.json";
  link.click();
  URL.revokeObjectURL(url);
}
export function resetApp() {
  const confirmReset = confirm(
    "Are you sure you want to reset all data? This cannot be undone."
  );
  if (confirmReset) {
    localStorage.clear();
    location.reload();
  }
}
window.openSetModal = openSetModal;
window.closeModal = closeModal;
window.toggleMode = toggleMode;
window.monthlyLimit = monthlyLimit;
window.downloadData = downloadData;
window.resetApp = resetApp;
