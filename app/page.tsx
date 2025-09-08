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
      <h1 className="text-2xl font-semibold mb-6">BoviTrack Web</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <a href="/nuevo" className="p-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
          <div className="text-lg font-semibold">Registrar Bovino</div>
          <div className="text-sm opacity-90">Crear un nuevo registro de bovino</div>
        </a>
        <a href="/bovinos" className="p-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
          <div className="text-lg font-semibold">Ver Bovinos</div>
          <div className="text-sm opacity-90">Listado general con estado</div>
        </a>
        <a href="/propietarios" className="p-6 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition">
          <div className="text-lg font-semibold">Propietarios</div>
          <div className="text-sm opacity-90">Gestión de propietarios</div>
        </a>
        <a href="/eventos" className="p-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
          <div className="text-lg font-semibold">Eventos</div>
          <div className="text-sm opacity-90">Historial de trazabilidad</div>
        </a>
      </div>
      {loading ? (
        <div> Cargando… </div>
      ) : (
        <div className="bg-white border rounded overflow-hidden shadow-sm">
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
                <tr key={b.id} className="border-t hover:bg-gray-50">
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


