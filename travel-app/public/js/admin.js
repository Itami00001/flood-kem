let bookingsChart = null;

// In-memory history of coin topups (persisted in localStorage)
const TOPUP_KEY = 'adminCoinTopupHistory';

function getTopupHistory() {
    try {
        return JSON.parse(localStorage.getItem(TOPUP_KEY)) || [];
    } catch { return []; }
}

function saveTopupHistory(history) {
    localStorage.setItem(TOPUP_KEY, JSON.stringify(history));
}

// Check if user is admin
function checkAdminAccess() {
    const user = localStorage.getItem('currentUser');
    if (!user) { window.location.href = 'login.html'; return false; }
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
        alert('Доступ запрещен. Требуются права администратора.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function adminHeaders() {
    return { 'X-User-ID': JSON.parse(localStorage.getItem('currentUser')).id };
}

// Load users with balances
async function loadUsers() {
    if (!checkAdminAccess()) return;
    try {
        const users = await fetch('http://localhost:6868/api/admin/users', { headers: adminHeaders() })
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); });
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.wallet ? user.wallet.balance : '0'} COIN</td>
            </tr>
        `).join('');
    } catch (error) {
        document.querySelector('#usersTable tbody').innerHTML =
            '<tr><td colspan="5" class="text-center text-danger">Ошибка загрузки</td></tr>';
    }
}

// Load tours with booking count
async function loadTours() {
    if (!checkAdminAccess()) return;
    try {
        const tours = await fetch('http://localhost:6868/api/admin/tours', { headers: adminHeaders() })
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); });
        const tbody = document.querySelector('#toursTable tbody');
        tbody.innerHTML = tours.map(tour => `
            <tr>
                <td>${tour.id}</td>
                <td>${tour.name}</td>
                <td>${tour.max_participants}</td>
                <td>${tour.current_participants}</td>
                <td>${tour.booking_count || 0}</td>
                <td>${tour.check_count || 0}</td>
                <td>${tour.price} COIN</td>
                <td><span class="badge ${tour.status === 'active' ? 'bg-success' : 'bg-secondary'}">${tour.status}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        document.querySelector('#toursTable tbody').innerHTML =
            '<tr><td colspan="8" class="text-center text-danger">Ошибка загрузки</td></tr>';
    }
}

// Load statistics and render chart
async function loadStats() {
    if (!checkAdminAccess()) return;
    try {
        const stats = await fetch('http://localhost:6868/api/admin/stats', { headers: adminHeaders() })
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); });
        renderChart(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render Chart.js chart
function renderChart(stats) {
    const ctx = document.getElementById('bookingsChart').getContext('2d');
    if (bookingsChart) bookingsChart.destroy();

    const labels = stats.map(s => new Date(s.date).toLocaleDateString('ru-RU'));
    const bookingCounts = stats.map(s => s.booking_count);
    const revenues = stats.map(s => parseFloat(s.total_revenue) || 0);

    bookingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.reverse(),
            datasets: [{
                label: 'Количество бронирований',
                data: bookingCounts.reverse(),
                borderColor: '#FED7A5',
                backgroundColor: 'rgba(254, 215, 165, 0.2)',
                tension: 0.1,
                fill: true
            }, {
                label: 'Выручка (COIN)',
                data: revenues.reverse(),
                borderColor: '#9E6752',
                backgroundColor: 'rgba(158, 103, 82, 0.2)',
                tension: 0.1,
                fill: true,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    type: 'linear', display: true, position: 'left',
                    title: { display: true, text: 'Бронирования', color: '#FED7A5' },
                    ticks: { color: '#FED7A5' },
                    grid: { color: '#73766A' }
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    title: { display: true, text: 'Выручка (COIN)', color: '#9E6752' },
                    ticks: { color: '#9E6752' },
                    grid: { drawOnChartArea: false }
                },
                x: { ticks: { color: '#FED7A5' }, grid: { color: '#73766A' } }
            },
            plugins: { legend: { labels: { color: '#FED7A5' } } }
        }
    });
}

