-- Script para poblar datos de ejemplo de alertas de inocuidad
-- Ejecutar después de migrate_alertas_inocuidad.sql

-- Actualizar algunos eventos existentes para generar alertas
UPDATE eventos 
SET 
  es_critico = TRUE,
  nivel_riesgo = 'Crítico',
  observaciones_inocuidad = 'Enfermedad detectada que afecta la inocuidad alimentaria'
WHERE id IN (
  SELECT id FROM eventos 
  WHERE tipo = 'Vacunación' 
    AND fecha >= CURRENT_DATE - INTERVAL '5 days'
  LIMIT 2
);

-- Agregar eventos de vacunación con fechas de vencimiento
INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, fecha_vencimiento, nivel_riesgo, observaciones_inocuidad, created_at)
SELECT 
  b.id,
  'Vacunación',
  CURRENT_DATE - INTERVAL '60 days',
  'Vacunación contra aftosa - VENCIDA',
  CURRENT_DATE - INTERVAL '30 days', -- Vencida hace 30 días
  'Alto',
  'Vacunación vencida que requiere renovación inmediata',
  NOW()
FROM bovinos b 
WHERE b.finalidad_productiva IN ('Leche', 'Carne')
ORDER BY b.created_at
LIMIT 3;

INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, fecha_vencimiento, nivel_riesgo, observaciones_inocuidad, created_at)
SELECT 
  b.id,
  'Vacunación',
  CURRENT_DATE - INTERVAL '45 days',
  'Vacunación contra brucelosis - POR VENCER',
  CURRENT_DATE + INTERVAL '15 days', -- Vence en 15 días
  'Medio',
  'Vacunación que vence pronto, programar renovación',
  NOW()
FROM bovinos b 
WHERE b.finalidad_productiva IN ('Leche', 'Carne')
ORDER BY b.created_at
LIMIT 4;

-- Agregar eventos de retiro sanitario
INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, requiere_retiro, es_critico, nivel_riesgo, observaciones_inocuidad, created_at)
SELECT 
  b.id,
  'Retiro Sanitario',
  CURRENT_DATE - INTERVAL '2 days',
  'Retiro sanitario por enfermedad detectada',
  TRUE,
  TRUE,
  'Crítico',
  'Bovino requiere retiro inmediato del sistema productivo',
  NOW()
FROM bovinos b 
WHERE b.finalidad_productiva IN ('Leche', 'Carne')
ORDER BY b.created_at
LIMIT 1;

-- Agregar eventos de cuarentena
INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, nivel_riesgo, observaciones_inocuidad, created_at)
SELECT 
  b.id,
  'Cuarentena',
  CURRENT_DATE - INTERVAL '10 days',
  'Bovino en período de cuarentena',
  'Medio',
  'Bovino en observación por posible exposición a enfermedad',
  NOW()
FROM bovinos b 
WHERE b.finalidad_productiva IN ('Leche', 'Carne')
ORDER BY b.created_at
LIMIT 2;

-- Agregar eventos de tratamiento vencido
INSERT INTO eventos (bovino_id, tipo, fecha, descripcion, fecha_vencimiento, nivel_riesgo, observaciones_inocuidad, created_at)
SELECT 
  b.id,
  'Tratamiento',
  CURRENT_DATE - INTERVAL '90 days',
  'Tratamiento antiparasitario - VENCIDO',
  CURRENT_DATE - INTERVAL '30 days', -- Vencido hace 30 días
  'Alto',
  'Tratamiento vencido que requiere renovación',
  NOW()
FROM bovinos b 
WHERE b.finalidad_productiva IN ('Leche', 'Carne')
ORDER BY b.created_at
LIMIT 2;

-- Ejecutar función para generar alertas
SELECT generar_alertas_inocuidad();

-- Verificar alertas generadas
SELECT 
  a.titulo,
  a.nivel_riesgo,
  a.fecha_deteccion,
  a.fecha_vencimiento,
  b.codigo as bovino_codigo,
  b.nombre as bovino_nombre,
  ta.nombre as tipo_alerta
FROM alertas_inocuidad a
JOIN bovinos b ON b.id = a.bovino_id
JOIN tipos_alertas ta ON ta.id = a.tipo_alerta_id
WHERE a.es_activa = TRUE
ORDER BY 
  CASE a.nivel_riesgo 
    WHEN 'Crítico' THEN 1 
    WHEN 'Alto' THEN 2 
    WHEN 'Medio' THEN 3 
    WHEN 'Bajo' THEN 4 
  END,
  a.fecha_deteccion DESC;
