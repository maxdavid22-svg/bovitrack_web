-- Script para poblar datos de ejemplo de producción
-- Incluye bovinos de diferentes finalidades y eventos de ordeño/engorde de fechas anteriores

-- Insertar bovinos de ejemplo con diferentes finalidades productivas
INSERT INTO bovinos (codigo, nombre, raza, sexo, fecha_nacimiento, estado, finalidad_productiva, peso_actual, id_propietario, nombre_propietario, created_at) VALUES
-- Bovinos de leche
('L001', 'Bella', 'Holstein', 'Hembra', '2020-03-15', 'Activo', 'Leche', 580.0, 'prop1', 'Juan Pérez', '2024-01-01'),
('L002', 'Luna', 'Holstein', 'Hembra', '2019-08-20', 'Activo', 'Leche', 620.0, 'prop1', 'Juan Pérez', '2024-01-01'),
('L003', 'Estrella', 'Jersey', 'Hembra', '2021-01-10', 'Activo', 'Leche', 450.0, 'prop2', 'María García', '2024-01-01'),
('L004', 'Dulce', 'Holstein', 'Hembra', '2020-11-05', 'Activo', 'Leche', 590.0, 'prop2', 'María García', '2024-01-01'),
('L005', 'Nieve', 'Jersey', 'Hembra', '2021-06-18', 'Activo', 'Leche', 420.0, 'prop1', 'Juan Pérez', '2024-01-01'),

-- Bovinos de carne
('C001', 'Toro', 'Angus', 'Macho', '2019-05-12', 'Activo', 'Carne', 750.0, 'prop3', 'Carlos López', '2024-01-01'),
('C002', 'Fuerte', 'Hereford', 'Macho', '2020-02-28', 'Activo', 'Carne', 680.0, 'prop3', 'Carlos López', '2024-01-01'),
('C003', 'Robusto', 'Angus', 'Macho', '2021-09-14', 'Activo', 'Carne', 520.0, 'prop4', 'Ana Martínez', '2024-01-01'),
('C004', 'Sólido', 'Hereford', 'Macho', '2020-12-03', 'Activo', 'Carne', 710.0, 'prop4', 'Ana Martínez', '2024-01-01'),

-- Bovinos de doble propósito
('D001', 'Versátil', 'Simmental', 'Hembra', '2020-07-22', 'Activo', 'Doble propósito', 550.0, 'prop5', 'Roberto Silva', '2024-01-01'),
('D002', 'Completo', 'Simmental', 'Macho', '2019-10-15', 'Activo', 'Doble propósito', 720.0, 'prop5', 'Roberto Silva', '2024-01-01'),

-- Bovinos de engorde
('E001', 'Crecido', 'Charolais', 'Macho', '2021-03-08', 'Activo', 'Engorde', 480.0, 'prop6', 'Luis Fernández', '2024-01-01'),
('E002', 'Pesado', 'Charolais', 'Macho', '2021-08-25', 'Activo', 'Engorde', 520.0, 'prop6', 'Luis Fernández', '2024-01-01');

