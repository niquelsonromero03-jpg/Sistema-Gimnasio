<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['admin', 'reception']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT s.id, s.dni, s.nombres, s.apellidos, s.email, s.telefono,
               s.fecha_nacimiento, s.created_at,
               p.nombre AS plan_nombre, p.precio AS plan_precio,
               m.fecha_vencimiento, m.estado
        FROM socios s
        LEFT JOIN membresias m ON s.id = m.socio_id AND m.estado = 'activo'
        LEFT JOIN planes p ON m.plan_id = p.id
        ORDER BY s.apellidos, s.nombres
    ");
    $socios = $stmt->fetchAll();
    jsonResponse(['socios' => $socios]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $dni             = trim($input['dni'] ?? '');
    $nombres         = trim($input['nombres'] ?? '');
    $apellidos       = trim($input['apellidos'] ?? '');
    $email           = trim($input['email'] ?? '');
    $telefono        = trim($input['telefono'] ?? '');
    $fecha_nacimiento = trim($input['fecha_nacimiento'] ?? '');
    $plan_id         = (int)($input['plan_id'] ?? 0);

    if (empty($dni) || empty($nombres) || empty($apellidos)) {
        jsonError('DNI, nombres y apellidos son requeridos', 400);
    }

    if (!preg_match('/^[0-9]{8}$/', $dni)) {
        jsonError('El DNI debe tener exactamente 8 dígitos', 400);
    }

    $check = $pdo->prepare("SELECT id FROM socios WHERE dni = ?");
    $check->execute([$dni]);
    if ($check->fetch()) {
        jsonError('Ya existe un socio con este DNI', 409);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO socios (dni, nombres, apellidos, email, telefono, fecha_nacimiento)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$dni, $nombres, $apellidos, $email ?: null, $telefono ?: null, $fecha_nacimiento ?: null]);
    $socioId = $pdo->lastInsertId();

    if ($plan_id > 0) {
        $stmtPlan = $pdo->prepare("SELECT duracion_dias, precio FROM planes WHERE id = ?");
        $stmtPlan->execute([$plan_id]);
        $plan = $stmtPlan->fetch();

        if ($plan) {
            $fechaInicio = date('Y-m-d');
            $fechaVencimiento = date('Y-m-d', strtotime("+{$plan['duracion_dias']} days"));

            $stmtMem = $pdo->prepare(
                "INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_vencimiento, estado)
                 VALUES (?, ?, ?, ?, 'activo')"
            );
            $stmtMem->execute([$socioId, $plan_id, $fechaInicio, $fechaVencimiento]);
        }
    }

    jsonResponse(['id' => $socioId, 'message' => 'Socio creado correctamente'], 201);

} else {
    jsonError('Método no permitido', 405);
}