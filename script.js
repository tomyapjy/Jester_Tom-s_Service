
/* Jester Tom's Service - Page Navigation */

function showWheel() {
  const image = document.getElementById("page-image");
  const button = document.getElementById("get-started");

  // Display the Selection Wheel Page
  image.src = "assets/morning/morning wheels page.png";
  image.alt = "Jester Tom's Service Selection Wheel";

  // Hide the Greeting Page button
  button.hidden = true;
  button.style.display = "none";
}
