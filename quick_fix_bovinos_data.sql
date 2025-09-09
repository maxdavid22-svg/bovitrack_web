-- Script rápido para poblar datos de ejemplo en bovinos existentes
-- Ejecutar en Supabase SQL Editor

-- Actualizar los primeros 3 bovinos con datos de ejemplo
UPDATE bovinos 
SET 
  peso_nacimiento = 35.5,
  peso_actual = 450.0,
  color = 'Negro',
  marcas = 'Mancha blanca en la frente',
  ubicacion_actual = 'Finca La Esperanza, Lote 5',
  coordenadas = '-12.0464, -77.0428',
  observaciones = 'Bovino muy dócil, fácil de manejar'
WHERE id IN (
  SELECT id FROM bovinos 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Actualizar el segundo bovino
UPDATE bovinos 
SET 
  peso_nacimiento = 42.0,
  peso_actual = 380.5,
  color = 'Blanco',
  marcas = 'Sin marcas distintivas',
  ubicacion_actual = 'Hacienda San José, Corral 3',
  coordenadas = '-12.0564, -77.0528',
  observaciones = 'Requiere cuidado especial en el invierno'
WHERE id IN (
  SELECT id FROM bovinos 
  ORDER BY created_at DESC 
  LIMIT 1 OFFSET 1
);

-- Actualizar el tercer bovino
UPDATE bovinos 
SET 
  peso_nacimiento = 38.2,
  peso_actual = 520.0,
  color = 'Marrón',
  marcas = 'Cicatriz en la oreja izquierda',
  ubicacion_actual = 'Rancho El Paraíso, Pasto 2',
  coordenadas = '-12.0664, -77.0628',
  observaciones = 'Excelente reproductor, descendencia de calidad'
WHERE id IN (
  SELECT id FROM bovinos 
  ORDER BY created_at DESC 
  LIMIT 1 OFFSET 2
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
LIMIT 3;
