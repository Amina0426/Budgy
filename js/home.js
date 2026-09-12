import { addExpenses } from "./expenses.js";

export function home(homeBtn) {
  if (!homeBtn) return;

  const exForm = document.querySelector("#overlay1");
  const addBtn = document.querySelector("#add");
  if (!exForm || !addBtn) return;

  if (homeBtn.dataset.expenseHandlersAttached === "true") return;
  homeBtn.dataset.expenseHandlersAttached = "true";

  homeBtn.addEventListener("click", () => {
    exForm.style.display = "block";
  });

  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      exForm.style.display = "none";
    });
  }

  addBtn.addEventListener("click", () => {
    exForm.style.display = "none";
    addExpenses();
  });
}

export function popMssg(text) {
  const mssg = document.createElement("div");
  mssg.classList.add("success-popup");
  mssg.innerText = text;
  document.body.appendChild(mssg);

  setTimeout(() => {
    mssg.remove();
  }, 2000);
}