// Load checks
async function loadChecks() {
    if (!checkAdminAccess()) return;
    try {
        const checks = await fetch('http://localhost:6868/api/admin/checks', { headers: adminHeaders() })
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); });
        const tbody = document.querySelector('#checksTable tbody');
        if (checks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Нет чеков</td></tr>';
            return;
        }
        tbody.innerHTML = checks.map(check => `
            <tr>
                <td>${check.id}</td>
                <td>${check.tour ? check.tour.name : 'N/A'}</td>
                <td>${check.message}</td>
                <td>${new Date(check.created_at).toLocaleString('ru-RU')}</td>
            </tr>
        `).join('');
    } catch (error) {
        document.querySelector('#checksTable tbody').innerHTML =
            '<tr><td colspan="4" class="text-center text-danger">Ошибка загрузки</td></tr>';
    }
}

// === COIN-пополнение ===
async function topupCoin() {
    const userId = parseInt(document.getElementById('topupUserId').value);
    const amount = parseFloat(document.getElementById('topupAmount').value);

    if (!userId || isNaN(userId) || userId < 1) {
        alert('Введите корректный ID пользователя');
        return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Введите корректную сумму пополнения');
        return;
    }

    try {
        // Получаем текущий кошелёк пользователя
        const res = await fetch(`http://localhost:6868/api/wallets/user/${userId}`, { headers: adminHeaders() });
        if (!res.ok) throw new Error(`Пользователь с ID=${userId} не найден или у него нет кошелька`);
        const wallet = await res.json();

        const newBalance = parseFloat(wallet.balance) + amount;

        // Обновляем баланс
        const updRes = await fetch(`http://localhost:6868/api/wallets/${wallet.id}`, {
            method: 'PUT',
            headers: { ...adminHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: newBalance })
        });
        if (!updRes.ok) throw new Error('Ошибка при обновлении баланса');

        // Записываем в историю
        const history = getTopupHistory();
        history.unshift({
            date: new Date().toLocaleString('ru-RU'),
            userId,
            username: wallet.user ? wallet.user.username : `ID ${userId}`,
            amount,
            newBalance
        });
        // Храним последние 50 операций
        saveTopupHistory(history.slice(0, 50));

        alert(`Баланс пользователя ID=${userId} пополнен на ${amount} COIN. Новый баланс: ${newBalance} COIN`);

        // Очищаем поля
        document.getElementById('topupUserId').value = '';
        document.getElementById('topupAmount').value = '';

        renderTopupHistory();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

function renderTopupHistory() {
    const history = getTopupHistory();
    const list = document.getElementById('coinTopupHistory');
    if (!list) return;

    if (history.length === 0) {
        list.innerHTML = `<li class="list-group-item" style="background:transparent;color:var(--accent-peach);border-color:var(--secondary-green);">
            История пополнений появится здесь
        </li>`;
        return;
    }

    list.innerHTML = history.map(op => `
        <li class="list-group-item d-flex justify-content-between align-items-start"
            style="background:transparent;color:var(--accent-peach);border-color:var(--secondary-green);">
            <div>
                <strong>+${op.amount} COIN</strong> → пользователь <em>${op.username || 'ID ' + op.userId}</em><br>
                <small>Новый баланс: ${op.newBalance} COIN</small>
            </div>
            <small class="text-muted">${op.date}</small>
        </li>
    `).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAccess()) return;

    document.getElementById('users-tab').addEventListener('click', loadUsers);
    document.getElementById('tours-tab').addEventListener('click', loadTours);
    document.getElementById('stats-tab').addEventListener('click', loadStats);
    document.getElementById('checks-tab').addEventListener('click', loadChecks);
    document.getElementById('coin-tab').addEventListener('click', () => renderTopupHistory());

    // Load initial data
    loadUsers();
});
