import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Propietario = { 
  id?: string; 
  tipo_propietario?: string;
  nombre: string; 
  apellidos?: string | null;
  tipo_documento?: string;
  numero_documento?: string;
  telefono?: string | null; 
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  departamento?: string | null;
  observaciones?: string | null;
};
type Bovino = { 
  id?: string; 
  codigo: string; 
  tag_rfid?: string | null;
  nombre?: string | null; 
  raza?: string | null; 
  sexo?: string | null; 
  fecha_nacimiento?: string | null; 
  estado?: string | null; 
  propietario_id?: string | null;
  peso_nacimiento?: number | null;
  peso_actual?: number | null;
  color?: string | null;
  marcas?: string | null;
  id_propietario?: string | null;
  nombre_propietario?: string | null;
  ubicacion_actual?: string | null;
  coordenadas?: string | null;
  observaciones?: string | null;
  foto?: string | null;
};
type EventoInput = { 
  id?: string; 
  bovino_id?: string; 
  bovino_codigo?: string; 
  tipo: string; 
  fecha: string; 
  descripcion?: string | null;
  medicamento?: string | null;
  dosis?: string | null;
  veterinario?: string | null;
  observaciones?: string | null;
  peso_kg?: number | null;
  costo?: number | null;
  ubicacion?: string | null;
  hora?: string | null;
  comprador?: string | null;
  destino?: string | null;
};

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
        for (const p of propietarios) {
          const propietarioData = {
            tipo_propietario: p.tipo_propietario || 'Individual',
            nombre: p.nombre,
            apellidos: p.apellidos || null,
            tipo_documento: p.tipo_documento || 'DNI',
            numero_documento: p.numero_documento || 'SIN_DOCUMENTO',
            telefono: p.telefono || null,
            email: p.email || null,
            direccion: p.direccion || null,
            ciudad: p.ciudad || null,
            departamento: p.departamento || null,
            observaciones: p.observaciones || null
          };
          
          // Si el id es UUID intentamos upsert por id
          if (isUuid(p.id)) {
            const { error } = await supabaseAdmin
              .from('propietarios')
              .upsert([{ id: p.id, ...propietarioData }], { onConflict: 'id', ignoreDuplicates: false });
            if (error) throw error;
          } else {
            // Actualizar por nombre si existe, si no, insertar
            const { data: existing, error: selErr } = await supabaseAdmin
              .from('propietarios')
              .select('id')
              .eq('nombre', p.nombre)
              .maybeSingle();
            if (selErr) throw selErr;
            if (existing?.id) {
              const { error: updErr } = await supabaseAdmin
                .from('propietarios')
                .update(propietarioData)
                .eq('id', existing.id);
              if (updErr) throw updErr;
            } else {
              const { error: insErr } = await supabaseAdmin
                .from('propietarios')
                .insert([propietarioData]);
              if (insErr) throw insErr;
            }
          }
        }
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
        console.log('[IMPORT] Procesando', eventos.length, 'eventos');
        console.log('[IMPORT] Primer evento:', eventos[0]);
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
            medicamento: ev.medicamento ?? null,
            dosis: ev.dosis ?? null,
            veterinario: ev.veterinario ?? null,
            observaciones: ev.observaciones ?? null,
            peso_kg: ev.peso_kg ?? null,
            costo: ev.costo ?? null,
            ubicacion: ev.ubicacion ?? null,
            hora: ev.hora ?? null,
            comprador: ev.comprador ?? null,
            destino: ev.destino ?? null,
          };
          
          // Debug: Log para verificar campos adicionales
          if (ev.medicamento || ev.dosis || ev.veterinario || ev.comprador || ev.destino) {
            console.log('[IMPORT] Evento con campos adicionales:', {
              bovino_codigo: ev.bovino_codigo,
              tipo: ev.tipo,
              medicamento: ev.medicamento,
              dosis: ev.dosis,
              veterinario: ev.veterinario,
              comprador: ev.comprador,
              destino: ev.destino,
              precio: ev.costo
            });
          }
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


