<?php
header('Content-Type: application/json; charset=utf-8');

function getAuthorizationHeader() {
    $headers = getallheaders();
    foreach ($headers as $name => $value) {
        if (strtolower($name) === 'authorization') {
            return $value;
        }
    }
    return null;
}

function requireAuth($requiredRoles = []) {
    global $sessionManager;

    $token = getAuthorizationHeader();
    if ($token) {
        $token = str_replace('Bearer ', '', $token);
    }

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

    if ($session['user_type'] !== 'staff') {
        http_response_code(403);
        echo json_encode(['error' => 'Acceso denegado']);
        exit;
    }

    $user = $sessionManager->getUserFromSession($token);

    if (!empty($requiredRoles) && !in_array($user['rol'], $requiredRoles)) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permisos para esta acción']);
        exit;
    }

    return $user;
}

function requireSocioAuth() {
    global $sessionManager;

    $token = getAuthorizationHeader();
    if ($token) {
        $token = str_replace('Bearer ', '', $token);
    }

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

    if ($session['user_type'] !== 'socio') {
        http_response_code(403);
        echo json_encode(['error' => 'Acceso denegado']);
        exit;
    }

    return $sessionManager->getUserFromSession($token);
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
}

function jsonError($message, $status = 400) {
    http_response_code($status);
    echo json_encode(['error' => $message]);
}