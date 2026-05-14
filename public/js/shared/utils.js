document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
    }

    if (sidebarClose && sidebar) {
        sidebarClose.addEventListener('click', () => sidebar.classList.remove('show'));
    }

    const botones = document.querySelectorAll('button');
    botones.forEach(btn => {
        if (btn.textContent.includes('Cerrar Sesión') || btn.querySelector('.fa-right-from-bracket')) {
            btn.addEventListener('click', cerrarSesion);
        }
    });
});

async function verificarSesion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/gimnasio/login.html';
        return;
    }

    try {
        const data = await fetch(`${window.API_BASE || '/gimnasio/api'}/auth/check.php`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(r => r.json());

        if (!data.authenticated) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            window.location.href = '/gimnasio/login.html';
        }
    } catch (e) {
        console.warn('No se pudo verificar la sesión:', e.message);
    }
}

function cerrarSesion() {
    const token = localStorage.getItem('token');

    fetch(`${window.API_BASE || '/gimnasio/api'}/auth/logout.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }).catch(() => {});

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.href = '/gimnasio/login.html';
}

window.API_BASE = '/gimnasio/api';