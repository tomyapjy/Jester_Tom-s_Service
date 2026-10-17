
/* Jester Tom's Service - Animated Slot Machine Wheel */

const categories = [
  { name: "Massage appointment", icon: "🌸" },
  { name: "Outing date", icon: "🏕️" },
  { name: "Indoor date", icon: "🏠" },
  { name: "Food date", icon: "🍴" }
];

let selectedIndex = 1;
let spinning = false;
let touchStartY = null;

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const image = document.getElementById("page-image");
const getStartedButton = document.getElementById("get-started");
const wheelControls = document.getElementById("wheel-controls");
const wheelTrack = document.getElementById("wheel-track");
const wheelWindow = document.querySelector(".wheel-window");

function showWheel() {
  image.src = "assets/morning/morning wheels page.png";
  image.alt = "Jester Tom's Service Selection Wheel";

  getStartedButton.hidden = true;
  getStartedButton.style.display = "none";

  wheelControls.hidden = false;

  selectedIndex = 1;
  spinning = false;

  buildWheel();
}

function buildWheel() {
  wheelTrack.innerHTML = "";

  // Five rows: two above, selected row, two below.
  for (let offset = -2; offset <= 2; offset++) {
    const index =
      (selectedIndex + offset + categories.length) %
      categories.length;

    const category = categories[index];
    const row = document.createElement("div");

    row.className = "wheel-option";

    if (offset === 0) {
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

  // Each row occupies 25% of the wheel window.
  // Position the selected row in the second visible slot.
  wheelTrack.style.transition = "none";
  wheelTrack.style.transform = "translateY(-25%)";
}

async function animateStep(direction, duration = 350) {
  const startPosition = -25;
  const endPosition = direction > 0 ? -50 : 0;

  wheelTrack.style.transition = "none";
  wheelTrack.style.transform =
    `translateY(${startPosition}%)`;

  // Force the browser to apply the starting position.
  void wheelTrack.offsetHeight;

  wheelTrack.style.transition =
    `transform ${duration}ms ease-in-out`;

  wheelTrack.style.transform =
    `translateY(${endPosition}%)`;

  await sleep(duration + 30);

  selectedIndex =
    (selectedIndex + direction + categories.length) %
    categories.length;

  buildWheel();
}

async function moveWheel(direction) {
  if (spinning || wheelControls.hidden) return;

  spinning = true;

  await animateStep(direction);

  spinning = false;
}

async function surpriseMe() {
  if (spinning || wheelControls.hidden) return;

  spinning = true;

  // Surprise Me chooses only Outing, Indoor or Food.
  const destination = Math.floor(Math.random() * 3) + 1;

  // Complete multiple rotations before stopping.
  const distance =
    (destination - selectedIndex + categories.length) %
    categories.length;

  const totalSteps = 12 + distance;

  for (let step = 0; step < totalSteps; step++) {
    const progress = step / totalSteps;

    // Fast at first, then gradually slow down.
    const duration =
      Math.round(85 + 380 * progress * progress);

    await animateStep(1, duration);
  }

  spinning = false;
}

function confirmSelection() {
  if (spinning || wheelControls.hidden) return;

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

function goBack() {
  if (spinning) return;

  image.src = "assets/morning/Morning greetings page.png";
  image.alt = "Jester Tom's Service Greeting Page";

  wheelControls.hidden = true;

  getStartedButton.hidden = false;
  getStartedButton.style.display = "block";
}

// Mouse scroll support
wheelWindow.addEventListener(
  "wheel",
  event => {
    event.preventDefault();

    if (spinning || wheelControls.hidden) return;

    moveWheel(event.deltaY > 0 ? 1 : -1);
  },
  { passive: false }
);

// Touch swipe support
wheelWindow.addEventListener(
  "touchstart",
  event => {
    touchStartY = event.touches[0].clientY;
  },
  { passive: true }
);

wheelWindow.addEventListener(
  "touchend",
  event => {
    if (touchStartY === null) return;

    const difference =
      touchStartY - event.changedTouches[0].clientY;

    touchStartY = null;

    if (Math.abs(difference) > 20) {
      moveWheel(difference > 0 ? 1 : -1);
    }
  },
  { passive: true }
);
/* Mouse drag support for the selection wheel */

let dragStartY = null;
let isDraggingWheel = false;

wheelWindow.style.cursor = "grab";
wheelWindow.style.touchAction = "none";

wheelWindow.addEventListener("pointerdown", event => {
  if (spinning || wheelControls.hidden) return;

  dragStartY = event.clientY;
  isDraggingWheel = true;

  wheelWindow.setPointerCapture(event.pointerId);
  wheelWindow.style.cursor = "grabbing";
});

wheelWindow.addEventListener("pointerup", event => {
  if (!isDraggingWheel || dragStartY === null) return;

  const distance = dragStartY - event.clientY;

  isDraggingWheel = false;
  dragStartY = null;
  wheelWindow.style.cursor = "grab";

  if (Math.abs(distance) > 20) {
    moveWheel(distance > 0 ? 1 : -1);
  }
});

wheelWindow.addEventListener("pointercancel", () => {
  isDraggingWheel = false;
  dragStartY = null;
  wheelWindow.style.cursor = "grab";
});
/* Click directly on a wheel category to select it */

wheelTrack.addEventListener("click", event => {
  if (spinning || wheelControls.hidden) return;

  const clickedRow = event.target.closest(".wheel-option");
  if (!clickedRow) return;

  const rows = Array.from(wheelTrack.children);
  const clickedPosition = rows.indexOf(clickedRow);

  // Our wheel contains five rows.
  // The selected category is the middle row (index 2).
  const difference = clickedPosition - 2;

  if (difference === 0) return;

  // Move toward the clicked category.
  moveWheel(difference > 0 ? 1 : -1);
});