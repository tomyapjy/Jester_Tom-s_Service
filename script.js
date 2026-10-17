
/* Jester Tom's Service - Free Scrolling Wheel */

const categories = [
  { name: "Massage appointment", icon: "🌸" },
  { name: "Outing", icon: "🏕️" },
  { name: "Indoor hangout", icon: "🏠" },
  { name: "Food outing", icon: "🍴" }
];

let selectedIndex = 1;
let spinning = false;
let dragging = false;
let dragStartY = 0;
let dragDistance = 0;
let dragSteps = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const image = document.getElementById("page-image");
const getStartedButton = document.getElementById("get-started");
const wheelControls = document.getElementById("wheel-controls");
const wheelTrack = document.getElementById("wheel-track");
const wheelWindow = document.querySelector(".wheel-window");

wheelWindow.style.cursor = "grab";
wheelWindow.style.touchAction = "none";

function wrapIndex(index) {
  return ((index % categories.length) + categories.length)
    % categories.length;
}

function rowHeight() {
  return wheelWindow.getBoundingClientRect().height / 4;
}

function showWheel() {
  document.querySelector(".image-wrapper").classList.remove("booking-page");
  image.src = "assets/morning/morning wheels page.png";
  image.alt = "Jester Tom's Service Selection Wheel";

  getStartedButton.hidden = true;
  getStartedButton.style.display = "none";

  wheelControls.hidden = false;

  selectedIndex = 1;
  spinning = false;
  dragging = false;

  buildWheel();
}

