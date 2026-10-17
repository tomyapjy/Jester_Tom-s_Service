
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
  document.getElementById("page-back").hidden = true;
  showWheel();
}