-- Insertar eventos de ordeño para los últimos 60 días
WITH fechas_ordeño AS (
  SELECT 
    bovino_codigo,
    fecha_ordeño,
    litros_base,
    turno_ordeño
  FROM (
    VALUES 
    -- L001 - Bella (Holstein)
    ('L001', CURRENT_DATE - INTERVAL '1 day', 25.5, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '1 day', 22.0, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '2 days', 24.8, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '2 days', 21.5, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '3 days', 26.2, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '3 days', 23.1, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '5 days', 25.0, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '5 days', 22.8, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '7 days', 24.5, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '7 days', 21.9, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '10 days', 26.8, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '10 days', 23.5, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '15 days', 25.2, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '15 days', 22.3, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '20 days', 24.9, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '20 days', 21.7, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '25 days', 26.1, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '25 days', 23.8, 'Tarde'),
    ('L001', CURRENT_DATE - INTERVAL '30 days', 25.7, 'Mañana'),
    ('L001', CURRENT_DATE - INTERVAL '30 days', 22.4, 'Tarde'),
    
    -- L002 - Luna (Holstein)
    ('L002', CURRENT_DATE - INTERVAL '1 day', 28.2, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '1 day', 25.5, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '2 days', 27.8, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '2 days', 24.9, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '4 days', 29.1, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '4 days', 26.3, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '6 days', 28.5, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '6 days', 25.7, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '8 days', 27.9, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '8 days', 24.8, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '12 days', 29.3, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '12 days', 26.1, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '18 days', 28.7, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '18 days', 25.4, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '22 days', 27.6, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '22 days', 24.2, 'Tarde'),
    ('L002', CURRENT_DATE - INTERVAL '28 days', 29.0, 'Mañana'),
    ('L002', CURRENT_DATE - INTERVAL '28 days', 26.5, 'Tarde'),
    
    -- L003 - Estrella (Jersey)
    ('L003', CURRENT_DATE - INTERVAL '1 day', 18.5, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '1 day', 16.2, 'Tarde'),
    ('L003', CURRENT_DATE - INTERVAL '3 days', 19.1, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '3 days', 17.0, 'Tarde'),
    ('L003', CURRENT_DATE - INTERVAL '5 days', 18.8, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '5 days', 16.5, 'Tarde'),
    ('L003', CURRENT_DATE - INTERVAL '9 days', 19.3, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '9 days', 17.2, 'Tarde'),
    ('L003', CURRENT_DATE - INTERVAL '14 days', 18.7, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '14 days', 16.8, 'Tarde'),
    ('L003', CURRENT_DATE - INTERVAL '19 days', 19.0, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '19 days', 16.9, 'Tarde'),
    ('L003', CURRENT_DATE - INTERVAL '24 days', 18.9, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '24 days', 17.1, 'Tarde'),
    ('L003', CURRENT_DATE - INTERVAL '29 days', 19.2, 'Mañana'),
    ('L003', CURRENT_DATE - INTERVAL '29 days', 16.7, 'Tarde'),
    
    -- L004 - Dulce (Holstein)
    ('L004', CURRENT_DATE - INTERVAL '2 days', 26.8, 'Mañana'),
    ('L004', CURRENT_DATE - INTERVAL '2 days', 24.1, 'Tarde'),
    ('L004', CURRENT_DATE - INTERVAL '4 days', 27.5, 'Mañana'),
    ('L004', CURRENT_DATE - INTERVAL '4 days', 24.8, 'Tarde'),
    ('L004', CURRENT_DATE - INTERVAL '7 days', 26.9, 'Mañana'),
    ('L004', CURRENT_DATE - INTERVAL '7 days', 23.7, 'Tarde'),
    ('L004', CURRENT_DATE - INTERVAL '11 days', 28.1, 'Mañana'),
    ('L004', CURRENT_DATE - INTERVAL '11 days', 25.3, 'Tarde'),
    ('L004', CURRENT_DATE - INTERVAL '16 days', 27.2, 'Mañana'),
    ('L004', CURRENT_DATE - INTERVAL '16 days', 24.5, 'Tarde'),
    ('L004', CURRENT_DATE - INTERVAL '21 days', 26.6, 'Mañana'),
    ('L004', CURRENT_DATE - INTERVAL '21 days', 23.9, 'Tarde'),
    ('L004', CURRENT_DATE - INTERVAL '26 days', 27.8, 'Mañana'),
    ('L004', CURRENT_DATE - INTERVAL '26 days', 25.0, 'Tarde'),
    
    -- L005 - Nieve (Jersey)
    ('L005', CURRENT_DATE - INTERVAL '3 days', 17.8, 'Mañana'),
    ('L005', CURRENT_DATE - INTERVAL '3 days', 15.9, 'Tarde'),
    ('L005', CURRENT_DATE - INTERVAL '6 days', 18.2, 'Mañana'),
    ('L005', CURRENT_DATE - INTERVAL '6 days', 16.3, 'Tarde'),
    ('L005', CURRENT_DATE - INTERVAL '10 days', 17.9, 'Mañana'),
    ('L005', CURRENT_DATE - INTERVAL '10 days', 16.1, 'Tarde'),
    ('L005', CURRENT_DATE - INTERVAL '13 days', 18.5, 'Mañana'),
    ('L005', CURRENT_DATE - INTERVAL '13 days', 16.7, 'Tarde'),
    ('L005', CURRENT_DATE - INTERVAL '17 days', 18.0, 'Mañana'),
    ('L005', CURRENT_DATE - INTERVAL '17 days', 16.2, 'Tarde'),
    ('L005', CURRENT_DATE - INTERVAL '23 days', 18.3, 'Mañana'),
    ('L005', CURRENT_DATE - INTERVAL '23 days', 16.5, 'Tarde'),
    ('L005', CURRENT_DATE - INTERVAL '27 days', 18.1, 'Mañana'),
    ('L005', CURRENT_DATE - INTERVAL '27 days', 16.4, 'Tarde')
  ) AS t(bovino_codigo, fecha_ordeño, litros_base, turno_ordeño)
)
INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, litros, turno, created_at)
SELECT 
  b.id,
  'Ordeño',
  fo.fecha_ordeño::date,
  'Ordeño ' || fo.turno_ordeño || ' - ' || fo.litros_base || ' litros',
  fo.litros_base,
  fo.turno_ordeño,
  NOW()
FROM fechas_ordeño fo
JOIN bovinos b ON b.codigo = fo.bovino_codigo;

