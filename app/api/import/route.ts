import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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
    console.log('[IMPORT] sizes', { propietarios: propietarios.length, bovinos: bovinos.length, eventos: eventos.length });

    // Helper para validar UUID
    const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

    // Upsert/insert propietarios (si el id no es UUID, lo omitimos para que Supabase lo genere)
    if (propietarios.length) {
      try {
        const sanitized = propietarios.map(p => ({
          ...(isUuid(p.id) ? { id: p.id } : {}),
          nombre: p.nombre,
          telefono: p.telefono ?? null,
          email: p.email ?? null,
        }));
        const { error } = await supabaseAdmin
          .from('propietarios')
          .upsert(sanitized, { onConflict: 'id', ignoreDuplicates: true });
        if (error) throw error;
      } catch (e: any) {
        console.error('[IMPORT] propietarios failed:', e?.message || e);
        return NextResponse.json({ error: e?.message || 'Error propietarios', stage: 'propietarios' }, { status: 500 });
      }
    }

    // Upsert bovinos (onConflict por codigo o id si lo traes)
    if (bovinos.length) {
      try {
        const { error } = await supabaseAdmin.from('bovinos').upsert(bovinos, { onConflict: 'codigo' });
        if (error) throw error;
      } catch (e: any) {
        console.error('[IMPORT] bovinos failed:', e?.message || e);
        return NextResponse.json({ error: e?.message || 'Error bovinos', stage: 'bovinos' }, { status: 500 });
      }
    }

    // Insert eventos (normalmente no upsert, conservamos histórico)
    let skippedEventos = 0;
    if (eventos.length) {
      try {
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
            tipo: ev.tipo || 'Registro',
            fecha: ev.fecha || new Date().toISOString().slice(0, 10),
            descripcion: ev.descripcion ?? null,
          };
          if (isUuid(ev.id)) {
            row.id = ev.id;
          } else {
            // Generar un UUID determinístico por contenido para idempotencia
            const base = `${bovinoId}|${row.tipo}|${row.fecha}|${row.descripcion ?? ''}`;
            const hex = crypto.createHash('md5').update(base).digest('hex');
            row.id = `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`;
          }
          eventosToInsert.push(row);
        }
        if (eventosToInsert.length) {
          const { error } = await supabaseAdmin
            .from('eventos')
            .upsert(eventosToInsert, { onConflict: 'id', ignoreDuplicates: true });
          if (error) throw error;
        }
      } catch (e: any) {
        console.error('[IMPORT] eventos failed:', e?.message || e);
        return NextResponse.json({ error: e?.message || 'Error eventos', stage: 'eventos' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, counts: { propietarios: propietarios.length, bovinos: bovinos.length, eventos_insertados: (eventos?.length || 0) - skippedEventos, eventos_omitidos: skippedEventos } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}


