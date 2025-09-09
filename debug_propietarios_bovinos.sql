-- Script para verificar el estado de propietarios y bovinos
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar propietarios existentes
SELECT 
  'PROPIETARIOS' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN nombre IS NOT NULL THEN 1 END) as con_nombre,
  COUNT(CASE WHEN telefono IS NOT NULL THEN 1 END) as con_telefono,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as con_email
FROM propietarios;

-- 2. Verificar bovinos y su relación con propietarios
SELECT 
  'BOVINOS' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN nombre_propietario IS NOT NULL THEN 1 END) as con_propietario,
  COUNT(CASE WHEN id_propietario IS NOT NULL THEN 1 END) as con_id_propietario,
  COUNT(CASE WHEN peso_actual IS NOT NULL THEN 1 END) as con_peso
FROM bovinos;

-- 3. Mostrar algunos propietarios de ejemplo
SELECT 
  'PROPIETARIOS SAMPLE' as info,
  id,
  nombre,
  apellidos,
  tipo_propietario,
  telefono,
  email,
  created_at
FROM propietarios 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Mostrar algunos bovinos con información de propietarios
SELECT 
  'BOVINOS SAMPLE' as info,
  codigo,
  nombre,
  id_propietario,
  nombre_propietario,
  peso_actual,
  color,
  ubicacion_actual,
  created_at
FROM bovinos 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar si hay bovinos con propietarios pero sin id_propietario
SELECT 
  'BOVINOS SIN ID_PROPIETARIO' as info,
  codigo,
  nombre,
  nombre_propietario,
  id_propietario
FROM bovinos 
WHERE nombre_propietario IS NOT NULL 
  AND (id_propietario IS NULL OR id_propietario = '')
ORDER BY created_at DESC;
