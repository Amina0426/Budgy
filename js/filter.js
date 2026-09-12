import { displayExpense } from "./expenses.js";

export function filter() {
  const searchInput = document.getElementById("expense-search");
  const searchToggle = document.getElementById("expense-search-toggle");
  const searchHeader = searchInput?.closest(".curr-header");
  const searchArea = searchInput?.closest(".filter-container");
  const container = document.querySelector(".container");

  if (!searchInput || searchInput.dataset.filterHandlersAttached === "true") {
    return;
  }
  searchInput.dataset.filterHandlersAttached = "true";

  const pastSection = document.getElementById("past-section");
  const pastHeader = pastSection?.querySelector(".p-header");
  const pastArrow = pastSection?.querySelector(".arrow-caret");

  const setPastSearchState = (isSearching) => {
    pastSection?.classList.toggle("open", isSearching);
    pastHeader?.classList.toggle("raised", isSearching);
    pastArrow?.classList.toggle("rotated", isSearching);
  };

  const closeSearch = () => {
    if (
      !searchInput.value &&
      !searchHeader?.classList.contains("search-open")
    ) {
      return;
    }

    searchInput.value = "";
    searchInput.classList.remove("search-visible");
    searchHeader?.classList.remove("search-open");
    searchToggle?.setAttribute("aria-expanded", "false");
    setPastSearchState(false);
    displayExpense();
  };

  searchToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isExpanded = searchInput.classList.toggle("search-visible");
    searchHeader?.classList.toggle("search-open", isExpanded);
    searchToggle.setAttribute("aria-expanded", String(isExpanded));
    if (isExpanded) {
      searchInput.focus();
    } else {
      closeSearch();
    }
  });

  searchInput.addEventListener("input", () => {
    setPastSearchState(false);
    displayExpense(searchInput.value.trim());
  });

  document.addEventListener("click", (event) => {
    if (!searchArea?.contains(event.target)) closeSearch();
  });

  container?.addEventListener("scroll", closeSearch);
}
