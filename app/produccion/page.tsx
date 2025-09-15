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

export default function ProduccionPage() {
  const [kpis, setKpis] = useState<KPIs>({ total: 0, carne: 0, leche: 0, dobleProposito: 0, engorde: 0, reproduccion: 0, desconocido: 0 });
  const [loading, setLoading] = useState(true);

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


