window.addEventListener("scroll", () => {
  const head = document.getElementById("header");
  if (window.scrollY > 50) {
    head.classList.add("shrink");
  } else {
    head.classList.remove("shrink");
  }
});
