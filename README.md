<<<<<<< HEAD
# FITFAB S.A.C. - Sistema de Gimnasio

Sistema de gestión de gimnasio con frontend HTML/CSS/JS y backend PHP REST API con MySQL.

## Requisitos

- **XAMPP** (Apache + MySQL) o **Laragon** (Apache + MySQL/MariaDB)
- **PHP** 8.0+
- **MySQL** / **MariaDB** 5.7+

## Puertos

Por defecto el proyecto corre en **http://localhost:8080/gimnasio/** ya que Laragon puede usar el puerto 80 (IIS en algunos equipos). Verifica que Apache esté corriendo en el puerto 8080.

## Levantarlo

### 1. Configurar Apache

En `httpd.conf` de XAMPP o en Laragon, asegúrate de que el puerto 8080 esté activo:

```
Listen 8080
```

Y que el DocumentRoot apunte a la carpeta del proyecto o agrega un alias:

```apache
Alias /gimnasio "C:/xampp/htdocs/gimnasio"
<Directory "C:/xampp/htdocs/gimnasio">
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    Require all granted
</Directory>
```

### 2. Crear la base de datos

Abre phpMyAdmin (http://localhost:8080/phpmyadmin/) o MySQL CLI y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS fitfab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Importar el esquema

En phpMyAdmin: Importar `database/schema.sql`

O desde la terminal:

```bash
mysql -u root -p fitfab < C:/xampp/htdocs/gimnasio/database/schema.sql
```

### 4. Poblar con datos de prueba (Seeder)

Desde phpMyAdmin: Importar `database/seed.sql`

O desde la terminal:

```bash
mysql -u root -p fitfab < C:/xampp/htdocs/gimnasio/database/seed.sql
```

Esto crea:
- 6 usuarios staff (admin, recepción, entrenadores)
- 6 socios de prueba
- 5 planes de membresía
- 8 membresías activas
- 9 pagos registrados
- 5 clases programadas
- 14 reservas
- 6 equipos
- 4 registros de mantenimiento

### 5. Verificar que todo esté corriendo

```bash
# Test de conexión a la BD
php -r '
$pdo = new PDO("mysql:host=localhost;dbname=fitfab", "root", "");
echo "Conexión OK - Versión MySQL: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
'

# Test del API (primero inicia sesión)
curl -X POST http://localhost:8080/gimnasio/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@fitfab.com\",\"password\":\"Admin123\"}"
```

## Credenciales de prueba

### Staff (login en /login.html)

| Email | Contraseña | Rol |
|---|---|---|
| admin@fitfab.com | Admin123 | Administrador |
| recepcion@fitfab.com | Recep123 | Recepcionista |
| marcos.trainer@fitfab.com | Coach123 | Entrenador |
| valerias.trainer@fitfab.com | Coach123 | Entrenador |

### Socios (login en /login_socio.html)

| DNI | Fecha de nacimiento | Nombre |
|---|---|---|
| 76543210 | 1992-03-15 | Carlos Mendoza |
| 43210987 | 1988-07-22 | Ana María Torres |
| 12345678 | 1995-12-03 | Roberto Salas |

## Rutas principales

| Ruta | Descripción |
|---|---|
| http://localhost:8080/gimnasio/ | Redirect a login |
| http://localhost:8080/gimnasio/login.html | Login staff |
| http://localhost:8080/gimnasio/login_socio.html | Login socio |
| http://localhost:8080/gimnasio/views/admin/index.html | Dashboard admin |
| http://localhost:8080/gimnasio/views/admin/socios.html | Gestión de socios |
| http://localhost:8080/gimnasio/views/admin/clases.html | Clases y reservas |
| http://localhost:8080/gimnasio/views/admin/pagos.html | Pagos y facturación |
| http://localhost:8080/gimnasio/views/admin/mantenimiento.html | Mantenimiento de equipos |
| http://localhost:8080/gimnasio/views/admin/configuracion.html | Configuración |
| http://localhost:8080/gimnasio/views/recepcion/recepcion.html | Recepción home |
| http://localhost:8080/gimnasio/views/recepcion/recepcion_socios.html | Gestión de socios |
| http://localhost:8080/gimnasio/views/recepcion/recepcion_pagos.html | Caja y facturación |
| http://localhost:8080/gimnasio/views/recepcion/recepcion_clases.html | Clases y reservas |
| http://localhost:8080/gimnasio/views/socio/socio.html | Mi QR (perfil socio) |
| http://localhost:8080/gimnasio/views/socio/socio_clases.html | Reservar clases |
| http://localhost:8080/gimnasio/views/socio/socio_pagos.html | Mis pagos |
| http://localhost:8080/gimnasio/views/entrenador/entrenador.html | Mis clases |
| http://localhost:8080/gimnasio/views/entrenador/entrenador_equipos.html | Reporte de equipos |

## Estructura del proyecto

```
gimnasio/
├── api/                    # Backend PHP REST API
│   ├── admin/              # Endpoints admin (dashboard, socios, clases, pagos, equipos, configuracion)
│   ├── auth/               # Login, logout, check session
│   ├── config/             # Database, session, auth helpers
│   ├── recepcion/          # Endpoints recepcion (clases, pagos)
│   ├── socio/              # Endpoints socio (perfil, clases, reservas, pagos)
│   └── entrenador/         # Endpoints entrenador (clases, asistentes)
├── database/
│   ├── schema.sql          # DDL - 11 tablas
│   ├── seed.sql            # Datos de prueba
│   └── sessions.sql        # Tabla de sesiones (ya incluido en schema.sql)
├── public/
│   ├── css/                # Estilos CSS
│   ├── js/                 # JavaScript frontend
│   │   ├── admin/          # Scripts para vistas admin
│   │   ├── recepcion/      # Scripts para vistas recepcion
│   │   ├── socio/          # Scripts para vistas socio
│   │   ├── entrenador/     # Scripts para vistas entrenador
│   │   └── shared/         # api.js, auth.js, utils.js (compartidos)
│   └── img/                # Imágenes y assets
└── views/                  # Vistas HTML por rol
    ├── admin/
    ├── recepcion/
    ├── socio/
    └── entrenador/
```

## Notas técnicas

- **Sesiones**: guardadas en MySQL (tabla `sessions`), no en PHP native sessions. Token Bearer de 24h de expiry.
- **Auth header**: se usa `getallheaders()` en PHP porque IIS/Laragon puede filtrar `$_SERVER['HTTP_AUTHORIZATION']`.
- **API Base**: hardcodeado como `http://localhost:8080/gimnasio/api` en `public/js/shared/api.js`.
- **CORS**: no aplicable (mismo origen) pero el API usa JSON exclusivamente.

## Comandos útiles

### Reset completo de la base de datos

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS fitfab; CREATE DATABASE fitfab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p fitfab < C:/xampp/htdocs/gimnasio/database/schema.sql
mysql -u root -p fitfab < C:/xampp/htdocs/gimnasio/database/seed.sql
```

### Ver sesiones activas en la BD

```sql
USE fitfab;
SELECT * FROM sessions WHERE expires_at > NOW();
```

### Ver todos los pagos

```sql
USE fitfab;
SELECT p.id, s.dni, s.nombres, s.apellidos, p.monto, p.metodo_pago, p.comprobante, p.fecha_pago
FROM pagos p JOIN socios s ON p.socio_id = s.id
ORDER BY p.fecha_pago DESC, p.id DESC;
```

### Ver estado de membresías

```sql
USE fitfab;
SELECT s.dni, CONCAT(s.nombres, ' ', s.apellidos) AS socio,
       p.nombre AS plan, m.fecha_vencimiento, m.estado
FROM socios s
LEFT JOIN membresias m ON s.id = m.socio_id AND m.estado = 'activo'
LEFT JOIN planes p ON m.plan_id = p.id
ORDER BY m.fecha_vencimiento ASC;
```
=======
# Sistema-Gimnasio
>>>>>>> 11ac4b47ca04b5b7c5ab9886d4a5b86d281fee0e
