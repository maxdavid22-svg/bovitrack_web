'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Propietario = { id: string; nombre: string; telefono: string | null; email: string | null };

export default function PropietariosPage() {
  const [items, setItems] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('propietarios')
        .select('id, nombre, telefono, email')
        .order('created_at', { ascending: false })
        .limit(200);
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1>Propietarios</h1>
      {loading ? 'Cargando…' : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Nombre</th>
              <th style={{ textAlign: 'left' }}>Teléfono</th>
              <th style={{ textAlign: 'left' }}>Email</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td>{i.telefono ?? '—'}</td>
                <td>{i.email ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}


