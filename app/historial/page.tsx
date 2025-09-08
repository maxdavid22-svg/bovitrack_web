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
    sexo: string | null;
    estado: string | null;
  };
  created_at: string;
};

type Filtros = {
  bovino_codigo: string;
  tipo: string;
  fecha_desde: string;
  fecha_hasta: string;
};

export default function HistorialPage() {
  const [eventos, setEventos] = useState<EventoCompleto[]>([]);
  const [bovinos, setBovinos] = useState<{codigo: string, nombre: string | null}[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtros>({
    bovino_codigo: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  useEffect(() => {
    cargarBovinos();
    cargarEventos();
  }, []);

  const cargarBovinos = async () => {
    const { data, error } = await supabase
      .from('bovinos')
      .select('codigo, nombre')
      .order('codigo');
    
    if (!error) {
      setBovinos(data || []);
    }
  };

  const cargarEventos = async (filtrosAplicados?: Filtros) => {
    setLoading(true);
    try {
      let query = supabase
        .from('eventos')
        .select(`
          id,
          tipo,
          fecha,
          descripcion,
          bovino_id,
          created_at,
          bovinos(codigo, nombre, raza, sexo, estado)
        `)
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false });

      const filtrosFinales = filtrosAplicados || filtros;

      if (filtrosFinales.bovino_codigo) {
        const { data: bovinoData } = await supabase
          .from('bovinos')
          .select('id')
          .eq('codigo', filtrosFinales.bovino_codigo)
          .single();
        
        if (bovinoData) {
          query = query.eq('bovino_id', bovinoData.id);
        }
      }

      if (filtrosFinales.tipo) {
        query = query.eq('tipo', filtrosFinales.tipo);
      }

      if (filtrosFinales.fecha_desde) {
        query = query.gte('fecha', filtrosFinales.fecha_desde);
      }

      if (filtrosFinales.fecha_hasta) {
        query = query.lte('fecha', filtrosFinales.fecha_hasta);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando eventos:', error);
      } else {
        // Mapear la respuesta de Supabase para extraer el objeto bovino individual
        const eventosMapeados = (data || []).map((evento: any) => ({
          ...evento,
          bovinos: evento.bovinos || { codigo: '', nombre: null, raza: null, sexo: null, estado: null }
        }));
        setEventos(eventosMapeados);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarEventos(filtros);
  };

  const limpiarFiltros = () => {
    const filtrosLimpios = {
      bovino_codigo: '',
      tipo: '',
      fecha_desde: '',
      fecha_hasta: ''
    };
    setFiltros(filtrosLimpios);
    cargarEventos(filtrosLimpios);
  };

  const tiposEvento = [
    'Registro', 'Vacunación', 'Tratamiento', 'Pesaje', 'Reproducción',
    'Parto', 'Venta', 'Muerte', 'Traslado', 'Otro'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">📊 Historial de Trazabilidad</h1>
        <p className="text-teal-100">Seguimiento completo de eventos por bovino</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bovino
            </label>
            <select
              value={filtros.bovino_codigo}
              onChange={(e) => setFiltros({...filtros, bovino_codigo: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Todos los bovinos</option>
              {bovinos.map(b => (
                <option key={b.codigo} value={b.codigo}>
                  {b.codigo} - {b.nombre || 'Sin nombre'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Todos los tipos</option>
              {tiposEvento.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            🔍 Aplicar Filtros
          </button>
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Eventos Encontrados ({eventos.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron eventos con los filtros aplicados
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
                {eventos.map(evento => (
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

      {/* Resumen por bovino */}
      {eventos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Resumen por Bovino</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Set(eventos.map(e => e.bovinos.codigo))).map(codigo => {
              const eventosBovino = eventos.filter(e => e.bovinos.codigo === codigo);
              const bovino = eventosBovino[0].bovinos;
              const tiposUnicos = new Set(eventosBovino.map(e => e.tipo));
              
              return (
                <div key={codigo} className="border rounded-lg p-4">
                  <div className="font-mono text-blue-600 font-semibold">{codigo}</div>
                  <div className="text-gray-600 text-sm mb-2">
                    {bovino.nombre || 'Sin nombre'} • {bovino.raza || 'Sin raza'}
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Total eventos: {eventosBovino.length}</div>
                    <div className="text-gray-500">Tipos: {Array.from(tiposUnicos).join(', ')}</div>
                    <div className="text-gray-500">
                      Último: {new Date(eventosBovino[0].fecha).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
