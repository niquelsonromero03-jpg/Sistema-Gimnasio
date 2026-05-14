document.addEventListener('DOMContentLoaded', async () => {
    const contenedorClases = document.getElementById('contenedorClases');
    const formNuevaClase = document.getElementById('formNuevaClase');

    let clasesData = [];

    const getIconoClase = (nombre) => {
        const lower = nombre.toLowerCase();
        if (lower.includes('yoga'))    return 'fa-spa';
        if (lower.includes('spinning')) return 'fa-person-biking';
        if (lower.includes('crossfit')) return 'fa-dumbbell';
        if (lower.includes('hiit'))    return 'fa-fire';
        if (lower.includes('zumba'))   return 'fa-music';
        if (lower.includes('pilates')) return 'fa-hands';
        return 'fa-calendar-check';
    };

    const renderizarClases = () => {
        if (!contenedorClases) return;
        contenedorClases.innerHTML = '';

        clasesData.forEach(clase => {
            const porcentaje = clase.capacidad_maxima > 0
                ? Math.round((clase.reservas_confirmadas / clase.capacidad_maxima) * 100)
                : 0;
            const esLleno = porcentaje >= 100;
            const colorPrincipal = esLleno ? 'danger' : (porcentaje >= 80 ? 'warning' : 'primary');
            const textoBadge = esLleno ? 'Lleno' : 'Disponible';
            const colorBadge = esLleno ? 'danger' : 'success';
            const icono = getIconoClase(clase.nombre);

            const fechaHora = new Date(clase.fecha_hora);
            const hoy = new Date();
            const esHoy = fechaHora.toDateString() === hoy.toDateString();
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            const esManana = fechaHora.toDateString() === manana.toDateString();

            let labelDia = fechaHora.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' });
            if (esHoy) labelDia = 'Hoy';
            else if (esManana) labelDia = 'Mañana';

            const horaFin = new Date(fechaHora.getTime() + clase.duracion_minutos * 60000);
            const horario = `${labelDia}, ${fechaHora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} - ${horaFin.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} hrs`;

            const card = document.createElement('div');
            card.className = 'col-12 col-md-6 col-xl-4';

            card.innerHTML = `
                <div class="card border-0 shadow-sm h-100 rounded-4">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                        <h5 class="fw-bold text-gray-800 mb-0 d-flex align-items-center">
                            <div class="bg-${colorPrincipal} bg-opacity-10 text-${colorPrincipal} rounded p-2 me-2 d-inline-flex justify-content-center align-items-center" style="width: 40px; height: 40px;">
                                <i class="fa-solid ${icono} fs-5"></i>
                            </div>
                            ${clase.nombre}
                        </h5>
                        <span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge} border-opacity-25 rounded-pill px-3 py-1">${textoBadge}</span>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <p class="text-muted mb-1"><i class="fa-regular fa-clock text-secondary me-2" style="width: 16px; text-align: center;"></i> ${horario}</p>
                            <p class="text-muted mb-1"><i class="fa-solid fa-user-ninja text-secondary me-2" style="width: 16px; text-align: center;"></i> Coach: ${clase.entrenador}</p>
                            <p class="text-muted mb-1"><i class="fa-solid fa-location-dot text-secondary me-2" style="width: 16px; text-align: center;"></i> ${clase.salon}</p>
                        </div>
                        <div class="mt-4">
                            <div class="d-flex justify-content-between align-items-end mb-1">
                                <span class="small fw-medium ${esLleno ? 'text-danger' : 'text-muted'}">Reservas: ${clase.reservas_confirmadas} / ${clase.capacidad_maxima}</span>
                                <span class="small fw-bold text-${colorPrincipal}">${porcentaje}%</span>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar bg-${colorPrincipal} rounded-pill" role="progressbar" style="width: ${porcentaje}%;" aria-valuenow="${clase.reservas_confirmadas}" aria-valuemin="0" aria-valuemax="${clase.capacidad_maxima}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 pb-4 pt-0">
                        <button class="btn btn-outline-${colorPrincipal} w-100 rounded-3 btn-asistentes" data-id="${clase.id}" data-nombre="${clase.nombre}">
                            <i class="fa-solid fa-clipboard-list me-2"></i> Ver Lista de Asistentes
                        </button>
                    </div>
                </div>
            `;

            contenedorClases.appendChild(card);
        });

        document.querySelectorAll('.btn-asistentes').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const claseId = parseInt(e.currentTarget.getAttribute('data-id'));
                const claseNombre = e.currentTarget.getAttribute('data-nombre');

                const tituloModal = document.getElementById('nombreClaseModal');
                if (tituloModal) tituloModal.textContent = claseNombre;

                try {
                    const res = await apiFetch(`/admin/reservas.php?clase_id=${claseId}`);
                    const listaAsistentes = document.getElementById('listaAsistentesModal');
                    if (listaAsistentes) {
                        if (res.asistentes && res.asistentes.length > 0) {
                            listaAsistentes.innerHTML = res.asistentes.map(a =>
                                `<li class="list-group-item px-0 py-3 border-bottom"><i class="fa-solid fa-user text-secondary me-3"></i> ${a.nombres} ${a.apellidos}</li>`
                            ).join('');
                        } else {
                            listaAsistentes.innerHTML = '<li class="list-group-item text-muted text-center py-3">No hay inscritos.</li>';
                        }
                    }
                } catch {
                    const listaAsistentes = document.getElementById('listaAsistentesModal');
                    if (listaAsistentes) listaAsistentes.innerHTML = '<li class="list-group-item text-danger text-center py-3">Error cargando asistentes.</li>';
                }

                const modalEl = document.getElementById('modalAsistentes');
                if (modalEl) new bootstrap.Modal(modalEl).show();
            });
        });
    };

    try {
        const data = await apiFetch('/admin/clases.php');
        clasesData = data.clases || [];
        renderizarClases();
    } catch (err) {
        console.error('Error cargando clases:', err);
    }

    if (formNuevaClase) {
        formNuevaClase.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                nombre: document.getElementById('nombreClase').value.trim(),
                entrenador_id: parseInt(document.getElementById('entrenadorClase').value),
                fecha_hora: document.getElementById('fechaHoraClase').value,
                duracion_minutos: parseInt(document.getElementById('capacidadClase').value) > 0 ? 60 : 60,
                capacidad_maxima: parseInt(document.getElementById('capacidadClase').value) || 20,
                salon: document.getElementById('salonClase').value
            };

            try {
                await apiFetch('/admin/clases.php', { method: 'POST', body: JSON.stringify(payload) });
                const refresh = await apiFetch('/admin/clases.php');
                clasesData = refresh.clases || [];
                renderizarClases();

                const modalEl = document.getElementById('modalNuevaClase');
                const mi = bootstrap.Modal.getInstance(modalEl);
                if (mi) mi.hide();
                formNuevaClase.reset();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }
});