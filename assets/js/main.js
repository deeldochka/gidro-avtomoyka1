(function () {
  "use strict";

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  var year = document.getElementById("year");

  /* ----- Header ----- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ----- Mobile menu ----- */
  function setMenu(open) {
    if (!burger || !mobileNav) return;
    mobileNav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    var use = burger.querySelector("use");
    if (use) use.setAttribute("href", open ? "#i-close" : "#i-menu");
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      setMenu(!mobileNav.classList.contains("is-open"));
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    document.addEventListener("click", function (event) {
      if (!mobileNav.classList.contains("is-open")) return;
      if (mobileNav.contains(event.target) || burger.contains(event.target)) return;
      setMenu(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

  /* ----- Reveal on scroll ----- */
  var revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  /* ----- Gallery lightbox ----- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCap = document.getElementById("lightboxCap");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var galleryButtons = Array.prototype.slice.call(
    document.querySelectorAll(".gallery__item")
  );
  var currentPhoto = 0;

  function showPhoto(index) {
    if (!galleryButtons.length || !lightboxImg) return;
    currentPhoto = (index + galleryButtons.length) % galleryButtons.length;
    var button = galleryButtons[currentPhoto];
    var image = button.querySelector("img");
    lightboxImg.src = button.getAttribute("data-full");
    lightboxImg.alt = image ? image.alt : "";
    if (lightboxCap) {
      lightboxCap.textContent = button.getAttribute("data-caption") || "";
    }
  }

  function openLightbox(index) {
    if (!lightbox || typeof lightbox.showModal !== "function") return;
    showPhoto(index);
    if (!lightbox.open) lightbox.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.open) return;
    lightbox.close();
  }

  galleryButtons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      openLightbox(index);
    });
  });

  if (lightbox) {
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev)
      lightboxPrev.addEventListener("click", function () {
        showPhoto(currentPhoto - 1);
      });
    if (lightboxNext)
      lightboxNext.addEventListener("click", function () {
        showPhoto(currentPhoto + 1);
      });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("close", function () {
      document.body.style.overflow = "";
    });

    lightbox.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPhoto(currentPhoto - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showPhoto(currentPhoto + 1);
      }
    });
  }

  /* ----- Booking ----- */
  var form = document.getElementById("bookingForm");
  var serviceSelect = document.getElementById("service");
  var nameInput = document.getElementById("name");
  var phoneInput = document.getElementById("phone");
  var dateInput = document.getElementById("date");
  var timeInput = document.getElementById("time");
  var carInput = document.getElementById("car");
  var commentInput = document.getElementById("comment");
  var successPanel = document.getElementById("formSuccess");
  var summaryBox = document.getElementById("requestSummary");
  var copyButton = document.getElementById("copyRequest");
  var editButton = document.getElementById("editRequest");
  var copyFeedback = document.getElementById("copyFeedback");
  var lastRequestText = "";

  var fieldName = document.getElementById("fieldName");
  var fieldPhone = document.getElementById("fieldPhone");
  var fieldService = document.getElementById("fieldService");

  /* Date: today or later */
  if (dateInput) {
    var now = new Date();
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    dateInput.min = local.toISOString().slice(0, 10);
  }

  /* Prefill service from price cards */
  document.querySelectorAll("[data-book]").forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-book");
      if (!serviceSelect || !value) return;
      serviceSelect.value = value;
      if (fieldService) fieldService.classList.remove("is-invalid");
    });
  });

  /* Phone mask */
  function formatPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.charAt(0) === "8") digits = "7" + digits.slice(1);
    if (digits.charAt(0) !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);

    var result = "+7";
    if (digits.length > 1) result += " (" + digits.slice(1, 4);
    if (digits.length >= 4) result += ") " + digits.slice(4, 7);
    if (digits.length >= 7) result += "-" + digits.slice(7, 9);
    if (digits.length >= 9) result += "-" + digits.slice(9, 11);
    return result;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      if (!phoneInput.value.trim()) {
        phoneInput.value = "";
        return;
      }
      phoneInput.value = formatPhone(phoneInput.value);
      if (fieldPhone) {
        fieldPhone.classList.toggle(
          "is-invalid",
          phoneInput.value.replace(/\D/g, "").length < 11
        );
      }
    });
  }

  if (nameInput) {
    nameInput.addEventListener("input", function () {
      if (fieldName) {
        fieldName.classList.toggle("is-invalid", nameInput.value.trim().length < 2);
      }
    });
  }

  if (serviceSelect) {
    serviceSelect.addEventListener("change", function () {
      if (fieldService) fieldService.classList.remove("is-invalid");
    });
  }

  function validName() {
    var ok = nameInput && nameInput.value.trim().length >= 2;
    if (fieldName) fieldName.classList.toggle("is-invalid", !ok);
    return ok;
  }

  function validPhone() {
    var ok =
      phoneInput && phoneInput.value.replace(/\D/g, "").length === 11;
    if (fieldPhone) fieldPhone.classList.toggle("is-invalid", !ok);
    return ok;
  }

  function validService() {
    var ok = serviceSelect && serviceSelect.value !== "";
    if (fieldService) fieldService.classList.toggle("is-invalid", !ok);
    return ok;
  }

  function formatDate(value) {
    if (!value) return "";
    var parts = value.split("-");
    if (parts.length !== 3) return value;
    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  function buildRequest() {
    var lines = ["Заявка на мойку «Гидро»"];
    lines.push("Имя: " + (nameInput ? nameInput.value.trim() : ""));
    lines.push("Телефон: " + (phoneInput ? phoneInput.value.trim() : ""));
    lines.push(
      "Автомобиль: " +
        (carInput && carInput.value.trim() ? carInput.value.trim() : "не указан")
    );
    lines.push("Услуга: " + (serviceSelect ? serviceSelect.value : ""));

    var dateValue = dateInput ? dateInput.value : "";
    var timeValue = timeInput ? timeInput.value : "";
    if (dateValue || timeValue) {
      lines.push(
        "Дата и время: " +
          (dateValue ? formatDate(dateValue) : "дата не указана") +
          (timeValue ? ", " + timeValue : "")
      );
    } else {
      lines.push("Дата и время: уточним по телефону");
    }

    if (commentInput && commentInput.value.trim()) {
      lines.push("Комментарий: " + commentInput.value.trim());
    }

    return lines.join("\n");
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var nameOk = validName();
      var phoneOk = validPhone();
      var serviceOk = validService();

      if (!nameOk) {
        if (nameInput) nameInput.focus();
        return;
      }
      if (!phoneOk) {
        if (phoneInput) phoneInput.focus();
        return;
      }
      if (!serviceOk) {
        if (serviceSelect) serviceSelect.focus();
        return;
      }

      lastRequestText = buildRequest();
      if (summaryBox) summaryBox.textContent = lastRequestText;
      form.classList.add("is-sent");
      if (successPanel) {
        successPanel.classList.add("is-visible");
        successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
        var callButton = successPanel.querySelector('a[href^="tel:"]');
        if (callButton) callButton.focus({ preventScroll: true });
      }
    });
  }

  if (editButton) {
    editButton.addEventListener("click", function () {
      if (!form) return;
      form.classList.remove("is-sent");
      if (successPanel) successPanel.classList.remove("is-visible");
      if (copyFeedback) copyFeedback.textContent = "";
      if (nameInput) nameInput.focus({ preventScroll: true });
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        var ok = document.execCommand("copy");
        document.body.removeChild(area);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (error) {
        document.body.removeChild(area);
        reject(error);
      }
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var text = lastRequestText || buildRequest();
      copyText(text)
        .then(function () {
          if (copyFeedback) {
            copyFeedback.textContent = "Заявка скопирована — вставьте её в сообщение.";
          }
        })
        .catch(function () {
          if (copyFeedback) {
            copyFeedback.textContent =
              "Не удалось скопировать автоматически. Выделите текст заявки вручную.";
          }
        });
    });
  }
})();
