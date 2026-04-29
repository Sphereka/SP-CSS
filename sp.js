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

  if (toggleButton){
    toggleButton.addEventListener("click", () => {
      navbarMenu.classList.toggle("active");
    });
  }

  // toast
  class ToastManager {
    constructor() {
      this.toastContainer = null;
      this.initContainer();
    }

    initContainer() {
      let container = document.querySelector('.sp-toast-container');

      if (!container) {
          container = document.createElement('div');
          container.className = 'sp-toast-container';
          document.body.appendChild(container);
      }

      this.toastContainer = container;
    }

    startRingLoop(toast) {
      const firstDelay = 1400;  // after entrance finishes
      const interval = 1500;

      const trigger = () => {
        if (!toast || !toast.isConnected) return;

        toast.classList.remove('replay-ring-active');
        toast.classList.add('replay-ring');

        void toast.offsetWidth;

        toast.classList.remove('replay-ring');
        toast.classList.add('replay-ring-active');
      };

      toast._ringInterval = setTimeout(function loop() {
        trigger();
        toast._ringInterval = setTimeout(loop, interval);
      }, firstDelay);
    }

    showToast(message, type = 'success') {
      const typeMap = {
        danger: 'error',
        error: 'error',
        warning: 'warning',
        success: 'success',
        info: 'info'
      };

      const icon = typeMap[type] || 'success';
      const toast = this.createToastElement(message, icon);

      this.toastContainer.appendChild(toast);

      requestAnimationFrame(() => {
        this.prepareIconAnimation(toast);
        requestAnimationFrame(() => {
            toast.classList.add('show');
            this.startRingLoop(toast);
        });
      });

      const progressFill = toast.querySelector('.sp-toast-timer-fill');
      const duration = 5000;
      let remaining = duration;
      let startTime = performance.now();
      let timerId = null;

      const removeLater = () => {
        timerId = setTimeout(() => {
          this.removeToast(toast);
        }, remaining);
      };

      removeLater();

      toast.addEventListener('mouseenter', () => {
        if (timerId) clearTimeout(timerId);
        if (progressFill) progressFill.style.animationPlayState = 'paused';
        remaining = Math.max(0, remaining - (performance.now() - startTime));
      });

      toast.addEventListener('mouseleave', () => {
        if (progressFill) progressFill.style.animationPlayState = 'running';
        startTime = performance.now();
        removeLater();
      });

      toast.addEventListener('click', () => {
        if (timerId) clearTimeout(timerId);
        this.removeToast(toast);
      });
    }

    createToastElement(message, icon) {
      const toast = document.createElement('div');
      toast.className = 'sp-toast';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      toast.setAttribute('aria-atomic', 'true');

      const iconSVG = this.getIconSVG(icon);

      toast.innerHTML = `
          <div class="sp-toast-content">
              <div class="sp-toast-icon ${icon}">${iconSVG}</div>
              <div class="sp-toast-message">${this.escapeHtml(message)}</div>
              <div class="sp-toast-timer-progress">
                  <span class="sp-toast-timer-fill"></span>
              </div>
          </div>
      `;

      return toast;
    }

    prepareIconAnimation(toast) {
      const iconWrap = toast.querySelector('.sp-toast-icon');
      if (!iconWrap) return;

      const shapes = iconWrap.querySelectorAll('path, line, circle');

      shapes.forEach((el, index) => {
        try {
            if (typeof el.getTotalLength === 'function') {
                const length = el.getTotalLength();
                el.style.strokeDasharray = `${length}`;
                el.style.strokeDashoffset = `${length}`;
                el.style.animationDelay = `${0.08 + index * 0.08}s`;
            }
        } catch (e) {
            // Skip elements that cannot be measured safely
        }
      });
    }

    getIconSVG(type) {
      const icons = {
        success: `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5"></path>
            </svg>
        `,
        error: `
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        `,
        warning: `
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 21h20L12 3z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `,
        info: `
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="11"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `
      };

      return icons[type] || icons.success;
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = String(text);
      return div.innerHTML;
    }

    removeToast(toast) {
      if (!toast || !toast.parentNode) return;

      if (toast._ringInterval) {
        clearTimeout(toast._ringInterval);
        toast._ringInterval = null;
      }

      toast.classList.remove('show');
      toast.classList.add('leaving');

      setTimeout(() => {
          if (toast && toast.parentNode) {
              toast.parentNode.removeChild(toast);
          }
      }, 260);
    }
  }

  const toastManager = new ToastManager();

  function showToast(message, type = 'success') {
    toastManager.showToast(message, type);
  }

  window.SpToast = {
    show: showToast,
    manager: toastManager
  };

  window.showToast = showToast;
});
