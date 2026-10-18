
/* =====================================
   JESTER TOM'S SERVICE
   WEBSITE FUNCTIONALITY
   ===================================== */

const categories = [
  { name: "Massage appointment", icon: "🌸" },
  { name: "Outing", icon: "🏕️" },
  { name: "Indoor hangout", icon: "🏠" },
  { name: "Food outing", icon: "🍴" }
];

const pages = [
  "assets/morning/morning massage page.png",
  "assets/morning/morning outing page.png",
  "assets/morning/morning indoors page.png",
  "assets/morning/morning food page.png"
];

const GREETING_IMAGE =
  "assets/morning/Morning greetings page.png";

const WHEEL_IMAGE =
  "assets/morning/morning wheels page.png";

const CONFIRMATION_IMAGE =
  "assets/morning/morning booking confirmed.png";

const BOOKING_FUNCTION_URL =
  "https://kmmogejcdhnxfptjwent.supabase.co/functions/v1/submit-booking";

/* =====================================
   ELEMENT REFERENCES
   ===================================== */

const image = document.getElementById("page-image");
const wrapper = document.querySelector(".image-wrapper");

const getStartedButton =
  document.getElementById("get-started");

const wheelControls =
  document.getElementById("wheel-controls");

const wheelTrack =
  document.getElementById("wheel-track");

const wheelWindow =
  document.querySelector(".wheel-window");

const pageBack =
  document.getElementById("page-back");

const bookingForm =
  document.getElementById("booking-form");

const monthSelect =
  document.getElementById("booking-month");

const yearSelect =
  document.getElementById("booking-year");

const bookingCalendar =
  document.getElementById("booking-calendar");

const bookingComments =
  document.getElementById("booking-comments");

const bookingConfirm =
  document.getElementById("booking-confirm");

const confirmationDetails =
  document.getElementById("confirmation-details");

const confirmationHomeButton =
  document.getElementById("confirmation-home");

/* =====================================
   WEBSITE STATE
   ===================================== */

let selectedIndex = 1;
let spinning = false;
let dragging = false;

let dragStartY = 0;
let dragDistance = 0;
let dragSteps = 0;

let tappedIndex = -1;
let pointerMoved = false;

let bookingMonth = new Date().getMonth();
let bookingYear = new Date().getFullYear();
let bookingDate = null;

let bookingSubmitting = false;

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

/* =====================================
   GENERAL NAVIGATION
   ===================================== */

function hideConfirmation() {
  confirmationDetails.hidden = true;
  confirmationHomeButton.hidden = true;
  updateAppointmentsLink();
}

function showGreeting() {
  bookingForm.hidden = true;
  pageBack.hidden = true;
  wheelControls.hidden = true;

  hideConfirmation();

  wrapper.classList.remove("booking-page");

  image.src = GREETING_IMAGE;
  image.alt = "Jester Tom's Service Greeting Page";

  getStartedButton.hidden = false;
  getStartedButton.style.display = "block";

  spinning = false;
  dragging = false;
}

function showWheel() {
  bookingForm.hidden = true;
  pageBack.hidden = true;

  hideConfirmation();

  wrapper.classList.remove("booking-page");

  image.src = WHEEL_IMAGE;
  image.alt = "Jester Tom's Service Selection Wheel";

  getStartedButton.hidden = true;
  getStartedButton.style.display = "none";

  wheelControls.hidden = false;

  selectedIndex = 1;
  spinning = false;
  dragging = false;

  buildWheel();
}

function goBack() {
  if (spinning) return;
  showGreeting();
}

function backToWheel() {
  showWheel();
}

function confirmationHome() {
  showGreeting();
}

/* =====================================
   SELECTION WHEEL
   ===================================== */

function wrapIndex(index) {
  return (
    (index % categories.length) + categories.length
  ) % categories.length;
}

function rowHeight() {
  return wheelWindow.getBoundingClientRect().height / 4;
}

function buildWheel(offset = 0) {
  wheelTrack.innerHTML = "";

  for (let position = -3; position <= 5; position++) {
    const category =
      categories[wrapIndex(selectedIndex + position)];

    const row = document.createElement("div");
    row.className = "wheel-option";

    if (position === 0) {
      row.classList.add("selected");
    }

    const icon = document.createElement("span");
    icon.className = "option-icon";
    icon.textContent = category.icon;

    const label = document.createElement("span");
    label.textContent = category.name;

    row.append(icon, label);
    wheelTrack.appendChild(row);
  }

  wheelTrack.style.transition = "none";

  const y = -2 * rowHeight() + offset;

  wheelTrack.style.transform =
    `translateY(${y}px)`;
}

