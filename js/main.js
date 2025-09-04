import { navigation, scrollTrack } from "./navigation.js";
import { AbouTags } from "./tags.js";
import { home } from "./home.js";
import { addExpenses, displayExpense } from "./expenses.js";
import { addIncome, displayIncome } from "./incomes.js";
import { track } from "./charts.js";
import { viewImg } from "./images.js";
import { closeAllDropdowns } from "./utils.js";
import { toggleMode } from "./settings.js";
import { initData } from "./storage.js";

function initiaLoad() {
  initData();
  const nav = document.querySelectorAll("a");
  const box = document.querySelector(".container");
  const sections = document.querySelectorAll("#h,#e,#i");

  const homeBtn = document.querySelector(".add");
  home(homeBtn);

  const tags = document.querySelectorAll(".tagel");
  const addTagBtn = document.querySelector("#tag2");
  if (tags.length && addTagBtn) {
    AbouTags(tags, addTagBtn);
  }

  if (nav.length && box && sections.length) {
    navigation(nav, box, sections);
    scrollTrack(nav, box, sections);
  }

  if (document.querySelector("#add")) {
    displayExpense();
  }
  if (document.querySelector("#income")) {
    addIncome();
    displayIncome();
  }

  if (document.querySelector("#donutCanvas")) {
    track();
  }

  viewImg();
}

// Close dropdowns globally
document.addEventListener("click", closeAllDropdowns);

// Initialize after all content is loaded
window.addEventListener("load", initiaLoad);

// Restore theme
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});
