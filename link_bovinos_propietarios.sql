-- Script para vincular bovinos existentes con propietarios
-- Ejecutar en Supabase SQL Editor

-- 1. Ver el estado actual
SELECT 
  'ESTADO ACTUAL' as info,
  (SELECT COUNT(*) FROM propietarios) as total_propietarios,
  (SELECT COUNT(*) FROM bovinos) as total_bovinos,
  (SELECT COUNT(*) FROM bovinos WHERE nombre_propietario IS NOT NULL) as bovinos_con_propietario;

-- 2. Mostrar propietarios disponibles
SELECT 
  'PROPIETARIOS DISPONIBLES' as info,
  id,
  nombre,
  apellidos,
  tipo_propietario
FROM propietarios 
ORDER BY created_at DESC;

-- 3. Mostrar bovinos sin propietario
SELECT 
  'BOVINOS SIN PROPIETARIO' as info,
  id,
  codigo,
  nombre,
  id_propietario,
  nombre_propietario
FROM bovinos 
WHERE nombre_propietario IS NULL OR nombre_propietario = ''
ORDER BY created_at DESC;

-- 4. Vincular bovinos con el primer propietario disponible
UPDATE bovinos 
SET 
  id_propietario = (SELECT id FROM propietarios ORDER BY created_at DESC LIMIT 1),
  nombre_propietario = (SELECT CONCAT(nombre, ' ', COALESCE(apellidos, '')) FROM propietarios ORDER BY created_at DESC LIMIT 1)
WHERE (nombre_propietario IS NULL OR nombre_propietario = '')
  AND EXISTS (SELECT 1 FROM propietarios);

-- 5. Verificar el resultado
SELECT 
  'RESULTADO DESPUÉS DE VINCULAR' as info,
  codigo,
  nombre,
  id_propietario,
  nombre_propietario,
  peso_actual,
  color,
  ubicacion_actual
FROM bovinos 
ORDER BY created_at DESC 
LIMIT 5;
