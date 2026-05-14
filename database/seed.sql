-- ============================================================
-- FITFAB S.A.C. — Datos Semilla
-- Motor: MySQL / MariaDB (XAMPP)
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

USE fitfab;

-- -----------------------------------------------------------
-- Contraseñas:
--   Admin123      → admin@fitfab.com
--   Recep123      → recepcion@fitfab.com
--   Coach123      → marcos.trainer@fitfab.com
--   Coach123      → valeria.trainer@fitfab.com
--   Coach123      → luis.trainer@fitfab.com
--   Coach123      → sofia.trainer@fitfab.com
-- -----------------------------------------------------------

-- =============================================================
-- STAFF (6 usuarios: 1 admin, 1 recepcionista, 4 entrenadores)
-- =============================================================
INSERT INTO staff (nombre, email, password_hash, rol) VALUES
('Fabricio Administrador', 'admin@fitfab.com',
    SHA2('Admin123', 256), 'admin'),
('Lucía Recepción', 'recepcion@fitfab.com',
    SHA2('Recep123', 256), 'reception'),
('Marcos Torres', 'marcos.trainer@fitfab.com',
    SHA2('Coach123', 256), 'trainer'),
('Valeria Sánchez', 'valeria.trainer@fitfab.com',
    SHA2('Coach123', 256), 'trainer'),
('Luis Ramírez', 'luis.trainer@fitfab.com',
    SHA2('Coach123', 256), 'trainer'),
('Sofía Martínez', 'sofia.trainer@fitfab.com',
    SHA2('Coach123', 256), 'trainer');

-- =============================================================
-- PLANES (4 activos + 1 inactivo)
-- =============================================================
INSERT INTO planes (nombre, duracion_dias, precio, activo) VALUES
('Mensual Básico',    30,  80.00, 1),
('Mensual Ilimitado', 30, 120.00, 1),
('Trimestral VIP',    90, 300.00, 1),
('Anual Full',       365, 1000.00, 1),
('Promo Verano 2025', 60, 150.00, 0);

-- =============================================================
-- SOCIOS (6)
-- =============================================================
INSERT INTO socios (dni, nombres, apellidos, email, telefono, fecha_nacimiento) VALUES
('76543210', 'Carlos',   'Mendoza Rojas',  'carlos.m@email.com', '987654321', '1992-03-15'),
('45678912', 'María',    'Rodríguez Solano','maria.r@email.com',  '987654322', '1988-07-22'),
('73849501', 'Juan',     'Gonzáles Pérez',  'juan.g@email.com',   '987654323', '1995-11-08'),
('43210987', 'Ana María','Torres López',    'ana.t@email.com',    '987654324', '1990-05-30'),
('12345678', 'Carlos',   'López Vargas',    'carlos.l@email.com', '987654325', '1985-01-12'),
('87654321', 'Roberto',  'Salas Pinto',     'roberto.s@email.com','987654326', '1993-09-25');

-- =============================================================
-- MEMBRESÍAS (8)
-- =============================================================
INSERT INTO membresias (socio_id, plan_id, fecha_inicio, fecha_vencimiento, estado) VALUES
-- Carlos Mendoza: Mensual Ilimitado activo hasta Jun 2026
(1, 2, '2026-05-15', '2026-06-15', 'activo'),
-- Carlos Mendoza: membresía anterior ya vencida
(1, 2, '2026-04-15', '2026-05-14', 'vencido'),

-- María Rodríguez: Trimestral VIP — moroso (venció 01 May)
(2, 3, '2026-02-01', '2026-05-01', 'vencido'),

-- Juan Gonzáles: Mensual Ilimitado activo
(3, 2, '2026-05-01', '2026-06-01', 'activo'),

-- Ana María Torres: Trimestral VIP — le queda 1 mes
(4, 3, '2026-03-01', '2026-06-01', 'activo'),

-- Carlos López: Mensual Básico vencido (inactivo en UI)
(5, 1, '2025-11-20', '2025-12-20', 'vencido'),

-- Roberto Salas: Mensual Básico vencido
(6, 1, '2025-10-01', '2025-10-31', 'vencido'),
-- Roberto: intentó Anual Full pero canceló
(6, 4, '2025-09-01', '2026-09-01', 'cancelado');

-- =============================================================
-- PAGOS (10)
-- =============================================================
INSERT INTO pagos (socio_id, membresia_id, monto, metodo_pago, comprobante, fecha_pago) VALUES
-- Carlos Mendoza: 3 pagos mensuales de S/120
(1, 1, 120.00, 'yape_plin',      'B001-004523', '2026-05-15'),
(1, 2, 120.00, 'efectivo',       'B001-004112', '2026-04-15'),
(1, 2, 120.00, 'transferencia',  'B001-003889', '2026-03-15'),

-- María Rodríguez: 2 pagos — quedó morosa en mayo
(2, 3, 300.00, 'transferencia',  'B001-003500', '2026-02-01'),
(2, 3, 300.00, 'efectivo',       'B001-002801', '2025-11-01'),

-- Juan Gonzáles: 1 pago
(3, 4, 120.00, 'yape_plin',      'B001-004630', '2026-05-01'),

-- Ana María: 1 pago
(4, 5, 300.00, 'efectivo',       'B001-003921', '2026-03-01'),

-- Carlos López: pagó una vez y dejó vencer
(5, 6,  80.00, 'yape_plin',      'B001-000147', '2025-11-20'),

-- Roberto Salas: pagó su mensual básico
(6, 8, 80.00, 'transferencia',   'B001-000032', '2025-10-01');

