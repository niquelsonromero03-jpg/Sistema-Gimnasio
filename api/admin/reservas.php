<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/auth_helpers.php';

$user = requireAuth();

$claseId = (int)($_GET['clase_id'] ?? 0);

if ($claseId <= 0) {
    jsonError('ID de clase requerido', 400);
}

$stmt = $pdo->prepare(
    "SELECT s.nombres, s.apellidos, s.dni, r.created_at
     FROM reservas r
     JOIN socios s ON r.socio_id = s.id
     WHERE r.clase_id = ? AND r.estado = 'confirmada'
     ORDER BY r.created_at"
);
$stmt->execute([$claseId]);
$asistentes = $stmt->fetchAll();

jsonResponse(['asistentes' => $asistentes]);