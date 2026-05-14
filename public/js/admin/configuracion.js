document.addEventListener('DOMContentLoaded', async () => {

    const userType = localStorage.getItem('userType');
    if (userType !== 'staff') {
        window.location.href = '/gimnasio/login.html';
        return;
    }

    async function cargarPlanes() {
        try {
            const data = await apiFetch('/admin/configuracion.php');
            renderizarPlanes(data.planes || []);
        } catch (err) {
            console.error('Error cargando planes:', err);
        }
    }

    function renderizarPlanes(planes) {
        const tbody = document.getElementById('tablaPlanesBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (planes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Sin planes registrados</td></tr>';
            return;
        }

        planes.forEach(plan => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 fw-medium text-gray-800">${plan.nombre}</td>
                <td class="text-center">${plan.duracion_dias}</td>
                <td class="text-end fw-bold text-gray-800">S/ ${parseFloat(plan.precio).toFixed(2)}</td>
                <td class="pe-4 text-center">
                    <span class="badge ${plan.activo ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25'} px-2 py-1 rounded-pill">
                        ${plan.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="pe-4 text-center">
                    <button class="btn btn-sm btn-light text-primary border rounded"><i class="fa-solid fa-pen"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const formCrearPlan = document.getElementById('formCrearPlan');
    if (formCrearPlan) {
        formCrearPlan.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                nombre: document.getElementById('nombrePlan').value.trim(),
                duracion_dias: parseInt(document.getElementById('duracionPlan').value),
                precio: parseFloat(document.getElementById('precioPlan').value)
            };

            try {
                await apiFetch('/admin/configuracion.php', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                formCrearPlan.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearPlan'));
                if (modal) modal.hide();

                await cargarPlanes();
                alert('Plan creado correctamente');
            } catch (err) {
                alert('Error al crear plan: ' + err.message);
            }
        });
    }

    const formDatosGimnasio = document.getElementById('formDatosGimnasio');
    if (formDatosGimnasio) {
        formDatosGimnasio.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = formDatosGimnasio.querySelectorAll('input');
            const datos = {};
            inputs.forEach(inp => {
                datos[inp.previousElementSibling?.textContent || inp.id] = inp.value;
            });
            localStorage.setItem('fitfab_gym_data', JSON.stringify(datos));
            alert('Datos del gimnasio guardados correctamente');
        });
    }

    const formNuevoStaff = document.getElementById('formNuevoStaff');
    if (formNuevoStaff) {
        formNuevoStaff.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Funcionalidad de staff aún no conectada al API. Por ahora solo está disponible la gestión de planes.');
        });
    }

    const logoutBtn = document.querySelector('.btn-outline-danger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout());
    }

    await cargarPlanes();
});