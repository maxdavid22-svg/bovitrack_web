create table if not exists propietarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  created_at timestamptz default now()
);

create table if not exists bovinos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nombre text,
  raza text,
  sexo text check (sexo in ('Macho','Hembra')),
  fecha_nacimiento date,
  estado text default 'Activo',
  propietario_id uuid references propietarios(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  bovino_id uuid references bovinos(id) on delete cascade,
  tipo text not null,
  fecha date not null,
  descripcion text,
  created_at timestamptz default now()
);

alter table propietarios enable row level security;
alter table bovinos enable row level security;
alter table eventos enable row level security;

drop policy if exists read_all_dev on propietarios;
drop policy if exists insert_dev on propietarios;
create policy read_all_dev on propietarios for select using (true);
create policy insert_dev on propietarios for insert with check (true);

drop policy if exists read_all_dev on bovinos;
drop policy if exists insert_dev on bovinos;
create policy read_all_dev on bovinos for select using (true);
create policy insert_dev on bovinos for insert with check (true);

drop policy if exists read_all_dev on eventos;
drop policy if exists insert_dev on eventos;
create policy read_all_dev on eventos for select using (true);
create policy insert_dev on eventos for insert with check (true);


