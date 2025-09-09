-- Migración para agregar campos faltantes a la tabla propietarios
-- Ejecutar en Supabase SQL Editor

-- Agregar nuevas columnas
alter table propietarios add column if not exists tipo_propietario text default 'Individual';
alter table propietarios add column if not exists apellidos text;
alter table propietarios add column if not exists tipo_documento text default 'DNI';
alter table propietarios add column if not exists numero_documento text;
alter table propietarios add column if not exists direccion text;
alter table propietarios add column if not exists ciudad text;
alter table propietarios add column if not exists departamento text;
alter table propietarios add column if not exists observaciones text;
alter table propietarios add column if not exists updated_at timestamptz default now();

-- Actualizar registros existentes con valores por defecto
update propietarios 
set 
  tipo_propietario = 'Individual',
  tipo_documento = 'DNI',
  numero_documento = 'SIN_DOCUMENTO',
  updated_at = now()
where tipo_propietario is null or tipo_documento is null or numero_documento is null;

-- Hacer campos obligatorios
alter table propietarios alter column tipo_propietario set not null;
alter table propietarios alter column tipo_documento set not null;
alter table propietarios alter column numero_documento set not null;

-- Crear índices para mejor rendimiento
create index if not exists idx_propietarios_tipo on propietarios(tipo_propietario);
create index if not exists idx_propietarios_documento on propietarios(tipo_documento, numero_documento);
create index if not exists idx_propietarios_ciudad on propietarios(ciudad);
