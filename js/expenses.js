import { saveItem, getItem } from "./storage.js";
import { popMssg } from "./home.js";
import { closeAllDropdowns } from "./utils.js";
import { selectedTag } from "./tags.js";
import { formatDate } from "./utils.js";

let input = document.querySelector("#in");
let addBtn = document.querySelector("#add");
let tags = document.querySelectorAll(".tagel");

export function addExpenses() {
  console.log("clicked");
  const amount = input.value;
  let tagIn = document.querySelector("#tagInput");

  if (tagIn.style.visibility === "visible" && tagIn.value.trim() !== "") {
    selectedTag.value = tagIn.value.trim();
    tagIn.style.visibility = "hidden";
    tagIn.value = "";
  }
  console.log(amount, " , ", tagIn);

  if (amount <= 0 || !selectedTag.value) {
    popMssg("Enter a valid amount and select a tag!");
    return;
  }

  const expense = {
    amount: amount,
    tag: selectedTag.value,
    date: new Date().toISOString(),
  };

  let expenses = getItem("expenses");
  expenses.unshift(expense);
  saveItem("expenses", expenses);

  input.value = "";
  tags.forEach((tag) => tag.classList.remove("selected"));
  displayExpense();
  popMssg(`Rs.${expense.amount} - ${expense.tag} added!`);
  document.querySelector("#tagInput").style.visibility = "hidden";
}
export function displayExpense() {
  const currList = document.querySelector(".curr");
  const past = document.querySelector(".past");
  if (!currList || !past) return;

  currList.addEventListener("click", (e) => {
    if (e.target.classList.contains("menu")) {
      e.stopPropagation();
      closeAllDropdowns();
      const dropdown = e.target.nextElementSibling;
      dropdown.classList.toggle("hidden");
    }
  });

  let expenses = getItem("expenses");
  if (expenses.length === 0) {
    currList.innerHTML = `<div class="empty-placeholder">Start adding Your expenses to view here.</div>`;
    past.innerHTML = "";
    return;
  }

  const curr = new Date().getMonth();
  const pastExpByMonth = {};
  const currExpenses = [];

  expenses.forEach((expense, realIndex) => {
    const date = new Date(expense.date);
    const month = date.getMonth();
    const monthKey = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (month === curr) {
      currExpenses.push({ ...expense, realIndex });
    } else {
      if (!pastExpByMonth[monthKey]) {
        pastExpByMonth[monthKey] = [];
      }
      pastExpByMonth[monthKey].push({ ...expense, realIndex });
    }
  });

  // Render current expenses
  currList.innerHTML = "";
  let batchSize = 30;
  let renderedCount = 0;

  function renderCurrBatch() {
    const slice = currExpenses.slice(renderedCount, renderedCount + batchSize);
    slice.forEach((expense) => {
      let li = document.createElement("div");
      li.classList.add("exDiv");
      li.innerHTML = `
        <p> Rs.${expense.amount}</p> 
        <p id="date">${formatDate(expense.date)}</p>
        <span id="t">${expense.tag}</span>
        ${expense.img ? `<img src="${expense.img}" class="bill-img">` : ""}
        <button class="menu">&#x22EE;</button>
        <div class="dd hidden">
          <button onclick="edit('expenses',${expense.realIndex})">Edit</button>
          <button onclick="deleteExpense(${expense.realIndex})">Delete</button>
          <button onclick="addPic(${expense.realIndex})">Add Bill</button>
        </div>`;
      currList.appendChild(li);
    });
    renderedCount += slice.length;
    if (renderedCount < currExpenses.length) {
      let loadMore = document.createElement("button");
      loadMore.textContent = "Load More";
      loadMore.classList.add("load-more");
      loadMore.onclick = () => {
        loadMore.remove();
        renderCurrBatch();
      };
      currList.appendChild(loadMore);
    }
  }
  renderCurrBatch();

  // Render past grouped expenses
  past.innerHTML = "";
  Object.keys(pastExpByMonth)
    .sort((a, b) => new Date(b) - new Date(a))
    .forEach((month) => {
      let monthDiv = document.createElement("div");
      monthDiv.classList.add("pastDiv");

      const total = pastExpByMonth[month].reduce(
        (sum, exp) => sum + parseFloat(exp.amount),
        0
      );

      let liHeader = document.createElement("div");
      liHeader.classList.add("pDiv-header");
      liHeader.textContent = `${month} Total: Rs.${total.toFixed(2)}`;
      monthDiv.appendChild(liHeader);

      let monthContent = document.createElement("div");
      monthContent.classList.add("pDiv-content", "hidden");
      monthDiv.appendChild(monthContent);

      liHeader.addEventListener("click", () => {
        document.querySelectorAll(".pDiv-content").forEach((div) => {
          if (div !== monthContent) div.classList.add("hidden");
        });
        monthContent.classList.toggle("hidden");

        if (!monthContent.dataset.loaded) {
          pastExpByMonth[month].forEach((expense) => {
            let li = document.createElement("div");
            li.classList.add("exDiv");
            li.innerHTML = `
              <p> Rs.${expense.amount}</p> 
              <p id="date">${formatDate(expense.date)}</p>
              <span id="t">${expense.tag}</span>
              ${
                expense.img ? `<img src="${expense.img}" class="bill-img">` : ""
              }
              <button class="menu">&#x22EE;</button>
              <div class="dd hidden">
                <button onclick="edit('expenses',${
                  expense.realIndex
                })">Edit</button>
                <button onclick="deleteExpense(${
                  expense.realIndex
                })">Delete</button>
                <button onclick="addPic(${expense.realIndex})">Add Bill</button>
              </div>`;
            monthContent.appendChild(li);
          });
          monthContent.dataset.loaded = "true";
        }
      });
      past.appendChild(monthDiv);
    });
}
export function deleteExpense(index) {
  let expenses = getItem("expenses");

  if (index >= 0 && index < expenses.length) {
    expenses.splice(index, 1);
  }

  saveItem("expenses", expenses);
  displayExpense();
}
export function addPic(index) {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = () => {
    const file = input.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const expenses = getItem("expenses");
        expenses[index].img = e.target.result;
        saveItem("expenses", expenses);
        displayExpense();
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}
export function togglePast() {
  let past = document.querySelector("#past-section");
  const arrow = document.querySelector(".arrow-caret");
  let header = document.querySelector(".p-header");
  header.classList.toggle("raised");
  past.classList.toggle("open");
  arrow.classList.toggle("rotated");

  if (!past.classList.contains("open")) {
    const allMonths = past.querySelectorAll(".pDiv-content");
    allMonths.forEach((div) => div.classList.add("hidden"));
  }
}
window.togglePast = togglePast;
window.deleteExpense = deleteExpense;
window.addPic = addPic;
