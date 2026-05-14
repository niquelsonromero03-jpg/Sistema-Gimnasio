<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth(['admin', 'reception']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT p.id, s.dni, CONCAT(s.nombres, ' ', s.apellidos) AS socio,
               p.monto, p.metodo_pago, p.comprobante, p.fecha_pago, p.created_at,
               m.estado AS membresia_estado
        FROM pagos p
        JOIN socios s ON p.socio_id = s.id
        LEFT JOIN membresias m ON p.membresia_id = m.id
        ORDER BY p.fecha_pago DESC, p.id DESC
    ");
    $pagos = $stmt->fetchAll();
    jsonResponse(['pagos' => $pagos]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $socio_id   = (int)($input['socio_id'] ?? 0);
    $monto      = (float)($input['monto'] ?? 0);
    $metodo_pago = trim($input['metodo_pago'] ?? '');
    $plan_id    = (int)($input['plan_id'] ?? 0);

    if ($socio_id <= 0 || $monto <= 0 || empty($metodo_pago)) {
        jsonError('Socio, monto y método de pago son requeridos', 400);
    }

    $stmtCheck = $pdo->prepare("SELECT id FROM socios WHERE id = ?");
    $stmtCheck->execute([$socio_id]);
    if (!$stmtCheck->fetch()) {
        jsonError('Socio no encontrado', 404);
    }

    $comprobante = 'B' . str_pad((int)date('dmY'), 8, '0', STR_PAD_LEFT) . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);

    $membresiaId = null;
    if ($plan_id > 0) {
        $stmtPlan = $pdo->prepare("SELECT duracion_dias FROM planes WHERE id = ?");
        $stmtPlan->execute([$plan_id]);
        $plan = $stmtPlan->fetch();

        if ($plan) {
            $fechaInicio = date('Y-m-d');
            $fechaVencimiento = date('Y-m-d', strtotime("+{$plan['duracion_dias']} days"));

            $stmtMem = $pdo->prepare(
                "INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_vencimiento, estado)
                 VALUES (?, ?, ?, ?, 'activo')"
            );
            $stmtMem->execute([$socio_id, $plan_id, $fechaInicio, $fechaVencimiento]);
            $membresiaId = $pdo->lastInsertId();
        }
    }

    $stmt = $pdo->prepare(
        "INSERT INTO pagos (socio_id, membresia_id, monto, metodo_pago, comprobante, fecha_pago)
         VALUES (?, ?, ?, ?, ?, CURDATE())"
    );
    $stmt->execute([$socio_id, $membresiaId, $monto, $metodo_pago, $comprobante]);

    jsonResponse([
        'id' => $pdo->lastInsertId(),
        'comprobante' => $comprobante,
        'message' => 'Pago registrado correctamente'
    ], 201);

} else {
    jsonError('Método no permitido', 405);
}