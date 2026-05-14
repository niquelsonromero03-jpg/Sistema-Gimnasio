<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

$input = json_decode(file_get_contents('php://input'), true);

$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email y contraseña son requeridos']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, nombre, email, password_hash, rol FROM staff WHERE email = ? AND activo = 1");
$stmt->execute([$email]);
$staff = $stmt->fetch();

if (!$staff || hash('sha256', $password) !== $staff['password_hash']) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales inválidas']);
    exit;
}

$userData = [
    'id'     => $staff['id'],
    'nombre' => $staff['nombre'],
    'email'  => $staff['email'],
    'rol'    => $staff['rol']
];

$token = $sessionManager->createSession($staff['id'], 'staff', $userData);

echo json_encode([
    'token' => $token,
    'user'  => $userData
]);