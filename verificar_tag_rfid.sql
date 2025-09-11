-- Script para verificar si la columna tag_rfid existe en la tabla bovinos
-- Ejecutar en Supabase SQL Editor

-- Verificar la estructura de la tabla bovinos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bovinos' 
ORDER BY ordinal_position;

-- Verificar si existe la columna tag_rfid específicamente
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bovinos' 
AND column_name = 'tag_rfid';

-- Si la consulta anterior no devuelve resultados, ejecutar esto para agregar la columna:
-- ALTER TABLE bovinos ADD COLUMN IF NOT EXISTS tag_rfid text;
-- CREATE INDEX IF NOT EXISTS idx_bovinos_tag_rfid ON bovinos(tag_rfid);

