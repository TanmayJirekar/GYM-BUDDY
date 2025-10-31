// nutrition.js — Pure Frontend Functionality

document.addEventListener("DOMContentLoaded", () => {
  // ==== Element References ====
  const dailyGoalEl = document.getElementById("dailyGoal");
  const totalConsumedEl = document.getElementById("totalConsumed");
  const remainingEl = document.getElementById("remaining");
  const progressBar = document.getElementById("calorieProgressBar");
  const mealForm = document.getElementById("mealForm");
  const mealName = document.getElementById("mealName");
  const mealCategory = document.getElementById("mealCategory");
  const mealCalories = document.getElementById("mealCalories");
  const mealQuantity = document.getElementById("mealQuantity");

  const lists = {
    breakfast: document.getElementById("breakfastList"),
    lunch: document.getElementById("lunchList"),
    dinner: document.getElementById("dinnerList"),
    snack: document.getElementById("snackList"),
  };

  const currentDateEl = document.getElementById("currentDate");

  // ==== Initialize ====
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  currentDateEl.textContent = new Date().toDateString();

  // Load from localStorage
  const savedData = JSON.parse(localStorage.getItem("nutritionData")) || {};
  const userData = savedData[today] || {
    meals: [],
    goal: 2000,
  };

  // ==== Functions ====

  function saveData() {
    savedData[today] = userData;
    localStorage.setItem("nutritionData", JSON.stringify(savedData));
  }

  function calculateTotals() {
    const total = userData.meals.reduce((sum, meal) => sum + meal.calories, 0);
    const remaining = userData.goal - total;
    totalConsumedEl.textContent = total;
    remainingEl.textContent = remaining > 0 ? remaining : 0;

    const percent = Math.min((total / userData.goal) * 100, 100);
    progressBar.style.width = percent + "%";
  }

  function renderMeals() {
    Object.keys(lists).forEach((cat) => {
      const list = lists[cat];
      const meals = userData.meals.filter((m) => m.category === cat);
      list.innerHTML = "";

      if (meals.length === 0) {
        list.innerHTML = `<p class="empty-state">No meals logged</p>`;
      } else {
        meals.forEach((meal, index) => {
          const div = document.createElement("div");
          div.className = "meal-item";
          div.innerHTML = `
            <p><strong>${meal.name}</strong> — ${meal.calories} kcal (${meal.quantity || 0}g)</p>
            <button class="delete-btn" data-index="${index}">✖</button>
          `;
          list.appendChild(div);
        });
      }
    });
  }

  function updateAll() {
    dailyGoalEl.textContent = userData.goal;
    calculateTotals();
    renderMeals();
    saveData();
  }

  // ==== Add Meal ====
  mealForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const meal = {
      name: mealName.value.trim(),
      category: mealCategory.value,
      calories: Number(mealCalories.value),
      quantity: Number(mealQuantity.value) || 0,
    };

    if (!meal.name || !meal.category || meal.calories <= 0) {
      alert("Please fill in all required fields properly.");
      return;
    }

    userData.meals.push(meal);
    mealForm.reset();
    updateAll();
  });

  // ==== Delete Meal ====
  Object.values(lists).forEach((list) => {
    list.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const index = e.target.dataset.index;
        userData.meals.splice(index, 1);
        updateAll();
      }
    });
  });

  // ==== Theme Toggle ====
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") body.classList.add("dark");
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
  });

  // ==== Menu Toggle (mobile) ====
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // ==== Initialize on load ====
  updateAll();
});
