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

    // Show create-tour card only for admin
    const createRow = document.getElementById('createTourRow');
    if (createRow) {
        const isAdmin = currentUser && currentUser.role === 'admin';
        createRow.style.display = isAdmin ? 'flex' : 'none';
        if (isAdmin) loadRoutesIntoSelect();
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
                    <button class="btn btn-primary w-100" onclick="showBookingModal(${tour.id}, ${tour.price})">Забронировать</button>
                    <button class="btn btn-secondary w-100 mt-2" onclick="showRouteDetails(${tour.route_id})">Детали маршрута</button>
                    ${currentUser && currentUser.role === 'admin' ? `<button class="btn btn-danger w-100 mt-2" onclick="resetTour(${tour.id})">Сбросить тур</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Инициализируем карту с метками всех туров
    initMainMap(tours);
}

// Show booking modal
function showBookingModal(tourId, tourPrice) {
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
                        <label class="form-label">Количество мест</label>
                        <input type="number" class="form-control" id="participantsCount" min="1" value="1"
                            oninput="updateTotalPrice(${tourPrice})">
                    </div>
                    <div class="mb-3">
                        <p class="card-text">Итого к списанию: <strong id="totalPriceDisplay">${tourPrice} COIN</strong></p>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Заметки</label>
                        <textarea class="form-control" id="bookingNotes" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-primary" onclick="createBooking(${tourId}, ${tourPrice})">Подтвердить</button>
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

// Update total price display in booking modal
function updateTotalPrice(pricePerSeat) {
    const count = parseInt(document.getElementById('participantsCount').value) || 1;
    document.getElementById('totalPriceDisplay').textContent = (pricePerSeat * count) + ' COIN';
}

// Create booking — списываем COIN с кошелька пользователя
async function createBooking(tourId, tourPrice) {
    const participantsCount = parseInt(document.getElementById('participantsCount').value);
    const notes = document.getElementById('bookingNotes').value;

    if (isNaN(participantsCount) || participantsCount < 1) {
        alert('Укажите корректное количество мест');
        return;
    }

    const totalPrice = tourPrice * participantsCount;

    try {
        // Проверяем баланс кошелька
        const walletInfo = await walletAPI.getBalance(currentUserId);
        if (parseFloat(walletInfo.balance) < totalPrice) {
            alert(`Недостаточно средств! Нужно ${totalPrice} COIN, у вас ${walletInfo.balance} COIN`);
            return;
        }

        // Создаём бронирование (сервер сам обновляет current_participants)
        const bookingData = {
            user_id: currentUserId,
            tour_id: tourId,
            participants_count: participantsCount,
            total_price: totalPrice,
            notes: notes
        };
        await bookingAPI.create(bookingData);

        // Списываем COIN с кошелька пользователя
        const walletData = await walletAPI.getByUserId(currentUserId);
        await walletAPI.update(walletData.id, { balance: parseFloat(walletInfo.balance) - totalPrice });

        alert(`Бронирование создано! Списано ${totalPrice} COIN`);
        bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();

        // Обновляем баланс в navbar
        document.getElementById('balanceDisplay').textContent = (parseFloat(walletInfo.balance) - totalPrice) + ' COIN';
        loadTours();
    } catch (error) {
        alert('Ошибка при создании бронирования: ' + error.message);
    }
}

// Load routes into create-tour select (called when admin card is shown)
async function loadRoutesIntoSelect() {
    try {
        const routes = await routeAPI.getAll();
        const sel = document.getElementById('newTourRouteId');
        if (!sel) return;
        sel.innerHTML = '<option value="">— выберите маршрут —</option>' +
            routes.map(r => `<option value="${r.id}">${r.name} (сложность ${r.difficulty}, ${r.duration_days} дн.)</option>`).join('');
    } catch (e) {
        console.error('Cannot load routes for select:', e);
    }
}

// Create new tour (admin only)
async function createNewTour() {
    const routeId  = parseInt(document.getElementById('newTourRouteId').value);
    const name     = document.getElementById('newTourName').value.trim();
    const desc     = document.getElementById('newTourDesc').value.trim();
    const price    = parseFloat(document.getElementById('newTourPrice').value);
    const maxP     = parseInt(document.getElementById('newTourMax').value);
    const start    = document.getElementById('newTourStart').value;
    const end      = document.getElementById('newTourEnd').value;

    if (!routeId || isNaN(routeId)) {
        alert('Выберите маршрут из списка');
        return;
    }
    if (!name || !price || isNaN(price) || !maxP || isNaN(maxP) || !start || !end) {
        alert('Заполните все обязательные поля (кроме описания)');
        return;
    }
    if (new Date(end) <= new Date(start)) {
        alert('Дата окончания должна быть позже даты начала');
        return;
    }

    try {
        await tourAPI.create({
            route_id: routeId,
            name,
            description: desc,
            price,
            max_participants: maxP,
            start_date: start,
            end_date: end,
            status: 'active'
        });
        alert('Тур успешно создан!');
        // Очищаем форму
        document.getElementById('newTourRouteId').value = '';
        ['newTourName','newTourDesc','newTourPrice','newTourMax','newTourStart','newTourEnd']
            .forEach(id => document.getElementById(id).value = '');
        loadTours();
    } catch (error) {
        alert('Ошибка при создании тура: ' + error.message);
    }
}

// Reset tour participants (admin only)
async function resetTour(tourId) {
    if (!confirm('Сбросить количество участников до 0? Бронирования останутся в базе.')) return;
    try {
        await tourAPI.reset(tourId);
        alert('Тур успешно сброшен!');
        loadTours();
    } catch (error) {
        alert('Ошибка при сбросе тура: ' + error.message);
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

// Initialize Yandex Map on main page with all active tour markers
function initMainMap(tours) {
    if (typeof ymaps === 'undefined') return;
    ymaps.ready(() => {
        // Destroy previous instance if any
        if (window._mainMap) {
            window._mainMap.destroy();
            window._mainMap = null;
        }

        const mapEl = document.getElementById('mainYandexMap');
        if (!mapEl) return;

        // Default center — Moscow
        let center = [55.7558, 37.6173];
        let zoom = 4;

        // Collect tour coords from routes
        const points = [];
        tours.forEach(tour => {
            if (tour.route && tour.route.coordinates_start) {
                const parts = tour.route.coordinates_start.split(',').map(c => parseFloat(c.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    points.push({ coords: parts, tour });
                }
            }
        });

        if (points.length > 0) center = points[0].coords;

        const map = new ymaps.Map('mainYandexMap', { center, zoom });
        window._mainMap = map;

        points.forEach(({ coords, tour }) => {
            const placemark = new ymaps.Placemark(coords, {
                balloonContentHeader: tour.name,
                balloonContentBody: `
                    <b>Маршрут:</b> ${tour.route ? tour.route.name : '—'}<br>
                    <b>Цена:</b> ${tour.price} COIN<br>
                    <b>Мест:</b> ${tour.current_participants}/${tour.max_participants}<br>
                    <b>Дата:</b> ${new Date(tour.start_date).toLocaleDateString('ru-RU')}
                `,
                hintContent: tour.name
            }, {
                preset: 'islands#orangeDotIcon'
            });
            map.geoObjects.add(placemark);
        });

        // Auto-fit to markers if more than one
        if (points.length > 1) {
            map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true, zoomMargin: 30 });
        }
    });
}

// Initialize Yandex Map in modal (route detail)
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
    checkAuth().then(() => {
        if (document.getElementById('toursContainer')) {
            loadTours();
        }
    });
});
