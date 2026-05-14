document.addEventListener('DOMContentLoaded', async () => {
    const tablaPagos = document.getElementById('tablaPagos');
    const formRegistroPago = document.getElementById('formRegistroPago');
    const seleccionarPlan = document.getElementById('seleccionarPlan');
    const inputMonto = document.getElementById('montoPagar');
    const historialTab = document.getElementById('historial-tab');

    let pagosData = [];

    const getIconoMetodo = (metodo) => {
        switch (metodo) {
            case 'efectivo':      return '<i class="fa-solid fa-money-bill-wave text-success me-1"></i>';
            case 'transferencia': return '<i class="fa-solid fa-building-columns text-info me-1"></i>';
            case 'yape_plin':     return '<i class="fa-solid fa-mobile-screen text-primary me-1"></i>';
            default:              return '<i class="fa-solid fa-credit-card text-secondary me-1"></i>';
        }
    };

    const getLabelMetodo = (metodo) => {
        switch (metodo) {
            case 'efectivo':      return 'Efectivo';
            case 'transferencia': return 'Transferencia';
            case 'yape_plin':     return 'Yape / Plin';
            default:              return metodo;
        }
    };

    const getBadgeEstado = (estado) => {
        switch (estado) {
            case 'activo':    return '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill">Vigente</span>';
            case 'vencido':  return '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-pill">Vencida</span>';
            case 'cancelado': return '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill">Cancelada</span>';
            default:          return '<span class="badge bg-light text-dark">' + (estado || '') + '</span>';
        }
    };

    const renderizarHistorial = (pagos) => {
        if (!tablaPagos) return;
        tablaPagos.innerHTML = '';

        if (!pagos || pagos.length === 0) {
            tablaPagos.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay pagos registrados.</td></tr>';
            return;
        }

        pagos.forEach(pago => {
            const fechaFormateada = new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 text-gray-800">${fechaFormateada}</td>
                <td class="fw-semibold text-gray-800">${pago.socio}</td>
                <td class="text-muted">${pago.comprobante || '-'}</td>
                <td class="fw-bold text-gray-800">S/ ${parseFloat(pago.monto).toFixed(2)}</td>
                <td><span class="badge bg-light text-dark border">${getIconoMetodo(pago.metodo_pago)} ${getLabelMetodo(pago.metodo_pago)}</span></td>
                <td>${getBadgeEstado(pago.membresia_estado || pago.estado || 'activo')}</td>
                <td class="pe-4 text-center">
                    <button class="btn btn-sm btn-light text-primary border rounded shadow-sm btn-descargar" title="Descargar Comprobante">
                        <i class="fa-solid fa-file-pdf"></i>
                    </button>
                </td>
            `;
            tablaPagos.appendChild(tr);
        });
    };

    async function cargarPagos() {
        try {
            const data = await apiFetch('/admin/pagos.php');
            pagosData = data.pagos || [];
            renderizarHistorial(pagosData);
        } catch (err) {
            console.error('Error cargando pagos:', err);
            tablaPagos.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Error al cargar pagos.</td></tr>';
        }
    }

    if (seleccionarPlan && inputMonto) {
        seleccionarPlan.addEventListener('change', (e) => {
            const precio = e.target.value;
            if (precio) inputMonto.value = parseFloat(precio).toFixed(2);
            else inputMonto.value = '';
        });
    }

    if (formRegistroPago) {
        formRegistroPago.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dniSocio = document.getElementById('buscarSocio').value.trim();
            const planTexto = seleccionarPlan.options[seleccionarPlan.selectedIndex]?.text || '';
            const monto = parseFloat(inputMonto.value);
            const metodoPago = document.getElementById('metodoPago').value;

            const planNombre = planTexto.split(' - ')[0].trim();
            const planMap = {
                'Mensual Básico': 1,
                'Mensual Ilimitado': 2,
                'Trimestral VIP': 3,
                'Anual Full': 4
            };
            const planId = planMap[planNombre] || 0;

            if (!dniSocio || !monto || !metodoPago) {
                alert('Complete todos los campos requeridos.');
                return;
            }

            try {
                const socioRes = await apiFetch('/admin/socios.php');
                const socio = socioRes.socios?.find(s => s.dni === dniSocio);
                if (!socio) {
                    alert('Socio no encontrado.');
                    return;
                }

                await apiFetch('/admin/pagos.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        socio_id: socio.id,
                        monto: monto,
                        metodo_pago: metodoPago,
                        plan_id: planId
                    })
                });

                await cargarPagos();
                formRegistroPago.reset();
                inputMonto.value = '';
                alert('Pago registrado correctamente.');
            } catch (err) {
                alert('Error al registrar pago: ' + err.message);
            }
        });
    }

    if (historialTab) {
        historialTab.addEventListener('shown.bs.tab', cargarPagos);
    }

    await cargarPagos();
});