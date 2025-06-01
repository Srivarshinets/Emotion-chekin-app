// script.js

let selectedMood = null;

const moodButtons = document.querySelectorAll(".mood-button");
const saveButton = document.querySelector(".save");
const clearButton = document.getElementById("clear");
const clearAllButton = document.getElementById("clearAll");
const thoughtsInput = document.getElementById("thoughts");
const log = document.getElementById("log");
const confirmation = document.getElementById("confirmation");

function updateSelectedMood(newMoodButton) {
  moodButtons.forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-checked", "false");
    button.setAttribute("tabindex", "-1");
  });
  newMoodButton.classList.add("selected");
  newMoodButton.setAttribute("aria-checked", "true");
  newMoodButton.setAttribute("tabindex", "0");
  newMoodButton.focus();
  selectedMood = newMoodButton.dataset.mood;
}

moodButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    updateSelectedMood(button);
  });

  // Keyboard navigation for radio group behavior
  button.addEventListener("keydown", (e) => {
    let newIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      newIndex = (index + 1) % moodButtons.length;
      updateSelectedMood(moodButtons[newIndex]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      newIndex = (index - 1 + moodButtons.length) % moodButtons.length;
      updateSelectedMood(moodButtons[newIndex]);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      updateSelectedMood(button);
    }
  });
});

saveButton.addEventListener("click", () => {
  const thoughts = thoughtsInput.value.trim();

  if (!selectedMood) {
    alert("Please select a mood before saving.");
    return;
  }

  const entry = {
    mood: selectedMood,
    thoughts,
    time: new Date().toLocaleString(),
  };

  const entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  entries.unshift(entry);
  localStorage.setItem("moodEntries", JSON.stringify(entries));

  // Reset form
  thoughtsInput.value = "";
  selectedMood = null;
  moodButtons.forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-checked", "false");
    button.setAttribute("tabindex", "-1");
  });
  moodButtons[0].setAttribute("tabindex", "0"); // Reset tab focus to first button

  renderEntries();

  // Show confirmation message
  showConfirmation("Your mood entry has been saved!");
});

clearButton.addEventListener("click", () => {
  // Clear textarea
  thoughtsInput.value = "";
  // Reset mood selection
  selectedMood = null;
  moodButtons.forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-checked", "false");
    button.setAttribute("tabindex", "-1");
  });
  moodButtons[0].setAttribute("tabindex", "0"); // Reset tab focus to first button
  moodButtons[0].focus();

  // Hide confirmation message if visible
  hideConfirmation();
});

clearAllButton.addEventListener("click", () => {
  const confirmClear = confirm(
    "Are you sure you want to clear all recent check-ins? This action cannot be undone."
  );
  if (!confirmClear) return;

  localStorage.removeItem("moodEntries");
  renderEntries();
  showConfirmation("All recent check-ins have been cleared!");
});

function renderEntries() {
  const entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  if (entries.length === 0) {
    log.innerHTML = `<p class="text-gray-500 italic">No recent check-ins yet.</p>`;
    return;
  }
  const entriesHtml = entries
    .slice(0, 5)
    .map(
      (entry) => `
    <div class="bg-white p-4 rounded shadow mb-3">
      <div class="text-2xl mb-1">${entry.mood}</div>
      <div class="mb-1"><strong>Note:</strong> ${
        entry.thoughts ? escapeHtml(entry.thoughts) : "<em>(No note)</em>"
      }</div>
      <div class="text-sm text-gray-500">${entry.time}</div>
    </div>
  `
    )
    .join("");
  log.innerHTML = entriesHtml;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}

function showConfirmation(message) {
  confirmation.textContent = message;
  confirmation.classList.remove("hidden");
  setTimeout(() => {
    hideConfirmation();
  }, 3000);
}

function hideConfirmation() {
  confirmation.classList.add("hidden");
  confirmation.textContent = "";
}

// Initial render
renderEntries();
