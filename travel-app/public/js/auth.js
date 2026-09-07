let currentUser = null;
let currentUserId = null;

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        currentUserId = currentUser.id;
        return true;
    }
    return false;
}

// Login function
async function login(username, password) {
    try {
        const users = await userAPI.getAll();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        // In production, this should be done server-side with proper password verification
        // For demo purposes, we're storing the user directly
        currentUser = user;
        currentUserId = user.id;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return true;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Register function
async function register(userData) {
    try {
        const newUser = await userAPI.register(userData);
        
        // Create wallet for new user
        await walletAPI.create({
            user_id: newUser.id,
            balance: 1000.00
        });
        
        return newUser;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    currentUserId = null;
    window.location.href = 'index.html';
}

// Initialize login form
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            await login(username, password);
            alert('Вход выполнен успешно!');
            window.location.href = 'index.html';
        } catch (error) {
            alert('Ошибка входа: ' + error.message);
        }
    });
}

// Initialize register form
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const full_name = document.getElementById('full_name').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        try {
            await register({
                username,
                email,
                full_name,
                password,
                role: 'user'
            });
            alert('Регистрация успешна! Теперь вы можете войти.');
            window.location.href = 'login.html';
        } catch (error) {
            alert('Ошибка регистрации: ' + error.message);
        }
    });
}

// Check auth on page load
if (window.location.pathname.includes('profile.html')) {
    if (!checkAuth()) {
        window.location.href = 'login.html';
    }
}
