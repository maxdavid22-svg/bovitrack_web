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
    <div>
      <h1 className="text-2xl font-semibold mb-4">BoviTrack Web</h1>
      <div className="flex gap-3 mb-4">
        <a className="px-3 py-2 bg-blue-600 text-white rounded" href="/nuevo">Nuevo Bovino</a>
        <a className="px-3 py-2 border rounded" href="/bovinos">Ver Bovinos</a>
        <a className="px-3 py-2 border rounded" href="/propietarios">Ver Propietarios</a>
        <a className="px-3 py-2 border rounded" href="/eventos">Ver Eventos</a>
      </div>
      {loading ? (
        <div> Cargando… </div>
      ) : (
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
              {bovinos.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.codigo}</td>
                  <td className="p-2">{b.nombre ?? 'Sin nombre'}</td>
                  <td className="p-2">{b.estado ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


