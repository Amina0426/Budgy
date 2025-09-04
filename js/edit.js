import { displayExpense } from "./expenses.js";
import { displayIncome } from "./incomes.js";
import {
  getExpenses,
  getIncomes,
  updateExpenseAt,
  updateIncomeAt,
} from "./storage.js";

export function edit(type, index) {
  let data = type == "expenses" ? getExpenses() : getIncomes();

  const item = data[index];
  if (!item) {
    return;
  }

  const overlay = document.getElementById("editModalOverlay");
  const amountInput = document.getElementById("editAmountInput");
  const tagInput = document.getElementById("editTagInput");
  const saveBtn = document.getElementById("editSaveBtn");
  const cancelBtn = document.getElementById("editCancelBtn");

  amountInput.value = item.amount;
  tagInput.value = item.tag || "";
  tagInput.style.display = type === "expenses" ? "block" : "none";

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

    if (type === "expenses") {
      const tag = tagInput.value.trim();
      if (tag === "") return alert("Tag cannot be empty");
      updatedItem.tag = tag;
      updateExpenseAt(index, updatedItem);
      displayExpense();
    } else {
      updateIncomeAt(index, updatedItem);
      displayIncome();
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
