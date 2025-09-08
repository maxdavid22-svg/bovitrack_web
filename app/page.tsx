'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Bovino = {
  id: string;
  codigo: string;
  nombre: string | null;
  raza: string | null;
  sexo: string | null;
  estado: string | null;
};

export default function Home() {
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('bovinos')
        .select('id, codigo, nombre, raza, sexo, estado')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        console.error(error);
      }
      setBovinos(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h1>BoviTrack Web</h1>
      <a href="/nuevo" style={{ display: 'inline-block', marginBottom: 12 }}>Nuevo Bovino</a>
      {loading ? (
        <div>Cargando…</div>
      ) : (
        <ul>
          {bovinos.map(b => (
            <li key={b.id}>{b.codigo} — {b.nombre ?? 'Sin nombre'} — {b.estado}</li>
          ))}
        </ul>
      )}
    </main>
  );
}


