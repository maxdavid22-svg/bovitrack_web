-- Agregar políticas UPDATE y DELETE faltantes en Supabase
-- Ejecutar en Supabase SQL Editor

-- Políticas para bovinos
drop policy if exists update_dev on bovinos;
drop policy if exists delete_dev on bovinos;
create policy update_dev on bovinos for update using (true);
create policy delete_dev on bovinos for delete using (true);

-- Políticas para propietarios
drop policy if exists update_dev on propietarios;
drop policy if exists delete_dev on propietarios;
create policy update_dev on propietarios for update using (true);
create policy delete_dev on propietarios for delete using (true);

-- Políticas para eventos
drop policy if exists update_dev on eventos;
drop policy if exists delete_dev on eventos;
create policy update_dev on eventos for update using (true);
create policy delete_dev on eventos for delete using (true);



