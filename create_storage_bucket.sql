-- Crear bucket de almacenamiento para imágenes de bovinos
-- Ejecutar en Supabase SQL Editor

-- Insertar el bucket en la tabla storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagenes-bovinos',
  'imagenes-bovinos',
  true,
  10485760, -- 10MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Verificar que el bucket se creó
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'imagenes-bovinos';
