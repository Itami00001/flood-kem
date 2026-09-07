const API_BASE_URL = 'http://localhost:6868/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// User API
const userAPI = {
    register: (userData) => apiRequest('/users/register', 'POST', userData),
    login: (userData) => apiRequest('/users/login', 'POST', userData),
    getAll: () => apiRequest('/users'),
    getById: (id) => apiRequest(`/users/${id}`),
    update: (id, userData) => apiRequest(`/users/${id}`, 'PUT', userData),
    delete: (id) => apiRequest(`/users/${id}`, 'DELETE'),
    getTopUsers: (limit = 10) => apiRequest(`/users/top/users?limit=${limit}`)
};

// Wallet API
const walletAPI = {
    create: (walletData) => apiRequest('/wallets', 'POST', walletData),
    getAll: () => apiRequest('/wallets'),
    getById: (id) => apiRequest(`/wallets/${id}`),
    getByUserId: (userId) => apiRequest(`/wallets/user/${userId}`),
    update: (id, walletData) => apiRequest(`/wallets/${id}`, 'PUT', walletData),
    transfer: (transferData) => apiRequest('/wallets/transfer', 'POST', transferData),
    getBalance: (userId) => apiRequest(`/wallets/balance/${userId}`)
};

// Route API
const routeAPI = {
    create: (routeData) => apiRequest('/routes', 'POST', routeData),
    getAll: () => apiRequest('/routes'),
    getById: (id) => apiRequest(`/routes/${id}`),
    update: (id, routeData) => apiRequest(`/routes/${id}`, 'PUT', routeData),
    delete: (id) => apiRequest(`/routes/${id}`, 'DELETE'),
    getByDifficulty: (min, max) => apiRequest(`/routes/difficulty/${min}/${max}`),
    getByDuration: (min, max) => apiRequest(`/routes/duration/${min}/${max}`),
    getPopular: (limit = 10) => apiRequest(`/routes/popular/routes?limit=${limit}`)
};

// Tour API
const tourAPI = {
    create: (tourData) => apiRequest('/tours', 'POST', tourData),
    getAll: () => apiRequest('/tours'),
    getById: (id) => apiRequest(`/tours/${id}`),
    getActive: () => apiRequest('/tours/active/tours'),
    getByRoute: (routeId) => apiRequest(`/tours/route/${routeId}`),
    update: (id, tourData) => apiRequest(`/tours/${id}`, 'PUT', tourData),
    updateParticipants: (id, participants) => apiRequest(`/tours/${id}/participants`, 'PUT', { current_participants: participants }),
    delete: (id) => apiRequest(`/tours/${id}`, 'DELETE'),
    getRating: () => apiRequest('/tours/rating/tours'),
    getAvailable: (startDate, endDate) => apiRequest(`/tours/available/tours?start_date=${startDate}&end_date=${endDate}`),
    reset: (id) => apiRequest(`/tours/${id}/reset`, 'PUT')
};

// Booking API
const bookingAPI = {
    create: (bookingData) => apiRequest('/bookings', 'POST', bookingData),
    getAll: () => apiRequest('/bookings'),
    getById: (id) => apiRequest(`/bookings/${id}`),
    getByUser: (userId) => apiRequest(`/bookings/user/${userId}`),
    getByTour: (tourId) => apiRequest(`/bookings/tour/${tourId}`),
    update: (id, bookingData) => apiRequest(`/bookings/${id}`, 'PUT', bookingData),
    confirm: (id) => apiRequest(`/bookings/${id}/confirm`, 'PUT'),
    delete: (id) => apiRequest(`/bookings/${id}`, 'DELETE'),
    getStatistics: () => apiRequest('/bookings/statistics/bookings')
};

// Review API
const reviewAPI = {
    create: (reviewData) => apiRequest('/reviews', 'POST', reviewData),
    getAll: () => apiRequest('/reviews'),
    getById: (id) => apiRequest(`/reviews/${id}`),
    getByTour: (tourId) => apiRequest(`/reviews/tour/${tourId}`),
    getByUser: (userId) => apiRequest(`/reviews/user/${userId}`),
    update: (id, reviewData) => apiRequest(`/reviews/${id}`, 'PUT', reviewData),
    delete: (id) => apiRequest(`/reviews/${id}`, 'DELETE'),
    getTourReviews: (tourId) => apiRequest(`/reviews/tour/${tourId}/details`)
};

// Admin API
const adminAPI = {
    topup: (userId, amount) => apiRequest('/admin/topup', 'POST', { user_id: userId, amount })
};
