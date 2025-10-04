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
  nombre_propietario: string | null;
  peso_actual: number | null;
  fecha_nacimiento: string | null;
  ubicacion_actual: string | null;
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
          .select('id, codigo, nombre, raza, sexo, estado, nombre_propietario, peso_actual, fecha_nacimiento, ubicacion_actual')
          .order('created_at', { ascending: false })
          .limit(8);

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
        <div className="flex justify-center mb-4">
          <img src="/Vaquita.png" alt="Vaquita" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-3xl font-bold mb-2">BoviTrack Web</h1>
        <p className="text-blue-100">Sistema de Trazabilidad Ganadera</p>
      </div>

      {/* Estadísticas modernas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalBovinos}</div>
              <div className="text-blue-100 text-sm">Total Bovinos</div>
            </div>
            <div className="text-4xl opacity-80">🐄</div>
          </div>
          <div className="mt-2 text-xs text-blue-200">
            {stats.totalBovinos > 0 ? `${((stats.bovinosActivos / stats.totalBovinos) * 100).toFixed(1)}% activos` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.bovinosActivos}</div>
              <div className="text-green-100 text-sm">Bovinos Activos</div>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
          <div className="mt-2 text-xs text-green-200">
            {stats.totalBovinos > 0 ? `${((stats.bovinosActivos / stats.totalBovinos) * 100).toFixed(1)}% del total` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalPropietarios}</div>
              <div className="text-amber-100 text-sm">Propietarios</div>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
          <div className="mt-2 text-xs text-amber-200">
            {stats.totalPropietarios > 0 ? `Promedio: ${(stats.totalBovinos / stats.totalPropietarios).toFixed(1)} bovinos/propietario` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalEventos}</div>
              <div className="text-purple-100 text-sm">Eventos</div>
            </div>
            <div className="text-4xl opacity-80">📅</div>
          </div>
          <div className="mt-2 text-xs text-purple-200">
            {stats.totalBovinos > 0 ? `Promedio: ${(stats.totalEventos / stats.totalBovinos).toFixed(1)} eventos/bovino` : 'Sin datos'}
          </div>
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
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">📋 Últimos Bovinos Registrados</h2>
            <a href="/bovinos" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todos →
            </a>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Cargando bovinos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Código</th>
                  <th className="p-4 font-semibold text-gray-700">Nombre</th>
                  <th className="p-4 font-semibold text-gray-700">Raza</th>
                  <th className="p-4 font-semibold text-gray-700">Sexo</th>
                  <th className="p-4 font-semibold text-gray-700">Propietario</th>
                  <th className="p-4 font-semibold text-gray-700">Peso</th>
                  <th className="p-4 font-semibold text-gray-700">Ubicación</th>
                  <th className="p-4 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {bovinos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">🐄</div>
                      <p className="text-lg">No hay bovinos registrados</p>
                      <p className="text-sm">Comienza registrando tu primer bovino</p>
                    </td>
                  </tr>
                ) : (
                  bovinos.map(b => (
                    <tr key={b.id} className="border-t hover:bg-blue-50 transition-colors">
                      <td className="p-4 font-mono text-blue-600 font-semibold">{b.codigo}</td>
                      <td className="p-4">
                        <div className="font-medium">{b.nombre ?? 'Sin nombre'}</div>
                        {b.fecha_nacimiento && (
                          <div className="text-xs text-gray-500">
                            Nac: {new Date(b.fecha_nacimiento).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {b.raza ?? 'Sin raza'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.sexo === 'Macho' ? 'bg-blue-100 text-blue-800' : 
                          b.sexo === 'Hembra' ? 'bg-pink-100 text-pink-800' : 
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {b.sexo ?? '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">
                          {b.nombre_propietario ?? 'Sin propietario'}
                        </div>
                      </td>
                      <td className="p-4">
                        {b.peso_actual ? (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                            {b.peso_actual} kg
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin peso</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-gray-600 max-w-24 truncate" title={b.ubicacion_actual || ''}>
                          {b.ubicacion_actual ?? 'Sin ubicación'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          b.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                          b.estado === 'Vendido' ? 'bg-blue-100 text-blue-800' :
                          b.estado === 'Sacrificado' ? 'bg-red-100 text-red-800' :
                          b.estado === 'Muerto' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {b.estado ?? 'Sin estado'}
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

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Distribución por Estado</h3>
          <div className="space-y-3">
            {(() => {
              const estados = bovinos.reduce((acc, b) => {
                const estado = b.estado || 'Sin estado';
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              const total = bovinos.length;
              
              return Object.entries(estados)
                .sort(([,a], [,b]) => b - a)
                .map(([estado, cantidad]) => {
                  const porcentaje = total > 0 ? (cantidad / total) * 100 : 0;
                  return (
                    <div key={estado} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{estado}</span>
                        <span className="text-gray-600">{cantidad} ({porcentaje.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            estado === 'Activo' ? 'bg-green-500' :
                            estado === 'Vendido' ? 'bg-blue-500' :
                            estado === 'Sacrificado' ? 'bg-red-500' :
                            estado === 'Muerto' ? 'bg-gray-500' :
                            'bg-yellow-500'
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

        {/* Resumen de Propietarios */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">👥 Resumen de Propietarios</h3>
          <div className="space-y-4">
            {(() => {
              const propietariosConBovinos = bovinos
                .filter(b => b.nombre_propietario)
                .reduce((acc, b) => {
                  const propietario = b.nombre_propietario!;
                  acc[propietario] = (acc[propietario] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

              const propietariosArray = Object.entries(propietariosConBovinos)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);

              return propietariosArray.length > 0 ? (
                propietariosArray.map(([propietario, cantidad]) => (
                  <div key={propietario} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {propietario.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 truncate max-w-32" title={propietario}>
                          {propietario}
                        </div>
                        <div className="text-xs text-gray-500">{cantidad} bovino{cantidad !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">{cantidad}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No hay bovinos con propietario asignado</p>
                </div>
              );
            })()}
          </div>
        </div>
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


