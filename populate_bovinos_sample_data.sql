-- Script para poblar datos de ejemplo en bovinos existentes
-- Ejecutar en Supabase SQL Editor

-- Actualizar algunos bovinos con datos de ejemplo
UPDATE bovinos 
SET 
  peso_nacimiento = CASE 
    WHEN codigo LIKE '%001%' THEN 35.5
    WHEN codigo LIKE '%002%' THEN 42.0
    WHEN codigo LIKE '%003%' THEN 38.2
    ELSE peso_nacimiento
  END,
  peso_actual = CASE 
    WHEN codigo LIKE '%001%' THEN 450.0
    WHEN codigo LIKE '%002%' THEN 380.5
    WHEN codigo LIKE '%003%' THEN 520.0
    ELSE peso_actual
  END,
  color = CASE 
    WHEN codigo LIKE '%001%' THEN 'Negro'
    WHEN codigo LIKE '%002%' THEN 'Blanco'
    WHEN codigo LIKE '%003%' THEN 'Marrón'
    ELSE color
  END,
  marcas = CASE 
    WHEN codigo LIKE '%001%' THEN 'Mancha blanca en la frente'
    WHEN codigo LIKE '%002%' THEN 'Sin marcas distintivas'
    WHEN codigo LIKE '%003%' THEN 'Cicatriz en la oreja izquierda'
    ELSE marcas
  END,
  ubicacion_actual = CASE 
    WHEN codigo LIKE '%001%' THEN 'Finca La Esperanza, Lote 5'
    WHEN codigo LIKE '%002%' THEN 'Hacienda San José, Corral 3'
    WHEN codigo LIKE '%003%' THEN 'Rancho El Paraíso, Pasto 2'
    ELSE ubicacion_actual
  END,
  coordenadas = CASE 
    WHEN codigo LIKE '%001%' THEN '-12.0464, -77.0428'
    WHEN codigo LIKE '%002%' THEN '-12.0564, -77.0528'
    WHEN codigo LIKE '%003%' THEN '-12.0664, -77.0628'
    ELSE coordenadas
  END,
  observaciones = CASE 
    WHEN codigo LIKE '%001%' THEN 'Bovino muy dócil, fácil de manejar'
    WHEN codigo LIKE '%002%' THEN 'Requiere cuidado especial en el invierno'
    WHEN codigo LIKE '%003%' THEN 'Excelente reproductor, descendencia de calidad'
    ELSE observaciones
  END
WHERE codigo IN (
  SELECT codigo FROM bovinos 
  WHERE codigo LIKE '%001%' OR codigo LIKE '%002%' OR codigo LIKE '%003%'
  LIMIT 3
);

-- Verificar los cambios
SELECT 
  codigo, 
  nombre, 
  peso_nacimiento, 
  peso_actual, 
  color, 
  marcas, 
  ubicacion_actual, 
  coordenadas,
  observaciones
FROM bovinos 
WHERE peso_actual IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;
