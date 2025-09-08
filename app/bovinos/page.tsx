'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Bovino = { id: string; codigo: string; nombre: string | null; estado: string | null };

export default function BovinosPage() {
  const [items, setItems] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('bovinos').select('id, codigo, nombre, estado').order('created_at', { ascending: false }).limit(200);
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>Bovinos</h1>
      {loading ? 'Cargando…' : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Código</th>
              <th style={{ textAlign: 'left' }}>Nombre</th>
              <th style={{ textAlign: 'left' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.codigo}</td>
                <td>{i.nombre ?? '—'}</td>
                <td>{i.estado ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}


