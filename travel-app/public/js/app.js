let currentUser = null;
let currentUserId = null;

// Check if user is logged in
async function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        currentUserId = currentUser.id;
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('profileLink').style.display = 'block';
        document.getElementById('balanceDisplay').style.display = 'block';
        
        // Show admin link only for admin users
        if (currentUser.role === 'admin') {
            document.getElementById('adminLink').style.display = 'block';
        }

        // Load and display wallet balance
        try {
            const walletBalance = await walletAPI.getBalance(currentUserId);
            document.getElementById('balanceDisplay').textContent = walletBalance.balance + ' COIN';
        } catch (error) {
            console.error('Error loading balance:', error);
            document.getElementById('balanceDisplay').textContent = 'Error';
        }
    } else {
        document.getElementById('loginLink').style.display = 'block';
        document.getElementById('profileLink').style.display = 'none';
        document.getElementById('adminLink').style.display = 'none';
        document.getElementById('balanceDisplay').style.display = 'none';
    }
}

// Load tours on main page
async function loadTours() {
    const container = document.getElementById('toursContainer');
    container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"></div></div>';

    try {
        const tours = await tourAPI.getActive();
        displayTours(tours);
    } catch (error) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Ошибка загрузки туров</div></div>';
    }
}

// Display tours
function displayTours(tours) {
    const container = document.getElementById('toursContainer');
    
    if (!tours || tours.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info">Нет доступных туров</div></div>';
        return;
    }

    container.innerHTML = tours.map(tour => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">${tour.name}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text"><strong>Маршрут:</strong> ${tour.route ? tour.route.name : 'Не указан'}</p>
                    <p class="card-text"><strong>Сложность:</strong> ${tour.route ? tour.route.difficulty : 'N/A'}</p>
                    <p class="card-text"><strong>Длительность:</strong> ${tour.route ? tour.route.duration_days + ' дней' : 'N/A'}</p>
                    <p class="card-text"><strong>Цена:</strong> ${tour.price} COIN</p>
                    <p class="card-text"><strong>Участников:</strong> ${tour.current_participants}/${tour.max_participants}</p>
                    <p class="card-text"><strong>Дата:</strong> ${new Date(tour.start_date).toLocaleDateString('ru-RU')}</p>
                    <button class="btn btn-primary w-100" onclick="showBookingModal(${tour.id})">Забронировать</button>
                    <button class="btn btn-secondary w-100 mt-2" onclick="showRouteDetails(${tour.route_id})">Детали маршрута</button>
                    ${currentUser && currentUser.role === 'admin' ? `<button class="btn btn-danger w-100 mt-2" onclick="resetTour(${tour.id})">Сбросить тур</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Show booking modal
function showBookingModal(tourId) {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему для бронирования');
        window.location.href = 'login.html';
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'bookingModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Бронирование тура</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Количество участников</label>
                        <input type="number" class="form-control" id="participantsCount" min="1" value="1">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Заметки</label>
                        <textarea class="form-control" id="bookingNotes" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-primary" onclick="createBooking(${tourId})">Подтвердить</button>
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

// Create booking
async function createBooking(tourId) {
    const participantsCount = parseInt(document.getElementById('participantsCount').value);
    const notes = document.getElementById('bookingNotes').value;

    try {
        const tour = await tourAPI.getById(tourId);
        const totalPrice = tour.price * participantsCount;

        const bookingData = {
            user_id: currentUserId,
            tour_id: tourId,
            participants_count: participantsCount,
            total_price: totalPrice,
            notes: notes
        };

        await bookingAPI.create(bookingData);
        
        // Update tour participants
        await tourAPI.updateParticipants(tourId, tour.current_participants + participantsCount);
        
        alert('Бронирование успешно создано!');
        bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
        loadTours();
    } catch (error) {
        alert('Ошибка при создании бронирования: ' + error.message);
    }
}

// Show route details with map
async function showRouteDetails(routeId) {
    try {
        const route = await routeAPI.getById(routeId);
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'routeModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${route.name}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="map-container" id="mapContainer">
                            <div id="yandexMap" style="width: 100%; height: 100%;"></div>
                        </div>
                        <p><strong>Описание:</strong> ${route.description || 'Нет описания'}</p>
                        <p><strong>Сложность:</strong> ${route.difficulty}/10</p>
                        <p><strong>Длительность:</strong> ${route.duration_days} дней</p>
                        <p><strong>Дистанция:</strong> ${route.distance_km} км</p>
                        <p><strong>Начало:</strong> ${route.start_location}</p>
                        <p><strong>Конец:</strong> ${route.end_location}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Initialize Yandex Map
        if (route.coordinates_start) {
            const coords = route.coordinates_start.split(',').map(c => parseFloat(c.trim()));
            initYandexMap(coords[0], coords[1]);
        }
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    } catch (error) {
        alert('Ошибка при загрузке маршрута: ' + error.message);
    }
}

// Reset tour participants (admin only)
async function resetTour(tourId) {
  if (!confirm('Вы уверены, что хотите сбросить количество участников этого тура до 0? Старые бронирования останутся в базе.')) return;
  try {
    await tourAPI.reset(tourId);
    alert('Тур успешно сброшен!');
    loadTours();
  } catch (error) {
    alert('Ошибка при сбросе тура: ' + error.message);
  }
}

// Initialize Yandex Map
function initYandexMap(lat, lon) {
    if (typeof ymaps !== 'undefined') {
        ymaps.ready(() => {
            const map = new ymaps.Map('yandexMap', {
                center: [lat, lon],
                zoom: 10
            });
            
            const placemark = new ymaps.Placemark([lat, lon], {
                balloonContent: 'Точка маршрута'
            });
            
            map.geoObjects.add(placemark);
        });
    } else {
        document.getElementById('mapContainer').innerHTML = '<p>Карта недоступна. API Яндекс Карт не загружен.</p>';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (document.getElementById('toursContainer')) {
        loadTours();
    }
});
