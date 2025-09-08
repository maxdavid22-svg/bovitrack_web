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
    <div>
      <h1 className="text-2xl font-semibold mb-4">Bovinos</h1>
      {loading ? 'Cargando…' : (
        <div className="bg-white border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Código</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="p-2">{i.codigo}</td>
                  <td className="p-2">{i.nombre ?? '—'}</td>
                  <td className="p-2">{i.estado ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