function moveWheel(direction) {
  if (spinning || dragging || wheelControls.hidden) {
    return;
  }

  selectedIndex = wrapIndex(
    selectedIndex + direction
  );

  buildWheel();
}

/* =====================================
   TOUCH AND DRAG SUPPORT
   ===================================== */

wheelWindow.style.cursor = "grab";
wheelWindow.style.touchAction = "none";

wheelWindow.addEventListener("pointerdown", event => {
  if (spinning || wheelControls.hidden) return;

  dragging = true;
  pointerMoved = false;

  dragStartY = event.clientY;
  dragDistance = 0;
  dragSteps = 0;

  const options = Array.from(
    wheelTrack.querySelectorAll(".wheel-option")
  );

  tappedIndex = options.findIndex(option => {
    const rect = option.getBoundingClientRect();

    return (
      event.clientY >= rect.top &&
      event.clientY < rect.bottom
    );
  });

  wheelWindow.setPointerCapture(event.pointerId);
  wheelWindow.style.cursor = "grabbing";
});

wheelWindow.addEventListener("pointermove", event => {
  if (!dragging) return;

  dragDistance = event.clientY - dragStartY;

  if (Math.abs(dragDistance) > 12) {
    pointerMoved = true;
  }

  if (!pointerMoved) return;

  const height = rowHeight();

  if (height <= 0) return;

  const steps = Math.round(-dragDistance / height);

  if (steps !== dragSteps) {
    selectedIndex = wrapIndex(
      selectedIndex + steps - dragSteps
    );

    dragSteps = steps;
  }

  const remainder =
    dragDistance + dragSteps * height;

  buildWheel(remainder);
});

wheelWindow.addEventListener("pointerup", () => {
  if (!dragging) return;

  dragging = false;
  wheelWindow.style.cursor = "grab";

  if (!pointerMoved && tappedIndex !== -1) {
    selectedIndex = wrapIndex(
      selectedIndex + tappedIndex - 3
    );
  }

  buildWheel();

  tappedIndex = -1;
  pointerMoved = false;
  dragDistance = 0;
  dragSteps = 0;
});

wheelWindow.addEventListener("pointercancel", () => {
  dragging = false;
  tappedIndex = -1;
  pointerMoved = false;

  wheelWindow.style.cursor = "grab";

  buildWheel();
});

wheelWindow.addEventListener("wheel", event => {
  event.preventDefault();

  if (spinning || dragging || wheelControls.hidden) {
    return;
  }

  const amount = Math.max(
    1,
    Math.round(Math.abs(event.deltaY) / 60)
  );

  const direction = event.deltaY > 0 ? 1 : -1;

  moveWheel(direction * amount);
}, { passive: false });

/* =====================================
   SURPRISE ME
   ===================================== */

async function surpriseMe() {
  if (spinning || dragging || wheelControls.hidden) {
    return;
  }

  spinning = true;

  // Excludes Massage appointment
  const destination =
    Math.floor(Math.random() * 3) + 1;

  const distance = wrapIndex(
    destination - selectedIndex
  );

  const totalSteps = 12 + distance;

  for (let step = 0; step < totalSteps; step++) {
    selectedIndex = wrapIndex(selectedIndex + 1);

    buildWheel();

    const progress = step / totalSteps;

    const delay = Math.round(
      65 + 280 * progress * progress
    );

    await sleep(delay);
  }

  spinning = false;
}

/* =====================================
   CATEGORY SELECTION
   ===================================== */

function confirmSelection() {
  if (spinning || dragging || wheelControls.hidden) {
    return;
  }

  image.src = pages[selectedIndex];
  image.alt = categories[selectedIndex].name;

  wrapper.classList.add("booking-page");
  wrapper.classList.remove("outing-page", "indoor-page", "food-page");

  if (selectedIndex === 1) {
  wrapper.classList.add("outing-page");
  } else if (selectedIndex === 2) {
  wrapper.classList.add("indoor-page");
  } else if (selectedIndex === 3) {
  wrapper.classList.add("food-page");
  }
  

  wheelControls.hidden = true;
  getStartedButton.hidden = true;

  hideConfirmation();

  pageBack.hidden = false;

  openBookingForm();
}

/* =====================================
   CALENDAR SETUP
   ===================================== */

const bookingMonths = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

bookingMonths.forEach((month, index) => {
  monthSelect.add(new Option(month, index));
});

for (let year = 2026; year <= 2040; year++) {
  yearSelect.add(new Option(year, year));
}

/* =====================================
   OPEN BOOKING FORM
   ===================================== */

