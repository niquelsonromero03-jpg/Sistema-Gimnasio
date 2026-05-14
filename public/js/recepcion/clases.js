document.addEventListener('DOMContentLoaded', async () => {
    const contenedorClases = document.getElementById('contenedorClases');
    const formInscribir = document.getElementById('formInscribir');
    const badgeFecha = document.getElementById('badgeFechaActual');

    let clasesData = [];

    const mostrarFechaActual = () => {
        if (!badgeFecha) return;
        const actualizar = () => {
            const f = new Date();
            const diaSemana = f.toLocaleDateString('es-ES', { weekday: 'long' });
            const diaNum = f.getDate().toString().padStart(2, '0');
            const mes = f.toLocaleDateString('es-ES', { month: 'long' });
            const hora = f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            badgeFecha.innerHTML = `<i class="fa-solid fa-calendar-day me-2"></i> ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${diaNum} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} - ${hora}`;
        };
        actualizar();
        setInterval(actualizar, 1000);
    };

    const getIconoClase = (nombre) => {
        const lower = nombre.toLowerCase();
        if (lower.includes('yoga'))    return 'fa-spa';
        if (lower.includes('spinning')) return 'fa-person-biking';
        if (lower.includes('crossfit')) return 'fa-dumbbell';
        if (lower.includes('hiit'))    return 'fa-fire';
        return 'fa-calendar-check';
    };

    const renderizarClases = () => {
        if (!contenedorClases) return;
        contenedorClases.innerHTML = '';

        clasesData.forEach(clase => {
            const porcentaje = clase.capacidad_maxima > 0
                ? Math.round((clase.reservas_confirmadas / clase.capacidad_maxima) * 100)
                : 0;
            const estaLlena = porcentaje >= 100;

            let colorClase = estaLlena ? 'danger' : (porcentaje >= 80 ? 'warning' : 'success');
            let textoBadge = estaLlena ? 'Clase Llena' : (porcentaje >= 80 ? 'Casi Lleno' : 'Cupos Libres');

            const icono = getIconoClase(clase.nombre);
            const colorIcono = estaLlena ? 'danger' : (porcentaje >= 80 ? 'warning' : 'primary');
            const bgIcono = `bg-${colorIcono}`;

            const fh = new Date(clase.fecha_hora);
            const horaFin = new Date(fh.getTime() + (clase.duracion_minutos || 60) * 60000);
            const horario = `${fh.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} - ${horaFin.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} hrs`;

            const card = `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card border-0 shadow-sm h-100 rounded-4">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
                                <div class="${bgIcono} bg-opacity-10 text-${colorIcono} rounded p-2 me-2 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
                                    <i class="fa-solid ${icono} fs-5"></i>
                                </div>
                                ${clase.nombre}
                            </h5>
                            <span class="badge bg-${colorClase} bg-opacity-10 text-${colorClase} border border-${colorClase} border-opacity-25 rounded-pill px-3 py-1">${textoBadge}</span>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2" style="width: 16px; text-align: center;"></i> ${horario}</p>
                                <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2" style="width: 16px; text-align: center;"></i> Coach: ${clase.entrenador}</p>
                                <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2" style="width: 16px; text-align: center;"></i> ${clase.salon}</p>
                            </div>
                            <div class="mt-4">
                                <div class="d-flex justify-content-between align-items-end mb-1">
                                    <span class="small fw-medium ${estaLlena ? 'text-danger' : 'text-muted'}">Reservas: ${clase.reservas_confirmadas} / ${clase.capacidad_maxima}</span>
                                    <span class="small fw-bold text-${colorClase}">${porcentaje}%</span>
                                </div>
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar bg-${colorClase} rounded-pill" role="progressbar" style="width: ${porcentaje}%;" aria-valuenow="${clase.reservas_confirmadas}" aria-valuemin="0" aria-valuemax="${clase.capacidad_maxima}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 pb-4 pt-3">
                            <div class="d-flex gap-2">
                                ${estaLlena ? `
                                    <button class="btn btn-secondary flex-grow-1 fw-medium" disabled>
                                        <i class="fa-solid fa-ban me-1"></i> Aforo Lleno
                                    </button>
                                ` : `
                                    <button class="btn btn-primary flex-grow-1 fw-medium shadow-sm btn-inscribir" data-id="${clase.id}" data-nombre="${clase.nombre}">
                                        <i class="fa-solid fa-user-plus me-1"></i> Inscribir Socio
                                    </button>
                                `}
                                <button class="btn btn-outline-secondary border shadow-sm btn-ver-asistentes" data-id="${clase.id}" title="Lista de Asistentes" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAsistentes">
                                    <i class="fa-solid fa-clipboard-list"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contenedorClases.insertAdjacentHTML('beforeend', card);
        });

        let claseSeleccionadaId = null;

        contenedorClases.querySelectorAll('.btn-inscribir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                claseSeleccionadaId = parseInt(e.currentTarget.getAttribute('data-id'));
                const nombre = e.currentTarget.getAttribute('data-nombre');
                document.getElementById('nombreClaseInscripcion').innerText = nombre;
                document.getElementById('dniInscripcion').value = '';
                new bootstrap.Modal(document.getElementById('modalInscribirSocio')).show();
            });
        });

        contenedorClases.querySelectorAll('.btn-ver-asistentes').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const claseId = parseInt(e.currentTarget.getAttribute('data-id'));
                const clase = clasesData.find(c => c.id === claseId);
                if (!clase) return;

                document.getElementById('offcanvasClassName').innerText = clase.nombre;

                const fh = new Date(clase.fecha_hora);
                document.getElementById('offcanvasClassTime').innerHTML = `<i class="fa-regular fa-clock me-1"></i> ${fh.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })} ${fh.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
                document.getElementById('offcanvasClassAforo').innerText = `Aforo: ${clase.reservas_confirmadas}/${clase.capacidad_maxima}`;

                const lista = document.getElementById('offcanvasListContainer');
                lista.innerHTML = '<div class="p-4 text-center text-muted"><span class="spinner-border spinner-border-sm me-2"></span> Cargando...</div>';

                try {
                    const res = await apiFetch(`/recepcion/clases.php?clase_id=${claseId}`);
                    if (res.asistentes && res.asistentes.length > 0) {
                        lista.innerHTML = res.asistentes.map(a =>
                            `<div class="list-group-item bg-transparent py-3 border-bottom border-light">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="d-flex align-items-center">
                                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(a.nombres)}&background=0D6EFD&color=fff&rounded=true" width="32" class="rounded-circle me-3">
                                        <div>
                                            <h6 class="mb-0 fw-semibold text-gray-800 fs-6">${a.nombres} ${a.apellidos}</h6>
                                            <small class="text-muted">DNI: ${a.dni}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                        ).join('');
                    } else {
                        lista.innerHTML = '<div class="p-4 text-center text-muted small">No hay socios inscritos.</div>';
                    }
                } catch {
                    lista.innerHTML = '<div class="p-4 text-center text-danger small">Error cargando asistentes.</div>';
                }
            });
        });
    };

    async function cargarClases() {
        try {
            const data = await apiFetch('/admin/clases.php');
            clasesData = (data.clases || []).filter(c => c.estado === 'programada');
            renderizarClases();
        } catch (err) {
            console.error('Error cargando clases:', err);
        }
    }

    if (formInscribir) {
        formInscribir.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dni = document.getElementById('dniInscripcion').value.trim();
            if (!dni) { alert('Ingrese el DNI del socio.'); return; }

            try {
                const socioRes = await apiFetch('/admin/socios.php');
                const socio = socioRes.socios?.find(s => s.dni === dni);
                if (!socio) { alert('Socio no encontrado.'); return; }

                const btn = e.submitter;
                const orig = btn.innerHTML;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>';
                btn.disabled = true;

                await apiFetch('/socio/reservas.php', {
                    method: 'POST',
                    body: JSON.stringify({ clase_id: claseSeleccionadaId, socio_id: socio.id })
                });

                bootstrap.Modal.getInstance(document.getElementById('modalInscribirSocio')).hide();
                await cargarClases();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    mostrarFechaActual();
    await cargarClases();
});