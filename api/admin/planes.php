<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['admin', 'reception']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, nombre, precio, duracion_dias, descripcion
         FROM planes
         ORDER BY precio ASC"
    );
    jsonResponse(['planes' => $stmt->fetchAll()]);

} else {
    jsonError('Método no permitido', 405);
}