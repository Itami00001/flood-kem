let bookingsChart = null;

// Check if user is admin
function checkAdminAccess() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
        alert('Доступ запрещен. Требуются права администратора.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Load users with balances
async function loadUsers() {
    if (!checkAdminAccess()) return;

    try {
        const users = await fetch('http://localhost:6868/api/admin/users', {
            headers: {
                'X-User-ID': JSON.parse(localStorage.getItem('currentUser')).id
            }
        }).then(res => {
            if (!res.ok) throw new Error('Failed to load users');
            return res.json();
        });

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
        console.error('Error loading users:', error);
        document.querySelector('#usersTable tbody').innerHTML = '<tr><td colspan="5" class="text-center text-danger">Ошибка загрузки</td></tr>';
    }
}

// Load tours with booking count
async function loadTours() {
    if (!checkAdminAccess()) return;

    try {
        const tours = await fetch('http://localhost:6868/api/admin/tours', {
            headers: {
                'X-User-ID': JSON.parse(localStorage.getItem('currentUser')).id
            }
        }).then(res => {
            if (!res.ok) throw new Error('Failed to load tours');
            return res.json();
        });

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
        console.error('Error loading tours:', error);
        document.querySelector('#toursTable tbody').innerHTML = '<tr><td colspan="8" class="text-center text-danger">Ошибка загрузки</td></tr>';
    }
}

// Load statistics and render chart
async function loadStats() {
    if (!checkAdminAccess()) return;

    try {
        const stats = await fetch('http://localhost:6868/api/admin/stats', {
            headers: {
                'X-User-ID': JSON.parse(localStorage.getItem('currentUser')).id
            }
        }).then(res => {
            if (!res.ok) throw new Error('Failed to load stats');
            return res.json();
        });

        renderChart(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('bookingsChart').getContext('2d').clearRect(0, 0, 400, 200);
    }
}

// Render Chart.js chart
function renderChart(stats) {
    const ctx = document.getElementById('bookingsChart').getContext('2d');
    
    if (bookingsChart) {
        bookingsChart.destroy();
    }

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
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Бронирования',
                        color: '#FED7A5'
                    },
                    ticks: {
                        color: '#FED7A5'
                    },
                    grid: {
                        color: '#73766A'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Выручка (COIN)',
                        color: '#9E6752'
                    },
                    ticks: {
                        color: '#9E6752'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    ticks: {
                        color: '#FED7A5'
                    },
                    grid: {
                        color: '#73766A'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FED7A5'
                    }
                }
            }
        }
    });
}

// Load checks
async function loadChecks() {
    if (!checkAdminAccess()) return;

    try {
        const checks = await fetch('http://localhost:6868/api/admin/checks', {
            headers: {
                'X-User-ID': JSON.parse(localStorage.getItem('currentUser')).id
            }
        }).then(res => {
            if (!res.ok) throw new Error('Failed to load checks');
            return res.json();
        });

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
        console.error('Error loading checks:', error);
        document.querySelector('#checksTable tbody').innerHTML = '<tr><td colspan="4" class="text-center text-danger">Ошибка загрузки</td></tr>';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAccess()) return;

    // Load data when tabs are clicked
    document.getElementById('users-tab').addEventListener('click', loadUsers);
    document.getElementById('tours-tab').addEventListener('click', loadTours);
    document.getElementById('stats-tab').addEventListener('click', loadStats);
    document.getElementById('checks-tab').addEventListener('click', loadChecks);

    // Load initial data
    loadUsers();
});
