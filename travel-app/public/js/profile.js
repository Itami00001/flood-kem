// Load user profile
async function loadProfile() {
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Load user info
        const user = await userAPI.getById(currentUserId);
        document.getElementById('userName').textContent = user.full_name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userRole').textContent = user.role;

        // Load wallet balance
        const walletBalance = await walletAPI.getBalance(currentUserId);
        document.getElementById('walletBalance').textContent = walletBalance.balance + ' COIN';

        // Load user bookings
        loadBookings();
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Ошибка загрузки профиля');
    }
}

// Load user bookings
async function loadBookings() {
    const container = document.getElementById('bookingsContainer');
    
    try {
        const bookings = await bookingAPI.getByUser(currentUserId);
        
        if (!bookings || bookings.length === 0) {
            container.innerHTML = '<p class="text-center">У вас пока нет бронирований</p>';
            return;
        }

        container.innerHTML = bookings.map(booking => `
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-title">Тур ID: ${booking.tour_id}</h6>
                    <p class="card-text mb-1"><strong>Участников:</strong> ${booking.participants_count}</p>
                    <p class="card-text mb-1"><strong>Стоимость:</strong> ${booking.total_price} COIN</p>
                    <p class="card-text mb-1"><strong>Статус:</strong> 
                        <span class="badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-warning'}">${booking.status}</span>
                    </p>
                    <p class="card-text mb-0"><small class="text-muted">Дата: ${new Date(booking.created_at).toLocaleDateString('ru-RU')}</small></p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = '<p class="text-center text-danger">Ошибка загрузки бронирований</p>';
    }
}

// Show transfer modal
function showTransferModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'transferModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Перевод COIN</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">ID получателя</label>
                        <input type="number" class="form-control" id="recipientId" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Сумма</label>
                        <input type="number" class="form-control" id="transferAmount" min="1" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-primary" onclick="transferCoins()">Отправить</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Transfer coins
async function transferCoins() {
    const recipientId = parseInt(document.getElementById('recipientId').value);
    const amount = parseFloat(document.getElementById('transferAmount').value);

    if (recipientId === currentUserId) {
        alert('Нельзя переводить самому себе');
        return;
    }

    try {
        await walletAPI.transfer({
            fromUserId: currentUserId,
            toUserId: recipientId,
            amount: amount
        });
        
        alert('Перевод выполнен успешно!');
        bootstrap.Modal.getInstance(document.getElementById('transferModal')).hide();
        loadProfile();
    } catch (error) {
        alert('Ошибка при переводе: ' + error.message);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('profile.html')) {
        loadProfile();
    }
});
