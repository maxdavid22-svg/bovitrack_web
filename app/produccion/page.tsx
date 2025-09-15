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
      } catch (e) {
        console.error('Error cargando KPIs de producción', e);
      } finally {
        setLoading(false);
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

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">Cargando métricas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </div>
          {series.map(s => (
            <div key={s.label} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <div className={`text-xs px-2 py-1 rounded-full ${s.color}`}>{s.emoji} {s.label}</div>
              <div className="text-2xl font-bold mt-2">{s.valor}</div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs de Ordeño */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">🥛 Litros hoy</div>
            <div className="text-2xl font-bold">{litrosHoy.toFixed(1)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">🥛 Últimos 7 días</div>
            <div className="text-2xl font-bold">{litros7d.toFixed(1)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">🥛 Últimos 30 días</div>
            <div className="text-2xl font-bold">{litros30d.toFixed(1)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Eventos de ordeño (30d)</div>
            <div className="text-2xl font-bold">{ordenhoUltimos30.length}</div>
          </div>
        </div>
      )}

      {/* KPIs de Engorde */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">📈 Eventos de Engorde (30d)</div>
            <div className="text-2xl font-bold">{engordeUltimos30.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">⚖️ Peso promedio (30d)</div>
            <div className="text-2xl font-bold">{promPeso30d.toFixed(1)} kg</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">📊 GMD promedio (30d)</div>
            <div className="text-2xl font-bold">{promGmd30d.toFixed(2)} kg/día</div>
          </div>
        </div>
      )}

      {/* Barra apilada simple (sin librerías) */}
      {!loading && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Distribución por finalidad</h2>
          <div className="space-y-3">
            {series.map(s => {
              const pct = kpis.total ? Math.round((s.valor / kpis.total) * 100) : 0;
              return (
                <div key={s.label} className="">
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>{s.emoji} {s.label}</span>
                    <span>{s.valor} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                    <div className="h-2 bg-green-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listados rápidos */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Bovinos de Leche (recientes)</h3>
            <ListaBovinosCorta finalidad="Leche" />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Bovinos de Carne (recientes)</h3>
            <ListaBovinosCorta finalidad="Carne" />
          </div>
        </div>
      )}

      {/* Gráficas simples últimos 30 días */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></span>
              Tendencia Ordeño (litros/día)
            </h3>
            <MiniBars data={serieLitrosDia} color="bg-blue-500" unit="L" />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></span>
              Tendencia Engorde (kg/día)
            </h3>
            <MiniBars data={serieEngordeDia} color="bg-orange-500" unit="kg" />
          </div>
        </div>
      )}

      {/* Últimos ordeños (verificación rápida) */}
      {!loading && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">Últimos Ordeños (30 días)</h3>
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
  const max = Math.max(1, ...data.map(d => d.total));
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
    max, 
    color,
    sampleData: sampleData.map(d => ({ fecha: d.fecha, total: d.total, percentage: ((d.total / max) * 100).toFixed(1) + '%' })),
    allValues: allValues.slice(0, 10),
    min: Math.min(...allValues),
    max: Math.max(...allValues)
  });

  return (
    <div>
      <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
        {data.map((d, i) => {
          // Altura proporcional real SIN mínimo
          const height = d.total > 0 ? (d.total / max) * 100 : 0;
          return (
            <div key={i} className="flex flex-col items-center min-w-0" title={`${d.fecha}: ${d.total} ${unit} (${height.toFixed(1)}%)`}>
              <div
                className={`w-4 rounded-t`}
                style={{ height: `${height}%`, backgroundColor: barColor, border: `1px solid ${barColor}`, filter: 'none' }}
              ></div>
              {d.total > 0 && (
                <div className="text-xs text-gray-600 mt-1 font-mono">
                  {d.total.toFixed(1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Últimos 30 días (máx: {max} {unit})
      </div>
    </div>
  );
}


