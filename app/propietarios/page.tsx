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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Propietarios</h1>
      </div>
      {loading ? 'Cargando…' : (
        <div className="bg-white border rounded overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="bg-amber-50 text-amber-900">
                <th className="p-2">Nombre</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{i.nombre}</td>
                  <td className="p-2">{i.telefono ?? '—'}</td>
                  <td className="p-2">{i.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


