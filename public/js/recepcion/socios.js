document.addEventListener('DOMContentLoaded', async () => {
    const tablaSociosBody = document.getElementById('tablaSociosBody');
    const inputBuscarSocio = document.getElementById('inputBuscarSocio');
    const textoContadorSocios = document.getElementById('textoContadorSocios');
    const formRegistroSocio = document.getElementById('formRegistroSocio');

    let sociosData = [];

    const renderizarTabla = (socios) => {
        if (!tablaSociosBody) return;
        tablaSociosBody.innerHTML = '';

        socios.forEach(socio => {
            const iniciales = (socio.nombres.charAt(0) + socio.apellidos.charAt(0)).toUpperCase();
            let badgeClase = '';
            let vencimientoClase = 'text-muted';

            if (socio.estado === 'activo') {
                badgeClase = 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
            } else if (socio.estado === 'vencido') {
                badgeClase = 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
                vencimientoClase = 'text-danger fw-medium';
            } else {
                badgeClase = 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
            }

            const vencimiento = socio.fecha_vencimiento
                ? new Date(socio.fecha_vencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '--/--/----';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 fw-medium text-gray-800">${socio.dni}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold" style="width: 36px; height: 36px; font-size: 0.9rem;">
                            ${iniciales}
                        </div>
                        <div>
                            <span class="fw-semibold text-gray-800 d-block">${socio.nombres} ${socio.apellidos}</span>
                        </div>
                    </div>
                </td>
                <td class="text-muted">${socio.plan_nombre || 'Sin plan'}</td>
                <td class="${vencimientoClase}">${vencimiento}</td>
                <td class="text-center">
                    <span class="badge ${badgeClase} px-2 py-1 rounded-pill">${socio.estado}</span>
                </td>
                <td class="pe-4 text-center">
                    <button class="btn btn-sm btn-light text-primary border rounded me-1 btn-accion" data-accion="Ver perfil"><i class="fa-regular fa-id-badge"></i></button>
                    <button class="btn btn-sm btn-light text-success border rounded me-1 btn-accion" data-accion="Renovar plan"><i class="fa-solid fa-arrows-rotate"></i></button>
                    <button class="btn btn-sm btn-light text-dark border rounded btn-accion" data-accion="Generar QR"><i class="fa-solid fa-qrcode"></i></button>
                </td>
            `;
            tablaSociosBody.appendChild(tr);
        });

        tablaSociosBody.querySelectorAll('.btn-accion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                alert(e.currentTarget.getAttribute('data-accion'));
            });
        });
    };

    const actualizarContador = (cantidad) => {
        if (textoContadorSocios) {
            textoContadorSocios.innerHTML = `<i class="fa-solid fa-users me-1"></i> Total registrados: ${cantidad} socios`;
        }
    };

    async function cargarSocios() {
        try {
            const data = await apiFetch('/admin/socios.php');
            sociosData = data.socios || [];
            renderizarTabla(sociosData);
            actualizarContador(sociosData.length);
        } catch (err) {
            console.error('Error cargando socios:', err);
        }
    }

    if (inputBuscarSocio) {
        inputBuscarSocio.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const filtrados = sociosData.filter(s =>
                s.dni.includes(term) || `${s.nombres} ${s.apellidos}`.toLowerCase().includes(term)
            );
            renderizarTabla(filtrados);
            actualizarContador(filtrados.length);
        });
    }

    if (formRegistroSocio) {
        formRegistroSocio.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                dni: document.getElementById('dniSocio').value.trim(),
                nombres: document.getElementById('nombresSocio').value.trim(),
                apellidos: document.getElementById('apellidosSocio').value.trim(),
                email: document.getElementById('correoSocio').value.trim(),
                telefono: document.getElementById('telefonoSocio').value.trim(),
                fecha_nacimiento: document.getElementById('fechaNacimiento').value || ''
            };

            try {
                await apiFetch('/admin/socios.php', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                await cargarSocios();

                const modalEl = document.getElementById('modalNuevoSocio');
                const mi = bootstrap.Modal.getInstance(modalEl);
                if (mi) mi.hide();
                formRegistroSocio.reset();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    await cargarSocios();
});