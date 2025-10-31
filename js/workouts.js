// workouts.js — handle workout logging, listing, editing, and deleting

document.addEventListener("DOMContentLoaded", () => {
  const workoutForm = document.getElementById("workoutForm");
  const workoutsList = document.getElementById("workoutsList");
  const totalCaloriesEl = document.getElementById("totalCaloriesBurned");
  const currentDateEl = document.getElementById("currentDate");

  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modalClose");
  const modalBody = document.getElementById("modalBody");

  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;

  // === Display today's date ===
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  currentDateEl.textContent = today;

  // === Load theme from localStorage ===
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") body.classList.add("dark");

  // === Sidebar Toggle ===
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // === Theme Toggle ===
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
  });

  // === Load workouts from localStorage ===
  let workouts = JSON.parse(localStorage.getItem("workouts")) || [];

  // === Render workouts ===
  function renderWorkouts() {
    workoutsList.innerHTML = "";
    if (workouts.length === 0) {
      workoutsList.innerHTML = `<p class="empty-state">No workouts logged yet. Start your first workout!</p>`;
      totalCaloriesEl.textContent = "Total: 0 kcal";
      return;
    }

    let totalCalories = 0;
    workouts.forEach((workout, index) => {
      totalCalories += workout.calories;

      const item = document.createElement("div");
      item.classList.add("workout-item");
      item.innerHTML = `
        <div class="workout-info">
          <h4>${workout.name}</h4>
          <p>${workout.type.toUpperCase()} • ${workout.duration} min • ${workout.intensity}</p>
          <p>${workout.calories} kcal burned</p>
          ${workout.notes ? `<p class="notes">📝 ${workout.notes}</p>` : ""}
        </div>
        <div class="workout-actions">
          <button class="btn-edit" data-index="${index}">✏️</button>
          <button class="btn-delete" data-index="${index}">🗑️</button>
        </div>
      `;
      workoutsList.appendChild(item);
    });

    totalCaloriesEl.textContent = `Total: ${totalCalories} kcal`;
  }

  renderWorkouts();

  // === Calculate calories burned ===
  function calculateCalories(duration, intensity, type) {
    const metValues = {
      cardio: 8,
      strength: 6,
      yoga: 3,
      hiit: 10,
      stretching: 2,
      sports: 7,
    };

    const intensityMultiplier = {
      low: 0.8,
      medium: 1,
      high: 1.2,
    };

    const profile = JSON.parse(localStorage.getItem("userProfile")) || {};
    const weight = profile.weight || 70; // default 70kg

    const met = metValues[type] || 5;
    const multiplier = intensityMultiplier[intensity] || 1;
    const calories = met * multiplier * weight * (duration / 60);
    return Math.round(calories);
  }

  // === Add workout ===
  workoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("exerciseName").value.trim();
    const type = document.getElementById("exerciseType").value;
    const duration = +document.getElementById("duration").value;
    const intensity = document.getElementById("intensity").value;
    const notes = document.getElementById("notes").value.trim();

    const calories = calculateCalories(duration, intensity, type);

    const newWorkout = {
      name,
      type,
      duration,
      intensity,
      notes,
      calories,
      date: new Date().toLocaleDateString(),
    };

    workouts.push(newWorkout);
    localStorage.setItem("workouts", JSON.stringify(workouts));

    workoutForm.reset();
    renderWorkouts();
    alert("🏋️ Workout logged successfully!");
  });

  // === Delete workout ===
  workoutsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const index = e.target.dataset.index;
      if (confirm("Are you sure you want to delete this workout?")) {
        workouts.splice(index, 1);
        localStorage.setItem("workouts", JSON.stringify(workouts));
        renderWorkouts();
      }
    }
  });

  // === Edit workout (modal) ===
  workoutsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-edit")) {
      const index = e.target.dataset.index;
      const workout = workouts[index];
      openEditModal(workout, index);
    }
  });

  function openEditModal(workout, index) {
    modal.classList.add("open");
    modalBody.innerHTML = `
      <h3>Edit Workout</h3>
      <form id="editWorkoutForm" class="form">
        <div class="form-group">
          <label>Exercise Name</label>
          <input type="text" id="editName" value="${workout.name}" required>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="editType">
            <option value="cardio" ${workout.type === "cardio" ? "selected" : ""}>Cardio</option>
            <option value="strength" ${workout.type === "strength" ? "selected" : ""}>Strength</option>
            <option value="yoga" ${workout.type === "yoga" ? "selected" : ""}>Yoga</option>
            <option value="hiit" ${workout.type === "hiit" ? "selected" : ""}>HIIT</option>
            <option value="stretching" ${workout.type === "stretching" ? "selected" : ""}>Stretching</option>
            <option value="sports" ${workout.type === "sports" ? "selected" : ""}>Sports</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Duration (min)</label>
            <input type="number" id="editDuration" value="${workout.duration}" required>
          </div>
          <div class="form-group">
            <label>Intensity</label>
            <select id="editIntensity">
              <option value="low" ${workout.intensity === "low" ? "selected" : ""}>Low</option>
              <option value="medium" ${workout.intensity === "medium" ? "selected" : ""}>Medium</option>
              <option value="high" ${workout.intensity === "high" ? "selected" : ""}>High</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea id="editNotes">${workout.notes || ""}</textarea>
        </div>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>
    `;

    const editForm = document.getElementById("editWorkoutForm");
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const updatedWorkout = {
        name: document.getElementById("editName").value.trim(),
        type: document.getElementById("editType").value,
        duration: +document.getElementById("editDuration").value,
        intensity: document.getElementById("editIntensity").value,
        notes: document.getElementById("editNotes").value.trim(),
        calories: calculateCalories(
          +document.getElementById("editDuration").value,
          document.getElementById("editIntensity").value,
          document.getElementById("editType").value
        ),
        date: new Date().toLocaleDateString(),
      };

      workouts[index] = updatedWorkout;
      localStorage.setItem("workouts", JSON.stringify(workouts));
      modal.classList.remove("open");
      renderWorkouts();
      alert("✅ Workout updated!");
    });
  }

  modalClose.addEventListener("click", () => modal.classList.remove("open"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
});
