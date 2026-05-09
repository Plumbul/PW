document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    if (!role) {
        window.location.href = '/login.html';
        return;
    }

    applyPermissions(role);

    initWebSocket();
});

function applyPermissions(role) {
    console.log("Ваша роль:", role);

    if (role === 'dispatcher_junior') {
        const actionButtons = document.querySelectorAll('.btn-warning, .btn-danger, .btn-action');
        actionButtons.forEach(btn => {
            btn.disabled = true;
            btn.title = "Недостатньо прав для керування";
        });
    }

    const analyticsSection = document.getElementById('analytics-section');
    if (analyticsSection) {
        analyticsSection.style.display = (role === 'chief_dispatcher') ? 'block' : 'none';
    }
}

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}`;
    let socket;

    try {
        socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            console.log("З'єднання з сервером встановлено");
            updateConnectionStatus(true);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                updateDashboard(data);
            } catch (err) {
                console.error("Помилка обробки даних:", err);
            }
        };

        socket.onclose = () => {
            console.warn("З'єднання втрачено. Спроба відновлення через 5 секунд...");
            updateConnectionStatus(false);
            setTimeout(initWebSocket, 5000);
        };

        socket.onerror = (error) => {
            console.error("Помилка WebSocket:", error);
            updateConnectionStatus(false);
        };

    } catch (e) {
        console.error("Не вдалося створити WebSocket:", e);
    }
}

function updateConnectionStatus(isOnline) {
    const statusBadge = document.getElementById('status');
    if (statusBadge) {
        statusBadge.className = isOnline ? 'badge bg-success' : 'badge bg-danger';
        statusBadge.innerText = isOnline ? 'ONLINE' : 'OFFLINE';
    }
}

function updateDashboard(data) {
    const fields = ['totalLoad', 'frequency', 'substationA'];
    
    fields.forEach(field => {
        const element = document.getElementById(`val-${field}`);
        if (element && data[field]) {
            const unit = field === 'frequency' ? ' Гц' : ' МВт';
            element.innerText = data[field] + unit;
        }

        const bar = document.getElementById(`bar-${field}`);
        if (bar) {
            let percent = 0;
            if (field === 'totalLoad') percent = (data[field] / 600) * 100;
            if (field === 'frequency') percent = ((data[field] - 49) / 2) * 100;
            
            bar.style.width = Math.min(percent, 100) + "%";
            
            if (percent > 85) bar.className = "progress-bar bg-danger";
            else if (percent > 60) bar.className = "progress-bar bg-warning";
            else bar.className = "progress-bar bg-success";
        }
    });
}


async function switchMode(action) {
    try {
        const response = await fetch('/api/network/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action })
        });

        const result = await response.json();
        
        if (response.ok) {
            alert("Команда прийнята: " + result.message);
        } else {
            alert("Помилка доступу: " + result.error);
        }
    } catch (err) {
        alert("Помилка зв'язку з сервером");
    }
}

async function getAnalytics() {
    try {
        const response = await fetch('/api/analytics');
        const data = await response.json();

        if (response.ok) {
            alert(`--- АНАЛІТИЧНИЙ ЗВІТ ---\n${data.report}\nПік навантаження: ${data.peakTime}`);
        } else {
            alert("Доступ заборонено: " + data.error);
        }
    } catch (err) {
        alert("Не вдалося завантажити аналітику");
    }
}