-- Configurar políticas de acceso para el bucket imagenes-bovinos
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear el bucket

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir inserción autenticada de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización autenticada de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación autenticada de imágenes" ON storage.objects;

-- Crear políticas de acceso para el bucket imagenes-bovinos
-- 1. Permitir lectura pública (para mostrar imágenes)
CREATE POLICY "Permitir lectura pública de imágenes" ON storage.objects
FOR SELECT USING (bucket_id = 'imagenes-bovinos');

-- 2. Permitir inserción autenticada (para subir imágenes)
CREATE POLICY "Permitir inserción autenticada de imágenes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'imagenes-bovinos');

-- 3. Permitir actualización autenticada (para modificar imágenes)
CREATE POLICY "Permitir actualización autenticada de imágenes" ON storage.objects
FOR UPDATE USING (bucket_id = 'imagenes-bovinos');

-- 4. Permitir eliminación autenticada (para eliminar imágenes)
CREATE POLICY "Permitir eliminación autenticada de imágenes" ON storage.objects
FOR DELETE USING (bucket_id = 'imagenes-bovinos');

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%imagenes%';
