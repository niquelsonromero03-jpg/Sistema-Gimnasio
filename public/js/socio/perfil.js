document.addEventListener('DOMContentLoaded', async () => {

    const userType = localStorage.getItem('userType');
    if (userType !== 'socio') {
        window.location.href = '/gimnasio/login_socio.html';
        return;
    }

    async function cargarPerfil() {
        try {
            const data = await apiFetch('/socio/perfil.php');
            const socio = data.socio;

            document.querySelector('.navbar-brand').textContent = 'FITFAB';

            const avatarImg = document.querySelector('.rounded-circle.border-4');
            if (avatarImg && socio) {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(socio.nombres + '+' + socio.apellidos)}&background=f8fafc&color=0d6efd&rounded=true&size=120`;
            }

            const nombreEl = document.querySelector('h4.fw-bold.text-gray-800');
            if (nombreEl && socio) {
                nombreEl.textContent = `${socio.nombres} ${socio.apellidos}`;
            }

            const codigoEl = document.querySelector('.text-muted.fw-medium.small');
            if (codigoEl && socio) {
                codigoEl.textContent = `Socio #${socio.id}`;
            }

            const estadoBadge = document.querySelector('.bg-success.bg-opacity-10.px-4.py-2.rounded-pill');
            const estadoTexto = estadoBadge?.querySelector('span.text-success');
            if (estadoTexto && socio) {
                if (socio.membresia_estado === 'activo') {
                    estadoTexto.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i> Membresía Activa';
                } else if (socio.membresia_estado === 'vencido') {
                    estadoBadge.className = 'bg-danger bg-opacity-10 px-4 py-2 rounded-pill border border-danger border-opacity-25 mb-3 shadow-sm';
                    estadoTexto.className = 'fw-bold text-danger fs-6';
                    estadoTexto.innerHTML = '<i class="fa-solid fa-circle-exclamation me-2"></i> Membresía Vencida';
                }
            }

            const planSpan = document.querySelector('.bg-light.rounded-4.p-3.mb-4 .fw-bold.text-dark.small');
            if (planSpan && socio) {
                planSpan.textContent = socio.plan_nombre || 'Sin plan';
            }

            const vencimientoSpan = document.querySelectorAll('.bg-light.rounded-4.p-3.mb-4 .fw-bold.text-dark.small')[1];
            if (vencimientoSpan && socio) {
                if (socio.fecha_vencimiento) {
                    const fecha = new Date(socio.fecha_vencimiento);
                    vencimientoSpan.textContent = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
                } else {
                    vencimientoSpan.textContent = 'Sin fecha';
                }
            }

            const qrContainer = document.getElementById('qrcode');
            if (qrContainer && socio) {
                qrContainer.innerHTML = '';
                new QRCode(qrContainer, {
                    text: `FITFAB-SOCIO-${socio.id}`,
                    width: 220,
                    height: 220,
                    colorDark: '#1e293b',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
            }

            const logoutLink = document.querySelector('.nav-link.text-danger');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            }

        } catch (err) {
            console.error('Error cargando perfil:', err);
        }
    }

    await cargarPerfil();
});