-- ==============================================================================
-- SCHOOLTRACK 2026 - SCRIPT DE INSERCIÓN DE DATOS INICIALES (SEED DATA)
-- Base de Datos: PostgreSQL (RDS / Local)
-- ==============================================================================

-- 1. ROLES
INSERT INTO rol (id_rol, nombre_rol)
VALUES 
    (1, 'Administrador'),
    (2, 'Conductor'),
    (3, 'Acudiente')
ON CONFLICT (id_rol) DO UPDATE 
SET nombre_rol = EXCLUDED.nombre_rol;

-- Sincronizar secuencia de rol
SELECT setval(pg_get_serial_sequence('rol', 'id_rol'), COALESCE((SELECT MAX(id_rol) FROM rol), 1));


-- 2. USUARIOS POR DEFECTO DEL LOGIN
-- Nota: La API de .NET acepta la contraseña en texto plano y la encripta automáticamente con BCrypt al primer inicio de sesión.
INSERT INTO usuario (id_usuario, id_rol, nombre, apellido, correo, contrasena, telefono, fecha_creacion)
VALUES 
    (1, 1, 'Administrador', 'General', 'admin@schooltrack.com', 'admin123', '3001234567', NOW()),
    (2, 2, 'Carlos', 'Mendoza', 'conductor.carlos@schooltrack.com', 'conductor123', '3109876543', NOW()),
    (3, 3, 'María', 'Gómez', 'acudiente.maria@schooltrack.com', 'acudiente123', '3205551234', NOW())
ON CONFLICT (id_usuario) DO UPDATE 
SET 
    id_rol = EXCLUDED.id_rol,
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    correo = EXCLUDED.correo,
    contrasena = EXCLUDED.contrasena,
    telefono = EXCLUDED.telefono;

-- Sincronizar secuencia de usuario
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'), COALESCE((SELECT MAX(id_usuario) FROM usuario), 1));


-- 3. VEHÍCULO DE PRUEBA
INSERT INTO vehiculo (id_vehiculo, placa, modelo, capacidad_pasajeros, soat_vencimiento, tecnomecanica_vencimiento)
VALUES 
    (1, 'STR-2026', 'Mercedes-Benz Sprinter 2024', 20, '2027-12-31', '2027-12-31')
ON CONFLICT (id_vehiculo) DO UPDATE 
SET 
    placa = EXCLUDED.placa,
    modelo = EXCLUDED.modelo,
    capacidad_pasajeros = EXCLUDED.capacidad_pasajeros;

-- Sincronizar secuencia de vehiculo
SELECT setval(pg_get_serial_sequence('vehiculo', 'id_vehiculo'), COALESCE((SELECT MAX(id_vehiculo) FROM vehiculo), 1));


-- 4. CONDUCTOR (Vinculado a usuario id 2 y vehiculo id 1)
INSERT INTO conductor (id_conductor, id_usuario, id_vehiculo, numero_licencia, categoria_licencia)
VALUES 
    (1, 2, 1, 'LIC-98765432-COL', 'C2')
ON CONFLICT (id_conductor) DO UPDATE 
SET 
    id_usuario = EXCLUDED.id_usuario,
    id_vehiculo = EXCLUDED.id_vehiculo,
    numero_licencia = EXCLUDED.numero_licencia,
    categoria_licencia = EXCLUDED.categoria_licencia;

-- Sincronizar secuencia de conductor
SELECT setval(pg_get_serial_sequence('conductor', 'id_conductor'), COALESCE((SELECT MAX(id_conductor) FROM conductor), 1));


-- 5. ACUDIENTE (Vinculado a usuario id 3)
INSERT INTO acudiente (id_acudiente, id_usuario, direccion_residencia)
VALUES 
    (1, 3, 'Calle 127 # 45-20, Bogotá D.C.')
ON CONFLICT (id_acudiente) DO UPDATE 
SET 
    id_usuario = EXCLUDED.id_usuario,
    direccion_residencia = EXCLUDED.direccion_residencia;

-- Sincronizar secuencia de acudiente
SELECT setval(pg_get_serial_sequence('acudiente', 'id_acudiente'), COALESCE((SELECT MAX(id_acudiente) FROM acudiente), 1));


-- 6. RUTA ESCOLAR
INSERT INTO ruta (id_ruta, nombre_ruta, descripcion, estado)
VALUES 
    (1, 'Ruta Norte 01 - Principal', 'Recorrido matutino hacia el Colegio San Patricio', true)
