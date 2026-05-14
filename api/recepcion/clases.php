<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(); // any staff type

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT id, codigo, nombre, ubicacion, estado FROM equipos ORDER BY codigo"
    );
    jsonResponse(['equipos' => $stmt->fetchAll()]);

} else {
    jsonError('Método no permitido', 405);
}