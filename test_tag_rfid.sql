-- Script de prueba para verificar el funcionamiento del Tag RFID
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la columna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bovinos' 
AND column_name = 'tag_rfid';

-- 2. Si la columna no existe, crearla:
-- ALTER TABLE bovinos ADD COLUMN IF NOT EXISTS tag_rfid text;
-- CREATE INDEX IF NOT EXISTS idx_bovinos_tag_rfid ON bovinos(tag_rfid);

-- 3. Verificar los datos actuales (ejecutar después de crear la columna)
SELECT id, codigo, nombre, tag_rfid, created_at 
FROM bovinos 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Actualizar un bovino existente con tag_rfid (cambiar el ID por uno real)
-- UPDATE bovinos 
-- SET tag_rfid = 'TEST123' 
-- WHERE id = 'tu-id-aqui' 
-- RETURNING id, codigo, tag_rfid;