/* Draw extra rows above and below so dragging is continuous */
function buildWheel(offset = 0) {
  wheelTrack.innerHTML = "";

  for (let position = -3; position <= 5; position++) {
    const category = categories[wrapIndex(selectedIndex + position)];

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

  // The selected row is positioned in the second visible slot.
  const y = -2 * rowHeight() + offset;
  wheelTrack.style.transform = `translateY(${y}px)`;
}

/* Move by any number of options */
function moveWheel(direction) {
  if (spinning || dragging || wheelControls.hidden) return;

  selectedIndex = wrapIndex(selectedIndex + direction);
  buildWheel();
}

/* Dragging and tapping the wheel */

let tappedIndex = -1;
let pointerMoved = false;

wheelWindow.addEventListener("pointerdown", event => {
  if (spinning || wheelControls.hidden) return;

  dragging = true;
  pointerMoved = false;

  dragStartY = event.clientY;
  dragDistance = 0;
  dragSteps = 0;

  /* Identify the actual option underneath the pointer */

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
  const steps = Math.round(-dragDistance / height);

  if (steps !== dragSteps) {
    selectedIndex = wrapIndex(
      selectedIndex + steps - dragSteps
    );

    dragSteps = steps;
  }

  const remainder = dragDistance + dragSteps * height;

  buildWheel(remainder);
});

wheelWindow.addEventListener("pointerup", event => {
  if (!dragging) return;

  dragging = false;
  wheelWindow.style.cursor = "grab";

  // If the mouse did not move, treat it as a tap.
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

/* Mouse wheel scrolling */
wheelWindow.addEventListener("wheel", event => {
  event.preventDefault();

  if (spinning || dragging || wheelControls.hidden) return;

  // Larger scroll movements can pass multiple categories.
  const amount = Math.max(1, Math.round(Math.abs(event.deltaY) / 60));

  const direction = event.deltaY > 0 ? 1 : -1;

  moveWheel(direction * amount);
}, { passive: false });

/* Surprise Me: spin before selecting a random date */
async function surpriseMe() {
  if (spinning || dragging || wheelControls.hidden) return;

  spinning = true;

  // Excludes Massage appointment.
  const destination = Math.floor(Math.random() * 3) + 1;

  const distance = wrapIndex(destination - selectedIndex);
  const totalSteps = 12 + distance;

  for (let step = 0; step < totalSteps; step++) {
    selectedIndex = wrapIndex(selectedIndex + 1);
    buildWheel();

    const progress = step / totalSteps;
    const delay = Math.round(65 + 280 * progress * progress);

    await sleep(delay);
  }

  spinning = false;
}

/* Confirm the selected category */
function confirmSelection() {
  if (spinning || dragging || wheelControls.hidden) return;

  const pages = [
    "assets/morning/morning massage page.png",
    "assets/morning/morning outing page.png",
    "assets/morning/morning indoors page.png",
    "assets/morning/morning food page.png"
  ];

  image.src = pages[selectedIndex];
  image.alt = categories[selectedIndex].name;
  // Enlarge the selected booking page.
document.querySelector(".image-wrapper").classList.add("booking-page");

  // Hide the wheel and its buttons.
  wheelControls.hidden = true;

  // Keep the Back button available on the selected page.
  document.getElementById("page-back").hidden = false;
  openBookingForm();
}

/* Return to the greeting page */
function goBack() {
  if (spinning) return;

  dragging = false;

  image.src = "assets/morning/Morning greetings page.png";
  image.alt = "Jester Tom's Service Greeting Page";

  wheelControls.hidden = true;

  getStartedButton.hidden = false;
  getStartedButton.style.display = "block";
}
function backToWheel() {
  document.getElementById("booking-form").hidden = true;
  document.getElementById("page-back").hidden = true;
  showWheel();
}
/* INTERACTIVE BOOKING CALENDAR */

const bookingMonths = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

let bookingMonth = new Date().getMonth();
let bookingYear = new Date().getFullYear();
let bookingDate = null;

const monthSelect = document.getElementById("booking-month");
const yearSelect = document.getElementById("booking-year");
const bookingCalendar = document.getElementById("booking-calendar");
const bookingComments = document.getElementById("booking-comments");
const bookingConfirm = document.getElementById("booking-confirm");

bookingMonths.forEach((month, index) => {
  monthSelect.add(new Option(month, index));
});

for (let year = 2026; year <= 2040; year++) {
  yearSelect.add(new Option(year, year));
}

function openBookingForm() {
  const form = document.getElementById("booking-form");

  bookingDate = null;
  bookingComments.value = "";
  document.getElementById("booking-count").textContent = "0/200";

  const today = new Date();
  bookingYear = Math.max(2026, Math.min(2040, today.getFullYear()));
  bookingMonth = today.getMonth();

  document.getElementById("booking-title").textContent =
    categories[selectedIndex].name;

  bookingConfirm.disabled = true;
  form.hidden = false;

  renderBookingCalendar();
}

function renderBookingCalendar() {
  monthSelect.value = bookingMonth;
  yearSelect.value = bookingYear;

  bookingCalendar.innerHTML = "";

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  weekdays.forEach(day => {
    const heading = document.createElement("div");
    heading.className = "weekday";
    heading.textContent = day;
    bookingCalendar.appendChild(heading);
  });

  const firstDay = new Date(bookingYear, bookingMonth, 1);
  const daysInMonth = new Date(bookingYear, bookingMonth + 1, 0).getDate();

  const offset = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < offset; i++) {
    bookingCalendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = day;

    const dateString =
      `${bookingYear}-${String(bookingMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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

function changeBookingMonth(direction) {
  const next = new Date(bookingYear, bookingMonth + direction, 1);

  if (next.getFullYear() < 2026 || next.getFullYear() > 2040) {
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

bookingComments.addEventListener("input", () => {
  document.getElementById("booking-count").textContent =
    `${bookingComments.value.length}/200`;
});

/* CONNECT WEBSITE TO SUPABASE */

const BOOKING_FUNCTION_URL =
  "https://kmmogejcdhnxfptjwent.supabase.co/functions/v1/submit-booking";

let bookingSubmitting = false;

async function submitBooking() {
  if (!bookingDate || bookingSubmitting) return;

  bookingSubmitting = true;
  bookingConfirm.disabled = true;
  bookingConfirm.textContent = "Submitting...";

  try {
    const response = await fetch(BOOKING_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category: categories[selectedIndex].name,
        booking_date: bookingDate,
        comments: bookingComments.value.trim()
      })
    });

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(result.error || "Submission failed");
    }

    // Hide the booking calendar
    document.getElementById("booking-form").hidden = true;

    // Display the booking confirmation page
image.src = "assets/morning/morning booking confirmed.png";
image.alt = "Booking Confirmed";

// Format the date selected by the user
const [year, month, day] = bookingDate.split("-").map(Number);

const formattedDate = new Date(
  year,
  month - 1,
  day
).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

// Show the actual booking details
document.getElementById("confirmed-date").textContent =
  formattedDate;

document.getElementById("confirmed-category").textContent =
  categories[selectedIndex].name;

// Show the new details and Home button
document.getElementById("confirmation-details").hidden = false;
document.getElementById("confirmation-home").hidden = false;

// Hide the old Back button
document.getElementById("page-back").hidden = true;

    // Keep the Back button available
    document.getElementById("page-back").hidden = false;

  } catch (error) {
    console.error(error);

    alert(
      "Booking could not be submitted. Please try again."
    );

  } finally {
    bookingSubmitting = false;
    bookingConfirm.textContent = "Confirm →";
    bookingConfirm.disabled = !bookingDate;
  }
}
/* Return to greeting page after booking */

function confirmationHome() {
  // Hide confirmation overlays
  document.getElementById("confirmation-details").hidden = true;
  document.getElementById("confirmation-home").hidden = true;

  // Hide booking form and other controls
  document.getElementById("booking-form").hidden = true;
  document.getElementById("page-back").hidden = true;
  wheelControls.hidden = true;

  // Restore greeting page sizing
  document.querySelector(".image-wrapper")
    .classList.remove("booking-page");

  // Return to greeting page
  image.src = "assets/morning/Morning greetings page.png";
  image.alt = "Jester Tom's Service Greeting Page";

  getStartedButton.hidden = false;
  getStartedButton.style.display = "block";
}