-- =============================================================
-- CLASES (5)
-- =============================================================
INSERT INTO clases (nombre, entrenador_id, fecha_hora, duracion_minutos, capacidad_maxima, salon, estado) VALUES
('Yoga Nidra',    4, '2026-05-11 18:00:00', 60, 20, 'Salón Zen',       'programada'),
('Spinning Pro',  3, '2026-05-11 19:30:00', 60, 25, 'Salón Cardio 1',  'programada'),
('CrossFit WOD',  5, '2026-05-12 07:00:00', 90, 15, 'Box Funcional',    'programada'),
('HIIT Avanzado', 6, '2026-05-11 19:30:00', 60, 25, 'Salón Cardio 2',  'programada'),
('Yoga Integral', 4, '2026-05-12 18:00:00', 60, 20, 'Salón Zen',       'programada');

-- =============================================================
-- RESERVAS (14)
-- =============================================================
INSERT INTO reservas (clase_id, socio_id, estado) VALUES
-- Yoga Nidra: 12 de 20 (60%)
(1, 1, 'confirmada'),
(1, 2, 'confirmada'),
(1, 4, 'confirmada'),
(1, 6, 'confirmada'),

-- Spinning Pro: 25 de 25 (100% lleno)
(2, 1, 'confirmada'),
(2, 2, 'confirmada'),
(2, 3, 'confirmada'),
(2, 4, 'confirmada'),
(2, 5, 'confirmada'),

-- CrossFit WOD: 14 de 15 (93%)
(3, 1, 'confirmada'),
(3, 3, 'confirmada'),
(3, 4, 'confirmada'),
(3, 6, 'confirmada'),

-- HIIT Avanzado: 25 de 25 (lleno)
(4, 2, 'confirmada');

-- =============================================================
-- EQUIPOS (6)
-- =============================================================
INSERT INTO equipos (codigo, nombre, ubicacion, estado) VALUES
('EQ-001', 'Cinta de Correr ProForm',          'Zona Cardio',      'operativo'),
('EQ-014', 'Bicicleta Estática LifeFitness',    'Sala Spinning',    'mantenimiento'),
('EQ-032', 'Máquina de Poleas Cruzadas',        'Zona de Fuerza',   'fuera_servicio'),
('EQ-005', 'Bicicleta Elíptica LifeFitness',    'Salón Cardio 2',   'mantenimiento'),
('EQ-022', 'Prensa de Piernas 45°',             'Zona Pesas Libres','fuera_servicio'),
('EQ-002', 'Máquina de Remo Concept2',          'Zona Funcional',   'operativo');

-- =============================================================
-- MANTENIMIENTOS (4)
-- =============================================================
INSERT INTO mantenimientos (equipo_id, tipo, descripcion, reportado_por, tecnico_responsable, fecha_reporte, fecha_solucion) VALUES
(2, 'correctivo',  'La resistencia magnética no responde al panel de control. El socio reportó que se queda sin carga.', 5, 'Carlos Mendoza', '2026-05-08', NULL),
(3, 'correctivo',  'El cable de la polea superior se reventó durante una sesión de entrenamiento.',                    3, 'Carlos Mendoza', '2026-05-02', NULL),
(4, 'preventivo',  'Ruido extraño en los pedales al superar las 80 RPM. Se programa revisión de rodamientos.',         6, 'Carlos Mendoza', '2026-05-10', NULL),
(5, 'correctivo',  'El seguro de peso no engancha correctamente en la posición 3 y 4. Riesgo de seguridad.',          5, 'Carlos Mendoza', '2026-04-28', '2026-05-03');

-- =============================================================
-- CONFIGURACIÓN (3 valores)
-- =============================================================
INSERT INTO configuracion (clave, valor) VALUES
('nombre_empresa',     'FITFAB S.A.C.'),
('direccion',          'Av. Siempre Viva 123, Distrito Central'),
('telefono',           '+51 987654321');

-- =============================================================
-- ACCESOS (20 registros — simulación de aforo)
-- =============================================================
INSERT INTO accesos (socio_id, fecha_hora, tipo) VALUES
-- 11 May 2026 — día actual
(1, '2026-05-11 06:15:00', 'entrada'),
(2, '2026-05-11 07:00:00', 'entrada'),
(3, '2026-05-11 07:30:00', 'entrada'),
(4, '2026-05-11 08:00:00', 'entrada'),
(2, '2026-05-11 08:45:00', 'salida'),
(3, '2026-05-11 09:00:00', 'salida'),
(5, '2026-05-11 10:00:00', 'entrada'),

-- 10 May 2026
(1, '2026-05-10 06:10:00', 'entrada'),
(1, '2026-05-10 08:30:00', 'salida'),
(3, '2026-05-10 07:00:00', 'entrada'),
(3, '2026-05-10 09:15:00', 'salida'),
(4, '2026-05-10 16:00:00', 'entrada'),
(4, '2026-05-10 18:00:00', 'salida'),

-- 09 May 2026
(1, '2026-05-09 06:05:00', 'entrada'),
(1, '2026-05-09 08:20:00', 'salida'),
(2, '2026-05-09 07:30:00', 'entrada'),
(2, '2026-05-09 09:30:00', 'salida'),
(4, '2026-05-09 10:00:00', 'entrada'),
(4, '2026-05-09 11:30:00', 'salida'),
(6, '2026-05-09 15:00:00', 'entrada'),
(6, '2026-05-09 17:00:00', 'salida');
