
/* Jester Tom's Service - Free Scrolling Wheel */

const categories = [
  { name: "Massage appointment", icon: "🌸" },
  { name: "Outing date", icon: "🏕️" },
  { name: "Indoor date", icon: "🏠" },
  { name: "Food date", icon: "🍴" }
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

/* Dragging the wheel */
wheelWindow.addEventListener("pointerdown", event => {
  if (spinning || wheelControls.hidden) return;

  dragging = true;
  dragStartY = event.clientY;
  dragDistance = 0;
  dragSteps = 0;

  wheelWindow.setPointerCapture(event.pointerId);
  wheelWindow.style.cursor = "grabbing";

  event.preventDefault();
});

wheelWindow.addEventListener("pointermove", event => {
  if (!dragging) return;

  dragDistance = event.clientY - dragStartY;

  const height = rowHeight();

  // Determine how many complete rows have been dragged.
  const steps = Math.round(-dragDistance / height);

  if (steps !== dragSteps) {
    selectedIndex = wrapIndex(selectedIndex + steps - dragSteps);
    dragSteps = steps;
  }

  // Keep the wheel moving directly with the mouse.
  const remainder = dragDistance + dragSteps * height;

  buildWheel(remainder);
});

function finishDrag() {
  if (!dragging) return;

  dragging = false;
  wheelWindow.style.cursor = "grab";

  const height = rowHeight();
  const remainder = dragDistance + dragSteps * height;

  // Settle smoothly on the selected row.
  wheelTrack.style.transition = "transform 180ms ease-out";
  wheelTrack.style.transform = `translateY(${-2 * height}px)`;

  dragDistance = 0;
  dragSteps = 0;
}

wheelWindow.addEventListener("pointerup", finishDrag);
wheelWindow.addEventListener("pointercancel", finishDrag);

/* Mouse wheel scrolling */
wheelWindow.addEventListener("wheel", event => {
  event.preventDefault();

  if (spinning || dragging || wheelControls.hidden) return;

  // Larger scroll movements can pass multiple categories.
  const amount = Math.max(1, Math.round(Math.abs(event.deltaY) / 60));

  const direction = event.deltaY > 0 ? 1 : -1;

  moveWheel(direction * amount);
}, { passive: false });

/* Click a category directly */
wheelTrack.addEventListener("click", event => {
  if (spinning || dragging || wheelControls.hidden) return;

  const row = event.target.closest(".wheel-option");
  if (!row) return;

  const rows = Array.from(wheelTrack.children);
  const position = rows.indexOf(row);

  // The selected category is the fourth generated row.
  const difference = position - 3;

  if (difference !== 0) {
    moveWheel(difference);
  }
});

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

  wheelControls.hidden = true;
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
