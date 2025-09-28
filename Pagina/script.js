// Configuración de API endpoints
const API_BASE_URL = 'https://2l83g90ljg.execute-api.us-east-1.amazonaws.com/dev';
const API_BASE_URL_HTTP = 'https://saex8k8zpc.execute-api.us-east-1.amazonaws.com';

// Estado global de la aplicación
let currentSession = null;

// Elementos del DOM
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const newPasswordCard = document.getElementById('newPasswordCard');

// Formularios
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const newPasswordForm = document.getElementById('newPasswordForm');

// Elementos de mensaje
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const newPasswordMessage = document.getElementById('newPasswordMessage');

// Enlaces de navegación
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkAuthStatus();
});

// Event listeners
function initializeEventListeners() {
    // Navegación entre cards
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCard('register');
    });
    
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCard('login');
    });
    
    // Formularios
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    newPasswordForm.addEventListener('submit', handleSetNewPassword);
    
    // Validación en tiempo real
    document.getElementById('loginUsername').addEventListener('input', validateEmail);
    document.getElementById('registerEmail').addEventListener('input', validateEmail);
    document.getElementById('registerPassword').addEventListener('input', validatePassword);
    document.getElementById('newPassword').addEventListener('input', validatePassword);
}

// Mostrar diferentes cards
function showCard(cardType) {
    // Ocultar todas las cards
    loginCard.classList.add('hidden');
    registerCard.classList.add('hidden');
    newPasswordCard.classList.add('hidden');
    
    // Mostrar la card solicitada
    switch(cardType) {
        case 'login':
            loginCard.classList.remove('hidden');
            clearMessage(loginMessage);
            break;
        case 'register':
            registerCard.classList.remove('hidden');
            clearMessage(registerMessage);
            break;
        case 'newPassword':
            newPasswordCard.classList.remove('hidden');
            clearMessage(newPasswordMessage);
            break;
    }
}

// Manejo del login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Validar email
    if (!isValidEmail(username)) {
        showMessage(loginMessage, 'El nombre de usuario debe ser un correo electrónico válido', 'error');
        return;
    }
    
    try {
        setButtonLoading(submitButton, true);
        clearMessage(loginMessage);
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            // Login exitoso
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('idToken', data.idToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            showMessage(loginMessage, '¡Login exitoso! Redirigiendo...', 'success');
            setTimeout(() => {
                // Aquí puedes redirigir a la página principal
                window.location.href = 'dashboard.html'; // o donde quieras redirigir
            }, 1500);
            
        } else if (data.challenge === 'NEW_PASSWORD_REQUIRED') {
            // Se requiere nueva contraseña
            currentSession = data.session;
            document.getElementById('newPasswordUsername').value = username;
            showCard('newPassword');
            showMessage(newPasswordMessage, data.message || 'Se requiere establecer una nueva contraseña', 'info');
            
        } else {
            showMessage(loginMessage, data.error || 'Error en el login', 'error');
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        showMessage(loginMessage, 'Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Manejo del registro
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Validaciones
    if (!isValidEmail(email)) {
        showMessage(registerMessage, 'Por favor ingresa un correo electrónico válido', 'error');
        return;
    }
    
    if (!isValidPassword(password)) {
        showMessage(registerMessage, 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números', 'error');
        return;
    }
    
    try {
        setButtonLoading(submitButton, true);
        clearMessage(registerMessage);
        
        const response = await fetch(`${API_BASE_URL}/createUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.ok !== false) {
            showMessage(registerMessage, '¡Usuario creado exitosamente! Ahora puedes iniciar sesión.', 'success');
            setTimeout(() => {
                showCard('login');
                document.getElementById('loginUsername').value = email;
            }, 2000);
        } else {
            showMessage(registerMessage, data.error || 'Error al crear usuario', 'error');
        }
        
    } catch (error) {
        console.error('Error en registro:', error);
        showMessage(registerMessage, 'Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Manejo de establecer nueva contraseña
async function handleSetNewPassword(e) {
    e.preventDefault();
    
    const username = document.getElementById('newPasswordUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!isValidPassword(newPassword)) {
        showMessage(newPasswordMessage, 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números', 'error');
        return;
    }
    
    if (!currentSession) {
        showMessage(newPasswordMessage, 'Sesión expirada. Vuelve a iniciar sesión.', 'error');
        showCard('login');
        return;
    }
    
    try {
        setButtonLoading(submitButton, true);
        clearMessage(newPasswordMessage);
        
        const response = await fetch(`${API_BASE_URL}/setNewPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username, 
                newPassword, 
                session: currentSession 
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            // Nueva contraseña establecida exitosamente
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('idToken', data.idToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            showMessage(newPasswordMessage, '¡Contraseña establecida correctamente! Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            showMessage(newPasswordMessage, data.error || 'Error al establecer nueva contraseña', 'error');
        }
        
    } catch (error) {
        console.error('Error en setNewPassword:', error);
        showMessage(newPasswordMessage, 'Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        setButtonLoading(submitButton, false);
    }
}

// Validaciones
function validateEmail(e) {
    const email = e.target.value;
    const input = e.target;
    
    if (email === '') {
        input.classList.remove('valid', 'invalid');
        return;
    }
    
    if (isValidEmail(email)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }
}

function validatePassword(e) {
    const password = e.target.value;
    const input = e.target;
    
    if (password === '') {
        input.classList.remove('valid', 'invalid');
        return;
    }
    
    if (isValidPassword(password)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

// Utilidades para UI
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Auto-ocultar mensajes de éxito después de 5 segundos
    if (type === 'success') {
        setTimeout(() => clearMessage(element), 5000);
    }
}

function clearMessage(element) {
    element.textContent = '';
    element.className = 'message';
    element.style.display = 'none';
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span>Cargando...';
    } else {
        button.disabled = false;
        // Restaurar el texto original del botón
        const icon = button.dataset.originalIcon || '<i class="fas fa-sign-in-alt"></i>';
        const text = button.dataset.originalText || button.textContent.replace('Cargando...', '');
        button.innerHTML = `${icon} ${text}`;
    }
}

// Verificar si el usuario ya está autenticado
function checkAuthStatus() {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        // Verificar si el token es válido (opcional)
        // Por ahora, si existe un token, redirigir al dashboard
        console.log('Usuario ya autenticado, redirigiendo...');
        // window.location.href = 'dashboard.html';
    }
}

// Función para hacer logout
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    currentSession = null;
    showCard('login');
}

// Función para refrescar token (si es necesario)
async function refreshToken() {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
        logout();
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL_HTTP}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: refreshTokenValue })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('idToken', data.idToken);
            return data.accessToken;
        } else {
            logout();
            return null;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
        return null;
    }
}

// Guardar textos originales de botones al cargar
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.dataset.originalText = button.textContent.trim();
        const icon = button.querySelector('i');
        if (icon) {
            button.dataset.originalIcon = icon.outerHTML;
        }
    });
});