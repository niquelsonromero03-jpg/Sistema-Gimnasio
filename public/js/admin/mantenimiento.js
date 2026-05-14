document.addEventListener('DOMContentLoaded', async () => {
    let equiposData = [];

    const renderizarTabla = (equipos) => {
        const tbody = document.querySelector('table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

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
                if (eq.nombre.includes(k)) { icono = v; break; }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-gray-800 fw-medium">${eq.codigo}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded p-2 me-3 border">
                            <i class="fa-solid ${icono} text-secondary fs-5" style="width:24px; text-align:center;"></i>
                        </div>
                        <div>
                            <span class="fw-semibold text-gray-800 d-block">${eq.nombre}</span>
                        </div>
                    </div>
                </td>
                <td class="text-gray-800">${eq.ubicacion}</td>
                <td><span class="badge ${badgeClass} px-2 py-1 rounded-pill"><i class="fa-solid ${badgeIcon} me-1"></i> ${estadoLabel}</span></td>
                <td class="pe-4 text-center">
                    <button class="btn btn-sm btn-light text-secondary rounded" title="Ver Historial"><i class="fa-solid fa-clock-rotate-left"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    const countOperativos = document.getElementById('countOperativos');
    const countMantenimiento = document.getElementById('countMantenimiento');
    const countFuera = document.getElementById('countFuera');

    const actualizarResumen = (equipos) => {
        const operativos = equipos.filter(e => e.estado === 'operativo').length;
        const enMant = equipos.filter(e => e.estado === 'mantenimiento').length;
        const fuera = equipos.filter(e => e.estado === 'fuera_servicio').length;
        if (countOperativos) countOperativos.textContent = operativos;
        if (countMantenimiento) countMantenimiento.textContent = enMant;
        if (countFuera) countFuera.textContent = fuera;
    };

    const selectEquipo = document.getElementById('equipoAfectado');
    const formIncidencia = document.getElementById('formIncidencia');

    const llenarSelect = (equipos) => {
        if (!selectEquipo) return;
        selectEquipo.innerHTML = '<option value="" selected disabled>Buscar y seleccionar equipo...</option>';
        equipos.forEach(eq => {
            const opt = document.createElement('option');
            opt.value = eq.id;
            opt.textContent = `${eq.codigo} - ${eq.nombre}`;
            selectEquipo.appendChild(opt);
        });
    };

    try {
        const data = await apiFetch('/admin/equipos.php');
        equiposData = data.equipos || [];
        renderizarTabla(equiposData);
        actualizarResumen(equiposData);
        llenarSelect(equiposData);
    } catch (err) {
        console.error('Error cargando equipos:', err);
    }

    if (formIncidencia) {
        formIncidencia.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                equipo_id: parseInt(document.getElementById('equipoAfectado').value),
                tipo: document.querySelector('input[name="tipoMantenimiento"]:checked')?.value || '',
                descripcion: document.getElementById('descProblema').value.trim(),
                tecnico_responsable: document.getElementById('responsableMant')?.value.trim() || ''
            };

            if (!payload.equipo_id || !payload.tipo || !payload.descripcion) {
                alert('Complete todos los campos requeridos.');
                return;
            }

            try {
                await apiFetch('/admin/equipos.php', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const offcanvasEl = document.getElementById('offcanvasIncidencia');
                const ocInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
                if (ocInstance) ocInstance.hide();

                formIncidencia.reset();
                alert('Incidencia registrada correctamente.');
            } catch (err) {
                alert('Error al registrar incidencia: ' + err.message);
            }
        });
    }
});