-- Insertar eventos de engorde para los últimos 60 días
WITH fechas_engorde AS (
  SELECT 
    bovino_codigo,
    fecha_engorde,
    peso_kg,
    gmd_kg
  FROM (
    VALUES 
    -- C001 - Toro (Angus)
    ('C001', CURRENT_DATE - INTERVAL '5 days', 755.0, 1.2),
    ('C001', CURRENT_DATE - INTERVAL '10 days', 743.0, 1.1),
    ('C001', CURRENT_DATE - INTERVAL '15 days', 731.0, 1.3),
    ('C001', CURRENT_DATE - INTERVAL '20 days', 718.0, 1.0),
    ('C001', CURRENT_DATE - INTERVAL '25 days', 708.0, 1.2),
    ('C001', CURRENT_DATE - INTERVAL '30 days', 698.0, 1.1),
    ('C001', CURRENT_DATE - INTERVAL '35 days', 687.0, 1.4),
    ('C001', CURRENT_DATE - INTERVAL '40 days', 673.0, 1.2),
    ('C001', CURRENT_DATE - INTERVAL '45 days', 661.0, 1.3),
    ('C001', CURRENT_DATE - INTERVAL '50 days', 648.0, 1.1),
    
    -- C002 - Fuerte (Hereford)
    ('C002', CURRENT_DATE - INTERVAL '3 days', 685.0, 1.0),
    ('C002', CURRENT_DATE - INTERVAL '8 days', 677.0, 1.2),
    ('C002', CURRENT_DATE - INTERVAL '13 days', 665.0, 1.1),
    ('C002', CURRENT_DATE - INTERVAL '18 days', 654.0, 1.3),
    ('C002', CURRENT_DATE - INTERVAL '23 days', 641.0, 1.0),
    ('C002', CURRENT_DATE - INTERVAL '28 days', 631.0, 1.2),
    ('C002', CURRENT_DATE - INTERVAL '33 days', 619.0, 1.1),
    ('C002', CURRENT_DATE - INTERVAL '38 days', 608.0, 1.4),
    ('C002', CURRENT_DATE - INTERVAL '43 days', 594.0, 1.2),
    ('C002', CURRENT_DATE - INTERVAL '48 days', 582.0, 1.3),
    
    -- C003 - Robusto (Angus)
    ('C003', CURRENT_DATE - INTERVAL '4 days', 525.0, 1.3),
    ('C003', CURRENT_DATE - INTERVAL '9 days', 512.0, 1.1),
    ('C003', CURRENT_DATE - INTERVAL '14 days', 501.0, 1.2),
    ('C003', CURRENT_DATE - INTERVAL '19 days', 489.0, 1.4),
    ('C003', CURRENT_DATE - INTERVAL '24 days', 475.0, 1.1),
    ('C003', CURRENT_DATE - INTERVAL '29 days', 464.0, 1.3),
    ('C003', CURRENT_DATE - INTERVAL '34 days', 451.0, 1.2),
    ('C003', CURRENT_DATE - INTERVAL '39 days', 439.0, 1.0),
    ('C003', CURRENT_DATE - INTERVAL '44 days', 429.0, 1.2),
    ('C003', CURRENT_DATE - INTERVAL '49 days', 417.0, 1.3),
    
    -- C004 - Sólido (Hereford)
    ('C004', CURRENT_DATE - INTERVAL '6 days', 715.0, 1.1),
    ('C004', CURRENT_DATE - INTERVAL '11 days', 704.0, 1.3),
    ('C004', CURRENT_DATE - INTERVAL '16 days', 691.0, 1.2),
    ('C004', CURRENT_DATE - INTERVAL '21 days', 679.0, 1.0),
    ('C004', CURRENT_DATE - INTERVAL '26 days', 669.0, 1.2),
    ('C004', CURRENT_DATE - INTERVAL '31 days', 657.0, 1.1),
    ('C004', CURRENT_DATE - INTERVAL '36 days', 646.0, 1.4),
    ('C004', CURRENT_DATE - INTERVAL '41 days', 632.0, 1.2),
    ('C004', CURRENT_DATE - INTERVAL '46 days', 620.0, 1.3),
    ('C004', CURRENT_DATE - INTERVAL '51 days', 607.0, 1.1),
    
    -- E001 - Crecido (Charolais)
    ('E001', CURRENT_DATE - INTERVAL '2 days', 485.0, 1.4),
    ('E001', CURRENT_DATE - INTERVAL '7 days', 472.0, 1.2),
    ('E001', CURRENT_DATE - INTERVAL '12 days', 461.0, 1.3),
    ('E001', CURRENT_DATE - INTERVAL '17 days', 449.0, 1.1),
    ('E001', CURRENT_DATE - INTERVAL '22 days', 438.0, 1.2),
    ('E001', CURRENT_DATE - INTERVAL '27 days', 426.0, 1.4),
    ('E001', CURRENT_DATE - INTERVAL '32 days', 413.0, 1.2),
    ('E001', CURRENT_DATE - INTERVAL '37 days', 402.0, 1.3),
    ('E001', CURRENT_DATE - INTERVAL '42 days', 390.0, 1.1),
    ('E001', CURRENT_DATE - INTERVAL '47 days', 379.0, 1.2),
    
    -- E002 - Pesado (Charolais)
    ('E002', CURRENT_DATE - INTERVAL '1 day', 525.0, 1.3),
    ('E002', CURRENT_DATE - INTERVAL '6 days', 512.0, 1.1),
    ('E002', CURRENT_DATE - INTERVAL '11 days', 501.0, 1.2),
    ('E002', CURRENT_DATE - INTERVAL '16 days', 489.0, 1.4),
    ('E002', CURRENT_DATE - INTERVAL '21 days', 475.0, 1.1),
    ('E002', CURRENT_DATE - INTERVAL '26 days', 464.0, 1.3),
    ('E002', CURRENT_DATE - INTERVAL '31 days', 451.0, 1.2),
    ('E002', CURRENT_DATE - INTERVAL '36 days', 439.0, 1.0),
    ('E002', CURRENT_DATE - INTERVAL '41 days', 429.0, 1.2),
    ('E002', CURRENT_DATE - INTERVAL '46 days', 417.0, 1.3)
  ) AS t(bovino_codigo, fecha_engorde, peso_kg, gmd_kg)
)
INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, peso_kg, gmd, created_at)
SELECT 
  b.id,
  'Engorde',
  fe.fecha_engorde::date,
  'Control de peso - ' || fe.peso_kg || ' kg (GMD: ' || fe.gmd_kg || ' kg/día)',
  fe.peso_kg,
  fe.gmd_kg,
  NOW()