function openBookingForm() {
  bookingDate = null;
  bookingComments.value = "";

  document.getElementById("booking-count")
    .textContent = "0/200";

  const today = new Date();

  bookingYear = Math.max(
    2026,
    Math.min(2040, today.getFullYear())
  );

  bookingMonth = today.getMonth();

  document.getElementById("booking-title")
    .textContent = categories[selectedIndex].name;

  bookingConfirm.disabled = true;
  bookingConfirm.textContent = "Confirm →";

  bookingForm.hidden = false;

  renderBookingCalendar();
}

/* =====================================
   DRAW INTERACTIVE CALENDAR
   ===================================== */

function renderBookingCalendar() {
  monthSelect.value = String(bookingMonth);
  yearSelect.value = String(bookingYear);

  bookingCalendar.innerHTML = "";

  const weekdays = [
    "Mon", "Tue", "Wed", "Thu",
    "Fri", "Sat", "Sun"
  ];

  weekdays.forEach(day => {
    const heading = document.createElement("div");

    heading.className = "weekday";
    heading.textContent = day;

    bookingCalendar.appendChild(heading);
  });

  const firstDay = new Date(
    bookingYear,
    bookingMonth,
    1
  );

  const daysInMonth = new Date(
    bookingYear,
    bookingMonth + 1,
    0
  ).getDate();

  const offset = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < offset; i++) {
    bookingCalendar.appendChild(
      document.createElement("div")
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = day;

    const dateString =
      `${bookingYear}-` +
      `${String(bookingMonth + 1).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}`;

    if (bookingDate === dateString) {
      button.classList.add("chosen");
    }

    button.addEventListener("click", () => {
      bookingDate = dateString;
      bookingConfirm.disabled = false;

      renderBookingCalendar();
    });

    bookingCalendar.appendChild(button);
  }
}

/* =====================================
   MONTH NAVIGATION
   ===================================== */

function changeBookingMonth(direction) {
  const next = new Date(
    bookingYear,
    bookingMonth + direction,
    1
  );

  if (
    next.getFullYear() < 2026 ||
    next.getFullYear() > 2040
  ) {
    return;
  }

  bookingYear = next.getFullYear();
  bookingMonth = next.getMonth();

  bookingDate = null;
  bookingConfirm.disabled = true;

  renderBookingCalendar();
}

monthSelect.addEventListener("change", () => {
  bookingMonth = Number(monthSelect.value);

  bookingDate = null;
  bookingConfirm.disabled = true;

  renderBookingCalendar();
});

yearSelect.addEventListener("change", () => {
  bookingYear = Number(yearSelect.value);

  bookingDate = null;
  bookingConfirm.disabled = true;

  renderBookingCalendar();
});

/* =====================================
   COMMENTS COUNTER
   ===================================== */

bookingComments.addEventListener("input", () => {
  document.getElementById("booking-count")
    .textContent =
      `${bookingComments.value.length}/200`;
});

/* =====================================
   SUBMIT BOOKING TO SUPABASE
   ===================================== */

async function submitBooking() {
  if (!bookingDate || bookingSubmitting) {
    return;
  }

  bookingSubmitting = true;
  bookingConfirm.disabled = true;
  bookingConfirm.textContent = "Submitting...";

  try {
    const response = await fetch(
      BOOKING_FUNCTION_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category: categories[selectedIndex].name,
          booking_date: bookingDate,
          comments: bookingComments.value.trim()
        })
      }
    );

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.error || "Submission failed"
      );
    }

    // Hide the calendar
    bookingForm.hidden = true;

    // Show confirmation background
    image.src = CONFIRMATION_IMAGE;
    image.alt = "Booking Confirmed";

    // Format the selected date
    const [year, month, day] =
      bookingDate.split("-").map(Number);

    const formattedDate = new Date(
      year,
      month - 1,
      day
    ).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    // Display the correct booking details
    document.getElementById("confirmed-date")
      .textContent = formattedDate;

    document.getElementById("confirmed-category")
      .textContent = categories[selectedIndex].name;

    confirmationDetails.hidden = false;
    confirmationHomeButton.hidden = false;

    // Hide the booking page's old Back button
    pageBack.hidden = true;

  } catch (error) {
    console.error("Booking submission error:", error);

    alert(
      "Booking could not be submitted. Please try again."
    );

  } finally {
    bookingSubmitting = false;

    bookingConfirm.textContent = "Confirm →";
    bookingConfirm.disabled = !bookingDate;
  }
}
/* =====================================
   APPOINTMENTS PAGE NAVIGATION
   ===================================== */

const appointmentsLink =
  document.getElementById("appointments-link");

const appointmentsBack =
  document.getElementById("appointments-back");

