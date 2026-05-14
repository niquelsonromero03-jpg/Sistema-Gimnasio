const API_BASE = 'http://localhost:8080/gimnasio/api';

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        window.location.href = '/gimnasio/login.html';
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}`);
    }

    return data;
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function getUserType() {
    return localStorage.getItem('userType');
}

function isAuthenticated() {
    return !!localStorage.getItem('token');
}

function isStaff() {
    return getUserType() === 'staff';
}

function isSocio() {
    return getUserType() === 'socio';
}