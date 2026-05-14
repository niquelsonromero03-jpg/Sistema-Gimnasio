<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireSocioAuth();

$stmt = $pdo->prepare("
    SELECT s.id, s.dni, s.nombres, s.apellidos, s.email, s.telefono,
           p.nombre AS plan_nombre, p.precio AS plan_precio,
           m.fecha_inicio, m.fecha_vencimiento, m.estado AS membresia_estado
    FROM socios s
    LEFT JOIN membresias m ON s.id = m.socio_id AND m.estado = 'activo'
    LEFT JOIN planes p ON m.plan_id = p.id
    WHERE s.id = ?
");
$stmt->execute([$user['id']]);
$socio = $stmt->fetch();

$stmtAccesos = $pdo->prepare(
    "SELECT COUNT(*) AS total FROM accesos
     WHERE socio_id = ? AND tipo = 'entrada' AND DATE(fecha_hora) = CURDATE()"
);
$stmtAccesos->execute([$user['id']]);
$accesosHoy = (int)$stmtAccesos->fetch()['total'];

jsonResponse([
    'socio'       => $socio,
    'accesos_hoy' => $accesosHoy
]);