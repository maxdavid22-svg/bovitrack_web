-- Migración para añadir campo finalidad_productiva a la tabla bovinos
-- Ejecutar en Supabase SQL Editor

-- Añadir columna finalidad_productiva (usar IF NOT EXISTS para evitar errores)
ALTER TABLE bovinos 
ADD COLUMN IF NOT EXISTS finalidad_productiva TEXT;

-- Eliminar constraint si existe (para evitar errores en re-ejecución)
ALTER TABLE bovinos 
DROP CONSTRAINT IF EXISTS check_finalidad_productiva;

-- Crear constraint para valores permitidos
ALTER TABLE bovinos 
ADD CONSTRAINT check_finalidad_productiva 
CHECK (finalidad_productiva IN ('Carne', 'Leche', 'Doble propósito', 'Engorde', 'Reproducción', 'Desconocido') OR finalidad_productiva IS NULL);

-- Crear índice para filtros eficientes (usar IF NOT EXISTS para evitar errores)
CREATE INDEX IF NOT EXISTS idx_bovinos_finalidad_productiva ON bovinos(finalidad_productiva);

-- Comentario en la columna
COMMENT ON COLUMN bovinos.finalidad_productiva IS 'Finalidad productiva del bovino: Carne, Leche, Doble propósito, Engorde, Reproducción, Desconocido';

-- Actualizar registros existentes con valor por defecto (opcional)
-- UPDATE bovinos SET finalidad_productiva = 'Desconocido' WHERE finalidad_productiva IS NULL;

-- Verificar la migración
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bovinos' 
AND column_name = 'finalidad_productiva';
