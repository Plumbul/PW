const form = document.getElementById('meterForm');
const dataList = document.getElementById('dataList');
const statusMsg = document.getElementById('statusMsg');

const API_URL = 'http://localhost:3000/api/consumers';

document.addEventListener('DOMContentLoaded', loadData);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    console.log("Відправка даних на:", API_URL, data);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Помилка сервера');

        const result = await response.json();
        if (result.success) {
            form.reset(); 
            showMessage("Дані успішно додано!");
            await loadData(); 
        }
    } catch (err) {
        console.error("Помилка при відправці:", err);
        showMessage("Помилка з'єднання");
    }
});

async function loadData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Не вдалося отримати дані');
        
        const data = await response.json();
        console.log("Отримані дані:", data);
        renderList(data);
    } catch (err) {
        console.error("Помилка завантаження:", err);
    }
}

function renderList(items) {
    if (!items || items.length === 0) {
        dataList.innerHTML = '<p style="color: #666; text-align: center;">Журнал порожній</p>';
        return;
    }

    dataList.innerHTML = items.slice().reverse().map(item => `
        <div class="record-card">
            <button class="btn-del" onclick="deleteItem('${item.id}')">Видалити</button>
            <div class="card-content">
                <h3>Рахунок: ${item.account || '—'}</h3>
                <p><strong>ПІБ:</strong> ${item.fullName || 'Не вказано'}</p>
                <p><strong>Адреса:</strong> ${item.address || '—'}</p>
                <p><strong>${item.meterType}:</strong> <span style="color: #0057b7; font-weight: bold;">${item.reading}</span></p>
                <small>Дата: ${new Date(item.date).toLocaleString('uk-UA')}</small>
            </div>
        </div>
    `).join('');
}

async function deleteItem(id) {
    if (confirm('Видалити цей запис?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadData();
        } catch (err) {
            console.error("Помилка видалення:", err);
        }
    }
}

function showMessage(text) {
    statusMsg.textContent = text;
    statusMsg.style.display = 'block';
    setTimeout(() => statusMsg.style.display = 'none', 3000);
}

setInterval(loadData, 10000);