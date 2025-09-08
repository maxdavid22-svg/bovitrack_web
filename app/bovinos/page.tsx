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
  fecha_nacimiento: string | null;
  created_at: string;
};

export default function BovinosPage() {
  const [items, setItems] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarBovinos();
  }, []);

  const cargarBovinos = async () => {
    try {
      const { data, error } = await supabase
        .from('bovinos')
        .select('id, codigo, nombre, raza, sexo, estado, fecha_nacimiento, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) {
        console.error('Error cargando bovinos:', error);
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const bovinosFiltrados = items.filter(bovino => 
    bovino.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    (bovino.nombre && bovino.nombre.toLowerCase().includes(filtro.toLowerCase())) ||
    (bovino.raza && bovino.raza.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">🐄 Gestión de Bovinos</h1>
            <p className="text-green-100">Listado completo de bovinos registrados</p>
          </div>
          <a 
            href="/nuevo" 
            className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition font-medium"
          >
            ➕ Nuevo Bovino
          </a>
        </div>
      </div>

      {/* Filtros y estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <div className="text-sm text-gray-600">
            Mostrando {bovinosFiltrados.length} de {items.length} bovinos
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por código, nombre o raza..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de bovinos */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Cargando bovinos...</div>
        ) : bovinosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filtro ? 'No se encontraron bovinos con el filtro aplicado' : 'No hay bovinos registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Raza</th>
                  <th className="p-4 font-medium">Sexo</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Fecha Nac.</th>
                  <th className="p-4 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {bovinosFiltrados.map(bovino => (
                  <tr key={bovino.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-mono text-blue-600 font-semibold">{bovino.codigo}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{bovino.nombre || 'Sin nombre'}</div>
                    </td>
                    <td className="p-4">{bovino.raza || '—'}</td>
                    <td className="p-4">{bovino.sexo || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bovino.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                        bovino.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bovino.estado || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      {bovino.fecha_nacimiento ? 
                        new Date(bovino.fecha_nacimiento).toLocaleDateString('es-ES') : 
                        '—'
                      }
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(bovino.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


