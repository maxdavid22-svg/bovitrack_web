'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Stats = {
  totalBovinos: number;
  bovinosActivos: number;
  totalPropietarios: number;
  totalEventos: number;
};

type Bovino = {
  id: string;
  codigo: string;
  nombre: string | null;
  raza: string | null;
  sexo: string | null;
  estado: string | null;
};

export default function Home() {
  const [stats, setStats] = useState<Stats>({ totalBovinos: 0, bovinosActivos: 0, totalPropietarios: 0, totalEventos: 0 });
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Obtener estadísticas
        const [bovinosRes, propietariosRes, eventosRes] = await Promise.all([
          supabase.from('bovinos').select('id, estado'),
          supabase.from('propietarios').select('id'),
          supabase.from('eventos').select('id')
        ]);

        const totalBovinos = bovinosRes.data?.length || 0;
        const bovinosActivos = bovinosRes.data?.filter(b => b.estado === 'Activo').length || 0;
        const totalPropietarios = propietariosRes.data?.length || 0;
        const totalEventos = eventosRes.data?.length || 0;

        setStats({ totalBovinos, bovinosActivos, totalPropietarios, totalEventos });

        // Obtener últimos bovinos
        const { data: bovinosData, error } = await supabase
          .from('bovinos')
          .select('id, codigo, nombre, raza, sexo, estado')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error(error);
        }
        setBovinos(bovinosData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header con título */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">🐄</div>
        <h1 className="text-3xl font-bold mb-2">BoviTrack Web</h1>
        <p className="text-blue-100">Sistema de Trazabilidad Ganadera</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalBovinos}</div>
          <div className="text-sm text-gray-600">Total Bovinos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.bovinosActivos}</div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{stats.totalPropietarios}</div>
          <div className="text-sm text-gray-600">Propietarios</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalEventos}</div>
          <div className="text-sm text-gray-600">Eventos</div>
        </div>
      </div>

      {/* Menú de opciones principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/nuevo" className="p-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">➕</div>
          <div className="text-lg font-semibold">Registrar Bovino</div>
          <div className="text-sm opacity-90">Crear un nuevo registro de bovino</div>
        </a>
        <a href="/bovinos" className="p-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-lg font-semibold">Ver Bovinos</div>
          <div className="text-sm opacity-90">Listado general con estado</div>
        </a>
        <a href="/propietarios" className="p-6 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">👥</div>
          <div className="text-lg font-semibold">Propietarios</div>
          <div className="text-sm opacity-90">Gestión de propietarios</div>
        </a>
        <a href="/nuevo-propietario" className="p-6 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">👤</div>
          <div className="text-lg font-semibold">Registrar Propietario</div>
          <div className="text-sm opacity-90">Agregar nuevo propietario</div>
        </a>
        <a href="/eventos" className="p-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-lg font-semibold">Eventos</div>
          <div className="text-sm opacity-90">Historial de trazabilidad</div>
        </a>
        <a href="/nuevo-evento" className="p-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">📝</div>
          <div className="text-lg font-semibold">Registrar Evento</div>
          <div className="text-sm opacity-90">Agregar nuevo evento</div>
        </a>
        <a href="/historial" className="p-6 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-lg font-semibold">Historial Completo</div>
          <div className="text-sm opacity-90">Trazabilidad detallada</div>
        </a>
        <a href="/reportes" className="p-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition transform hover:scale-105">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-lg font-semibold">Reportes</div>
          <div className="text-sm opacity-90">Análisis y estadísticas</div>
        </a>
      </div>

      {/* Últimos bovinos registrados */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Últimos Bovinos Registrados</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center">Cargando…</div>
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
                </tr>
              </thead>
              <tbody>
                {bovinos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      No hay bovinos registrados
                    </td>
                  </tr>
                ) : (
                  bovinos.map(b => (
                    <tr key={b.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-mono">{b.codigo}</td>
                      <td className="p-4">{b.nombre ?? 'Sin nombre'}</td>
                      <td className="p-4">{b.raza ?? '—'}</td>
                      <td className="p-4">{b.sexo ?? '—'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          b.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                          b.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {b.estado ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información del sistema */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <ul className="space-y-2">
              <li>• Registro completo de bovinos</li>
              <li>• Trazabilidad desde nacimiento</li>
              <li>• Gestión de propietarios</li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li>• Historial de eventos</li>
              <li>• Reportes detallados</li>
              <li>• Sincronización con app móvil</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


