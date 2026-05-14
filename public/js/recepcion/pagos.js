document.addEventListener('DOMContentLoaded', async () => {

    const planCobro = document.getElementById('planCobro');
    const montoRecibido = document.getElementById('montoRecibido');
    const formNuevoCobro = document.getElementById('formNuevoCobro');
    const tablaHistorialCaja = document.getElementById('tablaHistorialCaja');
    const textoTotalCaja = document.getElementById('textoTotalCaja');
    const buscarSocioInput = document.getElementById('buscarSocio');

    let sociosData = [];
    let planesData = [];
    let socioSeleccionado = null;

    const planCobroHidden = document.getElementById('planCobro');

    async function cargarPlanes() {
        try {
            const data = await apiFetch('/admin/planes.php');
            planesData = data.planes || [];
            popularPlanes();
        } catch (err) {
            console.error('Error cargando planes:', err);
        }
    }

    function popularPlanes() {
        if (!planCobro) return;
        planCobro.innerHTML = '<option value="" selected disabled>Seleccione un plan...</option>';
        planesData.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.id;
            option.textContent = `${plan.nombre} - S/ ${parseFloat(plan.precio).toFixed(2)}`;
            option.dataset.precio = plan.precio;
            planCobro.appendChild(option);
        });
    }

    async function cargarSocios() {
        try {
            const data = await apiFetch('/admin/socios.php');
            sociosData = data.socios || [];
        } catch (err) {
            console.error('Error cargando socios:', err);
        }
    }

    const obtenerBadgeMetodo = (metodo) => {
        if (metodo === 'efectivo') {
            return '<span class="badge bg-light text-dark border"><i class="fa-solid fa-money-bill-wave text-success me-1"></i> Efectivo</span>';
        } else if (metodo === 'transferencia') {
            return '<span class="badge bg-light text-dark border"><i class="fa-solid fa-building-columns text-info me-1"></i> Transferencia</span>';
        } else {
            return '<span class="badge bg-light text-dark border"><i class="fa-solid fa-mobile-screen text-primary me-1"></i> Yape / Plin</span>';
        }
    };

    if (planCobro && montoRecibido) {
        planCobro.addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            const precio = option.dataset.precio;
            montoRecibido.value = precio ? parseFloat(precio).toFixed(2) : '';
        });
    }

    if (buscarSocioInput) {
        buscarSocioInput.addEventListener('input', (e) => {
            const term = e.target.value.trim();
            if (term.length < 2) {
                socioSeleccionado = null;
                return;
            }
            const encontrado = sociosData.find(s =>
                s.dni === term || `${s.nombres} ${s.apellidos}`.toLowerCase().includes(term.toLowerCase())
            );
            if (encontrado) {
                socioSeleccionado = encontrado;
                buscarSocioInput.value = `${encontrado.dni} - ${encontrado.nombres} ${encontrado.apellidos}`;
            }
        });

        buscarSocioInput.addEventListener('blur', () => {
            if (socioSeleccionado) {
                buscarSocioInput.value = `${socioSeleccionado.dni} - ${socioSeleccionado.nombres} ${socioSeleccionado.apellidos}`;
            }
        });
    }

    async function cargarHistorial() {
        try {
            const data = await apiFetch('/recepcion/pagos.php');
            return data.pagos || [];
        } catch (err) {
            console.error('Error cargando historial:', err);
            return [];
        }
    }

    function renderizarHistorial(pagos) {
        if (!tablaHistorialCaja) return;
        tablaHistorialCaja.innerHTML = '';

        if (pagos.length === 0) {
            tablaHistorialCaja.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Sin movimientos hoy</td></tr>';
            return;
        }

        pagos.forEach(pago => {
            const fechaHora = new Date(pago.fecha_pago + ' ' + (pago.created_at ? pago.created_at.split(' ')[1] : '00:00:00'));
            const horaFormateada = fechaHora.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-gray-800 fw-medium">${horaFormateada}</td>
                <td class="fw-semibold text-gray-800">${pago.socio}</td>
                <td class="text-muted">${pago.comprobante || '-'}</td>
                <td class="fw-bold text-gray-800">S/ ${parseFloat(pago.monto).toFixed(2)}</td>
                <td>${obtenerBadgeMetodo(pago.metodo_pago)}</td>
                <td class="pe-4 text-center">
                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 shadow-sm btn-reimprimir" data-comprobante="${pago.comprobante || ''}"><i class="fa-solid fa-print me-1"></i> Reimprimir</button>
                </td>
            `;
            tablaHistorialCaja.appendChild(tr);
        });

        tablaHistorialCaja.querySelectorAll('.btn-reimprimir').forEach(btn => {
            btn.addEventListener('click', () => {
                const comp = btn.getAttribute('data-comprobante');
                alert(`Comprobante: ${comp}\nPreparando reimpresión...`);
            });
        });
    }

    function actualizarTotalCaja(pagos) {
        if (!textoTotalCaja) return;
        const total = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);
        textoTotalCaja.innerHTML = `<i class="fa-solid fa-sack-dollar me-2"></i> Total en Caja: S/ ${total.toFixed(2)}`;
    }

    async function recargarHistorial() {
        const pagos = await cargarHistorial();
        renderizarHistorial(pagos);
        actualizarTotalCaja(pagos);
    }

    if (formNuevoCobro) {
        formNuevoCobro.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!socioSeleccionado) {
                alert('Por favor seleccione un socio válido');
                return;
            }

            const planId = parseInt(planCobro.value);
            const metodo = document.getElementById('metodoPago').value;
            const monto = parseFloat(montoRecibido.value);

            if (!metodo || !monto) {
                alert('Complete todos los campos');
                return;
            }

            const selectedOption = planCobro.selectedOptions[0];
            const precioPlan = parseFloat(selectedOption.dataset.precio);
            const planNombre = selectedOption.textContent.split(' - ')[0];

            try {
                await apiFetch('/admin/pagos.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        socio_id: socioSeleccionado.id,
                        plan_id: planId,
                        monto: precioPlan,
                        metodo_pago: metodo
                    })
                });

                await recargarHistorial();

                formNuevoCobro.reset();
                montoRecibido.value = '';
                socioSeleccionado = null;
                buscarSocioInput.value = '';

                alert(`Pago procesado correctamente`);
            } catch (err) {
                alert('Error al procesar pago: ' + err.message);
            }
        });
    }

    const tabsLinks = document.querySelectorAll('#recepcionPagosTabs .nav-link');
    tabsLinks.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            event.relatedTarget.classList.remove('border-bottom', 'border-primary', 'border-3', 'text-primary');
            event.relatedTarget.classList.add('text-muted');
            event.target.classList.remove('text-muted');
            event.target.classList.add('border-bottom', 'border-primary', 'border-3', 'text-primary');
        });
    });

    await Promise.all([cargarPlanes(), cargarSocios()]);
    await recargarHistorial();
});