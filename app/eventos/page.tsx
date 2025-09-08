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
    <div>
      <h1 className="text-2xl font-semibold mb-4">Eventos</h1>
      {loading ? 'Cargando…' : (
        <div className="bg-white border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Fecha</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Descripción</th>
                <th className="p-2">Bovino ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t">
                  <td className="p-2">{i.fecha}</td>
                  <td className="p-2">{i.tipo}</td>
                  <td className="p-2">{i.descripcion ?? '—'}</td>
                  <td className="p-2">{i.bovino_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


