<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

$user = requireSocioAuth();

$stmt = $pdo->prepare(
    "SELECT p.id, p.monto, p.metodo_pago, p.comprobante, p.fecha_pago
     FROM pagos p WHERE p.socio_id = ? ORDER BY p.fecha_pago DESC LIMIT 20"
);
$stmt->execute([$user['id']]);
jsonResponse(['pagos' => $stmt->fetchAll()]);