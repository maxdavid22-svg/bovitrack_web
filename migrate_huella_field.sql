-- Migración para agregar campo huella a la tabla bovinos
-- Ejecutar en Supabase SQL Editor

-- Agregar columna huella
alter table bovinos add column if not exists huella text;

-- Crear índice para mejor rendimiento en búsquedas por huella
create index if not exists idx_bovinos_huella on bovinos(huella);

-- Comentario sobre el campo
comment on column bovinos.huella is 'Campo para almacenar información de la huella del bovino (imagen o datos biométricos)';
