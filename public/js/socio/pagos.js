document.addEventListener('DOMContentLoaded', async () => {

    const userType = localStorage.getItem('userType');
    if (userType !== 'socio') {
        window.location.href = '/gimnasio/login_socio.html';
        return;
    }

    async function cargarPerfilYpagos() {
        try {
            const [perfilData, pagosData] = await Promise.all([
                apiFetch('/socio/perfil.php'),
                apiFetch('/socio/pagos.php')
            ]);

            const socio = perfilData.socio;
            const pagos = pagosData.pagos || [];

            const planBadge = document.querySelector('.badge.bg-white.text-primary');
            if (planBadge && socio) {
                if (socio.membresia_estado === 'activo') {
                    planBadge.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> Activo';
                } else {
                    planBadge.className = 'badge bg-white text-danger rounded-pill px-3 py-2 fw-bold shadow-sm';
                    planBadge.innerHTML = '<i class="fa-solid fa-circle-exclamation me-1"></i> Vencido';
                }
            }

            const planNombreEl = document.querySelector('.bg-primary.text-white h2.fw-bold');
            if (planNombreEl && socio) {
                planNombreEl.textContent = socio.plan_nombre || 'Sin plan';
            }

            const vencimientoEl = document.querySelectorAll('.fw-bold.text-gray-800.m-0')[0];
            if (vencimientoEl && socio && socio.fecha_vencimiento) {
                const fecha = new Date(socio.fecha_vencimiento);
                vencimientoEl.textContent = `${fecha.getDate()} de ${fecha.toLocaleDateString('es-PE', { month: 'long' })}, ${fecha.getFullYear()}`;
            }

            const deudaEl = document.querySelectorAll('.fw-bold.text-success.m-0')[0];
            if (deudaEl !== undefined) {
                deudaEl.textContent = 'S/ 0.00';
            }

            const alertDiv = document.querySelector('.alert-success');
            if (alertDiv && socio) {
                if (socio.membresia_estado === 'activo') {
                    alertDiv.innerHTML = '<i class="fa-solid fa-face-smile-wink fs-4 me-3"></i><div class="small fw-medium">¡Estás al día con tus pagos! Disfruta de tu entrenamiento.</div>';
                    alertDiv.className = 'alert alert-success d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm';
                } else {
                    alertDiv.innerHTML = '<i class="fa-solid fa-face-expletive fs-4 me-3"></i><div class="small fw-medium">Tu membresía está vencida. Renueva para seguir entrenando.</div>';
                    alertDiv.className = 'alert alert-danger d-flex align-items-center rounded-3 mb-0 border-0 shadow-sm';
                }
            }

            renderizarPagos(pagos);

        } catch (err) {
            console.error('Error cargando datos:', err);
        }
    }

    function renderizarPagos(pagos) {
        const listGroup = document.querySelector('.list-group');
        if (!listGroup) return;

        listGroup.innerHTML = '';

        if (pagos.length === 0) {
            listGroup.innerHTML = '<p class="text-center text-muted p-4">Sin pagos registrados</p>';
            return;
        }

        pagos.forEach((pago, index) => {
            const badge = obtenerBadgeMetodo(pago.metodo_pago);
            const fecha = new Date(pago.fecha_pago);
            const fechaFormateada = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
            const bgClass = index % 2 === 1 ? ' bg-light bg-opacity-50' : '';

            const item = document.createElement('div');
            item.className = `list-group-item p-4 border-0 border-bottom border-light${bgClass}${index === pagos.length - 1 ? ' rounded-bottom-4' : ''}`;
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="fw-bold text-gray-800 mb-2">S/ ${parseFloat(pago.monto).toFixed(2)}</h5>
                        ${badge}
                    </div>
                    <div class="text-end">
                        <span class="text-muted small fw-medium d-block">${fechaFormateada}</span>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary fw-medium px-3 rounded-pill btn-comprobante" data-comprobante="${pago.comprobante || ''}">
                        <i class="fa-solid fa-file-invoice me-1"></i> Ver Comprobante
                    </button>
                </div>
            `;
            listGroup.appendChild(item);
        });

        listGroup.querySelectorAll('.btn-comprobante').forEach(btn => {
            btn.addEventListener('click', () => {
                const comp = btn.getAttribute('data-comprobante');
                verComprobante(comp);
            });
        });
    }

    function obtenerBadgeMetodo(metodo) {
        if (metodo === 'efectivo') {
            return '<span class="badge bg-light text-dark border border-secondary border-opacity-10 py-1 px-2"><i class="fa-solid fa-money-bill-wave text-success me-1"></i> Efectivo</span>';
        } else if (metodo === 'transferencia') {
            return '<span class="badge bg-light text-dark border border-secondary border-opacity-10 py-1 px-2"><i class="fa-solid fa-money-bill-transfer text-info me-1"></i> Transferencia</span>';
        } else {
            return '<span class="badge bg-light text-dark border border-secondary border-opacity-10 py-1 px-2"><i class="fa-solid fa-mobile-screen-button text-primary me-1"></i> Yape / Plin</span>';
        }
    }

    function verComprobante(numero) {
        Swal.fire({
            title: 'Comprobante',
            html: `Descargando comprobante electrónico <b>${numero}</b>...`,
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            customClass: { popup: 'rounded-4 shadow-lg' }
        });
    }

    const logoutLink = document.querySelector('.nav-link.text-danger');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    await cargarPerfilYpagos();
});