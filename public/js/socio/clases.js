document.addEventListener('DOMContentLoaded', async () => {

    const userType = localStorage.getItem('userType');
    if (userType !== 'socio') {
        window.location.href = '/gimnasio/login_socio.html';
        return;
    }

    async function cargarClases() {
        try {
            const data = await apiFetch('/socio/clases.php');
            renderizarClases(data.clases || []);
        } catch (err) {
            console.error('Error cargando clases:', err);
        }
    }

    function renderizarClases(clases) {
        const container = document.querySelector('.d-flex.flex-column.gap-3.mb-5');
        if (!container) return;

        container.innerHTML = '';

        if (clases.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay clases programadas</p>';
            return;
        }

        clases.forEach(clase => {
            const disponible = clase.disponibles > 0;
            const badgeClass = clase.estado === 'programada' ? 'bg-primary' : 'bg-secondary';
            const disponibilidadClass = disponible ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10';
            const disponibilidadTextClass = disponible ? 'text-success' : 'text-danger';
            const disponibilidadBgClass = disponible ? 'bg-success' : 'bg-white';

            const card = document.createElement('div');
            card.className = `card border-0 shadow-sm rounded-4 overflow-hidden${!disponible ? ' opacity-75 bg-light' : ''}`;
            card.innerHTML = `
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <span class="badge ${badgeClass} bg-opacity-10 text-primary mb-2 rounded-pill px-3 py-1 border border-primary border-opacity-25">${clase.salon}</span>
                            <h5 class="fw-bold text-gray-800 mb-1">${clase.nombre}</h5>
                            <p class="text-muted small mb-0"><i class="fa-solid fa-user-ninja me-1 text-secondary"></i> Coach: ${clase.instructor}</p>
                        </div>
                        <div class="bg-light rounded p-2 text-center border shadow-sm">
                            <span class="d-block fw-bold text-primary fs-5 lh-1">${clase.hora}</span>
                            <span class="d-block text-muted mt-1" style="font-size: 0.65rem; font-weight: 700;">HRS</span>
                        </div>
                    </div>

                    <div class="bg-light rounded-3 p-3 mb-4 border border-secondary border-opacity-10">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold text-gray-800 small"><i class="fa-solid fa-users text-primary me-2"></i> Lugares disponibles</span>
                            <span class="fw-bold ${disponibilidadTextClass} ${disponibilidadBgClass} bg-opacity-10 px-2 py-1 rounded">${clase.disponibles} / ${clase.capacidad}</span>
                        </div>
                    </div>

                    ${disponible
                        ? `<button class="btn btn-primary w-100 fw-bold py-3 shadow-sm btn-reservar" data-clase-id="${clase.id}">Reservar mi lugar</button>`
                        : `<button class="btn btn-secondary w-100 fw-bold py-3" disabled><i class="fa-solid fa-ban me-2"></i> Clase Llena</button>`
                    }
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.btn-reservar').forEach(btn => {
            btn.addEventListener('click', async () => {
                const claseId = parseInt(btn.getAttribute('data-clase-id'));
                await reservarClase(claseId, btn);
            });
        });
    }

    async function reservarClase(claseId, boton) {
        try {
            await apiFetch('/socio/reservas.php', {
                method: 'POST',
                body: JSON.stringify({ clase_id: claseId })
            });

            boton.classList.remove('btn-primary');
            boton.classList.add('btn-success');
            boton.innerHTML = '<i class="fa-solid fa-check-circle me-2"></i> Lugar Reservado';
            boton.disabled = true;

            Swal.fire({
                title: '¡Reserva Confirmada!',
                icon: 'success',
                confirmButtonText: 'Genial, gracias',
                confirmButtonColor: '#0d6efd',
                customClass: { popup: 'rounded-4 shadow-lg' }
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.message || 'No se pudo realizar la reserva',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        }
    }

    const logoutLink = document.querySelector('.nav-link.text-danger');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    await cargarClases();
});