document.addEventListener('DOMContentLoaded', async () => {

    const userType = localStorage.getItem('userType');
    if (userType !== 'staff') {
        window.location.href = '/gimnasio/login.html';
        return;
    }

    let equiposData = [];

    async function cargarEquipos() {
        try {
            const data = await apiFetch('/admin/equipos.php');
            equiposData = data.equipos || [];
            renderizarTabla(equiposData);
            llenarSelect(equiposData);
        } catch (err) {
            console.error('Error cargando equipos:', err);
        }
    }

    function renderizarTabla(equipos) {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (equipos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Sin equipos registrados</td></tr>';
            return;
        }

        equipos.forEach(eq => {
            let badgeClass = '', badgeIcon = '';
            switch (eq.estado) {
                case 'operativo':
                    badgeClass = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
                    badgeIcon = 'fa-check';
                    break;
                case 'mantenimiento':
                    badgeClass = 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
                    badgeIcon = 'fa-screwdriver-wrench';
                    break;
                case 'fuera_servicio':
                    badgeClass = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
                    badgeIcon = 'fa-ban';
                    break;
                default:
                    badgeClass = 'bg-secondary bg-opacity-10 text-secondary';
                    badgeIcon = 'fa-question';
            }

            const estadoLabel = eq.estado === 'operativo' ? 'Operativo'
                : eq.estado === 'mantenimiento' ? 'En Mantenimiento'
                : eq.estado === 'fuera_servicio' ? 'Fuera de Servicio' : eq.estado;

            const iconoMap = {
                'Cinta': 'fa-person-running', 'Bicicleta': 'fa-bicycle',
                'Máquina': 'fa-dumbbell', 'Elíptica': 'fa-person-walking',
                'Prensa': 'fa-dumbbell', 'Remo': 'fa-anchor'
            };
            let icono = 'fa-dumbbell';
            for (const [k, v] of Object.entries(iconoMap)) {
                if (eq.nombre && eq.nombre.includes(k)) { icono = v; break; }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 fw-medium text-gray-800">${eq.codigo}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded p-2 me-3 border">
                            <i class="fa-solid ${icono} text-secondary fs-5" style="width:24px; text-align:center;"></i>
                        </div>
                        <div>
                            <span class="fw-semibold text-gray-800 d-block">${eq.nombre || ''}</span>
                        </div>
                    </div>
                </td>
                <td class="text-muted"><i class="fa-solid fa-location-dot me-1 text-secondary opacity-50"></i> ${eq.ubicacion || '-'}</td>
                <td class="pe-4 text-center"><span class="badge ${badgeClass} px-3 py-1 rounded-pill"><i class="fa-solid ${badgeIcon} me-1"></i> ${estadoLabel}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function llenarSelect(equipos) {
        const selectEquipo = document.getElementById('selectEquipo');
        if (!selectEquipo) return;
        selectEquipo.innerHTML = '<option value="" selected disabled>Seleccione el equipo...</option>';
        equipos.forEach(eq => {
            const opt = document.createElement('option');
            opt.value = eq.id;
            opt.textContent = `${eq.codigo} - ${eq.nombre || eq.codigo}`;
            selectEquipo.appendChild(opt);
        });
    }

    const formReporte = document.getElementById('formReporteIncidencia');
    if (formReporte) {
        formReporte.addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectEl = document.getElementById('selectEquipo');
            const tipoEl = document.getElementById('selectTipoFalla');
            const descEl = document.getElementById('descFalla');

            if (!selectEl.value || !tipoEl.value || !descEl.value.trim()) {
                alert('Complete todos los campos requeridos.');
                return;
            }

            const selectedOption = selectEl.selectedOptions[0];
            const equipoTexto = selectedOption.textContent;

            try {
                await apiFetch('/admin/equipos.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        equipo_id: parseInt(selectEl.value),
                        tipo: tipoEl.value,
                        descripcion: descEl.value.trim()
                    })
                });

                formReporte.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalReporte'));
                if (modal) modal.hide();

                alert(`Reporte ${tipoEl.value} enviado con éxito para el equipo:\n${equipoTexto}.\n\nEl administrador de mantenimiento ha sido notificado.`);
                await cargarEquipos();
            } catch (err) {
                alert('Error al enviar reporte: ' + err.message);
            }
        });
    }

    const logoutBtn = document.querySelector('.btn-outline-danger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout());
    }

    await cargarEquipos();
});