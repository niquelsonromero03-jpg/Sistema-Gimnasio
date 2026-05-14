-- ============================================================
-- FITFAB S.A.C. — Sessions Table
-- Add to existing fitfab database
-- ============================================================

USE fitfab;

CREATE TABLE IF NOT EXISTS sessions (
    session_id    VARCHAR(128) PRIMARY KEY,
    user_id       INT          NOT NULL,
    user_type     ENUM('staff','socio') NOT NULL,
    data          TEXT          NULL,
    ip_address    VARCHAR(45)   NULL,
    user_agent    VARCHAR(255)  NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at    TIMESTAMP     NOT NULL,
    INDEX idx_expires (expires_at),
    INDEX idx_user (user_id, user_type)
) ENGINE=InnoDB;