<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['admin', 'trainer']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, codigo, nombre, ubicacion, estado FROM equipos ORDER BY codigo"
    );
    jsonResponse(['equipos' => $stmt->fetchAll()]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $tipo                = trim($input['tipo'] ?? '');
    $descripcion         = trim($input['descripcion'] ?? '');
    $equipo_id           = (int)($input['equipo_id'] ?? 0);
    $tecnico_responsable = trim($input['tecnico_responsable'] ?? '');

    if ($equipo_id <= 0 || empty($tipo) || empty($descripcion)) {
        jsonError('Equipo, tipo y descripción son requeridos', 400);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO mantenimientos (equipo_id, tipo, descripcion, reportado_por, tecnico_responsable, fecha_reporte)
         VALUES (?, ?, ?, ?, ?, CURDATE())"
    );
    $stmt->execute([$equipo_id, $tipo, $descripcion, $user['id'], $tecnico_responsable ?: null]);

    jsonResponse(['id' => $pdo->lastInsertId(), 'message' => 'Incidencia registrada'], 201);

} else {
    jsonError('Método no permitido', 405);
}