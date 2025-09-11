-- Script para configurar el bucket de almacenamiento para imágenes de bovinos
-- Ejecutar en Supabase SQL Editor

-- Crear el bucket para imágenes de bovinos (si no existe)
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

-- Configurar políticas de acceso para el bucket
-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública de imágenes" ON storage.objects
FOR SELECT USING (bucket_id = 'imagenes-bovinos');

-- Permitir inserción autenticada
CREATE POLICY "Permitir inserción autenticada de imágenes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'imagenes-bovinos');

-- Permitir actualización autenticada
CREATE POLICY "Permitir actualización autenticada de imágenes" ON storage.objects
FOR UPDATE USING (bucket_id = 'imagenes-bovinos');

-- Permitir eliminación autenticada
CREATE POLICY "Permitir eliminación autenticada de imágenes" ON storage.objects
FOR DELETE USING (bucket_id = 'imagenes-bovinos');

-- Comentario sobre el bucket
COMMENT ON TABLE storage.buckets IS 'Bucket para almacenar imágenes de bovinos en el sistema BoviTrack';
