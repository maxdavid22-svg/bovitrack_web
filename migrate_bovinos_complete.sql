-- Migración para agregar campos faltantes a la tabla bovinos
-- Ejecutar en Supabase SQL Editor

-- Agregar nuevas columnas
alter table bovinos add column if not exists peso_nacimiento decimal(8,2);
alter table bovinos add column if not exists peso_actual decimal(8,2);
alter table bovinos add column if not exists color text;
alter table bovinos add column if not exists marcas text;
alter table bovinos add column if not exists id_propietario text;
alter table bovinos add column if not exists nombre_propietario text;
alter table bovinos add column if not exists ubicacion_actual text;
alter table bovinos add column if not exists coordenadas text;
alter table bovinos add column if not exists observaciones text;
alter table bovinos add column if not exists foto text;
alter table bovinos add column if not exists updated_at timestamptz default now();

-- Crear índices para mejor rendimiento
create index if not exists idx_bovinos_propietario on bovinos(id_propietario);
create index if not exists idx_bovinos_color on bovinos(color);
create index if not exists idx_bovinos_ubicacion on bovinos(ubicacion_actual);

-- Agregar foreign key constraint si es necesario
-- alter table bovinos add constraint fk_bovinos_propietario 
-- foreign key (id_propietario) references propietarios(id);
