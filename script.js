// Data State
let cycleData = JSON.parse(localStorage.getItem('bloom_cycle_data')) || null;
let symptomLog = JSON.parse(localStorage.getItem('bloom_symptoms')) || [];

// DOM Elements
const form = document.getElementById('cycle-form');
const lastPeriodInput = document.getElementById('last-period-date');
const cycleLengthInput = document.getElementById('cycle-length');
const durationInput = document.getElementById('period-duration');

const cycleDayEl = document.getElementById('current-cycle-day');
const countdownEl = document.getElementById('next-period-countdown');
const fertileEl = document.getElementById('fertile-window-text');
const historyList = document.getElementById('history-list');
const clearBtn = document.getElementById('clear-data-btn');

// Form Submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  cycleData = {
    startDate: lastPeriodInput.value,
    cycleLength: parseInt(cycleLengthInput.value),
    duration: parseInt(durationInput.value)
  };

  localStorage.setItem('bloom_cycle_data', JSON.stringify(cycleData));
  updateDashboard();
});

// Update Dashboard Logic
function updateDashboard() {
  if (!cycleData) return;

  // Set form defaults
  lastPeriodInput.value = cycleData.startDate;
  cycleLengthInput.value = cycleData.cycleLength;
  durationInput.value = cycleData.duration;

  const start = new Date(cycleData.startDate);
  const today = new Date();
  
  // Clear time components for accurate day calculation
  start.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const diffTime = today - start;
  const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (currentDay < 1) {
    cycleDayEl.textContent = "1";
    countdownEl.textContent = "Start date set in the future.";
    return;
  }

  // Current Cycle Day
  const dayInCycle = ((currentDay - 1) % cycleData.cycleLength) + 1;
  cycleDayEl.textContent = dayInCycle;

  // Days until next period
  const daysLeft = cycleData.cycleLength - dayInCycle;
  if (daysLeft === 0) {
    countdownEl.textContent = "Your period is expected today!";
  } else {
    countdownEl.textContent = `Next period expected in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`;
  }

  // Estimated Ovulation & Fertile Window (typically ~14 days before next cycle)
  const estimatedOvulationDay = cycleData.cycleLength - 14;
  const fertileStart = estimatedOvulationDay - 4;
  const fertileEnd = estimatedOvulationDay + 1;

  if (dayInCycle >= fertileStart && dayInCycle <= fertileEnd) {
    fertileEl.textContent = `✨ Estimated Fertile Window (Day ${fertileStart} - ${fertileEnd}). Ovulation around Day ${estimatedOvulationDay}.`;
    fertileEl.style.color = "var(--accent-gold)";
  } else {
    fertileEl.textContent = `Estimated Ovulation: Day ${estimatedOvulationDay} of cycle (Fertile Window: Days ${fertileStart}-${fertileEnd}).`;
    fertileEl.style.color = "var(--text-muted)";
  }

  renderHistory();
}

// Symptom Chips Toggle
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected');
  });
});

// History Render
function renderHistory() {
  historyList.innerHTML = '';
  if (!cycleData) {
    historyList.innerHTML = '<li class="history-item">No cycle history logged yet.</li>';
    return;
  }

  const item = document.createElement('li');
  item.className = 'history-item';
  item.innerHTML = `
    <span><strong>Last Logged Period:</strong> ${cycleData.startDate}</span>
    <span style="color: var(--accent-gold);">${cycleData.cycleLength} Day Cycle</span>
  `;
  historyList.appendChild(item);
}

// Clear Data
clearBtn.addEventListener('click', () => {
  if (confirm("Clear your saved cycle data?")) {
    localStorage.removeItem('bloom_cycle_data');
    localStorage.removeItem('bloom_symptoms');
    cycleData = null;
    cycleDayEl.textContent = "--";
    countdownEl.textContent = "Set your cycle data to begin";
    fertileEl.textContent = "Fertile window prediction will appear here.";
    form.reset();
    renderHistory();
  }
});

// Initial Run
updateDashboard();
