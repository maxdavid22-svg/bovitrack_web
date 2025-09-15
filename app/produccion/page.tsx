'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type KPIs = {
  total: number;
  carne: number;
  leche: number;
  dobleProposito: number;
  engorde: number;
  reproduccion: number;
  desconocido: number;
};

type Serie = { label: string; valor: number; emoji: string; color: string };

type EventoOrdeno = {
  fecha: string;
  litros: number | null;
};

type EventoEngorde = {
  fecha: string;
  peso_kg: number | null;
  gmd: number | null;
};

export default function ProduccionPage() {
  const [kpis, setKpis] = useState<KPIs>({ total: 0, carne: 0, leche: 0, dobleProposito: 0, engorde: 0, reproduccion: 0, desconocido: 0 });
  const [loading, setLoading] = useState(true);
  const [ordenhoUltimos30, setOrdenhoUltimos30] = useState<EventoOrdeno[]>([]);
  const [litrosHoy, setLitrosHoy] = useState(0);
  const [litros7d, setLitros7d] = useState(0);
  const [litros30d, setLitros30d] = useState(0);
  const [engordeUltimos30, setEngordeUltimos30] = useState<EventoEngorde[]>([]);
  const [promPeso30d, setPromPeso30d] = useState(0);
  const [promGmd30d, setPromGmd30d] = useState(0);
  const [serieLitrosDia, setSerieLitrosDia] = useState<Array<{ fecha: string; total: number }>>([]);
  const [serieEngordeDia, setSerieEngordeDia] = useState<Array<{ fecha: string; total: number }>>([]);
  const [mostrarDetalles, setMostrarDetalles] = useState({
    bovinosLeche: false,
    bovinosCarne: false,
    ultimosOrdenos: false
  });
  const [alertas, setAlertas] = useState<any[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('bovinos')
          .select('finalidad_productiva');
        if (error) throw error;

        const total = data?.length || 0;
        const count = (v: string) => data?.filter(b => b.finalidad_productiva === v).length || 0;
        const k: KPIs = {
          total,
          carne: count('Carne'),
          leche: count('Leche'),
          dobleProposito: count('Doble propósito'),
          engorde: count('Engorde'),
          reproduccion: count('Reproducción'),
          desconocido: count('Desconocido') + (data?.filter(b => !b.finalidad_productiva).length || 0)
        };
        setKpis(k);

        // Cargar eventos de ordeño últimos 30 días
        const hoy = new Date();
        const hace30 = new Date(hoy);
        hace30.setDate(hoy.getDate() - 30);
        const desde = hace30.toISOString().split('T')[0];

        const { data: evs, error: evErr } = await supabase
          .from('eventos')
          .select('fecha, litros, tipo')
          .gte('fecha', desde)
          .eq('tipo', 'Ordeño')
          .order('fecha', { ascending: true });
        if (evErr) throw evErr;

        const ordenos: EventoOrdeno[] = (evs || []).map((e: any) => ({ fecha: e.fecha, litros: e.litros ?? 0 }));
        setOrdenhoUltimos30(ordenos);

        // Agregados
        const yyyyMmDd = (d: Date) => d.toISOString().split('T')[0];
        const hoyStr = yyyyMmDd(hoy);
        const hace7 = new Date(hoy);
        hace7.setDate(hoy.getDate() - 7);
        const desde7 = yyyyMmDd(hace7);

        const sum = (arr: EventoOrdeno[]) => arr.reduce((acc, it) => acc + (it.litros || 0), 0);
        setLitros30d(sum(ordenos));
        setLitros7d(sum(ordenos.filter(o => o.fecha >= desde7)));
        setLitrosHoy(sum(ordenos.filter(o => o.fecha === hoyStr)));

        // Serie diaria (litros por día últimos 30)
        const dias: string[] = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(hoy);
          d.setDate(hoy.getDate() - i);
          dias.push(yyyyMmDd(d));
        }
        const litrosPorDia = dias.map(fecha => {
          const eventosDelDia = ordenos.filter(o => o.fecha === fecha);
          const totalLitros = eventosDelDia.reduce((acc, evento) => acc + (evento.litros || 0), 0);
          return { fecha, total: totalLitros };
        });
        setSerieLitrosDia(litrosPorDia);

        // Cargar eventos de Engorde últimos 30 días
        const { data: evsEng, error: evEngErr } = await supabase
          .from('eventos')
          .select('fecha, peso_kg, gmd, tipo')
          .gte('fecha', desde)
          .eq('tipo', 'Engorde')
          .order('fecha', { ascending: true });
        if (evEngErr) throw evEngErr;
        const eng: EventoEngorde[] = (evsEng || []).map((e: any) => ({ fecha: e.fecha, peso_kg: e.peso_kg ?? null, gmd: e.gmd ?? null }));
        setEngordeUltimos30(eng);
        const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
        setPromPeso30d(avg(eng.filter(e=>typeof e.peso_kg==='number').map(e=>e.peso_kg as number)));
        setPromGmd30d(avg(eng.filter(e=>typeof e.gmd==='number').map(e=>e.gmd as number)));

        // Serie diaria (suma de pesos de engorde por día)
        const engPorDia = dias.map(fecha => {
          const eventosDelDia = eng.filter(o => o.fecha === fecha);
          const totalPeso = eventosDelDia.reduce((acc, evento) => acc + (evento.peso_kg || 0), 0);
          return { fecha, total: totalPeso };
        });
        setSerieEngordeDia(engPorDia);

        // Cargar alertas de inocuidad
        const { data: alertasData, error: alertasError } = await supabase
          .from('alertas_inocuidad')
          .select(`
            id,
            titulo,
            descripcion,
            nivel_riesgo,
            fecha_deteccion,
            fecha_vencimiento,
            es_activa,
            bovinos!inner(
              codigo,
              nombre,
              finalidad_productiva
            ),
            tipos_alertas!inner(
              nombre,
              codigo
            )
          `)
          .eq('es_activa', true)
          .order('nivel_riesgo', { ascending: true })
          .order('fecha_deteccion', { ascending: false });

        if (alertasError) throw alertasError;
        setAlertas(alertasData || []);
      } catch (e) {
        console.error('Error cargando KPIs de producción', e);
      } finally {
        setLoading(false);
        setAlertasLoading(false);
      }
    })();
  }, []);

  const series: Serie[] = [
    { label: 'Carne', valor: kpis.carne, emoji: '🥩', color: 'bg-red-100 text-red-800' },
    { label: 'Leche', valor: kpis.leche, emoji: '🥛', color: 'bg-blue-100 text-blue-800' },
    { label: 'Doble propósito', valor: kpis.dobleProposito, emoji: '🔄', color: 'bg-purple-100 text-purple-800' },
    { label: 'Engorde', valor: kpis.engorde, emoji: '📈', color: 'bg-orange-100 text-orange-800' },
    { label: 'Reproducción', valor: kpis.reproduccion, emoji: '👶', color: 'bg-pink-100 text-pink-800' },
    { label: 'Desconocido', valor: kpis.desconocido, emoji: '❓', color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <main className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">🏭 Producción</h1>
        <p className="text-green-100">Panel general por finalidad productiva</p>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3">
        <a href="/nuevo-evento?tipo=Ordeño" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">🥛 Registrar ordeño</a>
        <a href="/nuevo-evento?tipo=Engorde" className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 transition">📈 Registrar engorde</a>
      </div>

      {/* Filtros para mostrar detalles */}
      {!loading && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold mb-3">🔍 Mostrar detalles adicionales:</h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={mostrarDetalles.bovinosLeche}
                onChange={(e) => setMostrarDetalles({...mostrarDetalles, bovinosLeche: e.target.checked})}
                className="rounded"
              />
              <span>🥛 Bovinos de Leche</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={mostrarDetalles.bovinosCarne}
                onChange={(e) => setMostrarDetalles({...mostrarDetalles, bovinosCarne: e.target.checked})}
                className="rounded"
              />
              <span>🥩 Bovinos de Carne</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={mostrarDetalles.ultimosOrdenos}
                onChange={(e) => setMostrarDetalles({...mostrarDetalles, ultimosOrdenos: e.target.checked})}
                className="rounded"
              />
              <span>📋 Últimos Ordeños</span>
            </label>
          </div>
        </div>
      )}

      {/* Sección de Alertas de Inocuidad */}
      {!loading && !alertasLoading && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            Alertas de Inocuidad
          </h2>
          
          {alertas.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Sin alertas activas</h3>
              <p className="text-green-600">Todos los bovinos están en condiciones óptimas de inocuidad</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => {
                const bovino = Array.isArray(alerta.bovinos) ? alerta.bovinos[0] : alerta.bovinos;
                const tipoAlerta = Array.isArray(alerta.tipos_alertas) ? alerta.tipos_alertas[0] : alerta.tipos_alertas;
                
                const getNivelRiesgoStyles = (nivel: string) => {
                  switch (nivel) {
                    case 'Crítico':
                      return 'bg-red-100 border-red-300 text-red-800';
                    case 'Alto':
                      return 'bg-orange-100 border-orange-300 text-orange-800';
                    case 'Medio':
                      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
                    case 'Bajo':
                      return 'bg-blue-100 border-blue-300 text-blue-800';
                    default:
                      return 'bg-gray-100 border-gray-300 text-gray-800';
                  }
                };

                const getNivelRiesgoIcon = (nivel: string) => {
                  switch (nivel) {
                    case 'Crítico':
                      return '🔴';
                    case 'Alto':
                      return '🟠';
                    case 'Medio':
                      return '🟡';
                    case 'Bajo':
                      return '🔵';
                    default:
                      return '⚪';
                  }
                };

                return (
                  <div key={alerta.id} className={`border-l-4 rounded-lg p-4 ${getNivelRiesgoStyles(alerta.nivel_riesgo)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getNivelRiesgoIcon(alerta.nivel_riesgo)}</span>
                          <h3 className="font-semibold text-lg">{alerta.titulo}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelRiesgoStyles(alerta.nivel_riesgo)}`}>
                            {alerta.nivel_riesgo}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-3">{alerta.descripcion}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Bovino:</span>
                            <div className="text-gray-600">
                              {bovino?.codigo} - {bovino?.nombre || 'Sin nombre'}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {bovino?.finalidad_productiva}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Tipo de Alerta:</span>
                            <div className="text-gray-600">{tipoAlerta?.nombre}</div>
                          </div>
                          
                          <div>
                            <span className="font-medium">Detectada:</span>
                            <div className="text-gray-600">
                              {new Date(alerta.fecha_deteccion).toLocaleDateString('es-ES')}
                            </div>
                            {alerta.fecha_vencimiento && (
                              <>
                                <span className="font-medium">Vence:</span>
                                <div className="text-gray-600">
                                  {new Date(alerta.fecha_vencimiento).toLocaleDateString('es-ES')}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <button 
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                          onClick={() => {
                            // TODO: Implementar acción de ver detalles
                            console.log('Ver detalles de alerta:', alerta.id);
                          }}
                        >
                          Ver Detalles
                        </button>
                        <button 
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                          onClick={() => {
                            // TODO: Implementar resolución de alerta
                            console.log('Resolver alerta:', alerta.id);
                          }}
                        >
                          Marcar Resuelta
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">Cargando métricas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </div>
          {series.map(s => (
            <div key={s.label} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <div className={`text-xs px-2 py-1 rounded-full ${s.color}`}>{s.emoji} {s.label}</div>
              <div className="text-2xl font-bold mt-2">{s.valor}</div>
              <div className="text-xs text-gray-500">{kpis.total > 0 ? ((s.valor / kpis.total) * 100).toFixed(1) : 0}%</div>
            </div>
          ))}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-sm text-gray-500">🚨 Alertas</div>
            <div className={`text-2xl font-bold ${alertas.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {alertas.length}
            </div>
            <div className="text-xs text-gray-500">
              {alertas.filter(a => a.nivel_riesgo === 'Crítico').length} críticas
            </div>
          </div>
        </div>
      )}

      {/* Secciones de Producción lado a lado */}
      {!loading && (
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda - Producción de Leche */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🥛</span>
                Producción de Leche
              </h2>
              <div className="space-y-6">
                {/* Estadísticas de Leche */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">📊 Estadísticas de Ordeño</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Litros hoy</span>
                      <span className="text-xl font-bold text-blue-600">{litrosHoy.toFixed(1)} L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Últimos 7 días</span>
                      <span className="text-xl font-bold text-blue-600">{litros7d.toFixed(1)} L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Últimos 30 días</span>
                      <span className="text-xl font-bold text-blue-600">{litros30d.toFixed(1)} L</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm text-gray-600">Eventos (30d)</span>
                      <span className="text-lg font-semibold text-gray-700">{ordenhoUltimos30.length}</span>
                    </div>
                  </div>
                </div>

                {/* Gráfica de Tendencia de Leche */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></span>
                    Tendencia de Ordeño (litros/día)
                  </h3>
                  <MiniBarsSVG data={serieLitrosDia} color="#3B82F6" unit="L" />
                </div>
              </div>
            </div>

            {/* Columna Derecha - Producción de Carne */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🥩</span>
                Producción de Carne
              </h2>
              <div className="space-y-6">
                {/* Estadísticas de Engorde */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-orange-700">📈 Estadísticas de Engorde</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Eventos (30d)</span>
                      <span className="text-xl font-bold text-orange-600">{engordeUltimos30.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Peso promedio</span>
                      <span className="text-xl font-bold text-orange-600">{promPeso30d.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">GMD promedio</span>
                      <span className="text-xl font-bold text-orange-600">{promGmd30d.toFixed(2)} kg/día</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm text-gray-600">Total peso (30d)</span>
                      <span className="text-lg font-semibold text-gray-700">{serieEngordeDia.reduce((acc, d) => acc + d.total, 0).toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>

                {/* Gráfica de Tendencia de Engorde */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 text-orange-700 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></span>
                    Tendencia de Engorde (kg/día)
                  </h3>
                  <MiniBarsSVG data={serieEngordeDia} color="#F59E0B" unit="kg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Sección de Rankings */}
      {!loading && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Rankings de Producción
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Bovinos de Leche */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-700">
                <span className="text-2xl">🥛</span>
                Top 5 Productores de Leche (30 días)
              </h3>
              <TopProducersLeche />
            </div>

            {/* Top 5 Bovinos de Carne */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-orange-700">
                <span className="text-2xl">🥩</span>
                Top 5 Productores de Carne (30 días)
              </h3>
              <TopProducersCarne />
            </div>
          </div>
        </div>
      )}

      {/* Secciones detalladas (condicionales) */}
      {!loading && (
        <>
          {/* Bovinos de Leche */}
          {mostrarDetalles.bovinosLeche && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold mb-3">🥛 Bovinos de Leche (recientes)</h3>
              <ListaBovinosCorta finalidad="Leche" />
            </div>
          )}

          {/* Bovinos de Carne */}
          {mostrarDetalles.bovinosCarne && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold mb-3">🥩 Bovinos de Carne (recientes)</h3>
              <ListaBovinosCorta finalidad="Carne" />
            </div>
          )}

          {/* Últimos ordeños */}
          {mostrarDetalles.ultimosOrdenos && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold mb-4">📋 Últimos Ordeños (30 días)</h3>
              {ordenhoUltimos30.length === 0 ? (
                <div className="text-sm text-gray-500">No hay eventos de Ordeño en los últimos 30 días.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="p-3 font-medium">Fecha</th>
                        <th className="p-3 font-medium">Litros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenhoUltimos30.slice(-10).reverse().map((ev, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">{ev.fecha}</td>
                          <td className="p-3">{typeof ev.litros === 'number' ? ev.litros.toFixed(1) : ev.litros}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Siguientes pasos</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Agregar gráficos (líneas/barras) por producción</li>
          <li>Integrar eventos específicos (ordeño, engorde, partos)</li>
          <li>Alertas de inocuidad por tipo (retiros sanitarios, vacunación)</li>
        </ul>
      </div>
    </main>
  );
}

function ListaBovinosCorta({ finalidad }: { finalidad: 'Carne' | 'Leche' | 'Doble propósito' | 'Engorde' | 'Reproducción' | 'Desconocido' }) {
  const [items, setItems] = useState<Array<{ id: string; codigo: string; nombre: string | null; estado: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('bovinos')
          .select('id, codigo, nombre, estado, finalidad_productiva, created_at')
          .eq('finalidad_productiva', finalidad)
          .order('created_at', { ascending: false })
          .limit(6);
        if (error) throw error;
        setItems((data || []).map((b: any) => ({ id: b.id, codigo: b.codigo, nombre: b.nombre, estado: b.estado })));
      } catch (e) {
        console.error('Error cargando lista corta', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [finalidad]);

  if (loading) return <div className="text-sm text-gray-500">Cargando...</div>;
  if (!items.length) return <div className="text-sm text-gray-500">No hay datos</div>;

  return (
    <div className="divide-y">
      {items.map(it => (
        <div key={it.id} className="py-2 flex items-center justify-between">
          <div>
            <div className="font-mono text-blue-700 font-semibold">{it.codigo}</div>
            <div className="text-sm text-gray-700">{it.nombre || 'Sin nombre'}</div>
          </div>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs ${it.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{it.estado || '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniBars({ data, color, unit }: { data: Array<{ fecha: string; total: number }>; color: string; unit: string }) {
  // Solo considerar días con datos para el máximo
  const dataWithValues = data.filter(d => d.total > 0);
  const max = dataWithValues.length > 0 ? Math.max(...dataWithValues.map(d => d.total)) : 1;
  const hasData = data.some(d => d.total > 0);

  // Forzar color con inline-style para evitar overrides
  const colorHexMap: Record<string, string> = {
    'bg-blue-500': '#3B82F6',
    'bg-orange-500': '#F59E0B',
    'bg-green-500': '#22C55E',
    'bg-red-500': '#EF4444',
  };
  const barColor = colorHexMap[color] || '#3B82F6';

  if (!hasData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <div>No hay datos para mostrar</div>
      </div>
    );
  }

  // Debug: mostrar algunos valores
  const sampleData = data.filter(d => d.total > 0).slice(0, 5);
  const allValues = data.filter(d => d.total > 0).map(d => d.total);
  console.log('MiniBars Debug:', { 
    maxValue: max, 
    color,
    sampleData: sampleData.map(d => ({ fecha: d.fecha, total: d.total, percentage: ((d.total / max) * 100).toFixed(1) + '%' })),
    allValues: allValues.slice(0, 10),
    minValue: Math.min(...allValues),
    maxValueActual: Math.max(...allValues)
  });

  return (
    <div>
      <div className="relative h-40">
        {/* Líneas de referencia */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 border-t border-gray-200"></div>
          <div className="absolute top-1/2 left-0 right-0 border-t border-gray-200"></div>
          <div className="absolute bottom-8 left-0 right-0 border-t border-gray-200"></div>
        </div>
        
        {/* Área de barras (sin superposición con etiquetas) */}
        <div className="absolute top-0 left-0 right-0 h-32 flex items-end gap-2 overflow-x-auto">
          {data.map((d, i) => {
            const height = d.total > 0 ? (d.total / max) * 100 : 0;
            return (
              <div key={i} className="flex flex-col items-center min-w-0" title={`${d.fecha}: ${d.total} ${unit} (${height.toFixed(1)}%)`}>
                <div
                  className={`w-3 rounded-t`}
                  style={{ height: `${height}%`, backgroundColor: barColor, border: `1px solid ${barColor}`, filter: 'none' }}
                ></div>
                {d.total > 0 && height >= 50 && i % 4 === 0 && (
                  <div className="text-[10px] leading-none text-gray-600 mt-1 font-mono whitespace-nowrap">
                    {d.total.toFixed(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Etiquetas de fecha en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center gap-2 overflow-x-auto">
          {data.map((d, i) => (
            <div key={`lbl-${i}`} className="w-3 text-[10px] text-gray-500 text-center font-mono">
              {(i % 5 === 0 || i === data.length - 1) ? d.fecha.slice(5) : ''}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Últimos 30 días (máx: {max} {unit})
      </div>
    </div>
  );
}

function MiniBarsSVG({ data, color, unit }: { data: Array<{ fecha: string; total: number }>; color: string; unit: string }) {
  const width = 360; // px visibles
  const height = 140; // px de alto util
  const padding = { top: 20, right: 10, bottom: 20, left: 24 }; // Aumenté top de 10 a 20
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  
  // Solo considerar días con datos para el máximo
  const dataWithValues = data.filter(d => d.total > 0);
  const max = dataWithValues.length > 0 ? Math.max(...dataWithValues.map(d => d.total)) : 1;
  
  
  const barGap = 4;
  const barW = Math.max(2, Math.floor(innerW / data.length) - barGap);

  const y = (v: number) => padding.top + innerH - (v / max) * innerH;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Guías */}
        <line x1={padding.left} y1={padding.top} x2={padding.left + innerW} y2={padding.top} stroke="#E5E7EB" strokeWidth={1} />
        <line x1={padding.left} y1={padding.top + innerH / 2} x2={padding.left + innerW} y2={padding.top + innerH / 2} stroke="#E5E7EB" strokeWidth={1} />
        <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#E5E7EB" strokeWidth={1} />

        {/* Barras */}
        {data.map((d, i) => {
          const x = padding.left + i * (barW + barGap);
          const h = (d.total / max) * innerH;
          const isMaxValue = d.total === max;
          const shouldShowValue = isMaxValue || (h > 0.3 * innerH && i % 3 === 0);
          
          return (
            <g key={i}>
              <rect x={x} y={padding.top + innerH - h} width={barW} height={h} fill={color} rx={2} />
              {shouldShowValue && (
                <text x={x + barW / 2} y={padding.top + innerH - h - 6} textAnchor="middle" fontSize="10" fill="#374151">
                  {d.total.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}

        {/* Fechas */}
        {data.map((d, i) => {
          const x = padding.left + i * (barW + barGap);
          if (i % 5 !== 0 && i !== data.length - 1) return null;
          return (
            <text key={`lbl-${i}`} x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize="10" fill="#6B7280">
              {d.fecha.slice(5)}
            </text>
          );
        })}
      </svg>
      <div className="mt-2 text-xs text-gray-500 text-center">Últimos 30 días (máx: {max} {unit})</div>
    </div>
  );
}

// Componente para Top Productores de Leche
function TopProducersLeche() {
  const [topLeche, setTopLeche] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select(`
            bovino_id,
            litros,
            fecha,
            bovinos!inner(
              codigo,
              nombre,
              raza,
              finalidad_productiva,
              nombre_propietario
            )
          `)
          .eq('tipo', 'Ordeño')
          .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .not('litros', 'is', null);

        if (error) throw error;

        // Agrupar por bovino y sumar litros
        const bovinoStats = new Map();
        data?.forEach(evento => {
          const bovino = Array.isArray(evento.bovinos) ? evento.bovinos[0] : evento.bovinos;
          if (!bovino) return;
          
          const key = bovino.codigo;
          
          if (!bovinoStats.has(key)) {
            bovinoStats.set(key, {
              codigo: bovino.codigo,
              nombre: bovino.nombre,
              raza: bovino.raza,
              propietario: bovino.nombre_propietario,
              totalLitros: 0,
              eventos: 0
            });
          }
          
          const stats = bovinoStats.get(key);
          stats.totalLitros += evento.litros || 0;
          stats.eventos += 1;
        });

        // Convertir a array y ordenar por total de litros
        const sorted = Array.from(bovinoStats.values())
          .sort((a, b) => b.totalLitros - a.totalLitros)
          .slice(0, 5);

        setTopLeche(sorted);
      } catch (e) {
        console.error('Error cargando top productores de leche:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Cargando...</div>;
  if (topLeche.length === 0) return <div className="text-sm text-gray-500">No hay datos de producción</div>;

  return (
    <div className="space-y-3">
      {topLeche.map((bovino, index) => (
        <div key={bovino.codigo} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <div className="font-semibold text-blue-900">{bovino.codigo}</div>
              <div className="text-sm text-blue-700">{bovino.nombre || 'Sin nombre'}</div>
              <div className="text-xs text-blue-600">{bovino.raza} • {bovino.propietario}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-blue-900">{bovino.totalLitros.toFixed(1)} L</div>
            <div className="text-xs text-blue-600">{bovino.eventos} eventos</div>
            <div className="text-xs text-blue-600">{(bovino.totalLitros / bovino.eventos).toFixed(1)} L/prom</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para Top Productores de Carne
function TopProducersCarne() {
  const [topCarne, setTopCarne] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select(`
            bovino_id,
            peso_kg,
            gmd,
            fecha,
            bovinos!inner(
              codigo,
              nombre,
              raza,
              finalidad_productiva,
              nombre_propietario
            )
          `)
          .eq('tipo', 'Engorde')
          .gte('fecha', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .not('peso_kg', 'is', null);

        if (error) throw error;

        // Agrupar por bovino y calcular métricas
        const bovinoStats = new Map();
        data?.forEach(evento => {
          const bovino = Array.isArray(evento.bovinos) ? evento.bovinos[0] : evento.bovinos;
          if (!bovino) return;
          
          const key = bovino.codigo;
          
          if (!bovinoStats.has(key)) {
            bovinoStats.set(key, {
              codigo: bovino.codigo,
              nombre: bovino.nombre,
              raza: bovino.raza,
              propietario: bovino.nombre_propietario,
              pesos: [],
              gmds: []
            });
          }
          
          const stats = bovinoStats.get(key);
          if (evento.peso_kg) stats.pesos.push(evento.peso_kg);
          if (evento.gmd) stats.gmds.push(evento.gmd);
        });

        // Calcular métricas y ordenar por peso máximo
        const sorted = Array.from(bovinoStats.values())
          .map(bovino => {
            const pesoMax = Math.max(...bovino.pesos);
            const pesoProm = bovino.pesos.reduce((a: number, b: number) => a + b, 0) / bovino.pesos.length;
            const gmdProm = bovino.gmds.length > 0 ? bovino.gmds.reduce((a: number, b: number) => a + b, 0) / bovino.gmds.length : 0;
            
            return {
              ...bovino,
              pesoMaximo: pesoMax,
              pesoPromedio: pesoProm,
              gmdPromedio: gmdProm,
              eventos: bovino.pesos.length
            };
          })
          .sort((a, b) => b.pesoMaximo - a.pesoMaximo)
          .slice(0, 5);

        setTopCarne(sorted);
      } catch (e) {
        console.error('Error cargando top productores de carne:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Cargando...</div>;
  if (topCarne.length === 0) return <div className="text-sm text-gray-500">No hay datos de engorde</div>;

  return (
    <div className="space-y-3">
      {topCarne.map((bovino, index) => (
        <div key={bovino.codigo} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <div className="font-semibold text-green-900">{bovino.codigo}</div>
              <div className="text-sm text-green-700">{bovino.nombre || 'Sin nombre'}</div>
              <div className="text-xs text-green-600">{bovino.raza} • {bovino.propietario}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-900">{bovino.pesoMaximo.toFixed(1)} kg</div>
            <div className="text-xs text-green-600">{bovino.eventos} eventos</div>
            <div className="text-xs text-green-600">GMD: {bovino.gmdPromedio.toFixed(2)} kg/día</div>
          </div>
        </div>
      ))}
    </div>
  );
}


