<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireAuth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT p.id, s.dni, CONCAT(s.nombres, ' ', s.apellidos) AS socio,
                p.monto, p.metodo_pago, p.comprobante, p.fecha_pago
         FROM pagos p JOIN socios s ON p.socio_id = s.id
         ORDER BY p.fecha_pago DESC LIMIT 50"
    );
    jsonResponse(['pagos' => $stmt->fetchAll()]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $socio_id    = (int)($input['socio_id'] ?? 0);
    $monto       = (float)($input['monto'] ?? 0);
    $metodo_pago = trim($input['metodo_pago'] ?? '');

    if ($socio_id <= 0 || $monto <= 0 || empty($metodo_pago)) {
        jsonError('Socio, monto y método de pago son requeridos', 400);
    }

    $comprobante = 'B' . str_pad((int)date('dmY'), 8, '0', STR_PAD_LEFT) . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare(
        "INSERT INTO pagos (socio_id, monto, metodo_pago, comprobante, fecha_pago)
         VALUES (?, ?, ?, ?, CURDATE())"
    );
    $stmt->execute([$socio_id, $monto, $metodo_pago, $comprobante]);

    jsonResponse(['comprobante' => $comprobante, 'message' => 'Cobro registrado'], 201);

} else {
    jsonError('Método no permitido', 405);
}