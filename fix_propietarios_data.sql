-- Script para corregir datos de propietarios existentes
-- Ejecutar en Supabase SQL Editor DESPUÉS de migrate_propietarios.sql

-- 1. Primero ejecutar la migración si no se ha hecho
-- (ejecutar migrate_propietarios.sql primero)

-- 2. Actualizar registros que tienen 'SIN_DOCUMENTO' para que no se muestren
-- Esto es temporal hasta que se sincronicen los datos reales desde la app
update propietarios 
set numero_documento = null 
where numero_documento = 'SIN_DOCUMENTO';

-- 3. Verificar el estado actual
select 
  count(*) as total_propietarios,
  count(numero_documento) as con_documento,
  count(ciudad) as con_ciudad,
  count(telefono) as con_telefono
from propietarios;
