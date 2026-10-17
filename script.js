/* Jester Tom's Service - Animated Wheel */

const categories = [
  { name: "Massage appointment", icon: "🌸" },
  { name: "Outing date", icon: "🏕️" },
  { name: "Indoor date", icon: "🏠" },
  { name: "Food date", icon: "🍴" }
];

let selectedIndex = 1;
let spinning = false;
let wheelPosition = 4;
let touchStartY = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function showWheel() {
  document.getElementById("page-image").src =
    "assets/morning/morning wheels page.png";

  document.getElementById("get-started").hidden = true;
  document.getElementById("get-started").style.display = "none";

  document.getElementById("wheel-controls").hidden = false;

  selectedIndex = 1;
  spinning = false;
  buildWheel();
}

function buildWheel() {
  const track = document.getElementById("wheel-track");
  track.innerHTML = "";

  // Repeated entries allow the wheel to loop continuously.
  for (let i = -8; i <= 8; i++) {
    const categoryIndex =
      ((selectedIndex + i + 1) % 4 + 4) % 4;

    const category = categories[categoryIndex];
    const row = document.createElement("div");

    row.className = "wheel-option";
    if (i === 0) row.classList.add("selected");

    row.innerHTML = `
      <span class="option-icon">${category.icon}</span>
      <span>${category.name}</span>
    `;

    track.appendChild(row);
  }

  track.style.transition = "none";
  track.style.transform = "translateY(-200%)";
}

async function moveWheel(direction) {
  if (spinning) return;

  spinning = true;

  const track = document.getElementById("wheel-track");

  track.style.transition = "transform 350ms ease-in-out";

  const destination = direction > 0 ? -225 : -175;
  track.style.transform = `translateY(${destination}%)`;

  await sleep(370);

  selectedIndex =
    (selectedIndex + direction + categories.length) %
    categories.length;

  buildWheel();
  spinning = false;
}

async function surpriseMe() {
  if (spinning) return;

  spinning = true;

  // Surprise Me excludes Massage Appointment.
  const destination = Math.floor(Math.random() * 3) + 1;

  const track = document.getElementById("wheel-track");

  // Fast spinning, followed by gradual deceleration.
  const delays = [
    80, 70, 65, 65, 70, 80,
    100, 130, 170, 220, 300, 400
  ];

  for (const delay of delays) {
    track.style.transition = `transform ${delay}ms linear`;
    track.style.transform = "translateY(-225%)";

    await sleep(delay + 15);

    selectedIndex = (selectedIndex + 1) % categories.length;
    buildWheel();

    // Allow the browser to register the reset.
    await sleep(20);
  }

  // Finish on the randomly selected date category.
  selectedIndex = destination;
  buildWheel();

  spinning = false;
}

function confirmSelection() {
  if (spinning) return;

  const pages = [
    "assets/morning/morning massage page.png",
    "assets/morning/morning outing page.png",
    "assets/morning/morning indoors page.png",
    "assets/morning/morning food page.png"
  ];

  document.getElementById("page-image").src =
    pages[selectedIndex];

  document.getElementById("wheel-controls").hidden = true;
}

function goBack() {
  if (spinning) return;

  document.getElementById("page-image").src =
    "assets/morning/Morning greetings page.png";

  document.getElementById("wheel-controls").hidden = true;

  const button = document.getElementById("get-started");
  button.hidden = false;
  button.style.display = "block";
}

// Mouse wheel support
document.addEventListener("wheel", event => {
  if (document.getElementById("wheel-controls").hidden) return;

  if (event.target.closest(".wheel-window")) {
    event.preventDefault();
    moveWheel(event.deltaY > 0 ? 1 : -1);
  }
}, { passive: false });

// Touch swipe support
document.addEventListener("touchstart", event => {
  if (event.target.closest(".wheel-window")) {
    touchStartY = event.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener("touchend", event => {
  if (!event.target.closest(".wheel-window")) return;

  const difference =
    touchStartY - event.changedTouches[0].clientY;

  if (Math.abs(difference) > 20) {
    moveWheel(difference > 0 ? 1 : -1);
  }
});
