document.addEventListener('DOMContentLoaded', async function() {
    await cargarMetricas();
    renderizarGraficos();
});

async function cargarMetricas() {
    const elIngresos = document.getElementById('ingresosMes');
    const elSocios = document.getElementById('sociosActivos');
    const elMorosos = document.getElementById('sociosMorosos');
    const elAforo = document.getElementById('aforoActual');

    const mostrarLoader = (elemento) => {
        if (elemento) elemento.innerHTML = '<span class="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>';
    };

    mostrarLoader(elIngresos);
    mostrarLoader(elSocios);
    mostrarLoader(elMorosos);
    mostrarLoader(elAforo);

    try {
        const data = await apiFetch('/admin/dashboard.php');

        if (elIngresos) elIngresos.textContent = `S/ ${parseFloat(data.ingresos_mes).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        if (elSocios) elSocios.textContent = data.socios_activos.toLocaleString();
        if (elMorosos) elMorosos.textContent = data.socios_morosos.toLocaleString();
        if (elAforo) elAforo.textContent = `${data.aforo_actual.entrada} / ${data.aforo_actual.maximo}`;

        window.__dashboardData = data;

    } catch (error) {
        console.error('Error al cargar métricas:', error);
        if (elIngresos) elIngresos.textContent = '--';
        if (elSocios) elSocios.textContent = '--';
        if (elMorosos) elMorosos.textContent = '--';
        if (elAforo) elAforo.textContent = '--';
    }
}

function renderizarGraficos() {
    const canvasIngresos = document.getElementById('ingresosChart');
    const canvasSocios = document.getElementById('sociosChart');
    const data = window.__dashboardData;

    if (canvasIngresos) {
        const ctxIngresos = canvasIngresos.getContext('2d');
        const labels6m = data?.ingresos_6_meses?.map(m => m.mes) || ['Ene','Feb','Mar','Abr','May','Jun'];
        const valores6m = data?.ingresos_6_meses?.map(m => parseFloat(m.total)) || [0,0,0,0,0,0];

        new Chart(ctxIngresos, {
            type: 'bar',
            data: {
                labels: labels6m,
                datasets: [{
                    label: 'Ingresos (S/)',
                    data: valores6m,
                    backgroundColor: '#0d6efd',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: (value) => 'S/ ' + value.toLocaleString() }
                    }
                }
            }
        });
    }

    if (canvasSocios) {
        const ctxSocios = canvasSocios.getContext('2d');
        const estados = data?.estados_socios || { activo: 0, vencido: 0, cancelado: 0 };

        new Chart(ctxSocios, {
            type: 'doughnut',
            data: {
                labels: ['Activos', 'Morosos', 'Inactivos'],
                datasets: [{
                    data: [estados.activo || 0, estados.vencido || 0, estados.cancelado || 0],
                    backgroundColor: ['#198754', '#dc3545', '#6c757d'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 13 } } }
                },
                cutout: '70%'
            }
        });
    }
}