FROM fechas_engorde fe
JOIN bovinos b ON b.codigo = fe.bovino_codigo;

-- Insertar algunos eventos de vacunación y salud para completar
INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Vacunación', CURRENT_DATE - INTERVAL '15 days', 'Vacunación anual contra aftosa', NOW()
FROM bovinos b WHERE b.codigo IN ('L001', 'L002', 'L003');

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Vacunación', CURRENT_DATE - INTERVAL '20 days', 'Vacunación anual contra aftosa', NOW()
FROM bovinos b WHERE b.codigo IN ('C001', 'C002');

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Vacunación', CURRENT_DATE - INTERVAL '18 days', 'Vacunación anual contra aftosa', NOW()
FROM bovinos b WHERE b.codigo = 'D001';

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Vacunación', CURRENT_DATE - INTERVAL '25 days', 'Vacunación anual contra aftosa', NOW()
FROM bovinos b WHERE b.codigo IN ('E001', 'E002');

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Salud', CURRENT_DATE - INTERVAL '8 days', 'Revisión veterinaria rutinaria', NOW()
FROM bovinos b WHERE b.codigo = 'L004';

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Salud', CURRENT_DATE - INTERVAL '12 days', 'Revisión veterinaria rutinaria', NOW()
FROM bovinos b WHERE b.codigo = 'L005';

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Salud', CURRENT_DATE - INTERVAL '10 days', 'Revisión veterinaria rutinaria', NOW()
FROM bovinos b WHERE b.codigo = 'C003';

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, created_at)
SELECT b.id, 'Salud', CURRENT_DATE - INTERVAL '14 days', 'Revisión veterinaria rutinaria', NOW()
FROM bovinos b WHERE b.codigo = 'C004';

-- Mostrar resumen de datos insertados
SELECT 
  'Bovinos insertados' as tipo,
  COUNT(*) as cantidad
FROM bovinos 
WHERE codigo IN ('L001','L002','L003','L004','L005','C001','C002','C003','C004','D001','D002','E001','E002')

UNION ALL

SELECT 
  'Eventos de Ordeño' as tipo,
  COUNT(*) as cantidad
FROM eventos e
JOIN bovinos b ON b.id = e.bovino_id
WHERE e.tipo = 'Ordeño' 
  AND b.codigo IN ('L001','L002','L003','L004','L005')

UNION ALL

SELECT 
  'Eventos de Engorde' as tipo,
  COUNT(*) as cantidad
FROM eventos e
JOIN bovinos b ON b.id = e.bovino_id
WHERE e.tipo = 'Engorde' 
  AND b.codigo IN ('C001','C002','C003','C004','E001','E002')

UNION ALL

SELECT 
  'Otros eventos' as tipo,
  COUNT(*) as cantidad
FROM eventos e
JOIN bovinos b ON b.id = e.bovino_id
WHERE e.tipo IN ('Vacunación', 'Salud')
  AND b.codigo IN ('L001','L002','L003','L004','L005','C001','C002','C003','C004','D001','D002','E001','E002');
