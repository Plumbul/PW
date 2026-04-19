class SmartHomeApp {
    constructor() {
        this.config = [
            { id: 'totalPower', label: 'Загальна потужність', unit: 'кВт', limit: 5.0 },
            { id: 'temp', label: 'Температура в домі', unit: '°C', limit: 30 },
            { id: 'brightness', label: 'Яскравість світла', unit: '%', limit: 100 }
        ];
        
        this.history = [];
        this.charts = {};
        this.init();
    }

    init() {
        this.buildCards();
        this.initCharts();
        this.connect();
    }

    buildCards() {
        const container = document.getElementById('stats-container');
        container.innerHTML = this.config.map(item => `
            <div class="col-md-4">
                <div class="card p-3 shadow-sm border-0" id="card-${item.id}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small class="text-muted fw-bold">${item.label}</small>
                        <span class="badge rounded-pill bg-light text-dark" id="unit-${item.id}">${item.unit}</span>
                    </div>
                    <h2 class="display-6 fw-normal" id="val-${item.id}">0.00</h2>
                    <div class="progress" style="height: 6px;">
                        <div id="bar-${item.id}" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    initCharts() {
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        this.charts.pie = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Кухня', 'Вітальня', 'Спальні'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
                    hoverOffset: 10
                }]
            },
            options: { 
                responsive: true,
                plugins: { title: { display: true, text: 'Розподіл енергії по зонах' } }
            }
        });

        const lineCtx = document.getElementById('lineChart').getContext('2d');
        this.charts.line = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Загальне споживання (кВт)',
                    data: [],
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    connect() {
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onopen = () => {
            const status = document.getElementById('status');
            status.textContent = 'Online';
            status.className = 'badge bg-success';
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateDisplay(data);
        };

        this.socket.onclose = () => {
            document.getElementById('status').textContent = 'Offline';
            document.getElementById('status').className = 'badge bg-danger';
            setTimeout(() => this.connect(), 5000);
        };
    }

    updateDisplay(data) {
        this.config.forEach(item => {
            const val = data[item.id] || 0;
            const element = document.getElementById(`val-${item.id}`);
            const bar = document.getElementById(`bar-${item.id}`);
            const card = document.getElementById(`card-${item.id}`);

            element.textContent = item.id === 'brightness' ? val : val.toFixed(2);
            
            const percent = Math.min((val / item.limit) * 100, 100);
            bar.style.width = `${percent}%`;

            if (val > item.limit) {
                bar.classList.replace('bg-success', 'bg-danger');
                card.style.borderLeft = "5px solid red";
            } else {
                bar.classList.replace('bg-danger', 'bg-success');
                card.style.borderLeft = "none";
            }
        });

        this.charts.pie.data.datasets[0].data = [data.kitchen, data.livingRoom, data.bedroom];
        this.charts.pie.update();

        const time = new Date().toLocaleTimeString();
        this.charts.line.data.labels.push(time);
        this.charts.line.data.datasets[0].data.push(data.totalPower);

        if (this.charts.line.data.labels.length > 10) {
            this.charts.line.data.labels.shift();
            this.charts.line.data.datasets[0].data.shift();
        }
        this.charts.line.update();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SmartHomeApp();
});