const APPOINTMENTS_MORNING =
  "assets/morning/morning apt WO.png";

const APPOINTMENTS_NIGHT =
  "assets/night/night apt WO.png";

let previousAppointmentsPage = null;

// Show the Appointments page
function showAppointments() {
  previousAppointmentsPage = image.src;

  const isNight =
    image.src.includes("assets/night/");

  image.src = isNight
    ? APPOINTMENTS_NIGHT
    : APPOINTMENTS_MORNING;

  image.alt = "Appointments";

  bookingForm.hidden = true;
  wheelControls.hidden = true;
  getStartedButton.hidden = true;
  pageBack.hidden = true;

  hideConfirmation();

  appointmentsLink.hidden = true;
  appointmentsBack.hidden = false;

  wrapper.classList.remove("booking-page");
  wrapper.classList.add("appointments-page");
  selectedAppointmentDate = null;
  appointmentsMonth = new Date().getMonth();
  appointmentsYear = new Date().getFullYear();

  appointmentsUI.hidden = false;
  renderAppointmentsCalendar();

  appointmentsDetails.textContent =
  "Select a date to view your appointments.";
}

// Return to the previous page
function backFromAppointments() {
  appointmentsUI.hidden = true;
  appointmentsBack.hidden = true;

  wrapper.classList.remove("appointments-page");

  if (
    previousAppointmentsPage &&
    previousAppointmentsPage.includes("wheels")
  ) {
    showWheel();
  } else {
    showGreeting();
  }

  updateAppointmentsLink();
}

// Show the Appointments icon on supported pages
function updateAppointmentsLink() {
  const currentImage = image.src.toLowerCase();

  const isGreeting = currentImage.includes("greeting");
  const isWheel = currentImage.includes("wheels");
  const isConfirmation =
  currentImage.includes("booking confirmed") ||
  !confirmationDetails.hidden;

  appointmentsLink.hidden = !(
    isGreeting || isWheel || isConfirmation
  );

  appointmentsLink.classList.toggle(
    "appointments-greeting", isGreeting
  );

  appointmentsLink.classList.toggle(
    "appointments-wheel", isWheel
  );

  appointmentsLink.classList.toggle(
    "appointments-confirmation", isConfirmation
  );
}

image.addEventListener("load", updateAppointmentsLink);
updateAppointmentsLink();

/* =====================================
   INTERACTIVE APPOINTMENTS CALENDAR
   ===================================== */

const appointmentsUI =
  document.getElementById("appointments-ui");

const appointmentsCalendar =
  document.getElementById("appointments-calendar");

const appointmentsDetails =
  document.getElementById("appointments-details");

const appointmentsMonthButton =
  document.getElementById("appointments-month-select");

let appointmentsMonth = new Date().getMonth();
let appointmentsYear = new Date().getFullYear();
let selectedAppointmentDate = null;

function updateAppointmentsBackground() {
  const isNight = image.src.includes("assets/night/");
  const folder = isNight ? "night" : "morning";
  const prefix = isNight ? "night" : "morning";
  const suffix = selectedAppointmentDate ? "W" : "WO";

  image.src = `assets/${folder}/${prefix} apt ${suffix}.png`;
}

function renderAppointmentsCalendar() {
  appointmentsCalendar.innerHTML = "";

  appointmentsMonthButton.textContent =
    `${bookingMonths[appointmentsMonth]} ${appointmentsYear} ▾`;

  const firstDay = new Date(
    appointmentsYear, appointmentsMonth, 1
  ).getDay();

  const daysInMonth = new Date(
    appointmentsYear, appointmentsMonth + 1, 0
  ).getDate();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  weekdays.forEach(day => {
    const label = document.createElement("span");
    label.className = "appointment-weekday";
    label.textContent = day;
    appointmentsCalendar.appendChild(label);
  });

  for (let i = 0; i < firstDay; i++) {
    appointmentsCalendar.appendChild(
      document.createElement("span")
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day;

    const date =
      `${appointmentsYear}-` +
      `${String(appointmentsMonth + 1).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}`;

    if (date === selectedAppointmentDate) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      selectedAppointmentDate = date;
      updateAppointmentsBackground();
      renderAppointmentsCalendar();
      showAppointmentPlans(date);
    });

    appointmentsCalendar.appendChild(button);
  }
}

function changeAppointmentsMonth(direction) {
  const next = new Date(
    appointmentsYear,
    appointmentsMonth + direction,
    1
  );

  if (next.getFullYear() < 2026 || next.getFullYear() > 2040) {
    return;
  }

  appointmentsMonth = next.getMonth();
  appointmentsYear = next.getFullYear();
  selectedAppointmentDate = null;

  updateAppointmentsBackground();
  renderAppointmentsCalendar();

  appointmentsDetails.textContent =
    "Select a date to view your appointments.";
}

