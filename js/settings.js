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
import { track } from "./charts.js";
import {
  getExpenses,
  getIncomes,
  initData,
  replaceAllData,
  getMonthlyBudget,
  saveMonthlyBudget,
} from "./storage.js";
import { popMssg } from "./home.js";

export async function monthlyLimit() {
  const budgetInput = document.getElementById("monthlyBudget");
  const saveBudgetBtn = document.getElementById("saveBudgetBtn");

  if (!budgetInput) return;

  // Save changes to Firestore.
  const saveBudget = async () => {
    try {
      await saveMonthlyBudget(budgetInput.value);
      track();
      popMssg("Monthly budget saved!");
    } catch (error) {
      console.error("Failed to save monthly budget:", error);
      popMssg(error.message || "Could not save budget.");
    }
  };

  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener("click", saveBudget);
  } else {
    budgetInput.addEventListener("change", saveBudget);
  }

  try {
    // Load the budget from Firestore.
    let savedBudget = await getMonthlyBudget();

    // Migrate an existing localStorage budget if Firestore
    // doesn't have one yet.
    if (savedBudget === null) {
      const oldBudget = localStorage.getItem("monthlyBudget");

      if (oldBudget !== null && Number(oldBudget) > 0) {
        savedBudget = await saveMonthlyBudget(oldBudget);
      }
    } else {
      // Keep existing calculations working during migration.
      localStorage.setItem("monthlyBudget", String(savedBudget));
    }

    budgetInput.value = savedBudget ?? "";
    track();
  } catch (error) {
    console.error("Failed to load monthly budget:", error);
    popMssg("Could not load your budget from Firestore.");
  }
}
export async function downloadData() {
  const budget = await getMonthlyBudget();
  const data = {
    budget,

    expenses: getExpenses().map(({ id, images, img, ...expense }) => ({
      ...expense,
      images: [],
    })),

    incomes: getIncomes().map(({ id, ...income }) => income),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "finance-data.json";
  link.click();

  // Give the browser time to start downloading before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importBackup() {
  const input = document.getElementById("importBackupInput");
  if (!input) return;

  input.value = "";
  input.onchange = () => restoreBackup(input.files?.[0]);
  input.click();
}

async function restoreBackup(file) {
  if (!file) return;

  try {
    const backup = JSON.parse(await file.text());

    // Validate everything before modifying existing data.
    validateBackup(backup);

    if (
      !confirm(
        "Importing this backup will replace your current Budgy data. Continue?",
      )
    ) {
      return;
    }

    // Replace the signed-in user's Firestore expenses and incomes.
    // This also refreshes the in-memory caches.
    await replaceAllData(backup.expenses, backup.incomes);

    await saveMonthlyBudget(backup.budget);

    // Update the budget input on screen.
    const budgetInput = document.getElementById("monthlyBudget");

    if (budgetInput) {
      budgetInput.value = backup.budget ?? "";
    }

    // Refresh the displayed records.
    const [{ displayExpense }, { displayIncome }] = await Promise.all([
      import("./expenses.js"),
      import("./incomes.js"),
    ]);

    displayExpense();
    displayIncome();
    track();

    popMssg("Backup restored successfully!");
  } catch (error) {
    console.error("Failed to restore backup:", error);

    popMssg(error.message || "Failed to restore backup.");
  }
}

function validateBackup(backup) {
  if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
    throw new Error("Backup must be a JSON object.");
  }
  if (
    !("budget" in backup) ||
    !Array.isArray(backup.expenses) ||
    !Array.isArray(backup.incomes)
  ) {
    throw new Error("Backup must contain budget, expenses, and incomes.");
  }
  if (backup.budget !== null && !isPositiveAmount(backup.budget)) {
    throw new Error("Backup budget must be null or greater than zero.");
  }

  backup.expenses.forEach((expense, index) => {
    if (
      !expense ||
      typeof expense !== "object" ||
      !["amount", "tag", "date"].every((key) => key in expense)
    ) {
      throw new Error(`Expense ${index + 1} is missing required fields.`);
    }
    validateRecord(expense.amount, expense.date, `Expense ${index + 1}`);
    if (
      typeof expense.tag !== "string" ||
      !expense.tag.trim() ||
      expense.tag.length > 50
    ) {
      throw new Error(`Expense ${index + 1} has an invalid tag.`);
    }
    if ("images" in expense && !Array.isArray(expense.images)) {
      throw new Error(`Expense ${index + 1} has invalid images.`);
    }
  });

  backup.incomes.forEach((income, index) => {
    if (
      !income ||
      typeof income !== "object" ||
      !["amount", "date"].every((key) => key in income)
    ) {
      throw new Error(`Income ${index + 1} is missing required fields.`);
    }
    validateRecord(income.amount, income.date, `Income ${index + 1}`);
  });
}

function validateRecord(amount, date, label) {
  if (!isPositiveAmount(amount)) {
    throw new Error(`${label} has an invalid amount.`);
  }
  if (!isSupportedDate(date)) {
    throw new Error(`${label} date must use YYYY-MM-DD or ISO format.`);
  }
}

function isPositiveAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
}

function isSupportedDate(value) {
  if (typeof value !== "string") return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
}
export function resetApp() {
  const confirmReset = confirm(
    "Are you sure you want to reset all data? This cannot be undone.",
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
window.importBackup = importBackup;
window.resetApp = resetApp;
