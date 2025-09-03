import { addIncomeEntry, getIncomes, deleteIncomeAt } from "./storage.js";
import { popMssg } from "./home.js";
import { track } from "./charts.js";
import { closeAllDropdowns } from "./utils.js";
import { edit } from "./edit.js";

export function addIncome() {
  let incIn = document.querySelector("#income");
  let incAdd = document.querySelector("#inBtn");

  incAdd.addEventListener("click", () => {
    let amt = incIn.value;
    if (amt <= 0) {
      popMssg("Enter a valid income amount!"); // using popup for consistency
      return;
    }

    let income = {
      amount: amt,
      date: new Date().toISOString(),
    };

    addIncomeEntry(income);

    incIn.value = "";
    displayIncome();
    track();
    popMssg(`Rs.${income.amount} added to incomes!`);
  });
}

export function displayIncome() {
  let incList = document.querySelector(".incList");

  incList.addEventListener("click", (e) => {
    if (e.target.classList.contains("menu")) {
      e.stopPropagation();
      closeAllDropdowns();
      const dropdown = e.target.nextElementSibling;
      dropdown.classList.toggle("hidden");
    }
  });

  let incomes = getIncomes();
  if (incomes.length === 0) {
    incList.innerHTML = `<div class="empty-placeholder">No incomes added yet.</div>`;
    return;
  }
  incList.innerHTML = "";

  incomes.forEach((income, index) => {
    let li = document.createElement("div");
    li.classList.add("inDiv");
    li.innerHTML = `
      <p>Rs. ${income.amount}</p> 
      <p id="date">${formatDate(income.date)}</p>  
      <button class="menu">&#x22EE;</button>
      <div class="dd hidden">
        <button onclick="edit('incomes',${index})">Edit</button>
        <button onclick="deleteInc(${index})">Delete</button>
      </div>`;
    incList.appendChild(li);
  });
}

export function deleteInc(index) {
  deleteIncomeAt(index);
  displayIncome();
}

// helper for date formatting (keeps consistent with expenses.js)
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}
window.deleteInc = deleteInc;
