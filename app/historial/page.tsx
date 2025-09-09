'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type EventoCompleto = {
  id: string;
  tipo: string;
  fecha: string;
  descripcion: string | null;
  medicamento: string | null;
  dosis: string | null;
  veterinario: string | null;
  observaciones: string | null;
  peso_kg: number | null;
  costo: number | null;
  ubicacion: string | null;
  hora: string | null;
  comprador: string | null;
  destino: string | null;
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
          medicamento,
          dosis,
          veterinario,
          observaciones,
          peso_kg,
          costo,
          ubicacion,
          hora,
          comprador,
          destino,
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
        // Debug: Log para verificar los datos recibidos
        console.log('=== DEBUG HISTORIAL ===');
        console.log('Total eventos recibidos:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('Primer evento:', data[0]);
          console.log('Campos del primer evento:', {
            medicamento: data[0].medicamento,
            dosis: data[0].dosis,
            veterinario: data[0].veterinario,
            observaciones: data[0].observaciones,
            peso_kg: data[0].peso_kg,
            costo: data[0].costo,
            ubicacion: data[0].ubicacion,
            hora: data[0].hora
          });
        }
        console.log('=== FIN DEBUG ===');
        
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

      {/* Estadísticas modernas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{eventos.length}</div>
              <div className="text-teal-100 text-sm">Total Eventos</div>
            </div>
            <div className="text-4xl opacity-80">📊</div>
          </div>
          <div className="mt-2 text-xs text-teal-200">
            {eventos.length > 0 ? `Último: ${new Date(eventos[0]?.fecha).toLocaleDateString('es-ES')}` : 'Sin eventos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {new Set(eventos.map(e => e.bovinos.codigo)).size}
              </div>
              <div className="text-blue-100 text-sm">Bovinos Únicos</div>
            </div>
            <div className="text-4xl opacity-80">🐄</div>
          </div>
          <div className="mt-2 text-xs text-blue-200">
            {eventos.length > 0 ? `Promedio: ${(eventos.length / new Set(eventos.map(e => e.bovinos.codigo)).size).toFixed(1)} eventos/bovino` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {new Set(eventos.map(e => e.tipo)).size}
              </div>
              <div className="text-green-100 text-sm">Tipos de Evento</div>
            </div>
            <div className="text-4xl opacity-80">🏷️</div>
          </div>
          <div className="mt-2 text-xs text-green-200">
            {eventos.length > 0 ? `Diversidad de eventos` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {eventos.filter(e => e.veterinario).length}
              </div>
              <div className="text-purple-100 text-sm">Con Veterinario</div>
            </div>
            <div className="text-4xl opacity-80">👨‍⚕️</div>
          </div>
          <div className="mt-2 text-xs text-purple-200">
            {eventos.length > 0 ? `${((eventos.filter(e => e.veterinario).length / eventos.length) * 100).toFixed(1)}% del total` : 'Sin datos'}
          </div>
        </div>
      </div>

      {/* Distribución por Tipo de Evento */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">📈 Distribución por Tipo de Evento</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Cantidad por Tipo</h3>
            <div className="space-y-3">
              {(() => {
                const tipos = eventos.reduce((acc, e) => {
                  acc[e.tipo] = (acc[e.tipo] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                const total = eventos.length;
                
                return Object.entries(tipos)
                  .sort(([,a], [,b]) => b - a)
                  .map(([tipo, cantidad]) => {
                    const porcentaje = total > 0 ? (cantidad / total) * 100 : 0;
                    return (
                      <div key={tipo} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{tipo}</span>
                          <span className="text-gray-600">{cantidad} ({porcentaje.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              tipo === 'Vacunación' ? 'bg-green-500' :
                              tipo === 'Tratamiento' ? 'bg-yellow-500' :
                              tipo === 'Pesaje' ? 'bg-purple-500' :
                              tipo === 'Reproducción' ? 'bg-pink-500' :
                              tipo === 'Parto' ? 'bg-orange-500' :
                              tipo === 'Venta' ? 'bg-red-500' :
                              tipo === 'Muerte' ? 'bg-gray-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-3">Eventos por Veterinario</h3>
            <div className="space-y-3">
              {(() => {
                const veterinarios = eventos
                  .filter(e => e.veterinario)
                  .reduce((acc, e) => {
                    const vet = e.veterinario!;
                    acc[vet] = (acc[vet] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                return Object.entries(veterinarios)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([veterinario, cantidad]) => (
                    <div key={veterinario} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-semibold text-sm">
                            {veterinario.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{veterinario}</div>
                          <div className="text-xs text-gray-500">{cantidad} eventos</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-purple-600">{cantidad}</div>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>
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
                  <th className="p-4 font-semibold text-gray-700">Fecha/Hora</th>
                  <th className="p-4 font-semibold text-gray-700">Bovino</th>
                  <th className="p-4 font-semibold text-gray-700">Tipo</th>
                  <th className="p-4 font-semibold text-gray-700">Detalles</th>
                  <th className="p-4 font-semibold text-gray-700">Veterinario</th>
                  <th className="p-4 font-semibold text-gray-700">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map(evento => (
                  <tr key={evento.id} className="border-t hover:bg-teal-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">
                        {new Date(evento.fecha).toLocaleDateString('es-ES')}
                      </div>
                      {evento.hora && (
                        <div className="text-xs text-gray-500">
                          🕐 {evento.hora}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-blue-600 font-semibold">{evento.bovinos.codigo}</div>
                      <div className="text-gray-600 text-xs">
                        {evento.bovinos.nombre || 'Sin nombre'} • {evento.bovinos.raza || 'Sin raza'}
                      </div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          evento.bovinos.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                          evento.bovinos.estado === 'Vendido' ? 'bg-blue-100 text-blue-800' :
                          evento.bovinos.estado === 'Sacrificado' ? 'bg-red-100 text-red-800' :
                          evento.bovinos.estado === 'Muerto' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {evento.bovinos.estado || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      <div className="space-y-1 max-w-xs">
                        {evento.descripcion && (
                          <div className="text-sm text-gray-800">{evento.descripcion}</div>
                        )}
                        {evento.medicamento && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">💊 Medicamento:</span> {evento.medicamento}
                          </div>
                        )}
                        {evento.dosis && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">📏 Dosis:</span> {evento.dosis}
                          </div>
                        )}
                        {evento.peso_kg && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">⚖️ Peso:</span> {evento.peso_kg} kg
                          </div>
                        )}
                        {evento.costo && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">💰 Costo:</span> ${evento.costo}
                          </div>
                        )}
                        {evento.ubicacion && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">📍 Ubicación:</span> {evento.ubicacion}
                          </div>
                        )}
                        {evento.observaciones && (
                          <div className="text-xs text-gray-500 italic">
                            📝 {evento.observaciones}
                          </div>
                        )}
                        {evento.comprador && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">👤 Comprador:</span> {evento.comprador}
                          </div>
                        )}
                        {evento.destino && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-600">📍 Destino:</span> {evento.destino}
                          </div>
                        )}
                        {!evento.descripcion && !evento.medicamento && !evento.dosis && !evento.peso_kg && !evento.costo && !evento.ubicacion && !evento.observaciones && !evento.comprador && !evento.destino && (
                          <div className="text-xs text-gray-400">Sin detalles</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {evento.veterinario ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">👨‍⚕️ {evento.veterinario}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Sin veterinario</div>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      <div className="font-medium">
                        {new Date(evento.created_at).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs">
                        {new Date(evento.created_at).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
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
