import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Propietario = { id?: string; nombre: string; telefono?: string | null; email?: string | null };
type Bovino = { id?: string; codigo: string; nombre?: string | null; raza?: string | null; sexo?: string | null; fecha_nacimiento?: string | null; estado?: string | null; propietario_id?: string | null };
type Evento = { id?: string; bovino_id: string; tipo: string; fecha: string; descripcion?: string | null };

export async function POST(req: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
    if (!serviceKey) {
      return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE' }, { status: 500 });
    }

    const body = await req.json();
    const propietarios: Propietario[] = body.propietarios ?? [];
    const bovinos: Bovino[] = body.bovinos ?? [];
    const eventos: Evento[] = body.eventos ?? [];

    // Upsert propietarios
    if (propietarios.length) {
      const { error } = await supabaseAdmin.from('propietarios').upsert(propietarios, { onConflict: 'id' });
      if (error) throw error;
    }

    // Upsert bovinos (onConflict por codigo o id si lo traes)
    if (bovinos.length) {
      // Preferimos conflicto por codigo para evitar duplicados
      const { error } = await supabaseAdmin.from('bovinos').upsert(bovinos, { onConflict: 'codigo' });
      if (error) throw error;
    }

    // Insert eventos (normalmente no upsert, conservamos histórico)
    if (eventos.length) {
      const { error } = await supabaseAdmin.from('eventos').insert(eventos);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true, counts: { propietarios: propietarios.length, bovinos: bovinos.length, eventos: eventos.length } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}


