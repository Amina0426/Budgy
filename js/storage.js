let expenseCache = [];
let incomeCache = [];

export function initData() {
  expenseCache = JSON.parse(localStorage.getItem("expenses")) || [];
  incomeCache = JSON.parse(localStorage.getItem("incomes")) || [];
}

export function getExpenses() {
  return expenseCache;
}

export function getIncomes() {
  return incomeCache;
}

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenseCache));
}

function saveIncomes() {
  localStorage.setItem("incomes", JSON.stringify(incomeCache));
}

export function addExpense(expense) {
  expenseCache.unshift(expense);
  saveExpenses();
}
export function deleteExpenseAt(index) {
  if (index >= 0 && index < expenseCache.length) {
    expenseCache.splice(index, 1);
    saveExpenses();
  }
}
export function updateExpenseAt(index, newData) {
  if (index >= 0 && index < expenseCache.length) {
    expenseCache[index] = { ...expenseCache[index], ...newData };
    saveExpenses();
  }
}

export function addIncomeEntry(income) {
  incomeCache.unshift(income);
  saveIncomes();
}
export function deleteIncomeAt(index) {
  if (index >= 0 && index < incomeCache.length) {
    incomeCache.splice(index, 1);
    saveIncomes();
  }
}
export function updateIncomeAt(index, newData) {
  if (index >= 0 && index < incomeCache.length) {
    incomeCache[index] = { ...incomeCache[index], ...newData };
    saveIncomes();
  }
}
