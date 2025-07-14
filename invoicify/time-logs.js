document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer-display');
    const timerToggleBtn = document.getElementById('timer-toggle');
    const timeLogForm = document.getElementById('time-log-form');
    const timeLogsTable = document.getElementById('time-logs-table');

    let timer;
    let seconds = 0;
    let isTimerRunning = false;

    // --- Timer Functionality ---
    function startTimer() {
        isTimerRunning = true;
        timerToggleBtn.textContent = 'Stop Timer';
        timerToggleBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        timerToggleBtn.classList.add('bg-red-500', 'hover:bg-red-600');

        timer = setInterval(() => {
            seconds++;
            timerDisplay.textContent = formatTime(seconds);
        }, 1000);
    }

    function stopTimer() {
        isTimerRunning = false;
        timerToggleBtn.textContent = 'Start Timer';
        timerToggleBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
        timerToggleBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');

        clearInterval(timer);
        document.getElementById('log-duration').value = formatTimeForInput(seconds);
        seconds = 0;
    }

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    }

    function formatTimeForInput(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    timerToggleBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    // --- Form and Table Logic ---
    let sampleTimeLogs = [
        { id: 1, description: 'Initial project setup', date: '2024-07-28', duration: '02:30' },
        { id: 2, description: 'Client meeting', date: '2024-07-28', duration: '01:00' }
    ];

    function renderTimeLogs() {
        timeLogsTable.innerHTML = '';
        sampleTimeLogs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${log.description}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.date}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.duration}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                    <a href="#" class="text-red-600 hover:text-red-900 ml-4">Delete</a>
                    <a href="#" class="text-green-600 hover:text-green-900 ml-4">Add to Invoice</a>
                </td>
            `;
            timeLogsTable.appendChild(row);
        });
    }

    timeLogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLog = {
            id: Date.now(),
            description: document.getElementById('log-description').value,
            date: document.getElementById('log-date').value,
            duration: document.getElementById('log-duration').value
        };
        sampleTimeLogs.unshift(newLog);
        renderTimeLogs();
        timeLogForm.reset();
        timerDisplay.textContent = '00:00:00';
    });

    // Initial render
    renderTimeLogs();
});
