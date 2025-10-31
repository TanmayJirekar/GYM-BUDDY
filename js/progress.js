// progress.js — Fully Synced with nutrition.js (Frontend Only)

document.addEventListener("DOMContentLoaded", () => {
  const totalWorkoutsEl = document.getElementById("totalWorkouts");
  const avgCaloriesBurnedEl = document.getElementById("avgCaloriesBurned");
  const avgCaloriesConsumedEl = document.getElementById("avgCaloriesConsumed");
  const currentStreakEl = document.getElementById("currentStreak");

  const totalWorkoutTimeEl = document.getElementById("totalWorkoutTime");
  const totalCaloriesBurnedEl = document.getElementById("totalCaloriesBurned");
  const totalCaloriesConsumedStatEl = document.getElementById("totalCaloriesConsumedStat");
  const netCaloriesEl = document.getElementById("netCalories");

  const workoutChartEl = document.getElementById("workoutChart");
  const calorieChartEl = document.getElementById("calorieChart");
  const resetBtn = document.getElementById("resetDataBtn");
  const periodButtons = document.querySelectorAll(".period-btn");

  // ===== Load Local Data =====
  const workouts = JSON.parse(localStorage.getItem("workouts")) || [];

  // ✅ Read nutrition data correctly (from nutrition.js)
  const nutritionData = JSON.parse(localStorage.getItem("nutritionData")) || {};
  // Flatten meals into one array
  const allMeals = Object.values(nutritionData)
    .flatMap((d) => d.meals || [])
    .map((m) => ({
      calories: m.calories,
      date: new Date().toISOString().split("T")[0], // fallback if date missing
    }));

  // ===== Period Filter Logic =====
  let selectedPeriod = "week";

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  };

  const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const filterByPeriod = (arr, dateKey = "date") => {
    const now = new Date();
    let startDate;
    if (selectedPeriod === "week") startDate = getStartOfWeek();
    else if (selectedPeriod === "month") startDate = getStartOfMonth();
    else return arr; // all time
    return arr.filter((item) => new Date(item[dateKey]) >= startDate);
  };

  // ===== Main Update Function =====
  function updateProgress() {
    const filteredWorkouts = filterByPeriod(workouts);
    const filteredMeals = filterByPeriod(allMeals);

    // Totals
    const totalWorkouts = filteredWorkouts.length;
    const totalWorkoutTime = filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCaloriesBurned = filteredWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalCaloriesConsumed = filteredMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

    // Averages
    const avgCaloriesBurned = totalWorkouts ? Math.round(totalCaloriesBurned / totalWorkouts) : 0;
    const avgCaloriesConsumed = filteredMeals.length
      ? Math.round(totalCaloriesConsumed / filteredMeals.length)
      : 0;

    // Net calories
    const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

    // Workout streak
    const streak = calculateWorkoutStreak(workouts);

    // ===== Update DOM =====
    totalWorkoutsEl.textContent = totalWorkouts;
    avgCaloriesBurnedEl.textContent = avgCaloriesBurned;
    avgCaloriesConsumedEl.textContent = avgCaloriesConsumed;
    currentStreakEl.textContent = streak;

    totalWorkoutTimeEl.textContent = `${totalWorkoutTime} min`;
    totalCaloriesBurnedEl.textContent = `${totalCaloriesBurned} kcal`;
    totalCaloriesConsumedStatEl.textContent = `${totalCaloriesConsumed} kcal`;
    netCaloriesEl.textContent = `${netCalories} kcal`;

    // Render charts
    renderWorkoutChart(filteredWorkouts);
    renderCalorieChart(filteredWorkouts, filteredMeals);
  }

  // ===== Charts =====
  function renderWorkoutChart(workoutData) {
    workoutChartEl.innerHTML = "";
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyCounts = new Array(7).fill(0);

    workoutData.forEach((w) => {
      const d = new Date(w.date);
      const day = (d.getDay() + 6) % 7; // Monday = 0
      weeklyCounts[day]++;
    });

    weeklyCounts.forEach((count, i) => {
      const bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.height = `${count * 25}px`;
      bar.title = `${days[i]}: ${count} workout(s)`;
      workoutChartEl.appendChild(bar);
    });
  }

  function renderCalorieChart(workoutData, mealData) {
    calorieChartEl.innerHTML = "";

    const totalBurned = workoutData.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalConsumed = mealData.reduce((sum, m) => sum + (m.calories || 0), 0);

    const maxVal = Math.max(totalBurned, totalConsumed, 1);

    const burnedBar = document.createElement("div");
    burnedBar.classList.add("bar", "burned");
    burnedBar.style.height = `${(totalBurned / maxVal) * 100}%`;
    burnedBar.title = `Burned: ${totalBurned} kcal`;

    const consumedBar = document.createElement("div");
    consumedBar.classList.add("bar", "consumed");
    consumedBar.style.height = `${(totalConsumed / maxVal) * 100}%`;
    consumedBar.title = `Consumed: ${totalConsumed} kcal`;

    calorieChartEl.append(burnedBar, consumedBar);
  }

  // ===== Workout Streak Calculation =====
  function calculateWorkoutStreak(workoutArr) {
    if (!workoutArr.length) return 0;

    const dates = [...new Set(workoutArr.map((w) => w.date))].sort((a, b) => new Date(a) - new Date(b));
    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff <= 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    return maxStreak;
  }

  // ===== Reset Data =====
  resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all progress data?")) {
      localStorage.removeItem("workouts");
      localStorage.removeItem("nutritionData");
      updateProgress();
      alert("All data cleared successfully!");
    }
  });

  // ===== Period Selection Buttons =====
  periodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      periodButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPeriod = btn.dataset.period;
      updateProgress();
    });
  });

  // ===== Initialize =====
  document.getElementById("currentDate").textContent = new Date().toDateString();
  updateProgress();
});
