-- Migración para agregar campo tag_rfid a la tabla bovinos
-- Ejecutar en Supabase SQL Editor

-- Agregar columna tag_rfid
alter table bovinos add column if not exists tag_rfid text;

-- Crear índice para mejor rendimiento en búsquedas por tag_rfid
create index if not exists idx_bovinos_tag_rfid on bovinos(tag_rfid);

-- Agregar comentario a la columna
comment on column bovinos.tag_rfid is 'Identificador del tag RFID del bovino';

