// fade animation 
document.addEventListener("DOMContentLoaded", function () {
  const fadeInElements = document.querySelectorAll(".sp-fade-in");

  const options = {
    root: null, // Use the viewport as the container
    rootMargin: "0px",
    threshold: 0.1, // Trigger when 10% of the element is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Stop observing after it has faded in
      }
    });
  }, options);

  fadeInElements.forEach((element) => {
    observer.observe(element); // Observe each fade-in element
  });

  // carousel 
  const carousels = document.querySelectorAll(".sp-carousel");

  carousels.forEach((carousel) => {
    const slidesContainer = carousel.querySelector(".sp-slides");
    const slidesCount = slidesContainer.childElementCount;
    if (!slidesCount) return;

    // Detect RTL for this carousel:
    // Priority: explicit dir attribute on the carousel element,
    // fallback to computed style or document dir.
    const explicitDir = carousel.getAttribute("dir");
    const computedDir = getComputedStyle(carousel).direction;
    const docDir = document.documentElement.dir || "ltr";
    const isRTL = (explicitDir || computedDir || docDir).toLowerCase() === "rtl";

    // Controls
    const nextBtn = carousel.querySelector(".sp-next-slide");
    const prevBtn = carousel.querySelector(".sp-prev-slide");
    // Swap glyphs to make arrows match visual expectation when RTL
    if (isRTL) {
      if (nextBtn) nextBtn.textContent = "◁"; // visually point left for "next" in RTL
      if (prevBtn) prevBtn.textContent = "▷";
    } else {
      if (nextBtn) nextBtn.textContent = "▷";
      if (prevBtn) prevBtn.textContent = "◁";
    }

    // index-based carousel (0..slidesCount-1)
    let index = 0;

    // sign determines how translateX is computed: LTR -> -index * 100%, RTL -> +index * 100%
    const sign = isRTL ? 1 : -1;

    // ensure transition style applied (safe fallback)
    slidesContainer.style.transition = "transform 1s ease-in-out";

    function applyTransform() {
      slidesContainer.style.transform = `translateX(${sign * index * 100}%)`;
    }

    function changeSlide(next = true) {
      const controls = carousel.querySelector(".sp-controls");
      if (controls) controls.classList.add("sp-disable");

      if (next) {
        index = (index + 1) % slidesCount;
      } else {
        index = (index - 1 + slidesCount) % slidesCount;
      }

      applyTransform();

      setTimeout(() => {
        if (controls) controls.classList.remove("sp-disable");
      }, 1000); // matches transition duration
    }

    // get delay from class name, fallback to 3000ms
    const delayClass = Array.from(carousel.classList).find((c) =>
      c.startsWith("sp-carousel-delay-")
    );
    const delay = delayClass ? parseInt(delayClass.split("-").pop(), 10) : 3000;

    let autoChange = setInterval(() => changeSlide(true), delay);
    const restart = function () {
      clearInterval(autoChange);
      autoChange = setInterval(() => changeSlide(true), delay);
    };

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        changeSlide(true);
        restart();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        changeSlide(false);
        restart();
      });
    }

    // initial layout
    applyTransform();
  });


  // nav bar 
  // Navbar toggle script for small screens
  const toggleButton = document.querySelector(".sp-navbar-toggle");
  const navbarMenu = document.querySelector(".sp-navbar-menu");

  toggleButton.addEventListener("click", () => {
    navbarMenu.classList.toggle("active");
  });
});
