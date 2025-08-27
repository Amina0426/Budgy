export let selectedTag = { value: "" };
export function AbouTags(tags, addTag) {
  if (!tags || !addTag) return;
  [("click", "touchend")].forEach((e) => {
    tags.forEach((tag) => {
      tag.addEventListener(e, () => {
        selectedTag.value = tag.textContent;
        tags.forEach((btn) => btn.classList.remove("selected"));
        tag.classList.add("selected");
      });
    });
  });

  const input = document.querySelector("#tagInput");

  addTag.addEventListener("click", () => {
    input.style.visibility = "visible";
    input.focus();
  });
}
