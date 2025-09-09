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
    tag_rfid: string | null;
    nombre_propietario: string | null;
  };
  created_at: string;
};

type Filtros = {
  bovino_codigo: string;
  tipo: string;
  fecha_desde: string;
  fecha_hasta: string;
  solo_con_tag: boolean;
  propietario: string;
  estado_bovino: string;
};

export default function HistorialPage() {
  const [eventos, setEventos] = useState<EventoCompleto[]>([]);
  const [bovinos, setBovinos] = useState<{codigo: string, nombre: string | null, tag_rfid: string | null}[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtros>({
    bovino_codigo: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: '',
    solo_con_tag: false,
    propietario: '',
    estado_bovino: ''
  });

  useEffect(() => {
    cargarBovinos();
    cargarEventos();
  }, []);

  const cargarBovinos = async () => {
    const { data, error } = await supabase
      .from('bovinos')
      .select('codigo, nombre, tag_rfid')
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
          bovinos(codigo, nombre, raza, sexo, estado, tag_rfid, nombre_propietario)
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
        let eventosMapeados = (data || []).map((evento: any) => ({
          ...evento,
          bovinos: evento.bovinos || { codigo: '', nombre: null, raza: null, sexo: null, estado: null, tag_rfid: null, nombre_propietario: null }
        }));

        // Aplicar filtros adicionales
        if (filtrosFinales.solo_con_tag) {
          eventosMapeados = eventosMapeados.filter(evento => evento.bovinos.tag_rfid);
        }

        if (filtrosFinales.propietario) {
          eventosMapeados = eventosMapeados.filter(evento => 
            evento.bovinos.nombre_propietario === filtrosFinales.propietario
          );
        }

        if (filtrosFinales.estado_bovino) {
          eventosMapeados = eventosMapeados.filter(evento => 
            evento.bovinos.estado === filtrosFinales.estado_bovino
          );
        }

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
      fecha_hasta: '',
      solo_con_tag: false,
      propietario: '',
      estado_bovino: ''
    };
    setFiltros(filtrosLimpios);
    cargarEventos(filtrosLimpios);
  };

  const tiposEvento = [
    'Registro', 'Vacunación', 'Tratamiento', 'Pesaje', 'Reproducción',
    'Parto', 'Venta', 'Muerte', 'Traslado', 'Otro'
  ];

  const estadosBovino = [
    'Activo', 'Vendido', 'Muerto', 'Sacrificado'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">📊 Historial de Trazabilidad</h1>
        <p className="text-teal-100">Seguimiento completo de eventos por bovino</p>
      </div>

      {/* Estadísticas modernas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
            <div className="text-4xl opacity-80">📋</div>
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
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {new Set(eventos.map(e => e.bovinos.codigo).filter(codigo => {
                  const bovino = eventos.find(e => e.bovinos.codigo === codigo)?.bovinos;
                  return bovino?.tag_rfid;
                })).size}
              </div>
              <div className="text-indigo-100 text-sm">Con Tag RFID</div>
            </div>
            <div className="text-4xl opacity-80">🏷️</div>
          </div>
          <div className="mt-2 text-xs text-indigo-200">
            {new Set(eventos.map(e => e.bovinos.codigo)).size > 0 ? 
              `${((new Set(eventos.map(e => e.bovinos.codigo).filter(codigo => {
                const bovino = eventos.find(e => e.bovinos.codigo === codigo)?.bovinos;
                return bovino?.tag_rfid;
              })).size / new Set(eventos.map(e => e.bovinos.codigo)).size) * 100).toFixed(1)}% de bovinos` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {new Set(eventos.map(e => e.bovinos.nombre_propietario).filter(p => p)).size}
              </div>
              <div className="text-amber-100 text-sm">Propietarios Activos</div>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
          <div className="mt-2 text-xs text-amber-200">
            {new Set(eventos.map(e => e.bovinos.codigo)).size > 0 ? 
              `Promedio: ${(new Set(eventos.map(e => e.bovinos.codigo)).size / new Set(eventos.map(e => e.bovinos.nombre_propietario).filter(p => p)).size).toFixed(1)} bovinos/propietario` : 'Sin datos'}
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

      {/* Estadísticas de Tag RFID */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">🏷️ Estadísticas de Tag RFID</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Distribución de Tags</h3>
            <div className="space-y-3">
              {(() => {
                const bovinosUnicos = Array.from(new Set(eventos.map(e => e.bovinos.codigo)));
                const conTag = bovinosUnicos.filter(codigo => {
                  const bovino = eventos.find(e => e.bovinos.codigo === codigo)?.bovinos;
                  return bovino?.tag_rfid;
                }).length;
                const sinTag = bovinosUnicos.length - conTag;
                const total = bovinosUnicos.length;
                
                return (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium flex items-center">
                          <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                          Con Tag RFID
                        </span>
                        <span className="text-gray-600">{conTag} ({total > 0 ? ((conTag / total) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-indigo-500"
                          style={{ width: `${total > 0 ? (conTag / total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium flex items-center">
                          <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                          Sin Tag RFID
                        </span>
                        <span className="text-gray-600">{sinTag} ({total > 0 ? ((sinTag / total) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-gray-400"
                          style={{ width: `${total > 0 ? (sinTag / total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-3">Bovinos con Tag RFID</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(() => {
                const bovinosConTag = Array.from(new Set(eventos.map(e => e.bovinos.codigo)))
                  .filter(codigo => {
                    const bovino = eventos.find(e => e.bovinos.codigo === codigo)?.bovinos;
                    return bovino?.tag_rfid;
                  })
                  .map(codigo => {
                    const bovino = eventos.find(e => e.bovinos.codigo === codigo)?.bovinos;
                    const eventosBovino = eventos.filter(e => e.bovinos.codigo === codigo);
                    return {
                      codigo,
                      nombre: bovino?.nombre,
                      tag_rfid: bovino?.tag_rfid,
                      eventos: eventosBovino.length
                    };
                  })
                  .sort((a, b) => b.eventos - a.eventos)
                  .slice(0, 10);

                return bovinosConTag.map(bovino => (
                  <div key={bovino.codigo} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-indigo-600 font-semibold text-sm">🏷️</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{bovino.codigo}</div>
                        <div className="text-xs text-gray-500">{bovino.nombre || 'Sin nombre'}</div>
                        <div className="text-xs text-indigo-600 font-mono">{bovino.tag_rfid}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">{bovino.eventos}</div>
                      <div className="text-xs text-gray-500">eventos</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros modernos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">🔍 Filtros de Trazabilidad</h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {eventos.length} eventos encontrados
          </div>
        </div>

        {/* Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🐄 Bovino
            </label>
            <select
              value={filtros.bovino_codigo}
              onChange={(e) => setFiltros({...filtros, bovino_codigo: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Tipo de Evento
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            >
              <option value="">Todos los tipos</option>
              {tiposEvento.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Fecha Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({...filtros, fecha_desde: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Fecha Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({...filtros, fecha_hasta: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Propietario
            </label>
            <select
              value={filtros.propietario}
              onChange={(e) => setFiltros({...filtros, propietario: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            >
              <option value="">Todos los propietarios</option>
              {Array.from(new Set(eventos.map(e => e.bovinos.nombre_propietario).filter(p => p))).map(propietario => (
                <option key={propietario} value={propietario!}>{propietario}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🐄 Estado del Bovino
            </label>
            <select
              value={filtros.estado_bovino}
              onChange={(e) => setFiltros({...filtros, estado_bovino: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            >
              <option value="">Todos los estados</option>
              {estadosBovino.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltros({...filtros, solo_con_tag: !filtros.solo_con_tag})}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filtros.solo_con_tag 
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' 
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${filtros.solo_con_tag ? 'bg-indigo-500' : 'bg-gray-400'}`}></div>
              <span>🏷️ Solo con Tag RFID</span>
              <span className="text-xs bg-white px-2 py-1 rounded-full">
                {new Set(eventos.map(e => e.bovinos.codigo).filter(codigo => {
                  const bovino = eventos.find(e => e.bovinos.codigo === codigo)?.bovinos;
                  return bovino?.tag_rfid;
                })).size}
              </span>
            </button>
          </div>
        </div>

        {/* Botones de acción modernos */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={aplicarFiltros}
            className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Aplicar Filtros</span>
          </button>

          <button
            onClick={limpiarFiltros}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Limpiar Filtros</span>
          </button>
        </div>

        {/* Indicadores de filtros activos */}
        {(filtros.bovino_codigo || filtros.tipo || filtros.fecha_desde || filtros.fecha_hasta || filtros.solo_con_tag || filtros.propietario || filtros.estado_bovino) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filtros.bovino_codigo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                🐄 {filtros.bovino_codigo}
                <button
                  onClick={() => setFiltros({...filtros, bovino_codigo: ''})}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filtros.tipo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                🏷️ {filtros.tipo}
                <button
                  onClick={() => setFiltros({...filtros, tipo: ''})}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filtros.fecha_desde && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                📅 Desde: {filtros.fecha_desde}
                <button
                  onClick={() => setFiltros({...filtros, fecha_desde: ''})}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filtros.fecha_hasta && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                📅 Hasta: {filtros.fecha_hasta}
                <button
                  onClick={() => setFiltros({...filtros, fecha_hasta: ''})}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
            {filtros.solo_con_tag && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                🏷️ Solo con Tag RFID
                <button
                  onClick={() => setFiltros({...filtros, solo_con_tag: false})}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            )}
            {filtros.propietario && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                👥 {filtros.propietario}
                <button
                  onClick={() => setFiltros({...filtros, propietario: ''})}
                  className="ml-2 text-amber-600 hover:text-amber-800"
                >
                  ×
                </button>
              </span>
            )}
            {filtros.estado_bovino && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                🐄 {filtros.estado_bovino}
                <button
                  onClick={() => setFiltros({...filtros, estado_bovino: ''})}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Resultados modernos */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              📋 Eventos de Trazabilidad
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {eventos.length} eventos
              </div>
              {eventos.length > 0 && (
                <div className="text-xs text-gray-500">
                  Último: {new Date(eventos[0]?.fecha).toLocaleDateString('es-ES')}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              <span>Cargando eventos...</span>
            </div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">No se encontraron eventos</h3>
            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-50 to-teal-100 text-left">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">📅 Fecha/Hora</th>
                  <th className="p-4 font-semibold text-gray-700">🐄 Bovino</th>
                  <th className="p-4 font-semibold text-gray-700">👥 Propietario</th>
                  <th className="p-4 font-semibold text-gray-700">🏷️ Tag RFID</th>
                  <th className="p-4 font-semibold text-gray-700">📋 Tipo</th>
                  <th className="p-4 font-semibold text-gray-700">📝 Detalles</th>
                  <th className="p-4 font-semibold text-gray-700">👨‍⚕️ Veterinario</th>
                  <th className="p-4 font-semibold text-gray-700">⏰ Registrado</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento, index) => (
                  <tr key={evento.id} className={`border-t hover:bg-teal-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">
                        {new Date(evento.fecha).toLocaleDateString('es-ES')}
                      </div>
                      {evento.hora && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {evento.hora}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-blue-600 font-semibold text-sm">{evento.bovinos.codigo}</div>
                      <div className="text-gray-600 text-xs mt-1">
                        {evento.bovinos.nombre || 'Sin nombre'} • {evento.bovinos.raza || 'Sin raza'}
                      </div>
                      <div className="mt-2">
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
                      {evento.bovinos.nombre_propietario ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">👥 {evento.bovinos.nombre_propietario}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">Sin propietario</div>
                      )}
                    </td>
                    <td className="p-4">
                      {evento.bovinos.tag_rfid ? (
                        <div className="text-sm">
                          <div className="font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded">
                            {evento.bovinos.tag_rfid}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">Sin tag</div>
                      )}
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
                      <div className="space-y-2 max-w-xs">
                        {evento.descripcion && (
                          <div className="text-sm text-gray-800 font-medium">{evento.descripcion}</div>
                        )}
                        <div className="grid grid-cols-1 gap-1">
                          {evento.medicamento && (
                            <div className="text-xs flex items-center">
                              <span className="text-gray-500 mr-2">💊</span>
                              <span className="font-medium text-gray-600">Medicamento:</span>
                              <span className="ml-1">{evento.medicamento}</span>
                            </div>
                          )}
                          {evento.dosis && (
                            <div className="text-xs flex items-center">
                              <span className="text-gray-500 mr-2">📏</span>
                              <span className="font-medium text-gray-600">Dosis:</span>
                              <span className="ml-1">{evento.dosis}</span>
                            </div>
                          )}
                          {evento.peso_kg && (
                            <div className="text-xs flex items-center">
                              <span className="text-gray-500 mr-2">⚖️</span>
                              <span className="font-medium text-gray-600">Peso:</span>
                              <span className="ml-1">{evento.peso_kg} kg</span>
                            </div>
                          )}
                          {evento.costo && (
                            <div className="text-xs flex items-center">
                              <span className="text-gray-500 mr-2">💰</span>
                              <span className="font-medium text-gray-600">Costo:</span>
                              <span className="ml-1">${evento.costo}</span>
                            </div>
                          )}
                          {evento.ubicacion && (
                            <div className="text-xs flex items-center">
                              <span className="text-gray-500 mr-2">📍</span>
                              <span className="font-medium text-gray-600">Ubicación:</span>
                              <span className="ml-1">{evento.ubicacion}</span>
                            </div>
                          )}
                          {evento.comprador && (
                            <div className="text-xs flex items-center">
                              <span className="text-gray-500 mr-2">👤</span>
                              <span className="font-medium text-gray-600">Comprador:</span>
                              <span className="ml-1">{evento.comprador}</span>
                            </div>
                          )}
                          {evento.destino && (
                            <div className="text-xs flex items-center">
                              <span className="text-gray-500 mr-2">📍</span>
                              <span className="font-medium text-gray-600">Destino:</span>
                              <span className="ml-1">{evento.destino}</span>
                            </div>
                          )}
                        </div>
                        {evento.observaciones && (
                          <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                            📝 {evento.observaciones}
                          </div>
                        )}
                        {!evento.descripcion && !evento.medicamento && !evento.dosis && !evento.peso_kg && !evento.costo && !evento.ubicacion && !evento.observaciones && !evento.comprador && !evento.destino && (
                          <div className="text-xs text-gray-400 italic">Sin detalles adicionales</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {evento.veterinario ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-800 flex items-center">
                            <span className="text-gray-500 mr-2">👨‍⚕️</span>
                            {evento.veterinario}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">Sin veterinario</div>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      <div className="font-medium">
                        {new Date(evento.created_at).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs flex items-center mt-1">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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

      {/* Resumen por bovino moderno */}
      {eventos.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">📊 Resumen por Bovino</h3>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {Array.from(new Set(eventos.map(e => e.bovinos.codigo))).length} bovinos únicos
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(new Set(eventos.map(e => e.bovinos.codigo))).map(codigo => {
              const eventosBovino = eventos.filter(e => e.bovinos.codigo === codigo);
              const bovino = eventosBovino[0].bovinos;
              const tiposUnicos = new Set(eventosBovino.map(e => e.tipo));
              const ultimoEvento = eventosBovino[0];
              
              return (
                <div key={codigo} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-mono text-blue-600 font-semibold text-lg">{codigo}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bovino.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                      bovino.estado === 'Vendido' ? 'bg-blue-100 text-blue-800' :
                      bovino.estado === 'Sacrificado' ? 'bg-red-100 text-red-800' :
                      bovino.estado === 'Muerto' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bovino.estado || '—'}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 text-sm mb-4">
                    <div className="font-medium">{bovino.nombre || 'Sin nombre'}</div>
                    <div className="text-xs text-gray-500">{bovino.raza || 'Sin raza'}</div>
                    {bovino.tag_rfid && (
                      <div className="text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded mt-1">
                        🏷️ {bovino.tag_rfid}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">📊 Total eventos:</span>
                      <span className="font-semibold text-gray-800">{eventosBovino.length}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">🏷️ Tipos:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.from(tiposUnicos).slice(0, 3).map(tipo => (
                          <span key={tipo} className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tipo === 'Registro' ? 'bg-blue-100 text-blue-800' :
                            tipo === 'Vacunación' ? 'bg-green-100 text-green-800' :
                            tipo === 'Tratamiento' ? 'bg-yellow-100 text-yellow-800' :
                            tipo === 'Pesaje' ? 'bg-purple-100 text-purple-800' :
                            tipo === 'Reproducción' ? 'bg-pink-100 text-pink-800' :
                            tipo === 'Parto' ? 'bg-orange-100 text-orange-800' :
                            tipo === 'Venta' ? 'bg-red-100 text-red-800' :
                            tipo === 'Muerte' ? 'bg-gray-100 text-gray-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {tipo}
                          </span>
                        ))}
                        {Array.from(tiposUnicos).length > 3 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{Array.from(tiposUnicos).length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">📅 Último evento:</span>
                      <span className="font-medium text-gray-800">
                        {new Date(ultimoEvento.fecha).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      <span className="font-medium">Último tipo:</span> {ultimoEvento.tipo}
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