ON CONFLICT (id_ruta) DO UPDATE 
SET 
    nombre_ruta = EXCLUDED.nombre_ruta,
    descripcion = EXCLUDED.descripcion,
    estado = EXCLUDED.estado;

-- Sincronizar secuencia de ruta
SELECT setval(pg_get_serial_sequence('ruta', 'id_ruta'), COALESCE((SELECT MAX(id_ruta) FROM ruta), 1));


-- 7. PARADAS DE LA RUTA (Coordenadas en Bogotá para dibujo en Leaflet)
INSERT INTO parada (id_parada, id_ruta, nombre_parada, latitud, longitud, orden_visita)
VALUES 
    (1, 1, 'Parada 1: Residencia Familiar Gómez (Cl. 127)', 4.7120, -74.0710, 1),
    (2, 1, 'Parada 2: Parque Cedritos (Cl. 140)', 4.7215, -74.0620, 2),
    (3, 1, 'Parada 3: Colegio Mayor San Patricio', 4.7350, -74.0530, 3)
ON CONFLICT (id_parada) DO UPDATE 
SET 
    id_ruta = EXCLUDED.id_ruta,
    nombre_parada = EXCLUDED.nombre_parada,
    latitud = EXCLUDED.latitud,
    longitud = EXCLUDED.longitud,
    orden_visita = EXCLUDED.orden_visita;

-- Sincronizar secuencia de parada
SELECT setval(pg_get_serial_sequence('parada', 'id_parada'), COALESCE((SELECT MAX(id_parada) FROM parada), 1));


-- 8. ESTUDIANTE (Hijo de la acudiente María, asignado a la parada 1 y ruta 1)
INSERT INTO estudiante (id_estudiante, id_acudiente, nombre, apellido, colegio, curso_grado, estado, id_ruta, id_parada)
VALUES 
    (1, 1, 'Mateo', 'Gómez', 'Colegio Mayor San Patricio', '6° Primaria', true, 1, 1)
ON CONFLICT (id_estudiante) DO UPDATE 
SET 
    id_acudiente = EXCLUDED.id_acudiente,
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    colegio = EXCLUDED.colegio,
    curso_grado = EXCLUDED.curso_grado,
    estado = EXCLUDED.estado,
    id_ruta = EXCLUDED.id_ruta,
    id_parada = EXCLUDED.id_parada;

-- Sincronizar secuencia de estudiante
SELECT setval(pg_get_serial_sequence('estudiante', 'id_estudiante'), COALESCE((SELECT MAX(id_estudiante) FROM estudiante), 1));


-- 9. VIAJE ACTIVO EN HISTORIAL (Para probar el mapa interactivo y tracking GPS en vivo)
INSERT INTO historial (id_viaje, id_vehiculo, id_conductor, fecha, hora_inicio, hora_fin, estado_viaje, latitud_actual, longitud_actual)
VALUES 
    (1, 1, 1, CURRENT_DATE, '06:30:00', NULL, 'En progreso', 4.7150, -74.0680)
ON CONFLICT (id_viaje) DO UPDATE 
SET 
    id_vehiculo = EXCLUDED.id_vehiculo,
    id_conductor = EXCLUDED.id_conductor,
    estado_viaje = EXCLUDED.estado_viaje,
    latitud_actual = EXCLUDED.latitud_actual,
    longitud_actual = EXCLUDED.longitud_actual;

-- Sincronizar secuencia de historial
SELECT setval(pg_get_serial_sequence('historial', 'id_viaje'), COALESCE((SELECT MAX(id_viaje) FROM historial), 1));


-- 10. ASISTENCIA DEL VIAJE ACTIVO (Estado del estudiante en el recorrido)
INSERT INTO asistencia_viaje (id_asistencia, id_viaje, id_estudiante, estado_abordaje, hora_abordaje, hora_entrega)
VALUES 
    (1, 1, 1, 'Abordo', '06:45:00', NULL)
ON CONFLICT (id_asistencia) DO UPDATE 
SET 
    id_viaje = EXCLUDED.id_viaje,
    id_estudiante = EXCLUDED.id_estudiante,
    estado_abordaje = EXCLUDED.estado_abordaje,
    hora_abordaje = EXCLUDED.hora_abordaje;

-- Sincronizar secuencia de asistencia_viaje
SELECT setval(pg_get_serial_sequence('asistencia_viaje', 'id_asistencia'), COALESCE((SELECT MAX(id_asistencia) FROM asistencia_viaje), 1));
