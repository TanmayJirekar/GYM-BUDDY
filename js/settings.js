// settings.js — handles profile, preferences, goals, and theme toggle

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  const preferencesForm = document.getElementById("preferencesForm");

  const userName = document.getElementById("userName");
  const userAge = document.getElementById("userAge");
  const userGender = document.getElementById("userGender");
  const userHeight = document.getElementById("userHeight");
  const userWeight = document.getElementById("userWeight");
  const activityLevel = document.getElementById("activityLevel");

  const dailyGoalDisplay = document.getElementById("dailyGoalDisplay");
  const bmrDisplay = document.getElementById("bmrDisplay");

  const units = document.getElementById("units");
  const waterGoal = document.getElementById("waterGoal");
  const workoutGoal = document.getElementById("workoutGoal");
  const notificationsEnabled = document.getElementById("notificationsEnabled");
  const reminderWater = document.getElementById("reminderWater");

  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  const body = document.body;

  // === Load saved settings ===
  const savedProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
  const savedPreferences = JSON.parse(localStorage.getItem("userPreferences")) || {};
  const savedTheme = localStorage.getItem("theme") || "light";

  // === Apply saved data ===
  if (savedProfile) {
    userName.value = savedProfile.name || "";
    userAge.value = savedProfile.age || "";
    userGender.value = savedProfile.gender || "";
    userHeight.value = savedProfile.height || "";
    userWeight.value = savedProfile.weight || "";
    activityLevel.value = savedProfile.activityLevel || "moderate";

    if (savedProfile.bmr) bmrDisplay.textContent = savedProfile.bmr;
    if (savedProfile.dailyGoal) dailyGoalDisplay.textContent = savedProfile.dailyGoal;
  }

  if (savedPreferences) {
    units.value = savedPreferences.units || "metric";
    waterGoal.value = savedPreferences.waterGoal || 2000;
    workoutGoal.value = savedPreferences.workoutGoal || 5;
    notificationsEnabled.checked = savedPreferences.notificationsEnabled ?? true;
    reminderWater.checked = savedPreferences.reminderWater ?? true;
  }

  if (savedTheme === "dark") body.classList.add("dark");

  // === Calculate BMR and Daily Calorie Goal ===
  function calculateBMR(weight, height, age, gender) {
    if (!weight || !height || !age || !gender) return 0;
    if (gender === "male") return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    if (gender === "female") return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    return Math.round(10 * weight + 6.25 * height - 5 * age);
  }

  function calculateCalorieGoal(bmr, activityLevel) {
    const multiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryactive: 1.9,
    };
    return Math.round(bmr * (multiplier[activityLevel] || 1.55));
  }

  // === Auto-update BMR and Goal ===
  function updateCalorieGoal() {
    const bmr = calculateBMR(+userWeight.value, +userHeight.value, +userAge.value, userGender.value);
    const goal = calculateCalorieGoal(bmr, activityLevel.value);
    bmrDisplay.textContent = bmr || 0;
    dailyGoalDisplay.textContent = goal || 0;
  }

  userWeight.addEventListener("input", updateCalorieGoal);
  userHeight.addEventListener("input", updateCalorieGoal);
  userAge.addEventListener("input", updateCalorieGoal);
  userGender.addEventListener("change", updateCalorieGoal);
  activityLevel.addEventListener("change", updateCalorieGoal);

  // === Save Profile ===
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const profile = {
      name: userName.value.trim(),
      age: +userAge.value,
      gender: userGender.value,
      height: +userHeight.value,
      weight: +userWeight.value,
      activityLevel: activityLevel.value,
      bmr: +bmrDisplay.textContent,
      dailyGoal: +dailyGoalDisplay.textContent,
    };

    localStorage.setItem("userProfile", JSON.stringify(profile));
    localStorage.setItem("dailyCalorieGoal", profile.dailyGoal);
    alert("Profile saved successfully ✅");
  });

  // === Save Preferences ===
  preferencesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const prefs = {
      units: units.value,
      waterGoal: +waterGoal.value,
      workoutGoal: +workoutGoal.value,
      notificationsEnabled: notificationsEnabled.checked,
      reminderWater: reminderWater.checked,
    };

    localStorage.setItem("userPreferences", JSON.stringify(prefs));
    alert("Preferences saved successfully ✅");
  });

  // === Sidebar Toggle ===
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // === Theme Toggle ===
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
  });

  // === Optional: Water reminder (simple alert, no backend) ===
  if (reminderWater.checked && savedPreferences.reminderWater) {
    setInterval(() => {
      if (notificationsEnabled.checked && document.visibilityState === "visible") {
        alert("💧 Time to drink some water!");
      }
    }, 2 * 60 * 60 * 1000); // every 2 hours
  }
});
