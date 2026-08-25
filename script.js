// ==========================================
// SMART STUDY PLANNER
// JavaScript
// ==========================================


// ------------------------------------------
// CURRENT DATE
// ------------------------------------------

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
});


// ------------------------------------------
// MODAL
// ------------------------------------------

const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

openModal.addEventListener("click", () => {
    modal.classList.add("show");
});

closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
});


// Close modal when clicking outside

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("show");
    }
});


// ------------------------------------------
// TASK SYSTEM
// ------------------------------------------

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");


// Load saved tasks

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];


// Render tasks

function renderTasks() {

    // Keep default tasks if there are no custom tasks
    if (tasks.length === 0) {
        return;
    }

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {

        const taskElement = document.createElement("div");

        taskElement.className = `task ${task.completed ? "completed" : ""}`;

        taskElement.innerHTML = `

            <div class="task-check">
                ${task.completed ? "✓" : "○"}
            </div>

            <div class="task-info">
                <h3>${task.name}</h3>
                <p>${task.subject} · ${task.duration}</p>
            </div>

            <span class="priority ${task.priority}">
                ${capitalize(task.priority)}
            </span>

        `;

        taskElement.addEventListener("click", () => {
            toggleTask(index);
        });

        taskList.appendChild(taskElement);

    });

    updateProgress();
}


// Capitalize words

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


// Add new task

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const taskName = document.getElementById("taskName").value;
    const taskSubject = document.getElementById("taskSubject").value;
    const taskDuration = document.getElementById("taskDuration").value;
    const taskPriority = document.getElementById("taskPriority").value;


    const newTask = {

        name: taskName,
        subject: taskSubject,
        duration: taskDuration,
        priority: taskPriority,
        completed: false

    };


    tasks.push(newTask);

    saveTasks();

    renderTasks();

    taskForm.reset();

    modal.classList.remove("show");

});


// Toggle completed

function toggleTask(index) {

    tasks[index].completed = !tasks[index].completed;

    saveTasks();

    renderTasks();

}


// Save tasks

function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );

}


// ------------------------------------------
// PROGRESS
// ------------------------------------------

function updateProgress() {

    if (tasks.length === 0) {
        return;
    }

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const percentage = Math.round(
        (completed / tasks.length) * 100
    );


    document.getElementById("completedCount").textContent = completed;

    document.getElementById("progressValue").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";
}


// ------------------------------------------
// FOCUS TIMER
// ------------------------------------------

const focusModal = document.getElementById("focusModal");
const startFocus = document.getElementById("startFocus");
const closeFocus = document.getElementById("closeFocus");

const timerDisplay = document.getElementById("timer");
const timerBtn = document.getElementById("timerBtn");

let timeLeft = 25 * 60;
let timerInterval = null;
let timerRunning = false;


// Open focus timer

startFocus.addEventListener("click", () => {

    focusModal.classList.add("show");

});


// Close focus timer

closeFocus.addEventListener("click", () => {

    focusModal.classList.remove("show");

});


// Start / Pause timer

timerBtn.addEventListener("click", () => {

    if (timerRunning) {

        clearInterval(timerInterval);

        timerBtn.textContent = "Resume Timer";

        timerRunning = false;

    } else {

        timerInterval = setInterval(() => {

            if (timeLeft <= 0) {

                clearInterval(timerInterval);

                timerBtn.textContent = "Session Complete ✨";

                timerRunning = false;

                return;
            }


            timeLeft--;

            updateTimer();

        }, 1000);


        timerBtn.textContent = "Pause Timer";

        timerRunning = true;

    }

});


// Update timer display

function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


// ------------------------------------------
// DARK MODE
// ------------------------------------------

const themeBtn = document.getElementById("themeBtn");

let darkMode =
    localStorage.getItem("darkMode") === "true";


function applyTheme() {

    if (darkMode) {

        document.body.classList.add("dark");

        themeBtn.textContent = "☾";

    } else {

        document.body.classList.remove("dark");

        themeBtn.textContent = "☼";

    }

}


themeBtn.addEventListener("click", () => {

    darkMode = !darkMode;

    localStorage.setItem(
        "darkMode",
        darkMode
    );

    applyTheme();

});


// Initial theme

applyTheme();


// ------------------------------------------
// TASK HOVER / CLICK EFFECT
// ------------------------------------------

document.querySelectorAll(".task").forEach(task => {

    task.addEventListener("click", () => {

        task.classList.toggle("completed");

    });

});