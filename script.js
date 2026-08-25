/* ==========================================================================
   SMARTSTUDY PLANNER - ES6+ CORE APPLICATION LOGIC
   ========================================================================== */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. DEFAULT DATA & STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'smartstudy_app_state';

  // Default Motivational Quotes
  const DEFAULT_QUOTES = [
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
  ];

  // Helper to format date strings YYYY-MM-DD
  function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Initial Sample State (Used on First Launch)
  const INITIAL_STATE = {
    profile: {
      name: "Alex Rivera",
      goalTasks: 4
    },
    theme: "dark",
    streak: {
      count: 3,
      lastCompletedDate: getTodayString()
    },
    subjects: [
      { id: "sub-1", name: "JavaScript", color: "#6366f1" },
      { id: "sub-2", name: "DBMS", color: "#3b82f6" },
      { id: "sub-3", name: "Operating Systems", color: "#10b981" },
      { id: "sub-4", name: "Machine Learning", color: "#f59e0b" },
      { id: "sub-5", name: "DSA", color: "#ec4899" }
    ],
    tasks: [
      {
        id: "task-1",
        title: "Build JS Async Quiz App",
        subjectId: "sub-1",
        dueDate: getTodayString(),
        dueTime: "14:00",
        priority: "High",
        description: "Implement Promises, Async/Await and fetch API for question dataset.",
        completed: false,
        createdAt: Date.now() - 86400000
      },
      {
        id: "task-2",
        title: "DBMS Relational Algebra Notes",
        subjectId: "sub-2",
        dueDate: getTodayString(),
        dueTime: "17:30",
        priority: "Medium",
        description: "Review Select, Project, Join, and Union operations.",
        completed: true,
        createdAt: Date.now() - 172800000
      },
      {
        id: "task-3",
        title: "Process Scheduling Algorithms",
        subjectId: "sub-3",
        dueDate: getTodayString(),
        dueTime: "20:00",
        priority: "High",
        description: "Calculate Gantt charts for FCFS, SJF, and Round Robin.",
        completed: false,
        createdAt: Date.now() - 43200000
      },
      {
        id: "task-4",
        title: "Linear Regression PyTorch Lab",
        subjectId: "sub-4",
        dueDate: getTodayString(),
        dueTime: "11:00",
        priority: "Medium",
        description: "Train model on synthetic dataset and compute MSE loss.",
        completed: true,
        createdAt: Date.now() - 259200000
      },
      {
        id: "task-5",
        title: "Binary Tree Traversal Problems",
        subjectId: "sub-5",
        dueDate: getTodayString(),
        dueTime: "19:00",
        priority: "High",
        description: "Solve Inorder, Preorder, and Postorder iterative traversals on LeetCode.",
        completed: false,
        createdAt: Date.now() - 86400000
      }
    ],
    schedule: [
      { id: "sched-1", subjectId: "sub-1", startTime: "08:00", endTime: "09:30", topic: "JavaScript Closures & Event Loop" },
      { id: "sched-2", subjectId: "sub-2", startTime: "10:00", endTime: "11:30", topic: "DBMS Normalization (3NF & BCNF)" },
      { id: "sched-3", subjectId: "sub-5", startTime: "14:00", endTime: "15:30", topic: "DSA Graph Algorithms (BFS/DFS)" },
      { id: "sched-4", subjectId: "sub-4", startTime: "17:00", endTime: "18:30", topic: "ML Gradient Descent intuition" }
    ],
    timer: {
      workMin: 25,
      shortBreakMin: 5,
      longBreakMin: 15,
      mode: "work", // "work" | "shortBreak" | "longBreak"
      sessionsCompleted: 2,
      totalFocusMinutes: 50
    }
  };

  // Main State Holder
  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderApp();
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
      showToast("Error saving data to browser storage!", "danger");
    }
  }

  // --------------------------------------------------------------------------
  // 2. DOM ELEMENTS CACHE
  // --------------------------------------------------------------------------
  const DOM = {
    // Navigation
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnCloseSidebar: document.getElementById('btn-close-sidebar'),
    navItems: document.querySelectorAll('.nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    navSubjectsCount: document.getElementById('nav-subjects-count'),
    navTasksCount: document.getElementById('nav-tasks-count'),
    sidebarStreakCount: document.getElementById('sidebar-streak-count'),

    // Top Header
    globalSearch: document.getElementById('global-search'),
    currentDateText: document.getElementById('current-date-text'),
    headerQuickAddBtn: document.getElementById('header-quick-add-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    userProfileBtn: document.getElementById('user-profile-btn'),
    avatarDisplay: document.getElementById('avatar-display'),
    profileNameText: document.getElementById('profile-name-text'),

    // Reminders Banner
    reminderBanner: document.getElementById('reminder-banner'),
    reminderTitle: document.getElementById('reminder-title'),
    reminderDesc: document.getElementById('reminder-desc'),
    btnBannerClose: document.getElementById('btn-banner-close'),

    // Dashboard View
    greetingTitle: document.getElementById('greeting-title'),
    dashBtnAddSubject: document.getElementById('dash-btn-add-subject'),
    dashBtnAddTask: document.getElementById('dash-btn-add-task'),
    statTotalTasks: document.getElementById('stat-total-tasks'),
    statSubjectsSub: document.getElementById('stat-subjects-sub'),
    statCompletedTasks: document.getElementById('stat-completed-tasks'),
    statCompletedSub: document.getElementById('stat-completed-sub'),
    statPendingTasks: document.getElementById('stat-pending-tasks'),
    statDueTodaySub: document.getElementById('stat-due-today-sub'),
    statProgressPercent: document.getElementById('stat-progress-percent'),
    statProgressRatio: document.getElementById('stat-progress-ratio'),
    dashboardProgressRing: document.getElementById('dashboard-progress-ring'),
    dashScheduleTimeline: document.getElementById('dash-schedule-timeline'),
    dashPriorityTasksList: document.getElementById('dash-priority-tasks-list'),
    dashViewFullSchedule: document.getElementById('dash-view-full-schedule'),
    dashViewAllTasks: document.getElementById('dash-view-all-tasks'),
    dashStartPomoBtn: document.getElementById('dash-start-pomo-btn'),
    quoteTextDisplay: document.getElementById('quote-text-display'),
    quoteAuthorDisplay: document.getElementById('quote-author-display'),
    btnNewQuote: document.getElementById('btn-new-quote'),
    goalTasksStatus: document.getElementById('goal-tasks-status'),
    goalPercentText: document.getElementById('goal-percent-text'),
    goalProgressBar: document.getElementById('goal-progress-bar'),
    dashStreakDays: document.getElementById('dash-streak-days'),

    // Subjects View
    btnAddSubjectModal: document.getElementById('btn-add-subject-modal'),
    subjectsGrid: document.getElementById('subjects-grid'),

    // Tasks View
    btnAddTaskModal: document.getElementById('btn-add-task-modal'),
    taskFilterPills: document.querySelectorAll('.filter-pill'),
    taskSearchInput: document.getElementById('task-search-input'),
    taskSortSelect: document.getElementById('task-sort-select'),
    tasksList: document.getElementById('tasks-list'),

    // Schedule View
    btnAddSessionModal: document.getElementById('btn-add-session-modal'),
    scheduleTimeline: document.getElementById('schedule-timeline'),

    // Pomodoro View
    pomoTabs: document.querySelectorAll('.pomo-tab'),
    pomoProgressRing: document.getElementById('pomo-progress-ring'),
    pomoTimerDisplay: document.getElementById('pomo-timer-display'),
    pomoModeLabel: document.getElementById('pomo-mode-label'),
    btnPomoStart: document.getElementById('btn-pomo-start'),
    btnPomoPause: document.getElementById('btn-pomo-pause'),
    btnPomoReset: document.getElementById('btn-pomo-reset'),
    btnPomoSettingsModal: document.getElementById('btn-pomo-settings-modal'),
    pomoSessionsCompleted: document.getElementById('pomo-sessions-completed'),
    pomoTotalTime: document.getElementById('pomo-total-time'),

    // Progress View
    subjectProgressList: document.getElementById('subject-progress-list'),
    weeklyChart: document.getElementById('weekly-chart'),
    btnExportData: document.getElementById('btn-export-data'),
    inputImportFile: document.getElementById('input-import-file'),
    btnClearAllData: document.getElementById('btn-clear-all-data'),

    // Modals & Forms
    modalTask: document.getElementById('modal-task'),
    formTask: document.getElementById('form-task'),
    modalTaskTitle: document.getElementById('modal-task-title'),
    taskIdInput: document.getElementById('task-id'),
    taskTitleInput: document.getElementById('task-title-input'),
    taskSubjectSelect: document.getElementById('task-subject-select'),
    taskPrioritySelect: document.getElementById('task-priority-select'),
    taskDateInput: document.getElementById('task-date-input'),
    taskTimeInput: document.getElementById('task-time-input'),
    taskDescInput: document.getElementById('task-desc-input'),

    modalSubject: document.getElementById('modal-subject'),
    formSubject: document.getElementById('form-subject'),
    modalSubjectTitle: document.getElementById('modal-subject-title'),
    subjectIdInput: document.getElementById('subject-id'),
    subjectNameInput: document.getElementById('subject-name-input'),

    modalSession: document.getElementById('modal-session'),
    formSession: document.getElementById('form-session'),
    modalSessionTitle: document.getElementById('modal-session-title'),
    sessionIdInput: document.getElementById('session-id'),
    sessionSubjectSelect: document.getElementById('session-subject-select'),
    sessionStartTime: document.getElementById('session-start-time'),
    sessionEndTime: document.getElementById('session-end-time'),
    sessionTopicInput: document.getElementById('session-topic-input'),

    modalProfile: document.getElementById('modal-profile'),
    formProfile: document.getElementById('form-profile'),
    profileNameInput: document.getElementById('profile-name-input'),
    profileGoalTasks: document.getElementById('profile-goal-tasks'),

    modalPomoSettings: document.getElementById('modal-pomo-settings'),
    formPomoSettings: document.getElementById('form-pomo-settings'),
    settingWorkMin: document.getElementById('setting-work-min'),
    settingShortMin: document.getElementById('setting-short-min'),
    settingLongMin: document.getElementById('setting-long-min'),

    modalConfirm: document.getElementById('modal-confirm'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmBtnAction: document.getElementById('confirm-btn-action'),

    // Overlay / Utilities
    toastContainer: document.getElementById('toast-container'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  // Filter & Search Active Local Variables
  let activeTaskFilter = 'all';
  let activeSearchQuery = '';
  let activeSortOption = 'date-asc';

  // --------------------------------------------------------------------------
  // 3. INITIALIZATION & THEME SETTING
  // --------------------------------------------------------------------------
  function init() {
    applyTheme(state.theme);
    updateDateDisplay();
    setupEventListeners();
    initPomodoroTimer();
    renderApp();
    checkReminders();
    getRandomQuote();
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.dataset.theme = theme;
  }

  function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    DOM.currentDateText.textContent = now.toLocaleDateString('en-US', options);

    // Update greeting
    const hours = now.getHours();
    let greeting = "Good morning";
    if (hours >= 12 && hours < 17) greeting = "Good afternoon";
    else if (hours >= 17) greeting = "Good evening";

    DOM.greetingTitle.textContent = `${greeting}, ${state.profile.name} 👋`;
  }

  // --------------------------------------------------------------------------
  // 4. NAVIGATION & VIEW SWITCHING
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    DOM.viewSections.forEach(section => {
      if (section.id === `view-${viewName}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    DOM.navItems.forEach(item => {
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    closeMobileSidebar();

    // Scroll to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openMobileSidebar() {
    DOM.sidebar.classList.add('mobile-open');
    DOM.sidebarBackdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    DOM.sidebar.classList.remove('mobile-open');
    DOM.sidebarBackdrop.classList.remove('active');
  }

  // --------------------------------------------------------------------------
  // 5. TOAST NOTIFICATIONS & CONFETTI SYSTEM
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '🚨';

    toast.innerHTML = `
      <span style="font-size: 1.2rem;">${icon}</span>
      <span style="font-size: 0.875rem; font-weight: 500;">${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Web Audio Synthesizer Chime for Timer Complete
  function playTimerChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  }

  // Pure Canvas Confetti Particle Effect
  function triggerConfetti() {
    const canvas = DOM.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 5 + 3,
        speedX: Math.random() * 4 - 2,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 6 - 3
      });
    }

    let animationFrame;
    const startTime = Date.now();

    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;
      });

      if (Date.now() - startTime < 2500) {
        animationFrame = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    renderConfetti();
  }

  // --------------------------------------------------------------------------
  // 6. MAIN RENDER FUNCTION
  // --------------------------------------------------------------------------
  function renderApp() {
    updateProfileAndNavBadges();
    renderDashboard();
    renderSubjects();
    renderTasks();
    renderSchedule();
    renderProgress();
    populateSubjectSelects();
  }

  function updateProfileAndNavBadges() {
    DOM.profileNameText.textContent = state.profile.name;
    const initials = state.profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    DOM.avatarDisplay.textContent = initials || 'ST';

    DOM.navSubjectsCount.textContent = state.subjects.length;
    DOM.navTasksCount.textContent = state.tasks.filter(t => !t.completed).length;
    DOM.sidebarStreakCount.textContent = `${state.streak.count} Days`;
  }

  // --------------------------------------------------------------------------
  // 7. RENDER DASHBOARD VIEW
  // --------------------------------------------------------------------------
  function renderDashboard() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const todayStr = getTodayString();

    const dueToday = state.tasks.filter(t => !t.completed && t.dueDate === todayStr).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Stat Cards Update
    DOM.statTotalTasks.textContent = total;
    DOM.statSubjectsSub.textContent = `${state.subjects.length} Active Subjects`;

    DOM.statCompletedTasks.textContent = completed;
    DOM.statCompletedSub.textContent = `${percent}% finished`;

    DOM.statPendingTasks.textContent = pending;
    DOM.statDueTodaySub.textContent = `${dueToday} Due Today`;

    DOM.statProgressPercent.textContent = `${percent}%`;
    DOM.statProgressRatio.textContent = `${completed}/${total}`;

    // SVG Ring calculation (Circumference ~ 150.79)
    const circumference = 150.79;
    const offset = circumference - (circumference * percent) / 100;
    DOM.dashboardProgressRing.style.strokeDashoffset = offset;

    // Dashboard Schedule Timeline Preview
    DOM.dashScheduleTimeline.innerHTML = '';
    if (state.schedule.length === 0) {
      DOM.dashScheduleTimeline.innerHTML = `<p class="text-muted" style="text-align: center; padding: 1rem 0;">No sessions scheduled for today yet.</p>`;
    } else {
      const sortedSchedule = [...state.schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
      sortedSchedule.forEach(session => {
        const subject = state.subjects.find(s => s.id === session.subjectId);
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-left">
            <span class="timeline-time">${formatTime12h(session.startTime)} - ${formatTime12h(session.endTime)}</span>
            <div class="timeline-info">
              <strong>${escapeHTML(session.topic || 'Study Session')}</strong>
              <span>${subject ? escapeHTML(subject.name) : 'General Study'}</span>
            </div>
          </div>
          <div class="subject-dot" style="background-color: ${subject ? subject.color : '#6366f1'}; width: 10px; height: 10px;"></div>
        `;
        DOM.dashScheduleTimeline.appendChild(item);
      });
    }

    // High Priority Tasks Preview
    DOM.dashPriorityTasksList.innerHTML = '';
    const highPriorityTasks = state.tasks.filter(t => !t.completed && t.priority === 'High').slice(0, 4);

    if (highPriorityTasks.length === 0) {
      DOM.dashPriorityTasksList.innerHTML = `<p class="text-muted" style="text-align: center; padding: 1rem 0;">No high priority pending tasks! 🎉</p>`;
    } else {
      highPriorityTasks.forEach(task => {
        const subject = state.subjects.find(s => s.id === task.subjectId);
        const item = document.createElement('div');
        item.className = 'task-mini-item';
        item.innerHTML = `
          <div class="task-mini-left">
            <span class="badge-priority priority-high">High</span>
            <div>
              <strong style="font-size: 0.875rem; color: var(--text-main);">${escapeHTML(task.title)}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${subject ? escapeHTML(subject.name) : ''} • Due ${task.dueDate}</div>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost btn-complete-mini" data-id="${task.id}">✓ Complete</button>
        `;
        DOM.dashPriorityTasksList.appendChild(item);
      });
    }

    // Daily Goal & Streak Update
    const completedTodayCount = state.tasks.filter(t => t.completed && t.dueDate === todayStr).length;
    const goalTarget = state.profile.goalTasks;
    const goalPercent = Math.min(100, Math.round((completedTodayCount / goalTarget) * 100));

    DOM.goalTasksStatus.textContent = `${completedTodayCount} of ${goalTarget} tasks completed today`;
    DOM.goalPercentText.textContent = `${goalPercent}%`;
    DOM.goalProgressBar.style.width = `${goalPercent}%`;
    DOM.dashStreakDays.textContent = `${state.streak.count} Day Streak!`;
  }

  // --------------------------------------------------------------------------
  // 8. RENDER SUBJECTS VIEW
  // --------------------------------------------------------------------------
  function renderSubjects() {
    DOM.subjectsGrid.innerHTML = '';

    if (state.subjects.length === 0) {
      DOM.subjectsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">📚</div>
          <h3>No Subjects Added Yet</h3>
          <p>Create subjects like JavaScript, DBMS, or Physics to organize your tasks.</p>
          <button class="btn btn-primary" id="btn-empty-add-subject">+ Add First Subject</button>
        </div>
      `;
      document.getElementById('btn-empty-add-subject')?.addEventListener('click', () => openSubjectModal());
      return;
    }

    state.subjects.forEach(subject => {
      const subjectTasks = state.tasks.filter(t => t.subjectId === subject.id);
      const completedCount = subjectTasks.filter(t => t.completed).length;
      const totalCount = subjectTasks.length;
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const card = document.createElement('div');
      card.className = 'subject-card';
      card.innerHTML = `
        <div class="subject-banner" style="background-color: ${subject.color};"></div>
        <div class="subject-body">
          <div class="subject-header-row">
            <div class="subject-title-wrap">
              <div class="subject-dot" style="background-color: ${subject.color};"></div>
              <h3>${escapeHTML(subject.name)}</h3>
            </div>
          </div>
          
          <div class="subject-stats-row">
            <span>${totalCount} Total Tasks</span>
            <span>${percent}% Done</span>
          </div>

          <div class="progress-bar-track" style="margin-bottom: 1rem;">
            <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${subject.color};"></div>
          </div>

          <div class="subject-card-footer">
            <button class="btn btn-sm btn-ghost btn-edit-subject" data-id="${subject.id}">Edit</button>
            <button class="btn btn-sm btn-ghost text-danger btn-delete-subject" data-id="${subject.id}">Delete</button>
          </div>
        </div>
      `;
      DOM.subjectsGrid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 9. RENDER STUDY TASKS VIEW
  // --------------------------------------------------------------------------
  function renderTasks() {
    DOM.tasksList.innerHTML = '';

    let filtered = [...state.tasks];
    const todayStr = getTodayString();

    // 1. Filter Tab
    if (activeTaskFilter === 'today') {
      filtered = filtered.filter(t => t.dueDate === todayStr);
    } else if (activeTaskFilter === 'upcoming') {
      filtered = filtered.filter(t => !t.completed && t.dueDate > todayStr);
    } else if (activeTaskFilter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (activeTaskFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (activeTaskFilter === 'high') {
      filtered = filtered.filter(t => t.priority === 'High');
    }

    // 2. Search Filter
    if (activeSearchQuery.trim() !== '') {
      const q = activeSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => {
        const subject = state.subjects.find(s => s.id === t.subjectId);
        const subjectName = subject ? subject.name.toLowerCase() : '';
        return t.title.toLowerCase().includes(q) || subjectName.includes(q) || (t.description && t.description.toLowerCase().includes(q));
      });
    }

    // 3. Sorting
    filtered.sort((a, b) => {
      if (activeSortOption === 'date-asc') return a.dueDate.localeCompare(b.dueDate);
      if (activeSortOption === 'date-desc') return b.dueDate.localeCompare(a.dueDate);
      if (activeSortOption === 'priority') {
        const pOrder = { High: 1, Medium: 2, Low: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      }
      if (activeSortOption === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    if (filtered.length === 0) {
      DOM.tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📌</div>
          <h3>No Tasks Found</h3>
          <p>There are no study tasks matching the current filter or search criteria.</p>
          <button class="btn btn-primary" id="btn-empty-add-task">+ Create New Task</button>
        </div>
      `;
      document.getElementById('btn-empty-add-task')?.addEventListener('click', () => openTaskModal());
      return;
    }

    filtered.forEach(task => {
      const subject = state.subjects.find(s => s.id === task.subjectId);
      const isOverdue = !task.completed && task.dueDate < todayStr;
      const isToday = task.dueDate === todayStr;

      let dateBadgeClass = '';
      if (isOverdue) dateBadgeClass = 'text-danger';
      else if (isToday) dateBadgeClass = 'text-warning';

      const card = document.createElement('div');
      card.className = `task-item ${task.completed ? 'completed' : ''}`;
      card.innerHTML = `
        <div class="task-left">
          <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
            ${task.completed ? '✓' : ''}
          </div>
          <div class="task-details">
            <div class="task-title-row">
              <span class="task-title">${escapeHTML(task.title)}</span>
              ${subject ? `<span class="subject-tag" style="background-color: ${subject.color};">${escapeHTML(subject.name)}</span>` : ''}
              <span class="badge-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
            </div>
            
            <div class="task-meta">
              <span class="${dateBadgeClass}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${isOverdue ? 'OVERDUE: ' : ''}${task.dueDate} ${task.dueTime ? 'at ' + formatTime12h(task.dueTime) : ''}
              </span>
            </div>

            ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
          </div>
        </div>

        <div class="task-actions">
          <button class="btn btn-sm btn-ghost btn-edit-task" data-id="${task.id}">Edit</button>
          <button class="btn btn-sm btn-ghost text-danger btn-delete-task" data-id="${task.id}">Delete</button>
        </div>
      `;
      DOM.tasksList.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 10. RENDER SCHEDULE VIEW
  // --------------------------------------------------------------------------
  function renderSchedule() {
    DOM.scheduleTimeline.innerHTML = '';

    if (state.schedule.length === 0) {
      DOM.scheduleTimeline.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⏰</div>
          <h3>No Timetable Sessions Scheduled</h3>
          <p>Plan daily study slots to keep your learning structured and productive.</p>
          <button class="btn btn-primary" id="btn-empty-add-session">+ Add First Session</button>
        </div>
      `;
      document.getElementById('btn-empty-add-session')?.addEventListener('click', () => openSessionModal());
      return;
    }

    const sorted = [...state.schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Get current time string HH:MM
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    sorted.forEach(session => {
      const subject = state.subjects.find(s => s.id === session.subjectId);
      const isNow = currentHHMM >= session.startTime && currentHHMM <= session.endTime;

      const card = document.createElement('div');
      card.className = `schedule-card ${isNow ? 'active-now' : ''}`;
      if (subject) card.style.borderLeftColor = subject.color;

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div class="schedule-time-badge">
            ${formatTime12h(session.startTime)} – ${formatTime12h(session.endTime)}
          </div>
          <div class="schedule-info">
            <h4>${escapeHTML(session.topic || 'Study Session')} ${isNow ? '<span class="badge-priority priority-high" style="margin-left: 0.5rem;">ONGOING NOW</span>' : ''}</h4>
            <p class="text-muted">${subject ? escapeHTML(subject.name) : 'General Study'}</p>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-ghost btn-edit-session" data-id="${session.id}">Edit</button>
          <button class="btn btn-sm btn-ghost text-danger btn-delete-session" data-id="${session.id}">Delete</button>
        </div>
      `;
      DOM.scheduleTimeline.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 11. RENDER PROGRESS & ANALYTICS VIEW
  // --------------------------------------------------------------------------
  function renderProgress() {
    DOM.subjectProgressList.innerHTML = '';

    if (state.subjects.length === 0) {
      DOM.subjectProgressList.innerHTML = `<p class="text-muted">No subjects available for progress calculation.</p>`;
    } else {
      state.subjects.forEach(subject => {
        const tasks = state.tasks.filter(t => t.subjectId === subject.id);
        const done = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        const item = document.createElement('div');
        item.className = 'subject-prog-item';
        item.innerHTML = `
          <div class="prog-info-row">
            <span>${escapeHTML(subject.name)}</span>
            <span>${done}/${total} (${percent}%)</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${subject.color};"></div>
          </div>
        `;
        DOM.subjectProgressList.appendChild(item);
      });
    }

    // Weekly Completion Chart Visualizer (Mon to Sun)
    DOM.weeklyChart.innerHTML = '';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate counts for last 7 days mockup calculation
    days.forEach((day, index) => {
      const mockHeight = (index % 3 === 0) ? 75 : (index % 2 === 0 ? 90 : 45);
      const col = document.createElement('div');
      col.className = 'chart-bar-col';
      col.innerHTML = `
        <div class="chart-bar-wrap">
          <div class="chart-bar-inner" style="height: ${mockHeight}%;"></div>
        </div>
        <span class="chart-day-label">${day}</span>
      `;
      DOM.weeklyChart.appendChild(col);
    });
  }

  // Populate Subject Select Dropdowns in Modals
  function populateSubjectSelects() {
    const selects = [DOM.taskSubjectSelect, DOM.sessionSubjectSelect];
    selects.forEach(select => {
      if (!select) return;
      const currentVal = select.value;
      select.innerHTML = '';
      if (state.subjects.length === 0) {
        select.innerHTML = `<option value="">No subjects available</option>`;
        return;
      }
      state.subjects.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.id;
        opt.textContent = sub.name;
        select.appendChild(opt);
      });
      if (currentVal) select.value = currentVal;
    });
  }

  // --------------------------------------------------------------------------
  // 12. POMODORO TIMER ENGINE
  // --------------------------------------------------------------------------
  let timerInterval = null;
  let timerSecondsLeft = 25 * 60;
  let isTimerRunning = false;

  function initPomodoroTimer() {
    updateTimerDisplay();
  }

  function setTimerMode(mode) {
    state.timer.mode = mode;
    isTimerRunning = false;
    clearInterval(timerInterval);
    DOM.btnPomoStart.classList.remove('hidden');
    DOM.btnPomoPause.classList.add('hidden');

    DOM.pomoTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    if (mode === 'work') {
      timerSecondsLeft = state.timer.workMin * 60;
      DOM.pomoModeLabel.textContent = "Time to focus!";
    } else if (mode === 'shortBreak') {
      timerSecondsLeft = state.timer.shortBreakMin * 60;
      DOM.pomoModeLabel.textContent = "Take a short break ☕";
    } else if (mode === 'longBreak') {
      timerSecondsLeft = state.timer.longBreakMin * 60;
      DOM.pomoModeLabel.textContent = "Relax & Recharge 🌴";
    }

    updateTimerDisplay();
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    DOM.btnPomoStart.classList.add('hidden');
    DOM.btnPomoPause.classList.remove('hidden');

    timerInterval = setInterval(() => {
      if (timerSecondsLeft > 0) {
        timerSecondsLeft--;
        updateTimerDisplay();
      } else {
        // Timer completed!
        clearInterval(timerInterval);
        isTimerRunning = false;
        DOM.btnPomoStart.classList.remove('hidden');
        DOM.btnPomoPause.classList.add('hidden');

        playTimerChime();

        if (state.timer.mode === 'work') {
          state.timer.sessionsCompleted++;
          state.timer.totalFocusMinutes += state.timer.workMin;
          showToast(`Pomodoro Session Complete! Great job 🎯`, 'success');
          triggerConfetti();
        } else {
          showToast(`Break time over! Ready to focus?`, 'info');
        }

        saveState();
      }
    }, 1000);
  }

  function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    DOM.btnPomoStart.classList.remove('hidden');
    DOM.btnPomoPause.classList.add('hidden');
  }

  function resetTimer() {
    pauseTimer();
    setTimerMode(state.timer.mode);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    DOM.pomoTimerDisplay.textContent = timeStr;

    // SVG Ring calculation (Circumference ~ 596.9)
    let totalSecs = state.timer.workMin * 60;
    if (state.timer.mode === 'shortBreak') totalSecs = state.timer.shortBreakMin * 60;
    if (state.timer.mode === 'longBreak') totalSecs = state.timer.longBreakMin * 60;

    const circumference = 596.9;
    const progress = totalSecs > 0 ? timerSecondsLeft / totalSecs : 0;
    const offset = circumference * (1 - progress);
    DOM.pomoProgressRing.style.strokeDashoffset = offset;

    DOM.pomoSessionsCompleted.textContent = `${state.timer.sessionsCompleted} Sessions`;
    DOM.pomoTotalTime.textContent = `${state.timer.totalFocusMinutes} min`;
  }

  // --------------------------------------------------------------------------
  // 13. MODAL HANDLERS & CRUD OPERATIONS
  // --------------------------------------------------------------------------
  function openModal(modal) {
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  // Subject Operations
  function openSubjectModal(subjectId = null) {
    DOM.formSubject.reset();
    if (subjectId) {
      const subject = state.subjects.find(s => s.id === subjectId);
      if (subject) {
        DOM.modalSubjectTitle.textContent = 'Edit Subject';
        DOM.subjectIdInput.value = subject.id;
        DOM.subjectNameInput.value = subject.name;
        const colorRadio = DOM.formSubject.querySelector(`input[value="${subject.color}"]`);
        if (colorRadio) colorRadio.checked = true;
      }
    } else {
      DOM.modalSubjectTitle.textContent = 'Add New Subject';
      DOM.subjectIdInput.value = '';
    }
    openModal(DOM.modalSubject);
  }

  function handleSaveSubject(e) {
    e.preventDefault();
    const id = DOM.subjectIdInput.value;
    const name = DOM.subjectNameInput.value.trim();
    const color = DOM.formSubject.querySelector('input[name="subject-color"]:checked')?.value || '#6366f1';

    if (!name) {
      showToast('Please enter a valid subject name.', 'warning');
      return;
    }

    // Prevent duplicates
    const duplicate = state.subjects.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== id);
    if (duplicate) {
      showToast('A subject with this name already exists!', 'warning');
      return;
    }

    if (id) {
      // Edit existing
      const subject = state.subjects.find(s => s.id === id);
      if (subject) {
        subject.name = name;
        subject.color = color;
        showToast('Subject updated successfully.', 'success');
      }
    } else {
      // Create new
      const newSubject = {
        id: 'sub-' + Date.now(),
        name,
        color
      };
      state.subjects.push(newSubject);
      showToast('New subject added!', 'success');
    }

    saveState();
    closeModal(DOM.modalSubject);
  }

  function deleteSubject(subjectId) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    openConfirmModal(
      'Delete Subject',
      `Are you sure you want to delete "${subject.name}"? All associated tasks will also be deleted.`,
      () => {
        state.subjects = state.subjects.filter(s => s.id !== subjectId);
        state.tasks = state.tasks.filter(t => t.subjectId !== subjectId);
        state.schedule = state.schedule.filter(s => s.subjectId !== subjectId);
        saveState();
        showToast('Subject deleted.', 'info');
      }
    );
  }

  // Task Operations
  function openTaskModal(taskId = null) {
    if (state.subjects.length === 0) {
      showToast('Please add at least one subject before creating a task!', 'warning');
      openSubjectModal();
      return;
    }

    DOM.formTask.reset();
    populateSubjectSelects();

    if (taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        DOM.modalTaskTitle.textContent = 'Edit Study Task';
        DOM.taskIdInput.value = task.id;
        DOM.taskTitleInput.value = task.title;
        DOM.taskSubjectSelect.value = task.subjectId;
        DOM.taskPrioritySelect.value = task.priority;
        DOM.taskDateInput.value = task.dueDate;
        DOM.taskTimeInput.value = task.dueTime || '10:00';
        DOM.taskDescInput.value = task.description || '';
      }
    } else {
      DOM.modalTaskTitle.textContent = 'Create Study Task';
      DOM.taskIdInput.value = '';
      DOM.taskDateInput.value = getTodayString();
    }
    openModal(DOM.modalTask);
  }

  function handleSaveTask(e) {
    e.preventDefault();
    const id = DOM.taskIdInput.value;
    const title = DOM.taskTitleInput.value.trim();
    const subjectId = DOM.taskSubjectSelect.value;
    const priority = DOM.taskPrioritySelect.value;
    const dueDate = DOM.taskDateInput.value;
    const dueTime = DOM.taskTimeInput.value;
    const description = DOM.taskDescInput.value.trim();

    if (!title || !dueDate || !subjectId) {
      showToast('Please fill out all required task fields.', 'warning');
      return;
    }

    if (id) {
      // Edit
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        task.title = title;
        task.subjectId = subjectId;
        task.priority = priority;
        task.dueDate = dueDate;
        task.dueTime = dueTime;
        task.description = description;
        showToast('Task updated!', 'success');
      }
    } else {
      // Create
      const newTask = {
        id: 'task-' + Date.now(),
        title,
        subjectId,
        priority,
        dueDate,
        dueTime,
        description,
        completed: false,
        createdAt: Date.now()
      };
      state.tasks.push(newTask);
      showToast('Study task created successfully!', 'success');
    }

    saveState();
    closeModal(DOM.modalTask);
  }

  function toggleTaskCompletion(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
      showToast('Task completed! 🎉', 'success');

      // Check if all tasks for today are completed
      const todayStr = getTodayString();
      const todayTasks = state.tasks.filter(t => t.dueDate === todayStr);
      const allTodayCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed);

      if (allTodayCompleted) {
        triggerConfetti();
        showToast('Outstanding! You completed all daily tasks! 🔥', 'success');
      }
    }

    saveState();
  }

  function deleteTask(taskId) {
    openConfirmModal(
      'Delete Task',
      'Are you sure you want to delete this task?',
      () => {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        saveState();
        showToast('Task deleted.', 'info');
      }
    );
  }

  // Session Operations
  function openSessionModal(sessionId = null) {
    if (state.subjects.length === 0) {
      showToast('Please add a subject first!', 'warning');
      openSubjectModal();
      return;
    }
    DOM.formSession.reset();
    populateSubjectSelects();

    if (sessionId) {
      const s = state.schedule.find(item => item.id === sessionId);
      if (s) {
        DOM.modalSessionTitle.textContent = 'Edit Timetable Session';
        DOM.sessionIdInput.value = s.id;
        DOM.sessionSubjectSelect.value = s.subjectId;
        DOM.sessionStartTime.value = s.startTime;
        DOM.sessionEndTime.value = s.endTime;
        DOM.sessionTopicInput.value = s.topic || '';
      }
    } else {
      DOM.modalSessionTitle.textContent = 'Add Study Session';
      DOM.sessionIdInput.value = '';
    }
    openModal(DOM.modalSession);
  }

  function handleSaveSession(e) {
    e.preventDefault();
    const id = DOM.sessionIdInput.value;
    const subjectId = DOM.sessionSubjectSelect.value;
    const startTime = DOM.sessionStartTime.value;
    const endTime = DOM.sessionEndTime.value;
    const topic = DOM.sessionTopicInput.value.trim();

    if (startTime >= endTime) {
      showToast('End time must be after start time!', 'warning');
      return;
    }

    if (id) {
      const s = state.schedule.find(item => item.id === id);
      if (s) {
        s.subjectId = subjectId;
        s.startTime = startTime;
        s.endTime = endTime;
        s.topic = topic;
        showToast('Session updated!', 'success');
      }
    } else {
      const newSession = {
        id: 'sched-' + Date.now(),
        subjectId,
        startTime,
        endTime,
        topic
      };
      state.schedule.push(newSession);
      showToast('Study session scheduled!', 'success');
    }

    saveState();
    closeModal(DOM.modalSession);
  }

  function deleteSession(sessionId) {
    openConfirmModal(
      'Delete Session',
      'Are you sure you want to remove this timetable slot?',
      () => {
        state.schedule = state.schedule.filter(s => s.id !== sessionId);
        saveState();
        showToast('Session deleted.', 'info');
      }
    );
  }

  // Profile & Goal Settings
  function openProfileModal() {
    DOM.profileNameInput.value = state.profile.name;
    DOM.profileGoalTasks.value = state.profile.goalTasks;
    openModal(DOM.modalProfile);
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    const name = DOM.profileNameInput.value.trim();
    const goal = parseInt(DOM.profileGoalTasks.value, 10);

    if (name && goal > 0) {
      state.profile.name = name;
      state.profile.goalTasks = goal;
      saveState();
      updateDateDisplay();
      closeModal(DOM.modalProfile);
      showToast('Profile updated!', 'success');
    }
  }

  // Pomodoro Duration Settings
  function handleSavePomoSettings(e) {
    e.preventDefault();
    state.timer.workMin = parseInt(DOM.settingWorkMin.value, 10) || 25;
    state.timer.shortBreakMin = parseInt(DOM.settingShortMin.value, 10) || 5;
    state.timer.longBreakMin = parseInt(DOM.settingLongMin.value, 10) || 15;

    resetTimer();
    saveState();
    closeModal(DOM.modalPomoSettings);
    showToast('Pomodoro durations updated!', 'success');
  }

  // Confirmation Modal
  let confirmCallback = null;
  function openConfirmModal(title, message, onConfirm) {
    DOM.confirmTitle.textContent = title;
    DOM.confirmMessage.textContent = message;
    confirmCallback = onConfirm;
    openModal(DOM.modalConfirm);
  }

  // --------------------------------------------------------------------------
  // 14. EXPORT, IMPORT, & CLEAR DATA
  // --------------------------------------------------------------------------
  function exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smartstudy_backup_${getTodayString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data exported successfully!', 'success');
  }

  function importDataJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.subjects && imported.tasks) {
          state = imported;
          saveState();
          showToast('Data imported successfully!', 'success');
        } else {
          showToast('Invalid backup file format.', 'danger');
        }
      } catch (err) {
        showToast('Error parsing JSON file.', 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function clearAllData() {
    openConfirmModal(
      'Clear All Data',
      'WARNING: This will delete all your subjects, tasks, schedule, and settings. This cannot be undone.',
      () => {
        localStorage.removeItem(STORAGE_KEY);
        state = JSON.parse(JSON.stringify(INITIAL_STATE));
        saveState();
        showToast('All data has been reset to defaults.', 'warning');
      }
    );
  }

  // --------------------------------------------------------------------------
  // 15. QUOTES ENGINE & REMINDERS
  // --------------------------------------------------------------------------
  function getRandomQuote() {
    const q = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
    DOM.quoteTextDisplay.style.opacity = '0';
    DOM.quoteAuthorDisplay.style.opacity = '0';

    setTimeout(() => {
      DOM.quoteTextDisplay.textContent = `"${q.text}"`;
      DOM.quoteAuthorDisplay.textContent = `— ${q.author}`;
      DOM.quoteTextDisplay.style.opacity = '1';
      DOM.quoteAuthorDisplay.style.opacity = '1';
      DOM.quoteTextDisplay.style.transition = 'opacity 0.4s ease';
      DOM.quoteAuthorDisplay.style.transition = 'opacity 0.4s ease';
    }, 200);
  }

  function checkReminders() {
    const todayStr = getTodayString();
    const overdue = state.tasks.filter(t => !t.completed && t.dueDate < todayStr);
    const dueToday = state.tasks.filter(t => !t.completed && t.dueDate === todayStr);

    if (overdue.length > 0) {
      DOM.reminderTitle.textContent = `Overdue Tasks Warning (${overdue.length})`;
      DOM.reminderDesc.textContent = `You have ${overdue.length} overdue task(s). Please review and complete them!`;
      DOM.reminderBanner.classList.remove('hidden');
    } else if (dueToday.length > 0) {
      DOM.reminderTitle.textContent = `Tasks Due Today (${dueToday.length})`;
      DOM.reminderDesc.textContent = `You have ${dueToday.length} task(s) scheduled for completion today.`;
      DOM.reminderBanner.classList.remove('hidden');
    } else {
      DOM.reminderBanner.classList.add('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // 16. EVENT LISTENERS
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Navigation Tab Switching
    DOM.navItems.forEach(item => {
      item.addEventListener('click', () => switchView(item.dataset.view));
    });

    // Mobile Sidebar Toggles
    DOM.btnToggleSidebar.addEventListener('click', openMobileSidebar);
    DOM.btnCloseSidebar.addEventListener('click', closeMobileSidebar);
    DOM.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    // Header Actions
    DOM.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      saveState();
    });

    DOM.userProfileBtn.addEventListener('click', openProfileModal);
    DOM.headerQuickAddBtn.addEventListener('click', () => openTaskModal());

    // Global & Task View Search Inputs
    const handleSearchInput = (e) => {
      activeSearchQuery = e.target.value;
      if (DOM.globalSearch !== e.target) DOM.globalSearch.value = activeSearchQuery;
      if (DOM.taskSearchInput !== e.target) DOM.taskSearchInput.value = activeSearchQuery;
      if (activeSearchQuery.trim() !== '') switchView('tasks');
      renderTasks();
    };

    DOM.globalSearch.addEventListener('input', handleSearchInput);
    DOM.taskSearchInput.addEventListener('input', handleSearchInput);

    // Dashboard Quick Buttons
    DOM.dashBtnAddSubject.addEventListener('click', () => openSubjectModal());
    DOM.dashBtnAddTask.addEventListener('click', () => openTaskModal());
    DOM.dashViewFullSchedule.addEventListener('click', () => switchView('schedule'));
    DOM.dashViewAllTasks.addEventListener('click', () => switchView('tasks'));
    DOM.dashStartPomoBtn.addEventListener('click', () => switchView('pomodoro'));
    DOM.btnNewQuote.addEventListener('click', getRandomQuote);

    // Task Complete from Mini Dashboard List
    DOM.dashPriorityTasksList.addEventListener('click', e => {
      const btn = e.target.closest('.btn-complete-mini');
      if (btn) toggleTaskCompletion(btn.dataset.id);
    });

    // Subject View Buttons
    DOM.btnAddSubjectModal.addEventListener('click', () => openSubjectModal());
    DOM.subjectsGrid.addEventListener('click', e => {
      const editBtn = e.target.closest('.btn-edit-subject');
      const deleteBtn = e.target.closest('.btn-delete-subject');
      if (editBtn) openSubjectModal(editBtn.dataset.id);
      if (deleteBtn) deleteSubject(deleteBtn.dataset.id);
    });

    // Task View Filters & Controls
    DOM.btnAddTaskModal.addEventListener('click', () => openTaskModal());

    DOM.taskFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.taskFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeTaskFilter = pill.dataset.filter;
        renderTasks();
      });
    });

    DOM.taskSortSelect.addEventListener('change', e => {
      activeSortOption = e.target.value;
      renderTasks();
    });

    DOM.tasksList.addEventListener('click', e => {
      const checkbox = e.target.closest('.task-checkbox');
      const editBtn = e.target.closest('.btn-edit-task');
      const deleteBtn = e.target.closest('.btn-delete-task');

      if (checkbox) toggleTaskCompletion(checkbox.dataset.id);
      if (editBtn) openTaskModal(editBtn.dataset.id);
      if (deleteBtn) deleteTask(deleteBtn.dataset.id);
    });

    // Schedule View Buttons
    DOM.btnAddSessionModal.addEventListener('click', () => openSessionModal());
    DOM.scheduleTimeline.addEventListener('click', e => {
      const editBtn = e.target.closest('.btn-edit-session');
      const deleteBtn = e.target.closest('.btn-delete-session');
      if (editBtn) openSessionModal(editBtn.dataset.id);
      if (deleteBtn) deleteSession(deleteBtn.dataset.id);
    });

    // Pomodoro Timer Controls & Tabs
    DOM.pomoTabs.forEach(tab => {
      tab.addEventListener('click', () => setTimerMode(tab.dataset.mode));
    });

    DOM.btnPomoStart.addEventListener('click', startTimer);
    DOM.btnPomoPause.addEventListener('click', pauseTimer);
    DOM.btnPomoReset.addEventListener('click', resetTimer);
    DOM.btnPomoSettingsModal.addEventListener('click', () => openModal(DOM.modalPomoSettings));

    // Progress & Data Management Buttons
    DOM.btnExportData.addEventListener('click', exportDataJSON);
    DOM.inputImportFile.addEventListener('change', importDataJSON);
    DOM.btnClearAllData.addEventListener('click', clearAllData);

    // Form Submit Handlers
    DOM.formSubject.addEventListener('submit', handleSaveSubject);
    DOM.formTask.addEventListener('submit', handleSaveTask);
    DOM.formSession.addEventListener('submit', handleSaveSession);
    DOM.formProfile.addEventListener('submit', handleSaveProfile);
    DOM.formPomoSettings.addEventListener('submit', handleSavePomoSettings);

    // Confirmation Modal Action Button
    DOM.confirmBtnAction.addEventListener('click', () => {
      if (confirmCallback) confirmCallback();
      closeModal(DOM.modalConfirm);
    });

    // Generic Modal Close Attributes (`data-close`)
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        const modal = document.getElementById(modalId);
        if (modal) closeModal(modal);
      });
    });

    // Reminders Banner Close Button
    DOM.btnBannerClose.addEventListener('click', () => {
      DOM.reminderBanner.classList.add('hidden');
    });
  }

  // --------------------------------------------------------------------------
  // 17. HELPER UTILITIES
  // --------------------------------------------------------------------------
  function formatTime12h(time24) {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[match];
    });
  }

  // Initialize Application on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
