// ============================================
// GLOBAL STATE & UTILITIES
// ============================================

const APP_STATE = {
  user: {
    name: "User",
    age: 25,
    gender: "male",
    height: 175,
    weight: 70,
    activityLevel: "moderate",
  },
  workouts: [],
  nutrition: [],
  hydration: { goal: 2000, consumed: 0 },
  steps: 0,
  preferences: {
    theme: "light",
    units: "metric",
    waterGoal: 2000,
    workoutGoal: 5,
    notificationsEnabled: true,
  },
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

function saveToStorage() {
  localStorage.setItem("gymTrackerData", JSON.stringify(APP_STATE))
}

function loadFromStorage() {
  const stored = localStorage.getItem("gymTrackerData")
  if (stored) {
    Object.assign(APP_STATE, JSON.parse(stored))
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage()
  initializeTheme()
  initializeNavigation()
  updateCurrentDate()
  setInterval(updateCurrentDate, 60000)
})

// ============================================
// THEME MANAGEMENT
// ============================================

// function initializeTheme() {
//   const themeToggle = document.getElementById("themeToggle")
//   const savedTheme = localStorage.getItem("theme") || "light"

//   if (savedTheme === "dark") {
//     document.body.classList.add("dark-mode")
//     themeToggle.textContent = "☀️"
//   }

//   if (themeToggle) {
//     themeToggle.addEventListener("click", toggleTheme)
//   }
// }

// function toggleTheme() {
//   document.body.classList.toggle("dark-mode")
//   const isDark = document.body.classList.contains("dark-mode")
//   localStorage.setItem("theme", isDark ? "dark" : "light")

//   const themeToggle = document.getElementById("themeToggle")
//   themeToggle.textContent = isDark ? "☀️" : "🌙"
// }

// ============================================
// NAVIGATION
// ============================================

function initializeNavigation() {
  const menuToggle = document.getElementById("menuToggle")
  const navMenu = document.querySelector(".nav-menu")

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })
  }

  // Close menu when link is clicked
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active")
    })
  })

  // Set active link
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href")
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
}

// ============================================
// DATE & TIME
// ============================================

function updateCurrentDate() {
  const dateElements = document.querySelectorAll("#currentDate")
  const now = new Date()
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  const dateString = now.toLocaleDateString("en-US", options)

  dateElements.forEach((el) => {
    el.textContent = dateString
  })
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(content) {
  const modal = document.getElementById("modal")
  const modalBody = document.getElementById("modalBody")

  if (modal && modalBody) {
    modalBody.innerHTML = content
    modal.classList.add("active")

    const closeBtn = document.getElementById("modalClose")
    closeBtn.addEventListener("click", closeModal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal()
    })
  }
}

function closeModal() {
  const modal = document.getElementById("modal")
  if (modal) {
    modal.classList.remove("active")
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

function sendNotification(title, options = {}) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, options)
  }
}

// ============================================
// CALORIE CALCULATIONS
// ============================================

const EXERCISE_CALORIES = {
  cardio: { low: 5, medium: 8, high: 12 },
  strength: { low: 4, medium: 6, high: 9 },
  yoga: { low: 2, medium: 3, high: 5 },
  hiit: { low: 8, medium: 12, high: 15 },
  stretching: { low: 1, medium: 2, high: 3 },
  sports: { low: 6, medium: 9, high: 12 },
}

function calculateCaloriesBurned(exerciseType, duration, intensity) {
  const caloriesPerMin = EXERCISE_CALORIES[exerciseType]?.[intensity] || 5
  return Math.round(caloriesPerMin * duration)
}

// ============================================
// BMR & CALORIE GOAL CALCULATION
// ============================================

function calculateBMR() {
  const { age, gender, height, weight } = APP_STATE.user

  let bmr
  if (gender === "male") {
    bmr = 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
  } else {
    bmr = 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age
  }

  return Math.round(bmr)
}

function calculateDailyCalorieGoal() {
  const bmr = calculateBMR()
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryactive: 1.9,
  }

  const factor = activityFactors[APP_STATE.user.activityLevel] || 1.55
  return Math.round(bmr * factor)
}

// ============================================
// PROGRESS RING CALCULATION
// ============================================

function updateProgressRing(ringElement, percentage) {
  if (!ringElement) return

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (percentage / 100) * circumference

  ringElement.style.strokeDasharray = circumference
  ringElement.style.strokeDashoffset = offset
}

// ============================================
// QUOTES
// ============================================

const MOTIVATIONAL_QUOTES = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Success is not final, failure is not fatal. - Winston Churchill",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "Your body can stand almost anything. It's your mind that you need to convince. - Andrew Murphy",
  "The pain you feel today will be the strength you feel tomorrow. - Arnold Schwarzenegger",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Excellence is not a destination; it is a continuous journey that never ends. - Brian Tracy",
]

function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function getTodayData() {
  const today = new Date().toDateString()
  return {
    workouts: APP_STATE.workouts.filter((w) => new Date(w.date).toDateString() === today),
    nutrition: APP_STATE.nutrition.filter((n) => new Date(n.date).toDateString() === today),
    hydration: APP_STATE.hydration,
  }
}

function getWeekData() {
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    workouts: APP_STATE.workouts.filter((w) => new Date(w.date) >= weekAgo),
    nutrition: APP_STATE.nutrition.filter((n) => new Date(n.date) >= weekAgo),
  }
}

function getMonthData() {
  const today = new Date()
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  return {
    workouts: APP_STATE.workouts.filter((w) => new Date(w.date) >= monthAgo),
    nutrition: APP_STATE.nutrition.filter((n) => new Date(n.date) >= monthAgo),
  }
}
