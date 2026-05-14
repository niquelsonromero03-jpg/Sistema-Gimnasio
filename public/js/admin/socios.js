document.addEventListener('DOMContentLoaded', async () => {
    const tablaSocios = document.getElementById('tablaSocios');
    const buscadorSocios = document.getElementById('buscadorSocios');
    const formRegistroSocio = document.getElementById('formRegistroSocio');

    let sociosData = [];

    const getIniciales = (nombres, apellidos) => (nombres.charAt(0) + apellidos.charAt(0)).toUpperCase();

    const getBadgeEstado = (estado) => {
        switch (estado) {
            case 'activo':    return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Activo</span>';
            case 'vencido':  return '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill">Moroso</span>';
            case 'cancelado': return '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Inactivo</span>';
            default: return `<span class="badge bg-light text-dark">${estado}</span>`;
        }
    };

    const getColorAvatar = (estado) => {
        switch (estado) {
            case 'activo':    return 'bg-primary text-primary';
            case 'vencido':  return 'bg-danger text-danger';
            case 'cancelado': return 'bg-secondary text-secondary';
            default: return 'bg-primary text-primary';
        }
    };

    const renderizarTabla = (socios) => {
        if (!tablaSocios) return;
        tablaSocios.innerHTML = '';

        if (socios.length === 0) {
            tablaSocios.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron socios.</td></tr>';
            return;
        }

        socios.forEach(socio => {
            const tr = document.createElement('tr');
            const iniciales = getIniciales(socio.nombres, socio.apellidos);
            const badgeEstado = getBadgeEstado(socio.estado);
            const colorAvatar = getColorAvatar(socio.estado);
            const vencimiento = socio.fecha_vencimiento
                ? new Date(socio.fecha_vencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '--';

            tr.innerHTML = `
                <td class="ps-4 text-gray-800 fw-medium">${socio.dni}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar ${colorAvatar} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style="width: 40px; height: 40px;">
                            ${iniciales}
                        </div>
                        <div>
                            <span class="fw-semibold text-gray-800 d-block">${socio.nombres} ${socio.apellidos}</span>
                            <small class="text-muted">${socio.email || ''}</small>
                        </div>
                    </div>
                </td>
                <td class="text-gray-800">${socio.plan_nombre || 'Sin plan'}</td>
                <td class="text-gray-800">${vencimiento}</td>
                <td>${badgeEstado}</td>
                <td class="pe-4 text-center">
                    <div class="btn-group gap-1">
                        <button class="btn btn-sm btn-light text-secondary rounded" title="Ver Detalle"><i class="fa-regular fa-eye"></i></button>
                        <button class="btn btn-sm btn-light text-primary rounded" title="Generar QR"><i class="fa-solid fa-qrcode"></i></button>
                        <button class="btn btn-sm btn-light text-warning rounded" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
                    </div>
                </td>
            `;
            tablaSocios.appendChild(tr);
        });
    };

    try {
        const data = await apiFetch('/admin/socios.php');
        sociosData = data.socios || [];
        renderizarTabla(sociosData);
    } catch (err) {
        console.error('Error cargando socios:', err);
        tablaSocios.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Error al cargar socios.</td></tr>';
    }

    if (buscadorSocios) {
        buscadorSocios.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase().trim();
            const filtrados = sociosData.filter(socio => {
                const nombreCompleto = `${socio.nombres} ${socio.apellidos}`.toLowerCase();
                return socio.dni.includes(termino) || nombreCompleto.includes(termino);
            });
            renderizarTabla(filtrados);
        });
    }

    if (formRegistroSocio) {
        formRegistroSocio.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                dni: document.getElementById('dniSocio').value.trim(),
                nombres: document.getElementById('nombresSocio').value.trim(),
                apellidos: document.getElementById('apellidosSocio').value.trim(),
                email: document.getElementById('emailSocio').value.trim(),
                telefono: document.getElementById('telefonoSocio')?.value.trim() || '',
                fecha_nacimiento: document.getElementById('fechaNacimientoSocio')?.value || '',
                plan_id: parseInt(document.getElementById('planSocio')?.value) || 0
            };

            try {
                await apiFetch('/admin/socios.php', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const refresh = await apiFetch('/admin/socios.php');
                sociosData = refresh.socios || [];
                renderizarTabla(sociosData);

                const modalEl = document.getElementById('modalNuevoSocio');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();

                formRegistroSocio.reset();
            } catch (err) {
                alert('Error al registrar socio: ' + err.message);
            }
        });
    }
});