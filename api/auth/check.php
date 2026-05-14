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
    http_response_code(401);
    echo json_encode(['error' => 'Token no proporcionado']);
    exit;
}

$session = $sessionManager->validateSession($token);

if (!$session) {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida o expirada']);
    exit;
}

$user = $sessionManager->getUserFromSession($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'user'          => $user,
    'user_type'     => $session['user_type']
]);