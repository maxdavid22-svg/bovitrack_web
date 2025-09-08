import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Propietario = { id?: string; nombre: string; telefono?: string | null; email?: string | null };
type Bovino = { id?: string; codigo: string; nombre?: string | null; raza?: string | null; sexo?: string | null; fecha_nacimiento?: string | null; estado?: string | null; propietario_id?: string | null };
type EventoInput = { id?: string; bovino_id?: string; bovino_codigo?: string; tipo: string; fecha: string; descripcion?: string | null };

export async function POST(req: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
    if (!serviceKey) {
      return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE' }, { status: 500 });
    }

    const body = await req.json();
    const propietarios: Propietario[] = body.propietarios ?? [];
    const bovinos: Bovino[] = body.bovinos ?? [];
    const eventos: EventoInput[] = body.eventos ?? [];

    // Helper para validar UUID
    const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

    // Upsert/insert propietarios (si el id no es UUID, lo omitimos para que Supabase lo genere)
    if (propietarios.length) {
      const sanitized = propietarios.map(p => ({
        // no enviar id si no es uuid
        ...(isUuid(p.id) ? { id: p.id } : {}),
        nombre: p.nombre,
        telefono: p.telefono ?? null,
        email: p.email ?? null,
      }));
      const { error } = await supabaseAdmin.from('propietarios').insert(sanitized);
      if (error) throw error;
    }

    // Upsert bovinos (onConflict por codigo o id si lo traes)
    if (bovinos.length) {
      // Preferimos conflicto por codigo para evitar duplicados
      const { error } = await supabaseAdmin.from('bovinos').upsert(bovinos, { onConflict: 'codigo' });
      if (error) throw error;
    }

    // Insert eventos (normalmente no upsert, conservamos histórico)
    let skippedEventos = 0;
    if (eventos.length) {
      const eventosToInsert: any[] = [];
      for (const ev of eventos) {
        let bovinoId = ev.bovino_id;
        if (!bovinoId && ev.bovino_codigo) {
          const { data: bovinoRow, error: findErr } = await supabaseAdmin
            .from('bovinos')
            .select('id')
            .eq('codigo', ev.bovino_codigo)
            .maybeSingle();
          if (findErr) throw findErr;
          bovinoId = bovinoRow?.id;
        }
        if (!bovinoId) {
          skippedEventos++;
          continue; // evitar null en bovino_id
        }
        const row: any = {
          bovino_id: bovinoId,
          tipo: ev.tipo,
          fecha: ev.fecha,
          descripcion: ev.descripcion ?? null,
        };
        // sólo mandar id si es uuid
        if (isUuid(ev.id)) row.id = ev.id;
        eventosToInsert.push(row);
      }
      if (eventosToInsert.length) {
        const { error } = await supabaseAdmin
          .from('eventos')
          .upsert(eventosToInsert, { onConflict: 'id', ignoreDuplicates: true });
        if (error) throw error;
      }
    }

    return NextResponse.json({ ok: true, counts: { propietarios: propietarios.length, bovinos: bovinos.length, eventos_insertados: (eventos?.length || 0) - skippedEventos, eventos_omitidos: skippedEventos } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}


