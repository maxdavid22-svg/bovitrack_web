-- Verificar configuración del bucket de almacenamiento
-- Ejecutar en Supabase SQL Editor

-- Verificar que el bucket existe
SELECT 
  id as bucket_id,
  name as bucket_name,
  public as is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'imagenes-bovinos';

-- Verificar políticas de acceso
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%imagenes%';

-- Verificar permisos de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