function showAppointmentPlans(date) {
  const heading = document.createElement("h3");
  heading.textContent = new Date(
    `${date}T12:00:00`
  ).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const message = document.createElement("p");
  message.textContent =
    "Appointment details will appear here once connected to your saved bookings.";

  appointmentsDetails.replaceChildren(heading, message);
}

document.getElementById("appointments-prev-month")
  .addEventListener("click", () => changeAppointmentsMonth(-1));

document.getElementById("appointments-next-month")
  .addEventListener("click", () => changeAppointmentsMonth(1));

appointmentsMonthButton.addEventListener("click", () => {
  const answer = prompt(
    "Enter month and year (MM/YYYY):",
    `${String(appointmentsMonth + 1).padStart(2, "0")}/${appointmentsYear}`
  );

  if (!answer) return;

  const match = answer.match(/^(0?[1-9]|1[0-2])\/(20\d{2})$/);

  if (!match) {
    alert("Please use MM/YYYY, for example 10/2026.");
    return;
  }

  const year = Number(match[2]);

  if (year < 2026 || year > 2040) {
    alert("Please choose a year between 2026 and 2040.");
    return;
  }

  appointmentsMonth = Number(match[1]) - 1;
  appointmentsYear = year;
  selectedAppointmentDate = null;

  updateAppointmentsBackground();
  renderAppointmentsCalendar();

  appointmentsDetails.textContent =
    "Select a date to view your appointments.";
});

/* =====================================
   WISHLIST NAVIGATION
   ===================================== */

const wishlistLink = document.getElementById("wishlist-link");
const wishlistBack = document.getElementById("wishlist-back");

const WISHLIST_IMAGE = "wishlist page.png";

let previousWishlistPage = null;

function updateWishlistLink() {
  const current = image.src.toLowerCase();

  const isGreeting = current.includes("greeting");
  const isWheel = current.includes("wheels");

  wishlistLink.hidden = !(isGreeting || isWheel);

  wishlistLink.classList.toggle("wishlist-greeting", isGreeting);
  wishlistLink.classList.toggle("wishlist-wheel", isWheel);
}

function showWishlist() {
  previousWishlistPage = image.src;

  bookingForm.hidden = true;
  wheelControls.hidden = true;
  getStartedButton.hidden = true;
  pageBack.hidden = true;

  hideConfirmation();

  document.getElementById("appointments-link").hidden = true;

  wrapper.classList.remove("booking-page", "appointments-page");
  wrapper.classList.add("wishlist-page");

  image.src = WISHLIST_IMAGE;
  image.alt = "Wishlist";

  wishlistLink.hidden = true;
  wishlistBack.hidden = false;
  document.getElementById("wishlist-form").hidden = false;
}

function backFromWishlist() {
  document.getElementById("wishlist-form").hidden = true;
  wishlistBack.hidden = true;
  wrapper.classList.remove("wishlist-page");

  if (previousWishlistPage?.includes("wheels")) {
    showWheel();
  } else {
    showGreeting();
  }
}

image.addEventListener("load", updateWishlistLink);
updateWishlistLink();

/* =====================================
   WISHLIST TELEGRAM SUBMISSION
   ===================================== */

const WISHLIST_FUNCTION_URL =
  "https://kmmogejcdhnxfptjwent.supabase.co/functions/v1/submit-wishlist";

const wishlistForm = document.getElementById("wishlist-form");
const wishlistItem = document.getElementById("wishlist-item");
const wishlistNotes = document.getElementById("wishlist-notes");
const wishlistConfirm = document.getElementById("wishlist-confirm");
const wishlistStatus = document.getElementById("wishlist-status");

wishlistForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const item_name = wishlistItem.value.trim();
  const notes = wishlistNotes.value.trim();

  if (!item_name) {
    wishlistStatus.textContent = "Please enter an item name.";
    return;
  }

  wishlistConfirm.disabled = true;
  wishlistStatus.textContent = "Sending wishlist...";

  try {
    const response = await fetch(WISHLIST_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        item_name,
        notes
      })
    });

    if (!response.ok) {
      throw new Error("Wishlist submission failed");
    }

    wishlistStatus.textContent = "Wishlist submitted successfully! ♡";
    wishlistForm.reset();

  } catch (error) {
    console.error(error);
    wishlistStatus.textContent =
      "Unable to submit. Please try again.";
  } finally {
    wishlistConfirm.disabled = false;
  }
});