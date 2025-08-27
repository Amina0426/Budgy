export function viewImg() {
  const fullImageView = document.getElementById("fullImageView");
  const fullImg = document.getElementById("fullImg");

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("bill-img")) {
      fullImg.src = e.target.src;
      fullImageView.style.display = "flex";
      history.pushState({ imgOpen: true }, ""); // push state so back button works
    }
  });
  fullImageView.addEventListener("click", () => {
    fullImageView.style.display = "none";
    history.back(); // simulates pressing back
  });

  window.addEventListener("popstate", () => {
    fullImageView.style.display = "none";
  });
}
export function delImg() {
  const imgSrc = fullImg.src;
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const index = expenses.findIndex((exp) => exp.img === imgSrc);
  if (index === -1) return;
  const backupImg = expenses[index].img;
  expenses[index].img = null;
  localStorage.setItem("expenses", JSON.stringify(expenses));
  displayExpense();

  fullImageView.style.display = "none";

  const undo = document.createElement("div");
  undo.classList.add("success-popup");
  undo.style.opacity = "0.8";
  undo.innerText = "undo image?";
  document.body.appendChild(undo);

  setTimeout(() => {
    undo.remove();
  }, 10000);

  undo.addEventListener("click", () => {
    let imgUndone = JSON.parse(localStorage.getItem("expenses")) || [];
    if (imgUndone[index]) {
      imgUndone[index].img = backupImg;
      localStorage.setItem("expenses", JSON.stringify(imgUndone));
      displayExpense();
    }
    undo.style.display = "none";
  });
}
