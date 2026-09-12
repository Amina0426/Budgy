export function closeAllDropdowns() {
  document.querySelectorAll(".dd").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

export function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}
