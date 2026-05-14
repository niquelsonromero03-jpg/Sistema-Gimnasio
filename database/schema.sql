-- ============================================================
-- FITFAB S.A.C. — Schema de Base de Datos
-- Motor: MySQL / MariaDB (XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS fitfab
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE fitfab;

-- -----------------------------------------------------------
-- 1. staff — Usuarios del sistema
-- -----------------------------------------------------------
CREATE TABLE staff (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(120)   NOT NULL,
    email       VARCHAR(180)   NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol         ENUM('admin','reception','trainer') NOT NULL,
    activo      TINYINT(1)     NOT NULL DEFAULT 1,
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 2. socios — Miembros del gimnasio
-- -----------------------------------------------------------
CREATE TABLE socios (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    dni              CHAR(8)        NOT NULL UNIQUE,
    nombres          VARCHAR(80)    NOT NULL,
    apellidos        VARCHAR(80)    NOT NULL,
    email            VARCHAR(180)   NULL,
    telefono         VARCHAR(20)    NULL,
    fecha_nacimiento DATE           NULL,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 3. planes — Catálogo de planes de membresía
-- -----------------------------------------------------------
CREATE TABLE planes (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100)   NOT NULL,
    duracion_dias  INT            NOT NULL,
    precio         DECIMAL(10,2)  NOT NULL,
    activo         TINYINT(1)     NOT NULL DEFAULT 1,
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 4. membresias — Plan contratado por un socio
-- -----------------------------------------------------------
CREATE TABLE membresias (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    socio_id           INT            NOT NULL,
    plan_id            INT            NOT NULL,
    fecha_inicio       DATE           NOT NULL,
    fecha_vencimiento  DATE           NOT NULL,
    estado             ENUM('activo','vencido','cancelado') NOT NULL DEFAULT 'activo',
    created_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (socio_id) REFERENCES socios(id),
    FOREIGN KEY (plan_id)  REFERENCES planes(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 5. pagos — Historial de cobros de membresías
-- -----------------------------------------------------------
CREATE TABLE pagos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    socio_id        INT            NOT NULL,
    membresia_id    INT            NULL,
    monto           DECIMAL(10,2)  NOT NULL,
    metodo_pago     ENUM('efectivo','transferencia','yape_plin') NOT NULL,
    comprobante     VARCHAR(30)    NULL,
    fecha_pago      DATE           NOT NULL,
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (socio_id)     REFERENCES socios(id),
    FOREIGN KEY (membresia_id) REFERENCES membresias(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 6. clases — Clases grupales programadas
-- -----------------------------------------------------------
CREATE TABLE clases (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(120)   NOT NULL,
    entrenador_id    INT            NOT NULL,
    fecha_hora       DATETIME       NOT NULL,
    duracion_minutos INT            NOT NULL DEFAULT 60,
    capacidad_maxima INT            NOT NULL,
    salon            VARCHAR(80)    NOT NULL,
    estado           ENUM('programada','en_curso','finalizada','cancelada') NOT NULL DEFAULT 'programada',
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entrenador_id) REFERENCES staff(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 7. reservas — Socios inscritos a una clase
-- -----------------------------------------------------------
CREATE TABLE reservas (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    clase_id  INT            NOT NULL,
    socio_id  INT            NOT NULL,
    estado    ENUM('confirmada','cancelada','asistio') NOT NULL DEFAULT 'confirmada',
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clase_id) REFERENCES clases(id),
    FOREIGN KEY (socio_id) REFERENCES socios(id),
    UNIQUE (clase_id, socio_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 8. equipos — Maquinaria del gimnasio
-- -----------------------------------------------------------
CREATE TABLE equipos (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    codigo    VARCHAR(20)    NOT NULL UNIQUE,
    nombre    VARCHAR(150)   NOT NULL,
    ubicacion VARCHAR(100)   NOT NULL,
    estado    ENUM('operativo','mantenimiento','fuera_servicio') NOT NULL DEFAULT 'operativo',
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 9. mantenimientos — Registro de incidencias de equipos
-- -----------------------------------------------------------
CREATE TABLE mantenimientos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id           INT            NOT NULL,
    tipo                ENUM('preventivo','correctivo') NOT NULL,
    descripcion         TEXT           NOT NULL,
    reportado_por       INT            NULL,
    tecnico_responsable VARCHAR(120)   NULL,
    fecha_reporte       DATE           NOT NULL,
    fecha_solucion      DATE           NULL,
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id)      REFERENCES equipos(id),
    FOREIGN KEY (reportado_por)  REFERENCES staff(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 10. configuracion — Parámetros del gimnasio (key-value)
-- -----------------------------------------------------------
CREATE TABLE configuracion (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(80)   NOT NULL UNIQUE,
    valor TEXT          NOT NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 11. accesos — Registro de entradas/salidas (control de aforo)
-- -----------------------------------------------------------
CREATE TABLE accesos (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    socio_id   INT            NOT NULL,
    fecha_hora DATETIME       NOT NULL,
    tipo       ENUM('entrada','salida') NOT NULL,
    created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (socio_id) REFERENCES socios(id)
) ENGINE=InnoDB;

-- ============================================================
-- Índices sugeridos para rendimiento
-- ============================================================
CREATE INDEX idx_membresias_socio    ON membresias(socio_id);
CREATE INDEX idx_membresias_estado   ON membresias(estado);
CREATE INDEX idx_pagos_socio         ON pagos(socio_id);
CREATE INDEX idx_pagos_fecha         ON pagos(fecha_pago);
CREATE INDEX idx_clases_fecha        ON clases(fecha_hora);
CREATE INDEX idx_clases_entrenador   ON clases(entrenador_id);
CREATE INDEX idx_reservas_clase      ON reservas(clase_id);
CREATE INDEX idx_reservas_socio      ON reservas(socio_id);
CREATE INDEX idx_mantenimientos_eq   ON mantenimientos(equipo_id);
CREATE INDEX idx_accesos_socio       ON accesos(socio_id);
CREATE INDEX idx_accesos_fecha       ON accesos(fecha_hora);
