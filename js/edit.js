import { displayExpense } from "./expenses.js";
import { displayIncome } from "./incomes.js";
import { track } from "./charts.js";
import {
  getExpenses,
  getIncomes,
  updateExpenseAt,
  updateIncomeAt,
} from "./storage.js";

function toDateInputValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toStoredDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function edit(type, index) {
  let data = type == "expenses" ? getExpenses() : getIncomes();

  const item = data[index];
  if (!item) {
    return;
  }

  const overlay = document.getElementById("editModalOverlay");
  const amountInput = document.getElementById("editAmountInput");
  const tagInput = document.getElementById("editTagInput");
  const dateInput = document.getElementById("editDateInput");
  const saveBtn = document.getElementById("editSaveBtn");
  const cancelBtn = document.getElementById("editCancelBtn");

  amountInput.value = item.amount;
  tagInput.value = item.tag || "";
  tagInput.style.display = type === "expenses" ? "block" : "none";
  if (dateInput) {
    dateInput.value = toDateInputValue(item.date);
  }
  const initialDateInputValue = dateInput?.value || "";

  overlay.classList.add("show");

  function cleanup() {
    overlay.classList.remove("show");
    saveBtn.removeEventListener("click", onSave);
    cancelBtn.removeEventListener("click", onCancel);
  }

  function onSave() {
    const amt = amountInput.value.trim();
    if (amt === "" || isNaN(Number(amt))) return alert("Invalid amount");
    const updatedItem = { ...item, amount: Number(amt) };

    if (dateInput && dateInput.value !== initialDateInputValue) {
      if (!dateInput.value) return alert("Invalid date");
      const storedDate = toStoredDateValue(dateInput.value);
      if (!storedDate) return alert("Invalid date");
      updatedItem.date = storedDate;
    }

    if (type === "expenses") {
      const tag = tagInput.value.trim();
      if (tag === "") return alert("Tag cannot be empty");
      updatedItem.tag = tag;
      updateExpenseAt(index, updatedItem);
      displayExpense();
      track();
    } else {
      updateIncomeAt(index, updatedItem);
      displayIncome();
      track();
    }
    cleanup();
  }

  function onCancel() {
    cleanup();
  }

  saveBtn.addEventListener("click", onSave);
  cancelBtn.addEventListener("click", onCancel);
}
window.edit = edit;
