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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Bovinos</h1>
        <div className="flex gap-2">
          <a className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" href="/nuevo">Nuevo Bovino</a>
        </div>
      </div>
      {loading ? 'Cargando…' : (
        <div className="bg-white border rounded overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-2">Código</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t hover:bg-gray-50">
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


