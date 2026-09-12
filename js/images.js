import { displayExpense } from "./expenses.js";
import { getExpenses, updateExpenseAt } from "./storage.js";
import { track } from "./charts.js";

let currentImages = [];
let currentIndex = 0;
let currentExpenseIndex = -1;
let imageViewerInitialized = false;

function closeViewer() {
  const fullImageView = document.getElementById("fullImageView");
  if (fullImageView) fullImageView.style.display = "none";
}

function updateFullscreenImage() {
  console.log("update full scren called");
  const fullImg = document.getElementById("fullImg");
  const imgCounter = document.getElementById("imgCounter");
  if (!fullImg || !imgCounter || currentImages.length === 0) return;

  fullImg.src = currentImages[currentIndex];
  imgCounter.textContent = `${currentIndex + 1}/${currentImages.length}`;
}

function openImage(target) {
  console.log("open image xleed");
  const encodedImages = target.dataset.images;
  const expenseIndex = Number(target.dataset.expenseIndex);
  const imageIndex = Number(target.dataset.imageIndex);
  if (!encodedImages || !Number.isInteger(expenseIndex)) return;
  console.log("got all data");
  let images;
  try {
    images = JSON.parse(decodeURIComponent(encodedImages));
  } catch {
    console.log("couldnt parse");
    return;
  }
  console.log("parsing done");
  if (!Array.isArray(images) || images.length === 0) return;

  currentImages = images;
  currentExpenseIndex = expenseIndex;
  currentIndex = Math.min(
    Math.max(Number.isInteger(imageIndex) ? imageIndex : 0, 0),
    currentImages.length - 1,
  );
  updateFullscreenImage();
  console.log("updated");

  const fullImageView = document.getElementById("fullImageView");
  fullImageView.style.display = "flex";
  history.pushState({ imgOpen: true }, "");
  console.log("opened");
}

export function viewImg() {
  if (imageViewerInitialized) return;
  imageViewerInitialized = true;
  console.log("viewImg called");

  const fullImageView = document.getElementById("fullImageView");
  const nextButton = document.getElementById("nextImgBtn");
  const previousButton = document.getElementById("prevImgBtn");
  if (!fullImageView) return;

  document.addEventListener("click", (event) => {
    const thumbnail = event.target.closest?.(".bill-img");
    if (thumbnail) openImage(thumbnail);
  });
  console.log("added listener");
  fullImageView.addEventListener("click", (event) => {
    if (event.target === fullImageView) {
      closeViewer();
      history.back();
    }
  });

  nextButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (currentImages.length === 0) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateFullscreenImage();
  });

  previousButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (currentImages.length === 0) return;
    currentIndex =
      (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateFullscreenImage();
  });

  window.addEventListener("popstate", closeViewer);
}

export function delImg() {
  const expense = getExpenses()[currentExpenseIndex];
  if (!expense || currentImages.length === 0) return;

  if (Array.isArray(expense.images)) {
    if (currentIndex >= expense.images.length) return;
    expense.images.splice(currentIndex, 1);
    updateExpenseAt(currentExpenseIndex, { images: expense.images });
  } else if (expense.img === currentImages[currentIndex]) {
    updateExpenseAt(currentExpenseIndex, { img: null });
  } else {
    return;
  }

  currentImages.splice(currentIndex, 1);
  displayExpense();
  track();

  if (currentImages.length === 0) {
    closeViewer();
    currentExpenseIndex = -1;
    return;
  }
  if (currentIndex >= currentImages.length)
    currentIndex = currentImages.length - 1;
  updateFullscreenImage();
}

window.delImg = delImg;
