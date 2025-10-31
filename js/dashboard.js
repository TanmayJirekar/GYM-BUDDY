// =======================
// 📦 INITIAL SETUP
// =======================
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  updateGreeting();
  updateDate();
  loadDailyQuote();
  renderActivity();
});

// -----------------------
// 🌤 Greeting + Date
// -----------------------
function updateGreeting() {
  const greeting = document.getElementById("greeting");
  const hour = new Date().getHours();

  if (hour < 12) greeting.textContent = "🌞 Good Morning";
  else if (hour < 18) greeting.textContent = "☀️ Good Afternoon";
  else greeting.textContent = "🌙 Good Evening";
}

function updateDate() {
  const dateDisplay = document.getElementById("currentDate");
  const today = new Date();
  const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  dateDisplay.textContent = today.toLocaleDateString("en-US", options);
}

// -----------------------
// 💬 Motivational Quotes
// -----------------------
function loadDailyQuote() {
  const quotes = [
    "Push yourself because no one else is going to do it for you.",
    "Every workout counts. Keep going!",
    "Eat clean, train hard, stay consistent.",
    "The body achieves what the mind believes.",
    "No pain, no gain. Stay focused!",
    "Don’t wish for it, work for it.",
    "Success starts with self-discipline."
  ];
  const quoteEl = document.getElementById("dailyQuote");
  quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// -----------------------
// 💾 Local Storage Helpers
// -----------------------
function getData() {
  return JSON.parse(localStorage.getItem("fittrack-data")) || {
    caloriesBurned: 0,
    caloriesConsumed: 0,
    waterIntake: 0,
    steps: 0,
    activityLog: [],
  };
}

function saveData(data) {
  localStorage.setItem("fittrack-data", JSON.stringify(data));
}

// -----------------------
// 🔄 Load Dashboard
// -----------------------
function loadDashboardData() {
  const data = getData();
  document.getElementById("caloriesBurned").textContent = data.caloriesBurned;
  document.getElementById("caloriesConsumed").textContent = data.caloriesConsumed;
  document.getElementById("waterIntake").textContent = data.waterIntake;
  document.getElementById("stepsCount").textContent = data.steps;

  updateProgressRings(data);
}

// -----------------------
// 📈 Progress Rings
// -----------------------
function updateProgressRings(data) {
  const calorieGoal = 2000;
  const waterGoal = 3000;
  const stepGoal = 8000;

  const caloriesPercent = Math.min((data.caloriesBurned / calorieGoal) * 100, 100);
  const waterPercent = Math.min((data.waterIntake / waterGoal) * 100, 100);
  const workoutPercent = Math.min((data.steps / stepGoal) * 100, 100);

  setRingProgress("caloriesRing", "caloriesPercent", caloriesPercent);
  setRingProgress("waterRing", "waterPercent", waterPercent);
  setRingProgress("workoutRing", "workoutPercent", workoutPercent);
}

function setRingProgress(ringId, textId, percent) {
  const circle = document.getElementById(ringId);
  const text = document.getElementById(textId);
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;

  text.textContent = `${Math.round(percent)}%`;
}

// -----------------------
// ⚡ Quick Action Buttons
// -----------------------
document.getElementById("addWaterBtn").addEventListener("click", () => openModal("water"));
document.getElementById("addWorkoutBtn").addEventListener("click", () => openModal("workout"));
document.getElementById("addMealBtn").addEventListener("click", () => openModal("meal"));
document.getElementById("addStepsBtn").addEventListener("click", () => openModal("steps"));

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

modalClose.addEventListener("click", closeModal);
window.addEventListener("click", (e) => e.target === modal && closeModal());

function openModal(type) {
  modal.style.display = "flex";
  let html = "";

  switch (type) {
    case "water":
      html = `
        <h3>Add Water Intake</h3>
        <input type="number" id="waterAmount" placeholder="Enter ml" />
        <button id="saveWater">Save</button>`;
      break;
    case "workout":
      html = `
        <h3>Log Workout</h3>
        <input type="text" id="workoutName" placeholder="Workout name" />
        <input type="number" id="workoutCalories" placeholder="Calories burned" />
        <button id="saveWorkout">Save</button>`;
      break;
    case "meal":
      html = `
        <h3>Log Meal</h3>
        <input type="text" id="mealName" placeholder="Meal name" />
        <input type="number" id="mealCalories" placeholder="Calories consumed" />
        <button id="saveMeal">Save</button>`;
      break;
    case "steps":
      html = `
        <h3>Add Steps</h3>
        <input type="number" id="stepsInput" placeholder="Enter steps" />
        <button id="saveSteps">Save</button>`;
      break;
  }

  modalBody.innerHTML = html;

  // Add event listeners dynamically
  if (type === "water") document.getElementById("saveWater").onclick = saveWater;
  if (type === "workout") document.getElementById("saveWorkout").onclick = saveWorkout;
  if (type === "meal") document.getElementById("saveMeal").onclick = saveMeal;
  if (type === "steps") document.getElementById("saveSteps").onclick = saveSteps;
}

function closeModal() {
  modal.style.display = "none";
}

// -----------------------
// 💧 Save Water Intake
// -----------------------
function saveWater() {
  const amount = parseInt(document.getElementById("waterAmount").value);
  if (!amount || amount <= 0) return alert("Enter a valid water amount (ml).");

  const data = getData();
  data.waterIntake += amount;
  data.activityLog.unshift(`💧 Drank ${amount} ml water`);
  saveData(data);

  closeModal();
  loadDashboardData();
  renderActivity();
}

// -----------------------
// 🏋️ Save Workout
// -----------------------
function saveWorkout() {
  const name = document.getElementById("workoutName").value.trim();
  const calories = parseInt(document.getElementById("workoutCalories").value);
  if (!name || !calories) return alert("Please enter workout name and calories.");

  const data = getData();
  data.caloriesBurned += calories;
  data.activityLog.unshift(`🏋️ ${name} - ${calories} kcal`);
  saveData(data);

  closeModal();
  loadDashboardData();
  renderActivity();
}

// -----------------------
// 🍽️ Save Meal
// -----------------------
function saveMeal() {
  const name = document.getElementById("mealName").value.trim();
  const calories = parseInt(document.getElementById("mealCalories").value);
  if (!name || !calories) return alert("Please enter meal name and calories.");

  const data = getData();
  data.caloriesConsumed += calories;
  data.activityLog.unshift(`🍎 Ate ${name} - ${calories} kcal`);
  saveData(data);

  closeModal();
  loadDashboardData();
  renderActivity();
}

// -----------------------
// 👟 Save Steps
// -----------------------
function saveSteps() {
  const steps = parseInt(document.getElementById("stepsInput").value);
  if (!steps || steps <= 0) return alert("Enter a valid number of steps.");

  const data = getData();
  data.steps += steps;
  data.activityLog.unshift(`👟 Walked ${steps} steps`);
  saveData(data);

  closeModal();
  loadDashboardData();
  renderActivity();
}

// -----------------------
// 🕒 Render Activity Log
// -----------------------
function renderActivity() {
  const activityList = document.getElementById("activityList");
  const data = getData();

  if (data.activityLog.length === 0) {
    activityList.innerHTML = `<p class="empty-state">No activity yet. Start tracking!</p>`;
    return;
  }

  activityList.innerHTML = data.activityLog
    .slice(0, 6)
    .map((act) => `<div class="activity-item">${act}</div>`)
    .join("");
}

// -----------------------
// 🌙 Theme Toggle
// -----------------------
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", toggleTheme);

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const icon = themeToggle.querySelector(".theme-icon");
  icon.textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
  localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
}

// Load theme on startup
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
  document.querySelector(".theme-icon").textContent = "☀️";
}
