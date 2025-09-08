'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Evento = { id: string; tipo: string; fecha: string; descripcion: string | null; bovino_id: string };

export default function EventosPage() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('eventos')
        .select('id, tipo, fecha, descripcion, bovino_id')
        .order('fecha', { ascending: false })
        .limit(200);
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1>Eventos</h1>
      {loading ? 'Cargando…' : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Fecha</th>
              <th style={{ textAlign: 'left' }}>Tipo</th>
              <th style={{ textAlign: 'left' }}>Descripción</th>
              <th style={{ textAlign: 'left' }}>Bovino ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.fecha}</td>
                <td>{i.tipo}</td>
                <td>{i.descripcion ?? '—'}</td>
                <td>{i.bovino_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}


