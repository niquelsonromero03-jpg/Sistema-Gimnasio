<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

requireAuth(); // Solo staff autenticado

// Ingresos del mes actual
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(monto), 0) AS total
    FROM pagos
    WHERE MONTH(fecha_pago) = MONTH(CURDATE())
      AND YEAR(fecha_pago) = YEAR(CURDATE())
");
$stmt->execute();
$ingresos = (float)$stmt->fetch()['total'];

// Total socios activos (membresía vigente)
$stmt = $pdo->prepare("
    SELECT COUNT(*) AS total
    FROM membresias
    WHERE estado = 'activo'
      AND fecha_vencimiento >= CURDATE()
");
$stmt->execute();
$sociosActivos = (int)$stmt->fetch()['total'];

// Total socios morosos (membresía vencida sin renovar)
$stmt = $pdo->prepare("
    SELECT COUNT(*) AS total
    FROM membresias
    WHERE estado = 'vencido'
      AND socio_id NOT IN (
          SELECT socio_id FROM membresias WHERE estado = 'activo'
      )
");
$stmt->execute();
$sociosMorosos = (int)$stmt->fetch()['total'];

// Aforo actual (entradas de hoy vs máximo fijo de 100)
$stmt = $pdo->prepare("
    SELECT COUNT(*) AS total
    FROM accesos
    WHERE tipo = 'entrada'
      AND DATE(fecha_hora) = CURDATE()
");
$stmt->execute();
$aforoActual = (int)$stmt->fetch()['total'];

// Ingresos últimos 6 meses para el gráfico
$stmt = $pdo->query("
    SELECT DATE_FORMAT(fecha_pago, '%b') AS mes,
           SUM(monto) AS total
    FROM pagos
    WHERE fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY YEAR(fecha_pago), MONTH(fecha_pago)
    ORDER BY MIN(fecha_pago)
");
$ingresos6meses = $stmt->fetchAll();

// Estado de socios para el doughnut
$stmt = $pdo->query("
    SELECT estado, COUNT(*) AS total FROM membresias GROUP BY estado
");
$estadosSociosRaw = $stmt->fetchAll();
$estadosSocios = [
    'activo'   => 0,
    'vencido'  => 0,
    'cancelado'=> 0
];
foreach ($estadosSociosRaw as $row) {
    $estadosSocios[$row['estado']] = (int)$row['total'];
}

jsonResponse([
    'ingresos_mes'    => $ingresos,
    'socios_activos'  => $sociosActivos,
    'socios_morosos'  => $sociosMorosos,
    'aforo_actual'    => [
        'entrada' => $aforoActual,
        'maximo'  => 100
    ],
    'ingresos_6_meses'=> $ingresos6meses,
    'estados_socios' => $estadosSocios
]);