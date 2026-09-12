import { getExpenses, getIncomes } from "./storage.js";

function getAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function isCurrentMonth(dateValue, now) {
  const date = new Date(dateValue);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function setBudgetState(usedEl, remainingEl, progressEl, expenses) {
  if (!usedEl || !remainingEl || !progressEl) return;

  const budget = Number(localStorage.getItem("monthlyBudget"));
  if (!Number.isFinite(budget) || budget <= 0) {
    usedEl.innerText = "Budget not set";
    remainingEl.innerText = "Budget not set";
    progressEl.style.width = "0%";
    progressEl.style.backgroundColor = "#ccc";
    usedEl.classList.add("muted");
    remainingEl.classList.add("muted");
    return;
  }

  const now = new Date();
  const currentMonthExpenses = expenses
    .filter((expense) => isCurrentMonth(expense.date, now))
    .reduce((sum, expense) => sum + getAmount(expense.amount), 0);
  const usedPercent = (currentMonthExpenses / budget) * 100;
  const displayedPercent = Math.min(Math.max(usedPercent, 0), 100);
  const remainingBudget = Math.max(budget - currentMonthExpenses, 0);

  usedEl.innerText = `${usedPercent.toFixed(1)}%`;
  remainingEl.innerText = remainingBudget.toFixed(2);
  progressEl.style.width = `${displayedPercent}%`;
  progressEl.style.backgroundColor =
    usedPercent < 80 ? "green" : usedPercent <= 100 ? "orange" : "red";
  usedEl.classList.remove("muted");
  remainingEl.classList.remove("muted");
}

export function track() {
  const expenses = getExpenses();
  const incomes = getIncomes();
  const totalIncome = incomes.reduce(
    (sum, income) => sum + getAmount(income.amount),
    0,
  );
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + getAmount(expense.amount),
    0,
  );

  const incomeTotalEl = document.getElementById("incomeTotal");
  const expenseTotalEl = document.getElementById("expenseTotal");
  const balanceTotalEl = document.getElementById("balanceTotal");

  if (incomeTotalEl) incomeTotalEl.innerText = totalIncome.toFixed(2);
  if (expenseTotalEl) expenseTotalEl.innerText = totalExpense.toFixed(2);
  if (balanceTotalEl) {
    balanceTotalEl.innerText = (totalIncome - totalExpense).toFixed(2);
  }

  setBudgetState(
    document.getElementById("budgetUsed"),
    document.getElementById("budgetRemaining"),
    document.getElementById("budgetProgress"),
    expenses,
  );
}
