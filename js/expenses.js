import {
  deleteExpenseAt,
  addExpense,
  updateExpenseAt,
  getExpenses,
} from "./storage.js";
import { popMssg } from "./home.js";
import { closeAllDropdowns } from "./utils.js";
import { selectedTag } from "./tags.js";
import { formatDate } from "./utils.js";
import { track } from "./charts.js";

function getExpenseImages(expense) {
  if (Array.isArray(expense.images) && expense.images.length > 0) {
    return expense.images
      .map((image) =>
        typeof image === "string" ? image : image?.image || image?.src || "",
      )
      .filter(Boolean);
  }
  return expense.img ? [expense.img] : [];
}

function escapeImageAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderExpenseImages(expense, realIndex) {
  const images = getExpenseImages(expense);
  if (images.length === 0) return "";

  const encodedImages = encodeURIComponent(JSON.stringify(images));
  return `<div class="bill-images-wrapper">
    <div class="bill-images">
      ${images
        .map(
          (image, imageIndex) => `
            <img src="${escapeImageAttribute(image)}" class="bill-img" data-expense-index="${realIndex}" data-image-index="${imageIndex}" data-images="${encodedImages}" alt="Expense receipt">
          `,
        )
        .join("")}
    </div>
    <span class="img-count-badge">${images.length}</span>
  </div>`;
}

let input = document.querySelector("#in");
let addBtn = document.querySelector("#add");
let tags = document.querySelectorAll(".tagel");

export function addExpenses() {
  const amount = input.value;
  let tagIn = document.querySelector("#tagInput");

  if (tagIn.style.visibility === "visible" && tagIn.value.trim() !== "") {
    selectedTag.value = tagIn.value.trim();
    tagIn.style.visibility = "hidden";
    tagIn.value = "";
  }

  if (amount <= 0 || !selectedTag.value) {
    popMssg("Enter a valid amount and select a tag!");
    return;
  }

  const expense = {
    amount: amount,
    tag: selectedTag.value,
    date: new Date().toISOString(),
  };

  addExpense(expense);
  displayExpense();
  track();
  popMssg(`Rs.${expense.amount} - ${expense.tag} added!`);
  input.value = "";
  selectedTag.value = "";
  tags.forEach((tag) => tag.classList.remove("selected"));
  document.querySelector("#tagInput").style.visibility = "hidden";
}
export function displayExpense(searchQuery) {
  const currList = document.querySelector(".curr");
  const past = document.querySelector(".past");
  if (!currList || !past) return;

  if (currList.dataset.expenseMenuHandlerAttached !== "true") {
    currList.dataset.expenseMenuHandlerAttached = "true";
    currList.addEventListener("click", (e) => {
      if (e.target.classList.contains("menu")) {
        e.stopPropagation();
        closeAllDropdowns();
        const dropdown = e.target.nextElementSibling;
        dropdown.classList.toggle("hidden");
      }
    });
  }

  const expenses = getExpenses();
  const searchInput = document.getElementById("expense-search");
  const query = String(searchQuery ?? searchInput?.value ?? "")
    .trim()
    .toLowerCase();
  const filteredExpenses = query
    ? expenses.filter((expense) => {
        const amount = Number(expense.amount);
        const searchableValues = [
          expense.tag || "",
          String(expense.amount ?? ""),
          Number.isFinite(amount) ? amount.toFixed(2) : "",
          formatDate(expense.date),
          expense.date || "",
        ];
        return searchableValues.some((value) =>
          String(value).toLowerCase().includes(query),
        );
      })
    : expenses;

  if (filteredExpenses.length === 0) {
    currList.innerHTML = `<div class="empty-placeholder">Start adding Your expenses to view here.</div>`;
    past.innerHTML = "";
    if (query) {
      currList.innerHTML = `<div class="empty-placeholder">No expenses found.</div>`;
    }
    return;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const pastExpByMonth = {};
  const currExpenses = [];

  filteredExpenses.forEach((expense) => {
    const realIndex = expenses.indexOf(expense);
    const date = new Date(expense.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

    if (query) {
      currExpenses.push({ ...expense, realIndex });
    } else if (year === currentYear && month === currentMonth) {
      currExpenses.push({ ...expense, realIndex });
    } else {
      if (!pastExpByMonth[monthKey]) {
        pastExpByMonth[monthKey] = { year, month, expenses: [] };
      }
      pastExpByMonth[monthKey].expenses.push({ ...expense, realIndex });
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
        ${renderExpenseImages(expense, expense.realIndex)}
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
    .sort((a, b) => b.localeCompare(a))
    .forEach((monthKey) => {
      let monthDiv = document.createElement("div");
      monthDiv.classList.add("pastDiv");
      const monthGroup = pastExpByMonth[monthKey];

      const total = monthGroup.expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount),
        0,
      );

      let liHeader = document.createElement("div");
      liHeader.classList.add("pDiv-header");
      const groupDate = new Date(monthGroup.year, monthGroup.month, 1);
      liHeader.textContent = `${groupDate.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      })} Total: Rs.${total.toFixed(2)}`;
      monthDiv.appendChild(liHeader);

      let monthContent = document.createElement("div");
      monthContent.classList.add("pDiv-content", "hidden");
      monthDiv.appendChild(monthContent);

      const openMonthGroup = () => {
        document.querySelectorAll(".pDiv-content").forEach((div) => {
          if (div !== monthContent && !query) div.classList.add("hidden");
        });
        monthContent.classList.toggle("hidden");

        if (!monthContent.dataset.loaded) {
          monthGroup.expenses.forEach((expense) => {
            let li = document.createElement("div");
            li.classList.add("exDiv");
            li.innerHTML = `
              <p> Rs.${expense.amount}</p> 
              <p id="date">${formatDate(expense.date)}</p>
              <span id="t">${expense.tag}</span>
              ${renderExpenseImages(expense, expense.realIndex)}
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
      };
      liHeader.addEventListener("click", openMonthGroup);
      past.appendChild(monthDiv);
    });
}
export function deleteExpense(index) {
  deleteExpenseAt(index);
  displayExpense();
  track();
}
export function addPic(index) {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.multiple = true;
  input.onchange = () => {
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers).then((newImages) => {
      const expense = getExpenses()[index];
      if (!expense) return;

      const existingImages = Array.isArray(expense.images)
        ? [...expense.images]
        : expense.img
          ? [expense.img]
          : [];
      updateExpenseAt(index, { images: [...existingImages, ...newImages] });
      displayExpense();
      track();
    });
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
