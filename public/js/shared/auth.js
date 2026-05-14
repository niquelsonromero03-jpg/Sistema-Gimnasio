async function loginStaff(email, password) {
    const data = await apiFetch('/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (data && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', 'staff');
    }

    return data;
}

async function loginSocio(dni, fechaNacimiento) {
    const data = await apiFetch('/auth/login_socio.php', {
        method: 'POST',
        body: JSON.stringify({ dni, fecha_nacimiento: fechaNacimiento })
    });

    if (data && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', 'socio');
    }

    return data;
}

async function checkAuth() {
    try {
        const data = await apiFetch('/auth/check.php');
        return data.authenticated ? data : null;
    } catch (e) {
        return null;
    }
}

async function logout() {
    try {
        await apiFetch('/auth/logout.php', { method: 'POST' });
    } catch (e) {
        console.warn('Logout API falló:', e.message);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.href = '/gimnasio/login.html';
}

function redirectByRole() {
    const user = getCurrentUser();
    const type = getUserType();

    if (type === 'socio') {
        window.location.href = '/gimnasio/views/socio/socio.html';
    } else if (type === 'staff') {
        const roleRedirects = {
            'admin'     : '/gimnasio/views/admin/index.html',
            'reception' : '/gimnasio/views/recepcion/recepcion.html',
            'trainer'   : '/gimnasio/views/entrenador/entrenador.html'
        };
        window.location.href = roleRedirects[user.rol] || '/gimnasio/login.html';
    } else {
        window.location.href = '/gimnasio/login.html';
    }
}