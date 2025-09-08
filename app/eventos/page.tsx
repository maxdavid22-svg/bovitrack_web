'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type EventoCompleto = {
  id: string;
  tipo: string;
  fecha: string;
  descripcion: string | null;
  bovino_id: string;
  bovinos: {
    codigo: string;
    nombre: string | null;
    raza: string | null;
    estado: string | null;
  };
  created_at: string;
};

export default function EventosPage() {
  const [items, setItems] = useState<EventoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          id,
          tipo,
          fecha,
          descripcion,
          bovino_id,
          created_at,
          bovinos(codigo, nombre, raza, estado)
        `)
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) {
        console.error('Error cargando eventos:', error);
      } else {
        // Mapear la respuesta de Supabase para extraer el objeto bovino individual
        const eventosMapeados = (data || []).map((evento: any) => ({
          ...evento,
          bovinos: evento.bovinos[0] || { codigo: '', nombre: null, raza: null, estado: null }
        }));
        setItems(eventosMapeados);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tiposEvento = [
    'Registro', 'Vacunación', 'Tratamiento', 'Pesaje', 'Reproducción',
    'Parto', 'Venta', 'Muerte', 'Traslado', 'Otro'
  ];

  const eventosFiltrados = items.filter(evento => {
    const cumpleFiltroTexto = 
      evento.bovinos.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      (evento.bovinos.nombre && evento.bovinos.nombre.toLowerCase().includes(filtro.toLowerCase())) ||
      (evento.descripcion && evento.descripcion.toLowerCase().includes(filtro.toLowerCase()));
    
    const cumpleFiltroTipo = !filtroTipo || evento.tipo === filtroTipo;
    
    return cumpleFiltroTexto && cumpleFiltroTipo;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">📅 Historial de Eventos</h1>
            <p className="text-purple-100">Registro completo de eventos del ganado</p>
          </div>
          <a 
            href="/nuevo-evento" 
            className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition font-medium"
          >
            ➕ Nuevo Evento
          </a>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <div className="text-sm text-gray-600">
            Mostrando {eventosFiltrados.length} de {items.length} eventos
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar por bovino, descripción..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todos los tipos</option>
              {tiposEvento.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de eventos */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Cargando eventos...</div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filtro || filtroTipo ? 'No se encontraron eventos con los filtros aplicados' : 'No hay eventos registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Bovino</th>
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium">Descripción</th>
                  <th className="p-4 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {eventosFiltrados.map(evento => (
                  <tr key={evento.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">
                        {new Date(evento.fecha).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-blue-600">{evento.bovinos.codigo}</div>
                      <div className="text-gray-600 text-xs">
                        {evento.bovinos.nombre || 'Sin nombre'} • {evento.bovinos.raza || 'Sin raza'}
                      </div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          evento.bovinos.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                          evento.bovinos.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {evento.bovinos.estado || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        evento.tipo === 'Registro' ? 'bg-blue-100 text-blue-800' :
                        evento.tipo === 'Vacunación' ? 'bg-green-100 text-green-800' :
                        evento.tipo === 'Tratamiento' ? 'bg-yellow-100 text-yellow-800' :
                        evento.tipo === 'Pesaje' ? 'bg-purple-100 text-purple-800' :
                        evento.tipo === 'Reproducción' ? 'bg-pink-100 text-pink-800' :
                        evento.tipo === 'Parto' ? 'bg-orange-100 text-orange-800' :
                        evento.tipo === 'Venta' ? 'bg-red-100 text-red-800' :
                        evento.tipo === 'Muerte' ? 'bg-gray-100 text-gray-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {evento.tipo}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        {evento.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(evento.created_at).toLocaleString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen por tipo */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Resumen por Tipo de Evento</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiposEvento.map(tipo => {
              const cantidad = items.filter(e => e.tipo === tipo).length;
              if (cantidad === 0) return null;
              
              return (
                <div key={tipo} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{cantidad}</div>
                  <div className="text-sm text-gray-600">{tipo}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


