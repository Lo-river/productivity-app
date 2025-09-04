document.addEventListener('DOMContentLoaded', function () {
    console.log(' tasks.js är inkopplat och körs');

  let stored = JSON.parse(localStorage.getItem('tasks'));
  let tasks  = Array.isArray(stored) ? stored : [];
  let currentTaskId = null;
  let isEditing = false; 
  let newTaskCreated = false;
  let categories = new Set(); 

  const count = 400, defaults = { origin: { y: 0.91 } };
  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    }));
  }


  setupFilterMenu();
  setupSorting();
  loadCategories();
  
  updateTaskList();

  // handle popup 


function openToDoModal(isEditingMode = false, taskId = null) {
  const todoNode     = document.querySelector("#todo");
  if (!todoNode) return;

  // hämta knappar och fält
  const titleInput     = todoNode.querySelector(".todo-title");
  const categorySelect = todoNode.querySelector(".category-select");
  const descTextarea   = todoNode.querySelector(".todo-description");
  const cancelBtn      = todoNode.querySelector("#cancel-btn");
  // const saveBtn        = todoNode.querySelector("#save-btn");
  // const cancelBtn      = todoNode.querySelector("#cancel-btn");
  const editIcon       = todoNode.querySelector(".edit-btn");

  // visa modal
  todoNode.classList.add("todo-active");
  todoNode.style.display = 'block';
  isEditing = isEditingMode;
  currentTaskId = (taskId !== null) ? taskId : tasks.length;
  //- todoNode.classList.remove("edit-task", "view-task");
  todoNode.classList.remove("edit-task", "view-task");
  todoNode.classList.add(isEditingMode ? "edit-task" : "view-task");

  cancelBtn.textContent = isEditingMode ? "Cancel" : "Close";


    const newEditIcon = editIcon.cloneNode(true);
    editIcon.replaceWith(newEditIcon);
    newEditIcon.addEventListener("click", () => {
        openToDoModal(true, currentTaskId);
    });

  // fyll / återställ fälten och lås upp dem i edit-läge
  if (tasks[currentTaskId]) {
    titleInput.value      = tasks[currentTaskId].title;
    categorySelect.value  = tasks[currentTaskId].category;
    descTextarea.value    = tasks[currentTaskId].description;
  } else {
    titleInput.value      = "";
    categorySelect.value  = "";
    descTextarea.value    = "";
    newTaskCreated = true;
  }
  // titleInput.disabled   = !isEditingMode;
  // descTextarea.disabled = !isEditingMode;

  // "lås upp"/frys inmatningsfält
    titleInput.disabled   = !isEditingMode;
    descTextarea.disabled = !isEditingMode;
  populateCategoryDropdown();
}



  function loadCategories() {
    const categorySelect = document.getElementById("category-select");
    const stored = JSON.parse(localStorage.getItem("categories")) || ["Work", "Personal"];

    categorySelect.innerHTML = '<option value="">Select Category</option>';
    stored.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  document.getElementById("add-category-btn").addEventListener("click", function () {
    const newCategoryInput = document.getElementById("new-category-input");
    const newCategory = newCategoryInput.value.trim();

    if (newCategory === "") {
      alert("Please enter a category name.");
      return;
    }

    let stored = JSON.parse(localStorage.getItem("categories")) || [];
    if (!stored.includes(newCategory)) {
      stored.push(newCategory);
      localStorage.setItem("categories", JSON.stringify(stored));
      loadCategories();
    }

    newCategoryInput.value = "";
  });

  function populateCategoryDropdown() {
    loadCategories();
  }

  function closeToDo() {
    let todoNode = document.querySelector("#todo");
    if (!todoNode) return;

    isEditing = false;
    todoNode.style.display = 'none'; 
    updateTaskList(); 
  }

  function enableEditing() {
    openToDoModal(true, currentTaskId);
  }
  
  function saveTask() {
    // const title = document.querySelector(".todo-title").textContent.trim();
    const title = document.querySelector(".todo-title").value.trim();
    const category = document.querySelector(".category-select").value || "Uncategorized";
    // const description = document.querySelector(".todo-description").textContent.trim();
    const description = document.querySelector(".todo-description").value.trim();
    // const dueDate = document.getElementById("due-date").value;

    const nowIso = new Date().toISOString();


    if (newTaskCreated) {
    //   tasks.push({ title, category, description, checked: false, createdAt: nowIso,      
    //   dueDate: dueDate || null  
    // });
    tasks.push({ title, category, description, checked: false, createdAt: nowIso });

      newTaskCreated = false;
    } else {
      tasks[currentTaskId] = {
        ...tasks[currentTaskId],
        title,
        category,
        description,
        // dueDate: dueDate || tasks[currentTaskId].dueDate
      };
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    closeToDo();
  }

  function addNewTask() {
    newTaskCreated = true;
    currentTaskId = tasks.length;
    openToDoModal(true, currentTaskId);
  }

 
  function deleteTask(taskId) {
    const idx = parseInt(taskId, 10);
    tasks.splice(idx, 1);                // ta bort elementet helt
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTaskList();
  }


  function updateTaskList(filter = 'all') {
    const taskList = document.getElementById("todo-list");
    taskList.innerHTML = "";

    Object.keys(tasks).forEach(taskId => {
      const task = tasks[taskId];
      if (!task) return;   
        
      if (filter === 'finished' && !task.checked) return;
      if (filter === 'upcoming' && task.checked) return;

      const li = document.createElement("li");
      li.classList.add("task-card");
      const checkboxLabel = document.createElement("label");
      checkboxLabel.classList.add("custom-checkbox");
      const checkboxInput = document.createElement("input");
      checkboxInput.type = "checkbox";
      checkboxInput.checked = task.checked || false;
      checkboxInput.style.display = "none";
      const checkboxIcon = document.createElement("span");
      checkboxIcon.classList.add("checkbox-icon");
      const customIcon = document.createElement("img");
      customIcon.src = task.checked ? "/images/iconchecked.svg" : "/images/iconunchecked.svg";
      checkboxIcon.appendChild(customIcon);
      checkboxLabel.appendChild(checkboxInput);
      checkboxLabel.appendChild(checkboxIcon);


      checkboxInput.addEventListener("change", function() {
        task.checked = this.checked;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        updateTaskList(filter);

      // confetti
        if (this.checked) {
          fire(0.25, { spread: 26, startVelocity: 55 });
          fire(0.2,  { spread: 60 });
          fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        }
      });

      const showTaskBtn = document.createElement("button");
      showTaskBtn.textContent = task.title;
      showTaskBtn.classList.add("show-task-btn");
      showTaskBtn.addEventListener("click", function () {
        openToDoModal(false, parseInt(taskId));
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", function () {
        deleteTask(taskId);
      });

      if (task.checked) li.classList.add("completed");
      li.appendChild(checkboxLabel);
      li.appendChild(showTaskBtn);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });
  }

  function setupFilterMenu() {
    const filterBtn = document.getElementById("filter-btn");
    const filterMenu = document.getElementById("filter-menu");
    const filterFinished = document.getElementById("filter-finished");
    const filterUpcoming = document.getElementById("filter-upcoming");

    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle("show");
    });
    document.addEventListener("click", (e) => {
      if (!filterMenu.contains(e.target) && !filterBtn.contains(e.target)) {
        filterMenu.classList.remove("show");
      }
    });
    filterFinished.addEventListener("change", () => {
      updateTaskList(filterFinished.checked ? 'finished' : 'all');
    });
    filterUpcoming.addEventListener("change", () => {
      updateTaskList(filterUpcoming.checked ? 'upcoming' : 'all');
    });
  }

  function setupSorting() {
    const sortBtn = document.getElementById("sort-btn");
    let isSortedAscending = true;
    sortBtn.addEventListener("click", () => {
      tasks.reverse();
      updateTaskList();
      isSortedAscending = !isSortedAscending;
    });
  }

  // event listeners  
  document.getElementById("cta-btn").addEventListener("click", addNewTask);
  // document.getElementById("add-task-btn").addEventListener("click", addNewTask);
  // document.querySelector(".save-btn").addEventListener("click", saveTask);
  // document.querySelector(".save-task-btn").addEventListener("click", saveTask);
  document.getElementById("cancel-btn").addEventListener("click", closeToDo);
  document.getElementById("save-btn").addEventListener("click", saveTask);
  document.querySelector(".close-icon").addEventListener("click", closeToDo);
  document.querySelector(".edit-btn").addEventListener("click", enableEditing);

  updateTaskList() 

  
});

