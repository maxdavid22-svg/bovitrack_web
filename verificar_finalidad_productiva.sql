-- Script de verificación para el campo finalidad_productiva
-- Ejecutar después de aplicar migrate_finalidad_productiva.sql

-- 1. Verificar que la columna existe
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bovinos' 
AND column_name = 'finalidad_productiva';

-- 2. Verificar que el constraint existe
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'bovinos'::regclass 
AND conname = 'check_finalidad_productiva';

-- 3. Verificar que el índice existe
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'bovinos' 
AND indexname = 'idx_bovinos_finalidad_productiva';

-- 4. Probar insertar un bovino con finalidad productiva válida
INSERT INTO bovinos (codigo, sexo, finalidad_productiva) 
VALUES ('TEST-FINALIDAD-001', 'Macho', 'Carne')
ON CONFLICT (codigo) DO NOTHING;

-- 5. Probar insertar un bovino con finalidad productiva inválida (debería fallar)
-- INSERT INTO bovinos (codigo, sexo, finalidad_productiva) 
-- VALUES ('TEST-FINALIDAD-002', 'Hembra', 'Invalid');

-- 6. Verificar que se puede insertar NULL
INSERT INTO bovinos (codigo, sexo, finalidad_productiva) 
VALUES ('TEST-FINALIDAD-003', 'Hembra', NULL)
ON CONFLICT (codigo) DO NOTHING;

-- 7. Consultar los bovinos de prueba
SELECT codigo, sexo, finalidad_productiva 
FROM bovinos 
WHERE codigo LIKE 'TEST-FINALIDAD-%'
ORDER BY codigo;

-- 8. Limpiar datos de prueba (opcional)
-- DELETE FROM bovinos WHERE codigo LIKE 'TEST-FINALIDAD-%';



