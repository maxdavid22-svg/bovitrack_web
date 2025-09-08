# BoviTrack Web (Next.js + Supabase)

Este es un frontend mínimo para conectarse a Supabase.

## Variables de entorno

Configura en Vercel (Project Settings > Environment Variables) o en `.env.local` si corres local:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup de base de datos (Supabase)

En el Dashboard de Supabase, abre SQL y ejecuta el contenido de `supabase_setup.sql`. Esto creará tablas básicas y políticas RLS para desarrollo.

> Nota: En producción, endurece las políticas RLS.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` / `npm start` — producción

## Flujo

- Home: lista los bovinos (tabla `bovinos`).
- /nuevo: formulario mínimo para insertar un bovino (`codigo`, `nombre`).
