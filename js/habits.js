document.addEventListener("DOMContentLoaded", function () {
  
  // get DOM-element
 
  const habitPopup = document.getElementById("habit-popup");
  const openPopupButton = document.querySelector(".cta-button");
  const cancelButton = document.getElementById("cancel-btn");
  const saveButton = document.getElementById("save-btn");
  const habitList = document.getElementById("habit-list");

  const titleInput = document.getElementById("habit-title");
  const repetitionDisplay = document.getElementById("habit-repetition-display");
  const priorityDropdownButton = document.getElementById("habit-priority-btn");
  const categoryDropdownButton = document.getElementById("habit-category-btn");
  const popupEditButton = document.getElementById("popup-edit-btn");

  const filterButton = document.getElementById("habit-filter-btn");
  const filterMenu = document.getElementById("habit-filter-menu");
  const filterPrioritySelect = document.getElementById("habit-filter-priority");

  const sortRepetitionsButton = document.getElementById("habit-sort-btn");
  const sortPriorityButton = document.getElementById("habit-priority-sort-btn");

  const increaseButton = document.getElementById("add-repetition");
  const decreaseButton = document.getElementById("sub-repetition");
  const resetButton = document.getElementById("reset-repetition");

 
  // global variables 
 
  let habits = JSON.parse(localStorage.getItem("habits")) || [];
  let currentEditingHabitId = null;
  let currentHabit = null;               
  let currentFilterPriority = "all";     
  let repetitionsSortAscending = true;   // Toggle for sortering repetitions 
  let prioritySortAscending = true;      // Toggle for sortering priority




  function openPopup(habit = null, isEditable = true) {
  document.body.classList.add("editing-mode");
  habitPopup.style.display = "flex";

  // show or hide edit button
  if (habit) {
    // only show edit pen when user is in view-mode (isEditable=false) in a existing habit
    popupEditButton.style.display = isEditable ? "none" : "block";
  } else {
    // new habit - hide edit button
    popupEditButton.style.display = "none";
  }

  // set to editabla or read-only
  if (isEditable) {
    titleInput.removeAttribute("disabled");
    priorityDropdownButton.removeAttribute("disabled");
    categoryDropdownButton.removeAttribute("disabled");
    increaseButton.removeAttribute("disabled");
    decreaseButton.removeAttribute("disabled");
    resetButton.removeAttribute("disabled");
  } else {
    titleInput.setAttribute("disabled", "true");
    priorityDropdownButton.setAttribute("disabled", "true");
    categoryDropdownButton.setAttribute("disabled", "true");
    increaseButton.setAttribute("disabled", "true");
    decreaseButton.setAttribute("disabled", "true");
    resetButton.setAttribute("disabled", "true");
  }



  if (habit) {
    // existing habit - fill field/input values
    titleInput.value = habit.title;
    repetitionDisplay.textContent = habit.repetitions;
    // Adding new to keep priority and category when editing 
      document.getElementsByName("habit-priority").forEach(option => {
      option.checked = option.value === habit.priority;
      if (option.checked) {
        priorityDropdownButton.querySelector("span").textContent =
          option.parentElement.textContent.trim();
      }
    });

        document.getElementsByName("habit-category").forEach(option => {
          option.checked = option.value === habit.category;
          if (option.checked) {
            categoryDropdownButton.querySelector("span").textContent =
              option.parentElement.textContent.trim();
          }
        });

    currentEditingHabitId = habit.id;
    currentHabit = habit;
  } else {
    // new habit - reset fields/input
    titleInput.value = "";
    priorityDropdownButton.querySelector("span").textContent = "Choose priority";
    categoryDropdownButton.querySelector("span").textContent = "Choose category";
    document.getElementsByName("habit-priority").forEach(o => o.checked = false);
    document.getElementsByName("habit-category").forEach(o => o.checked = false);
    repetitionDisplay.textContent = "0";
    currentEditingHabitId = null;
    currentHabit = { repetitions: 0 };
  }
}
  
  // function: close popup
  
  function closePopup() {
    document.body.classList.remove("editing-mode");
    habitPopup.style.display = "none";
  }

 
  // function: save or edit habit
 
  function saveHabit() {
    const title = titleInput.value.trim();
    if (title === "") {
      alert("Please enter a habit title!");
      return;
    }

    // check priority from radio buttons
    let selectedPriority = "";
    document.getElementsByName("habit-priority").forEach(option => {
      if (option.checked) selectedPriority = option.value;
    });

    // check repetition value
    const repetitions = parseInt(repetitionDisplay.textContent) || 0;

    // check category from radio buttons
    let selectedCategory = "";
    document.getElementsByName("habit-category").forEach(option => {
      if (option.checked) selectedCategory = option.value;
    });

    if (currentEditingHabitId !== null) {
      // uppdate current habit
      const index = habits.findIndex(habit => habit.id === currentEditingHabitId);
      if (index !== -1) {
        habits[index] = {
          id: currentEditingHabitId,
          title: title,
          priority: selectedPriority,
          repetitions: repetitions,
          category: selectedCategory
        };
      }
    } else {
      // add new habit
      const newHabit = {
        id: Date.now(),
        title: title,
        priority: selectedPriority,
        repetitions: repetitions,
        category: selectedCategory
      };
      habits.push(newHabit);
    }

    localStorage.setItem("habits", JSON.stringify(habits));
    renderHabits();
    closePopup();
  }

  
  // function: update habit - called when repetition value changes i popup)

  function updateHabit(updatedHabit) {
    const index = habits.findIndex(habit => habit.id === updatedHabit.id);
    if (index !== -1) {
      habits[index] = updatedHabit;
      localStorage.setItem("habits", JSON.stringify(habits));
      renderHabits();
      openPopup(updatedHabit, false);
    }
  }

 
  // function: render all habits - with filter + sort applied

  function renderHabits() {
    habitList.innerHTML = "";

    // filter by priority
    const filteredHabits = habits.filter(habit => {
      return currentFilterPriority === "all" || habit.priority === currentFilterPriority;
    });

    // create card for every habit
    filteredHabits.forEach(habit => {
      const habitCard = document.createElement("div");
      habitCard.classList.add("habit-card");

      // Inner HTML for habit card
      habitCard.innerHTML = `
        <div class="habit-card-inner">
          <div class="habit-card-header" id="habit-trash-edit">
            <button class="delete-btn" data-id="${habit.id}"></button>
            <h2 class="habit-category">${habit.category}</h2>
            <button class="edit-btn" data-id="${habit.id}"></button>
          </div>
          <hr class="habit-divider">
          <div class="habit-card-body">
            <div class="habit-icon" id="habit-icon-${habit.id}"></div>
          </div>
          <p class="habit-card-title">${habit.title}</p>
          <div class="habit-card-footer">
            <span class="habit-repetitions"> ${habit.repetitions} days/week</span>
          </div>
        </div>
      `;
      habitList.appendChild(habitCard);

      // add right svg
      const habitIcon = document.getElementById(`habit-icon-${habit.id}`);
      if (habit.category === "Workout") {
        habitIcon.innerHTML = `<img src="/images/habits/habits-workout-hover-black.svg" alt="Workout icon" data-id="${habit.id}">`;
      } else if (habit.category === "Study") {
        habitIcon.innerHTML = `<img src="/images/habits/habits-study-big.svg" alt="Study icon" data-id="${habit.id}">`;
      } else if (habit.category === "Clean") {
        habitIcon.innerHTML = `<img src="/images/habits/habits-clean-hover-black.svg" alt="Cleaning icon" data-id="${habit.id}">`;
      } else if (habit.category === "Gardening") {
        habitIcon.innerHTML = `<img src="/images/habits/habits-plant-hover-black.svg" alt="Gardening icon" data-id="${habit.id}">`;
      } else if (habit.category === "Pet care") {
        habitIcon.innerHTML = `<img src="/images/habits/habits-pet-hover-black.svg" alt="Pet care icon" data-id="${habit.id}">`;
      } else if (habit.category === "Cook") {
        habitIcon.innerHTML = `<img src="/images/habits/habits-eat-hover-black.svg" alt="Cooking icon" data-id="${habit.id}">`;
      } else {
        habitIcon.innerHTML = `<img src="/images/habit-no-category.svg" alt="Default icon" data-id="${habit.id}">`;
      }
      // click icon to show in display mode
      habitIcon.addEventListener("click", () => openPopup(habit, false));

      // connect edit button
      habitCard.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", function () {
          const habitId = parseInt(this.getAttribute("data-id"));
          const found = habits.find(h => h.id === habitId);
          if (found) openPopup(found, true);
        });
      });

      // connect delete button 
      habitCard.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", function () {
          const habitId = parseInt(this.getAttribute("data-id"));
          habits = habits.filter(h => h.id !== habitId);
          localStorage.setItem("habits", JSON.stringify(habits));
          renderHabits();
        });
      });
    });
  }

 
  

  function setupFilterMenu() {
  const filterBtn  = document.getElementById("habit-filter-btn");
  const filterMenu = document.getElementById("habit-filter-menu");
  const radios     = filterMenu.querySelectorAll('input[name="habit-filter"]');

  // toggle dropdown
  filterBtn.addEventListener("click", e => {
    e.stopPropagation();
    filterMenu.classList.toggle("show");
    filterBtn.classList.toggle("active");
  });
  document.addEventListener("click", e => {
    if (!filterMenu.contains(e.target) && !filterBtn.contains(e.target)) {
      filterMenu.classList.remove("show");
      filterBtn.classList.remove("active");
    }
  });

  // when user choose a filter
  radios.forEach(radio => radio.addEventListener("change", () => {
    currentFilterPriority = radio.value;   // "all", "low", "normal", "high"
    renderHabits();
    // close dropdown
    filterMenu.classList.remove("show");
    filterBtn.classList.remove("active");
  }));
}

  

 function setupSorting() {
  const sortBtn  = document.getElementById("habit-sort-btn");
  const sortMenu = document.getElementById("habit-sort-menu");
  const radios   = sortMenu.querySelectorAll('input[name="habit-sort"]');
  
  // toggle dropdown
  sortBtn.addEventListener("click", e => {
    e.stopPropagation();
    sortMenu.classList.toggle("show");
    sortBtn.classList.toggle("active");
  });
  document.addEventListener("click", e => {
    if (!sortMenu.contains(e.target) && !sortBtn.contains(e.target)) {
      sortMenu.classList.remove("show");
      sortBtn.classList.remove("active");
    }
  });

  // user choose sorting alternative
  radios.forEach(radio => radio.addEventListener("change", () => {
    // first sort the array
    if (radio.value === "repetitions") {
      habits.sort((a,b) => repetitionsSortAscending
        ? a.repetitions - b.repetitions
        : b.repetitions - a.repetitions);
      repetitionsSortAscending = !repetitionsSortAscending;
    } else {
      habits.sort((a,b) => prioritySortAscending
        ? (a.priority||"").localeCompare(b.priority||"")
        : (b.priority||"").localeCompare(a.priority||""));
      prioritySortAscending = !prioritySortAscending;
    }

    localStorage.setItem("habits", JSON.stringify(habits));
    renderHabits();
    sortMenu.classList.remove("show");
    sortBtn.classList.remove("active");
  }));
}
  // popup: repetition buttons
 
  increaseButton.addEventListener("click", function () {
    let count = parseInt(repetitionDisplay.textContent) || 0;
    count++;
    repetitionDisplay.textContent = count;
    if (currentHabit && currentHabit.id) {
      currentHabit.repetitions = count;
      // updateHabit(currentHabit);
    } else if (currentHabit) {
      currentHabit.repetitions = count;
    }
  });

  decreaseButton.addEventListener("click", function () {
    let count = parseInt(repetitionDisplay.textContent) || 0;
    if (count > 0) {
      count--;
      repetitionDisplay.textContent = count;
      if (currentHabit && currentHabit.id) {
        currentHabit.repetitions = count;
        // updateHabit(currentHabit);
      } else if (currentHabit) {
        currentHabit.repetitions = count;
      }
    }
  });

  resetButton.addEventListener("click", function () {
    let count = 0;
    repetitionDisplay.textContent = count;
    if (currentHabit && currentHabit.id) {
      currentHabit.repetitions = count;
      // updateHabit(currentHabit);
    } else if (currentHabit) {
      currentHabit.repetitions = count;
    }
  });

 
  // popup: priority dropdown

  const prioritySelectContainer = document.getElementById("habit-priority-select");
  const priorityMenu = document.getElementById("habit-priority-menu");
  priorityDropdownButton.addEventListener("click", function (event) {
    event.stopPropagation();
    prioritySelectContainer.classList.toggle("active");
  });
  const priorityCheckboxes = priorityMenu.querySelectorAll('input[type="checkbox"]');
  priorityCheckboxes.forEach(option => {
    option.addEventListener("change", function () {
      priorityCheckboxes.forEach(otherOption => {
        if (otherOption !== option) otherOption.checked = false;
      });
      if (option.checked) {
        priorityDropdownButton.querySelector("span").textContent = option.parentElement.textContent.trim();
      } else {
        priorityDropdownButton.querySelector("span").textContent = "Choose priority";
      }
      prioritySelectContainer.classList.remove("active");
    });
  });

 
  // popup: category dropdown

  const categorySelectContainer = document.getElementById("habit-category-select");
  const categoryMenu = document.getElementById("habit-category-menu");
  categoryDropdownButton.addEventListener("click", function (event) {
    event.stopPropagation();
    categorySelectContainer.classList.toggle("active");
  });
  const categoryCheckboxes = categoryMenu.querySelectorAll('input[type="checkbox"]');
  categoryCheckboxes.forEach(option => {
    option.addEventListener("change", function () {
      categoryCheckboxes.forEach(otherOption => {
        if (otherOption !== option) otherOption.checked = false;
      });
      if (option.checked) {
        categoryDropdownButton.querySelector("span").textContent = option.parentElement.textContent.trim();
      } else {
        categoryDropdownButton.querySelector("span").textContent = "Choose category";
      }
      categorySelectContainer.classList.remove("active");
    });
  });

  document.addEventListener("click", function () {
    prioritySelectContainer.classList.remove("active");
    categorySelectContainer.classList.remove("active");
  });

  // connect open popup button

  openPopupButton.addEventListener("click", () => openPopup(null, true));
  cancelButton.addEventListener("click", closePopup);
  saveButton.addEventListener("click", saveHabit);
  popupEditButton.addEventListener("click", function () {
    if (currentHabit) {
      openPopup(currentHabit, true);
    }
  });


  // init filter, sort och render list

  setupFilterMenu();
  setupSorting();
  renderHabits();
});
