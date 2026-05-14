<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/auth_helpers.php';

requireSocioAuth();

$stmt = $pdo->query("
    SELECT c.id, c.nombre, s.nombre AS entrenador, c.fecha_hora,
           c.duracion_minutos, c.capacidad_maxima, c.salon,
           (SELECT COUNT(*) FROM reservas r WHERE r.clase_id = c.id AND r.estado = 'confirmada') AS reservas_confirmadas
    FROM clases c
    JOIN staff s ON c.entrenador_id = s.id
    WHERE c.fecha_hora > NOW() AND c.estado = 'programada'
    ORDER BY c.fecha_hora ASC
");
jsonResponse(['clases' => $stmt->fetchAll()]);