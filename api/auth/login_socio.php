<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

$input = json_decode(file_get_contents('php://input'), true);

$dni             = trim($input['dni'] ?? '');
$fechaNac        = trim($input['fecha_nacimiento'] ?? '');

if (empty($dni) || empty($fechaNac)) {
    http_response_code(400);
    echo json_encode(['error' => 'DNI y fecha de nacimiento son requeridos']);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT s.id, s.dni, s.nombres, s.apellidos, s.email,
            p.nombre AS plan_nombre, p.precio AS plan_precio,
            m.fecha_vencimiento, m.estado AS membresia_estado
     FROM socios s
     LEFT JOIN membresias m ON s.id = m.socio_id AND m.estado = 'activo'
     LEFT JOIN planes p ON m.plan_id = p.id
     WHERE s.dni = ? AND s.fecha_nacimiento = ?"
);
$stmt->execute([$dni, $fechaNac]);
$socio = $stmt->fetch();

if (!$socio) {
    http_response_code(401);
    echo json_encode(['error' => 'Datos no encontrados. Verifica tu DNI y fecha de nacimiento.']);
    exit;
}

$userData = [
    'id'               => $socio['id'],
    'dni'              => $socio['dni'],
    'nombres'          => $socio['nombres'],
    'apellidos'        => $socio['apellidos'],
    'email'            => $socio['email'],
    'plan_nombre'      => $socio['plan_nombre'],
    'plan_precio'      => $socio['plan_precio'],
    'fecha_vencimiento'=> $socio['fecha_vencimiento'],
    'membresia_estado' => $socio['membresia_estado']
];

$token = $sessionManager->createSession($socio['id'], 'socio', $userData);

echo json_encode([
    'token' => $token,
    'user'  => $userData
]);