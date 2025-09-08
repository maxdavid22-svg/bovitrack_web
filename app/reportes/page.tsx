'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Estadisticas = {
  totalBovinos: number;
  bovinosActivos: number;
  bovinosInactivos: number;
  totalPropietarios: number;
  totalEventos: number;
  eventosPorTipo: { [key: string]: number };
  eventosPorMes: { [key: string]: number };
  bovinosPorRaza: { [key: string]: number };
  bovinosPorSexo: { [key: string]: number };
  bovinosPorEstado: { [key: string]: number };
};

export default function ReportesPage() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalBovinos: 0,
    bovinosActivos: 0,
    bovinosInactivos: 0,
    totalPropietarios: 0,
    totalEventos: 0,
    eventosPorTipo: {},
    eventosPorMes: {},
    bovinosPorRaza: {},
    bovinosPorSexo: {},
    bovinosPorEstado: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      // Obtener datos básicos
      const [bovinosRes, propietariosRes, eventosRes] = await Promise.all([
        supabase.from('bovinos').select('*'),
        supabase.from('propietarios').select('*'),
        supabase.from('eventos').select('*')
      ]);

      const bovinos = bovinosRes.data || [];
      const propietarios = propietariosRes.data || [];
      const eventos = eventosRes.data || [];

      // Calcular estadísticas básicas
      const totalBovinos = bovinos.length;
      const bovinosActivos = bovinos.filter(b => b.estado === 'Activo').length;
      const bovinosInactivos = bovinos.filter(b => b.estado === 'Inactivo').length;
      const totalPropietarios = propietarios.length;
      const totalEventos = eventos.length;

      // Eventos por tipo
      const eventosPorTipo: { [key: string]: number } = {};
      eventos.forEach(evento => {
        eventosPorTipo[evento.tipo] = (eventosPorTipo[evento.tipo] || 0) + 1;
      });

      // Eventos por mes (últimos 12 meses)
      const eventosPorMes: { [key: string]: number } = {};
      const ahora = new Date();
      for (let i = 0; i < 12; i++) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const mesKey = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
        eventosPorMes[mesKey] = 0;
      }
      
      eventos.forEach(evento => {
        const fechaEvento = new Date(evento.fecha);
        const mesKey = fechaEvento.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
        if (eventosPorMes.hasOwnProperty(mesKey)) {
          eventosPorMes[mesKey]++;
        }
      });

      // Bovinos por raza
      const bovinosPorRaza: { [key: string]: number } = {};
      bovinos.forEach(bovino => {
        const raza = bovino.raza || 'Sin especificar';
        bovinosPorRaza[raza] = (bovinosPorRaza[raza] || 0) + 1;
      });

      // Bovinos por sexo
      const bovinosPorSexo: { [key: string]: number } = {};
      bovinos.forEach(bovino => {
        const sexo = bovino.sexo || 'Sin especificar';
        bovinosPorSexo[sexo] = (bovinosPorSexo[sexo] || 0) + 1;
      });

      // Bovinos por estado
      const bovinosPorEstado: { [key: string]: number } = {};
      bovinos.forEach(bovino => {
        const estado = bovino.estado || 'Sin especificar';
        bovinosPorEstado[estado] = (bovinosPorEstado[estado] || 0) + 1;
      });

      setEstadisticas({
        totalBovinos,
        bovinosActivos,
        bovinosInactivos,
        totalPropietarios,
        totalEventos,
        eventosPorTipo,
        eventosPorMes,
        bovinosPorRaza,
        bovinosPorSexo,
        bovinosPorEstado
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const BarChart = ({ data, title, color = 'blue' }: { data: { [key: string]: number }, title: string, color?: string }) => {
    const maxValue = Math.max(...Object.values(data));
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500'
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div className="w-24 text-sm text-gray-600 truncate">{key}</div>
              <div className="flex-1 mx-3">
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
                    style={{ width: `${(value / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm font-medium text-right">{value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">📈 Reportes y Estadísticas</h1>
          <p className="text-red-100">Análisis completo del sistema</p>
        </div>
        <div className="text-center py-12">
          <div className="text-lg">Cargando estadísticas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">📈 Reportes y Estadísticas</h1>
        <p className="text-red-100">Análisis completo del sistema</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{estadisticas.totalBovinos}</div>
          <div className="text-sm text-gray-600">Total Bovinos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{estadisticas.bovinosActivos}</div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{estadisticas.bovinosInactivos}</div>
          <div className="text-sm text-gray-600">Inactivos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-amber-600">{estadisticas.totalPropietarios}</div>
          <div className="text-sm text-gray-600">Propietarios</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{estadisticas.totalEventos}</div>
          <div className="text-sm text-gray-600">Eventos</div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart 
          data={estadisticas.bovinosPorEstado} 
          title="Bovinos por Estado" 
          color="green" 
        />
        <BarChart 
          data={estadisticas.bovinosPorSexo} 
          title="Bovinos por Sexo" 
          color="blue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart 
          data={estadisticas.bovinosPorRaza} 
          title="Bovinos por Raza" 
          color="purple" 
        />
        <BarChart 
          data={estadisticas.eventosPorTipo} 
          title="Eventos por Tipo" 
          color="red" 
        />
      </div>

      {/* Eventos por mes */}
      <BarChart 
        data={estadisticas.eventosPorMes} 
        title="Eventos por Mes (Últimos 12 meses)" 
        color="indigo" 
      />

      {/* Resumen detallado */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen Detallado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Distribución de Bovinos</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Activos:</span>
                <span className="font-medium">{estadisticas.bovinosActivos} ({((estadisticas.bovinosActivos / estadisticas.totalBovinos) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Inactivos:</span>
                <span className="font-medium">{estadisticas.bovinosInactivos} ({((estadisticas.bovinosInactivos / estadisticas.totalBovinos) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Actividad del Sistema</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Eventos:</span>
                <span className="font-medium">{estadisticas.totalEventos}</span>
              </div>
              <div className="flex justify-between">
                <span>Promedio por Bovino:</span>
                <span className="font-medium">{(estadisticas.totalEventos / estadisticas.totalBovinos).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tipos de evento más comunes */}
      {Object.keys(estadisticas.eventosPorTipo).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tipos de Evento Más Comunes</h3>
          <div className="space-y-2">
            {Object.entries(estadisticas.eventosPorTipo)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([tipo, cantidad]) => (
                <div key={tipo} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{tipo}</span>
                  <span className="text-blue-600 font-semibold">{cantidad} eventos</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
