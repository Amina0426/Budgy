import { addExpenses } from "./expenses.js";

export function home(homeBtn) {
  if (!homeBtn) return;

  homeBtn.addEventListener("click", () => {
    const exForm = document.querySelector("#overlay1");
    const addBtn = document.querySelector("#add");
    if (!exForm || !addBtn) return;

    exForm.style.display = "block";

    // Close button
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        exForm.style.display = "none";
      });
    }

    // Add expense button hides form
    addBtn.addEventListener("click", () => {
      exForm.style.display = "none";
      addExpenses();
    });
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
