export function closeAllDropdowns() {
  document.querySelectorAll(".dd").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

export function formatDate(iso) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
