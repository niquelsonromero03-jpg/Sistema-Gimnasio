document.addEventListener('DOMContentLoaded', async () => {

    const userType = localStorage.getItem('userType');
    if (userType !== 'staff') {
        window.location.href = '/gimnasio/login.html';
        return;
    }

    async function cargarClases() {
        try {
            const data = await apiFetch('/entrenador/clases.php');
            renderizarClases(data.clases || []);
        } catch (err) {
            console.error('Error cargando clases:', err);
        }
    }

    function renderizarClases(clases) {
        const container = document.querySelector('.row.g-4');
        if (!container) return;

        container.innerHTML = '';

        if (clases.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No tienes clases programadas para hoy</p>';
            return;
        }

        clases.forEach(clase => {
            const horaFin = new Date(clase.fecha_hora);
            horaFin.setMinutes(horaFin.getMinutes() + (clase.duracion_minutos || 60));
            const horaFinStr = horaFin.toTimeString().slice(0, 5);

            const horaInicio = new Date(clase.fecha_hora).toTimeString().slice(0, 5);
            const porcentaje = clase.capacidad_maxima > 0
                ? Math.round((clase.asistentes_confirmados / clase.capacidad_maxima) * 100)
                : 0;
            const barColor = porcentaje >= 100 ? 'bg-danger' : porcentaje >= 75 ? 'bg-warning' : 'bg-success';
            const textColor = porcentaje >= 100 ? 'text-danger' : porcentaje >= 75 ? 'text-warning' : 'text-success';

            const card = document.createElement('div', 'col-12 col-md-6 col-xl-4');
            card.className = 'col-12 col-md-6 col-xl-4';
            card.innerHTML = `
                <div class="card border-0 shadow-sm h-100 rounded-4 border-start border-success border-4">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                        <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
                            <div class="bg-success bg-opacity-10 text-success rounded p-2 me-3 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
                                <i class="fa-solid fa-dumbbell fs-5"></i>
                            </div>
                            ${clase.nombre}
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-4 mt-2">
                            <div class="d-flex align-items-center text-muted mb-2">
                                <div class="bg-light rounded p-2 me-3 text-center" style="width: 35px;"><i class="fa-regular fa-clock text-success"></i></div>
                                <span class="fw-medium">${horaInicio} - ${horaFinStr} hrs</span>
                            </div>
                            <div class="d-flex align-items-center text-muted">
                                <div class="bg-light rounded p-2 me-3 text-center" style="width: 35px;"><i class="fa-solid fa-location-dot text-success"></i></div>
                                <span class="fw-medium">${clase.salon}</span>
                            </div>
                        </div>

                        <div class="p-3 bg-light rounded-3">
                            <div class="d-flex justify-content-between align-items-end mb-2">
                                <span class="small fw-semibold text-gray-800">Asistentes confirmados: ${clase.asistentes_confirmados} / ${clase.capacidad_maxima}</span>
                                <span class="small fw-bold ${textColor}">${porcentaje}%</span>
                            </div>
                            <div class="progress bg-white border" style="height: 10px;">
                                <div class="progress-bar ${barColor}" role="progressbar" style="width: ${porcentaje}%;" aria-valuenow="${clase.asistentes_confirmados}" aria-valuemin="0" aria-valuemax="${clase.capacidad_maxima}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 pb-4 pt-2">
                        <button class="btn btn-outline-success w-100 fw-semibold btn-ver-asistentes" data-clase-id="${clase.id}" data-nombre="${clase.nombre}" data-hora="${horaInicio}">
                            <i class="fa-solid fa-clipboard-list me-2"></i> Ver Lista de Asistentes
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.btn-ver-asistentes').forEach(btn => {
            btn.addEventListener('click', () => {
                const claseId = btn.getAttribute('data-clase-id');
                const nombre = btn.getAttribute('data-nombre');
                const hora = btn.getAttribute('data-hora');
                cargarAsistentes(nombre, hora, claseId);
            });
        });
    }

    async function cargarAsistentes(nombreClase, hora, claseId) {
        document.getElementById('ocNombreClase').innerText = nombreClase;
        document.getElementById('ocHoraClase').innerText = hora;

        const listaAlumnos = document.getElementById('listaAlumnos');
        listaAlumnos.innerHTML = '<div class="list-group-item py-3 text-center text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i> Cargando...</div>';

        try {
            const data = await apiFetch(`/entrenador/asistentes.php?clase_id=${claseId}`);
            const asistentes = data.asistentes || [];

            listaAlumnos.innerHTML = '';

            if (asistentes.length === 0) {
                listaAlumnos.innerHTML = '<div class="list-group-item py-3 text-center text-muted">Sin asistentes inscritos</div>';
                return;
            }

            asistentes.forEach((socio, index) => {
                const item = document.createElement('div');
                item.className = 'list-group-item py-3';
                item.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="bg-light text-secondary rounded-circle d-flex justify-content-center align-items-center me-3 fw-bold border" style="width: 40px; height: 40px;">${index + 1}</div>
                        <div>
                            <h6 class="mb-0 fw-semibold text-gray-800">${Socio.nombres} ${Socio.apellidos}</h6>
                            <small class="text-muted">DNI: ${Socio.dni}</small>
                        </div>
                    </div>
                `;
                listaAlumnos.appendChild(item);
            });
        } catch (err) {
            listaAlumnos.innerHTML = '<div class="list-group-item py-3 text-center text-danger">Error cargando asistentes</div>';
        }
    }

    const logoutBtn = document.querySelector('.btn-outline-danger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout());
    }

    await cargarClases();
});