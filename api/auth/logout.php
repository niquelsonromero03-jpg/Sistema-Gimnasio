<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

function getAuthToken() {
    $headers = getallheaders();
    foreach ($headers as $name => $value) {
        if (strtolower($name) === 'authorization') {
            return str_replace('Bearer ', '', $value);
        }
    }
    return null;
}

$token = getAuthToken();

if (empty($token)) {
    http_response_code(400);
    echo json_encode(['error' => 'Token no proporcionado']);
    exit;
}

$sessionManager->destroySession($token);

echo json_encode(['message' => 'Sesión cerrada correctamente']);