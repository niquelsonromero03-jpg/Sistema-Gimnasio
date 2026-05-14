<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

class SessionManager {
    private $pdo;
    private $sessionLifetime = 86400; // 24 hours

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function createSession($userId, $userType, $data = null) {
        $sessionId = bin2hex(random_bytes(32));

        $stmt = $this->pdo->prepare(
            "INSERT INTO sessions (session_id, user_id, user_type, data, ip_address, user_agent, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))"
        );

        $stmt->execute([
            $sessionId,
            $userId,
            $userType,
            $data ? json_encode($data) : null,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null,
            $this->sessionLifetime
        ]);

        return $sessionId;
    }

    public function validateSession($sessionId) {
        if (empty($sessionId)) return null;

        $stmt = $this->pdo->prepare(
            "SELECT * FROM sessions WHERE session_id = ? AND expires_at > NOW()"
        );
        $stmt->execute([$sessionId]);
        return $stmt->fetch();
    }

    public function destroySession($sessionId) {
        $stmt = $this->pdo->prepare("DELETE FROM sessions WHERE session_id = ?");
        $stmt->execute([$sessionId]);
    }

    public function getUserFromSession($sessionId) {
        $session = $this->validateSession($sessionId);
        if (!$session) return null;

        if ($session['user_type'] === 'staff') {
            $stmt = $this->pdo->prepare("SELECT id, nombre, email, rol FROM staff WHERE id = ? AND activo = 1");
        } else {
            $stmt = $this->pdo->prepare(
                "SELECT s.id, s.dni, s.nombres, s.apellidos, s.email,
                        p.nombre AS plan_nombre, p.precio AS plan_precio,
                        m.fecha_vencimiento, m.estado AS membresia_estado
                 FROM socios s
                 LEFT JOIN membresias m ON s.id = m.socio_id AND m.estado = 'activo'
                 LEFT JOIN planes p ON m.plan_id = p.id
                 WHERE s.id = ?"
            );
        }
        $stmt->execute([$session['user_id']]);
        return $stmt->fetch();
    }
}

$sessionManager = new SessionManager($pdo);