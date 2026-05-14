<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['trainer']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT c.id, c.nombre, c.fecha_hora, c.duracion_minutos,
               c.capacidad_maxima, c.salon, c.estado,
               r.staff_id,
               (SELECT COUNT(*) FROM reservas WHERE clase_id = c.id AND estado = 'confirmada') AS asistentes_confirmados
        FROM clases c
        JOIN reservas r ON c.id = r.clase_id
        WHERE c.entrenador_id = ? AND DATE(c.fecha_hora) = CURDATE()
        GROUP BY c.id
        ORDER BY c.fecha_hora ASC
    ");
    $stmt->execute([$user['id']]);
    $clases = $stmt->fetchAll();

    jsonResponse(['clases' => $clases]);

} else {
    jsonError('Método no permitido', 405);
}