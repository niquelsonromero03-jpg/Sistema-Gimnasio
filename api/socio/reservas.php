<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireSocioAuth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare(
        "SELECT r.id, c.nombre AS clase, s.nombre AS entrenador,
                c.fecha_hora, c.salon, r.estado, r.created_at
         FROM reservas r
         JOIN clases c ON r.clase_id = c.id
         JOIN staff s ON c.entrenador_id = s.id
         WHERE r.socio_id = ?
         ORDER BY c.fecha_hora DESC"
    );
    $stmt->execute([$user['id']]);
    jsonResponse(['reservas' => $stmt->fetchAll()]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $clase_id = (int)($input['clase_id'] ?? 0);

    if ($clase_id <= 0) {
        jsonError('ID de clase es requerido', 400);
    }

    $stmt = $pdo->prepare("SELECT capacidad_maxima FROM clases WHERE id = ?");
    $stmt->execute([$clase_id]);
    $clase = $stmt->fetch();

    if (!$clase) {
        jsonError('Clase no encontrada', 404);
    }

    $stmtCount = $pdo->prepare(
        "SELECT COUNT(*) AS total FROM reservas WHERE clase_id = ? AND estado = 'confirmada'"
    );
    $stmtCount->execute([$clase_id]);
    $reservados = (int)$stmtCount->fetch()['total'];

    if ($reservados >= $clase['capacidad_maxima']) {
        jsonError('La clase está llena. No hay lugares disponibles.', 409);
    }

    $stmtCheck = $pdo->prepare(
        "SELECT id FROM reservas WHERE clase_id = ? AND socio_id = ? AND estado = 'confirmada'"
    );
    $stmtCheck->execute([$clase_id, $user['id']]);
    if ($stmtCheck->fetch()) {
        jsonError('Ya estás inscrito en esta clase', 409);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO reservas (clase_id, socio_id, estado) VALUES (?, ?, 'confirmada')"
    );
    $stmt->execute([$clase_id, $user['id']]);

    jsonResponse(['id' => $pdo->lastInsertId(), 'message' => 'Reserva confirmada'], 201);

} else {
    jsonError('Método no permitido', 405);
}