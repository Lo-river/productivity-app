document.addEventListener("DOMContentLoaded", () => {
  // make sure we always have one empty array saved
  if (!localStorage.getItem("tasks"))  localStorage.setItem("tasks", JSON.stringify([]));
  if (!localStorage.getItem("habits"))  localStorage.setItem("habits", JSON.stringify([]));
  if (!localStorage.getItem("events"))  localStorage.setItem("events", JSON.stringify([]));

  loadHomeData();
});

function loadHomeData() {
  loadRecentTasks();
  loadTopHabits();
  loadUpcomingEvents();
}

// creatre card for each section (tasks, habits, events)
function createHomeCard(title, subtitle) {
  const card = document.createElement("div");
  card.classList.add("home-card");

  const titleEl = document.createElement("h3");
  titleEl.textContent = title;
  titleEl.classList.add("home-card-title");

  const subtitleEl = document.createElement("p");
  subtitleEl.classList.add("home-card-subtitle");
  subtitleEl.textContent = subtitle;

  card.appendChild(titleEl);
  card.appendChild(subtitleEl);
  return card;
}

// Format date (ex. "10 March 2025")
function formatEventDateTime(datetimeString) {
  const dateObj = new Date(datetimeString);
  const options = { day: "2-digit", month: "long", year: "numeric" };
  return dateObj.toLocaleDateString("en-GB", options);
}

// fetch and show undone tasks
function loadRecentTasks() {
  const raw = localStorage.getItem("tasks");
  let tasks = [];

  try {
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    console.error(" parse error in loadRecentTasks()");
    tasks = [];
  }

  tasks = Array.isArray(tasks)
    ? tasks.filter(t => t && typeof t === "object")
    : [];

  const undoneTasks = tasks
    .filter(task => !task.checked)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);

  const listEl = document.getElementById("recent-tasks-list");
  if (!listEl) return console.error(" #recent-tasks-list saknas!");
  listEl.innerHTML = "";

  undoneTasks.forEach(task => {
    const card = createHomeCard(
      task.title || "Untitled",
      // task.createdAt ? formatEventDateTime(task.createdAt) : "No date"
      task.dueDate 
        ? formatEventDateTime(task.dueDate) 
        : (task.createdAt 
            ? formatEventDateTime(task.createdAt) 
            : "No date")
    );
    listEl.appendChild(card);
  });
}

// Fetch and show top habits/ highest priority
function loadTopHabits() {
  const raw = localStorage.getItem("habits");
  let habits = [];

  try {
    habits = raw ? JSON.parse(raw) : [];
  } catch {
    console.error(" parse error in loadTopHabits()");
    habits = [];
  }

  habits = Array.isArray(habits) ? habits : [];
  habits.sort((a, b) => b.repetitions - a.repetitions);
  const top = habits.slice(0, 3);

  const listEl = document.getElementById("top-habits-list");
  if (!listEl) return console.error(" #top-habits-list saknas!");
  listEl.innerHTML = "";

  top.forEach(habit => {
    const card = createHomeCard(
      habit.title || "Untitled",
      `${habit.repetitions || 0} days/week`
    );
    listEl.appendChild(card);
  });
}

// fetch and show upcoming events
function loadUpcomingEvents() {
  const raw = localStorage.getItem("events");
  let events = [];

  try {
    events = raw ? JSON.parse(raw) : [];
  } catch {
    console.error(" parse error in loadUpcomingEvents()");
    events = [];
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });

  futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = futureEvents.slice(0, 3);

  const listEl = document.getElementById("upcoming-events-list");
  if (!listEl) return console.error(" #upcoming-events-list is missing!");
  listEl.innerHTML = "";

  upcoming.forEach(event => {
    const card = createHomeCard(
      event.title || "Untitled", 
      event.date ? formatEventDateTime(event.date) : "No date"
    );
    listEl.appendChild(card);
  });

}