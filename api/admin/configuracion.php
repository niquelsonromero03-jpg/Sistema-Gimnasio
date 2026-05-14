<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['admin']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, nombre, duracion_dias, precio, activo FROM planes WHERE activo = 1 ORDER BY precio");
    jsonResponse(['planes' => $stmt->fetchAll()]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $nombre        = trim($input['nombre'] ?? '');
    $duracion_dias = (int)($input['duracion_dias'] ?? 0);
    $precio        = (float)($input['precio'] ?? 0);

    if (empty($nombre) || $duracion_dias <= 0 || $precio <= 0) {
        jsonError('Nombre, duración y precio son requeridos', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO planes (nombre, duracion_dias, precio) VALUES (?, ?, ?)");
    $stmt->execute([$nombre, $duracion_dias, $precio]);

    jsonResponse(['id' => $pdo->lastInsertId(), 'message' => 'Plan creado'], 201);

} else {
    jsonError('Método no permitido', 405);
}