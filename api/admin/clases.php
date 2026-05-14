<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['admin', 'reception', 'trainer']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT c.id, c.nombre, s.nombre AS entrenador, c.fecha_hora,
               c.duracion_minutos, c.capacidad_maxima, c.salon, c.estado,
               (SELECT COUNT(*) FROM reservas r WHERE r.clase_id = c.id AND r.estado = 'confirmada') AS reservas_confirmadas
        FROM clases c
        JOIN staff s ON c.entrenador_id = s.id
        ORDER BY c.fecha_hora ASC
    ");
    $clases = $stmt->fetchAll();
    jsonResponse(['clases' => $clases]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $nombre           = trim($input['nombre'] ?? '');
    $entrenador_id    = (int)($input['entrenador_id'] ?? 0);
    $fecha_hora       = trim($input['fecha_hora'] ?? '');
    $duracion_minutos = (int)($input['duracion_minutos'] ?? 60);
    $capacidad_maxima = (int)($input['capacidad_maxima'] ?? 20);
    $salon            = trim($input['salon'] ?? '');

    if (empty($nombre) || empty($fecha_hora) || empty($salon) || $entrenador_id <= 0) {
        jsonError('Nombre, entrenador, fecha/hora y salón son requeridos', 400);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO clases (nombre, entrenador_id, fecha_hora, duracion_minutos, capacidad_maxima, salon)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$nombre, $entrenador_id, $fecha_hora, $duracion_minutos, $capacidad_maxima, $salon]);

    jsonResponse(['id' => $pdo->lastInsertId(), 'message' => 'Clase programada correctamente'], 201);

} else {
    jsonError('Método no permitido', 405);
}