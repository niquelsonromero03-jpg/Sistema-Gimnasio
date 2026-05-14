<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['trainer']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $clase_id = (int)($_GET['clase_id'] ?? 0);

    if ($clase_id <= 0) {
        jsonError('clase_id es requerido', 400);
    }

    $stmt = $pdo->prepare("
        SELECT s.id, s.dni, s.nombres, s.apellidos, r.created_at
        FROM reservas r
        JOIN socios s ON r.socio_id = s.id
        WHERE r.clase_id = ? AND r.estado = 'confirmada'
        ORDER BY r.created_at ASC
    ");
    $stmt->execute([$clase_id]);
    $asistentes = $stmt->fetchAll();

    jsonResponse(['asistentes' => $asistentes]);

} else {
    jsonError('Método no permitido', 405);
}