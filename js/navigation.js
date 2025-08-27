export function navigation(nav, box, sections) {
  nav.forEach((link) => {
    if (link.getAttribute("href") === "#h") {
      link.classList.add("active");
    }

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
      nav.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

export function scrollTrack(nav, box, sections) {
  box.addEventListener("scroll", () => {
    let curr = "";
    sections.forEach((sec) => {
      if (box.scrollLeft >= sec.offsetLeft - 100) {
        curr = sec.getAttribute("id");
      }
    });
    nav.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(curr)) {
        link.classList.add("active");
      }
    });
  });
}
