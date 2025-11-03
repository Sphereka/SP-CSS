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
    const slides = carousel.querySelector(".sp-slides");
    const slidesCount = slides.childElementCount;
    const maxLeft = (slidesCount - 1) * -100; // Calculate maxLeft for each carousel
    let current = 0;

    // Get the delay from the class name, default to 3000ms if not found
    const delayClass = Array.from(carousel.classList).find((className) =>
      className.startsWith("sp-carousel-delay-")
    );
    const delay = delayClass
      ? parseInt(delayClass.split("-").pop())
      : 9000000;

    function changeSlide(next = true) {
      const controls = carousel.querySelector(".sp-controls");
      controls.classList.add("sp-disable");

      if (next) {
        current = current > maxLeft ? current - 100 : 0; // Loop back to start
      } else {
        current = current < 0 ? current + 100 : maxLeft; // Loop to end
      }

      slides.style.left = current + "%";

      setTimeout(() => {
        controls.classList.remove("sp-disable");
      }, 1000); // Transition duration is 1s
    }

    let autoChange = setInterval(changeSlide, delay);
    const restart = function () {
      clearInterval(autoChange);
      autoChange = setInterval(changeSlide, delay);
    };

    // Controls
    carousel
      .querySelector(".sp-next-slide")
      .addEventListener("click", function () {
        changeSlide();
        restart();
      });

    carousel
      .querySelector(".sp-prev-slide")
      .addEventListener("click", function () {
        changeSlide(false);
        restart();
      });
  });

  // nav bar 
  // Navbar toggle script for small screens
  const toggleButton = document.querySelector(".sp-navbar-toggle");
  const navbarMenu = document.querySelector(".sp-navbar-menu");

  toggleButton.addEventListener("click", () => {
    navbarMenu.classList.toggle("active");
  });
});
