-- Migración para agregar campo imagenes a la tabla bovinos
-- Ejecutar en Supabase SQL Editor

-- Agregar columna imagenes como array de texto
alter table bovinos add column if not exists imagenes text[];

-- Crear índice para mejor rendimiento en búsquedas por imágenes
create index if not exists idx_bovinos_imagenes on bovinos using gin(imagenes);

-- Comentario sobre el campo
comment on column bovinos.imagenes is 'Array de URLs o nombres de archivos de imágenes del bovino';
