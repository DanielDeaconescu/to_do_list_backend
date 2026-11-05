const modalContainer = document.querySelector(`.modal-add-task-container`);
const addTaskBtn = document.querySelector(`.add-task-btn`);
const closeModal = document.querySelector(`.modal-close-btn`);
const modal = document.querySelector(`.modal-add-task`);

if (addTaskBtn) {
  addTaskBtn.addEventListener("click", (e) => {
    modalContainer.classList.remove("no-display");
    e.stopPropagation();
  });

  closeModal.addEventListener("click", () => {
    modalContainer.classList.add("no-display");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".modal-add-task")) {
      modalContainer.classList.add("no-display");
    }
  });
}

// Tags implementation

const tagsArray = [];

// Render the tag that was placed inside .tags-input (in .tag-list)
const tagList = document.querySelector(".tag-list");

const renderTags = (val) => {
  const tagElem = document.createElement("span");
  if (val && !tagsArray.includes(val)) {
    tagElem.textContent = "#" + val;
    tagElem.className = "tag-item";
    tagList.appendChild(tagElem);
  }
};

const tagInput = document.querySelector(".tags-input");
if (tagInput) {
  tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      renderTags(e.target.value);
      // Insert the current value of the .tags-input in the tagsArray
      tagsArray.push(e.target.value);
      e.target.value = "";
    }
  });
}

const addNewTaskForm = document.querySelector(`.add-new-task-form`);
const taskName = document.getElementById("taskName");
const dueDate = document.getElementById("dueDate");
const tags = document.getElementById("tags");
const priority = document.getElementById("priority");

if (addNewTaskForm) {
  addNewTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("/add-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskName: taskName.value,
        dueDate: dueDate.value,
        tags: tagsArray,
        priority: priority.value,
      }),
    });

    if (response.ok) {
      window.location.href = "/";
    }
  });
}
