'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MapModal from '../components/MapModal';

type Propietario = { 
  id: string; 
  tipo_propietario: string;
  nombre: string; 
  apellidos: string | null;
  tipo_documento: string;
  numero_documento: string;
  telefono: string | null; 
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  departamento: string | null;
  observaciones: string | null;
  created_at: string;
  bovinos_count?: number;
};

// Función para hacer match de nombres de propietarios
const matchPropietario = (propietarioNombre: string, bovinoPropietario: string): boolean => {
  if (!propietarioNombre || !bovinoPropietario) return false;
  
  const propietario = propietarioNombre.trim().toLowerCase();
  const bovino = bovinoPropietario.trim().toLowerCase();
  
  // Match exacto
  if (propietario === bovino) return true;
  
  // Match por primera palabra (nombre)
  const propietarioPrimeraPalabra = propietario.split(' ')[0];
  const bovinoPrimeraPalabra = bovino.split(' ')[0];
  
  return propietarioPrimeraPalabra === bovinoPrimeraPalabra;
};

export default function PropietariosPage() {
  const [items, setItems] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [mapModal, setMapModal] = useState<{
    isOpen: boolean;
    address: string;
    city?: string;
    department?: string;
  }>({
    isOpen: false,
    address: '',
    city: '',
    department: ''
  });

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const cargarPropietarios = async () => {
    try {
      // Cargar propietarios
      const { data: propietariosData, error: propietariosError } = await supabase
        .from('propietarios')
        .select('id, tipo_propietario, nombre, apellidos, tipo_documento, numero_documento, telefono, email, direccion, ciudad, departamento, observaciones, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (propietariosError) {
        console.error('Error cargando propietarios:', propietariosError);
        return;
      }

      // Cargar TODOS los bovinos para contar correctamente
      const { data: bovinosData, error: bovinosError } = await supabase
        .from('bovinos')
        .select('nombre_propietario')
        .not('nombre_propietario', 'is', null)
        .not('nombre_propietario', 'eq', '');

      if (bovinosError) {
        console.error('Error cargando bovinos:', bovinosError);
      }

      // Debug: Log para verificar los datos
      console.log('=== DEBUG PROPIETARIOS ===');
      console.log('Total bovinos en BD:', bovinosData?.length || 0);
      console.log('Propietarios en BD:', propietariosData?.length || 0);

      // Contar bovinos por propietario
      const bovinosPorPropietario = (bovinosData || []).reduce((acc: Record<string, number>, bovino) => {
        const propietario = bovino.nombre_propietario?.trim();
        if (propietario && propietario !== '') {
          acc[propietario] = (acc[propietario] || 0) + 1;
        }
        return acc;
      }, {});

      console.log('Bovinos por propietario:', bovinosPorPropietario);
      console.log('Total bovinos contados:', Object.values(bovinosPorPropietario).reduce((sum, count) => sum + count, 0));

      // Agregar conteo de bovinos a cada propietario usando match más robusto
      const propietariosConBovinos = (propietariosData || []).map(propietario => {
        let bovinosCount = 0;
        
        // Contar bovinos que coincidan con este propietario
        (bovinosData || []).forEach(bovino => {
          if (bovino.nombre_propietario) {
            // Intentar match con nombre solo
            if (matchPropietario(propietario.nombre, bovino.nombre_propietario)) {
              bovinosCount++;
            }
            // Si no hay match y tiene apellidos, intentar con nombre completo
            else if (propietario.apellidos) {
              const nombreCompleto = `${propietario.nombre} ${propietario.apellidos}`.trim();
              if (matchPropietario(nombreCompleto, bovino.nombre_propietario)) {
                bovinosCount++;
              }
            }
          }
        });
        
        // Debug: Log para cada propietario con bovinos
        if (bovinosCount > 0) {
          console.log(`✅ Propietario: "${propietario.nombre}", Bovinos: ${bovinosCount}`);
        } else {
          console.log(`❌ Propietario: "${propietario.nombre}", Sin bovinos`);
        }
        
        return {
          ...propietario,
          bovinos_count: bovinosCount
        };
      });

      console.log('=== FIN DEBUG ===');
      setItems(propietariosConBovinos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const propietariosFiltrados = items.filter(propietario => 
    propietario.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (propietario.apellidos && propietario.apellidos.toLowerCase().includes(filtro.toLowerCase())) ||
    propietario.numero_documento.includes(filtro) ||
    (propietario.telefono && propietario.telefono.includes(filtro)) ||
    (propietario.email && propietario.email.toLowerCase().includes(filtro.toLowerCase())) ||
    (propietario.ciudad && propietario.ciudad.toLowerCase().includes(filtro.toLowerCase()))
  );

  const handleLocationClick = (propietario: Propietario) => {
    if (propietario.direccion || propietario.ciudad || propietario.departamento) {
      setMapModal({
        isOpen: true,
        address: propietario.direccion || '',
        city: propietario.ciudad || '',
        department: propietario.departamento || ''
      });
    }
  };

  const closeMapModal = () => {
    setMapModal({
      isOpen: false,
      address: '',
      city: '',
      department: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">👥 Gestión de Propietarios</h1>
            <p className="text-amber-100">Listado completo de propietarios registrados</p>
          </div>
          <a 
            href="/nuevo-propietario" 
            className="bg-white text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition font-medium"
          >
            ➕ Nuevo Propietario
          </a>
        </div>
      </div>

      {/* Estadísticas modernas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{items.length}</div>
              <div className="text-amber-100 text-sm">Total Propietarios</div>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
          <div className="mt-2 text-xs text-amber-200">
            {items.length > 0 ? `${items.filter(p => p.bovinos_count && p.bovinos_count > 0).length} con bovinos` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {items.reduce((sum, p) => sum + (p.bovinos_count || 0), 0)}
              </div>
              <div className="text-green-100 text-sm">Total Bovinos</div>
            </div>
            <div className="text-4xl opacity-80">🐄</div>
          </div>
          <div className="mt-2 text-xs text-green-200">
            {items.length > 0 ? `Promedio: ${(items.reduce((sum, p) => sum + (p.bovinos_count || 0), 0) / items.length).toFixed(1)} por propietario` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {Math.max(...items.map(p => p.bovinos_count || 0))}
              </div>
              <div className="text-blue-100 text-sm">Máximo Bovinos</div>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
          <div className="mt-2 text-xs text-blue-200">
            {items.length > 0 ? `Propietario con más ganado` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {new Set(items.map(p => p.tipo_propietario)).size}
              </div>
              <div className="text-purple-100 text-sm">Tipos Diferentes</div>
            </div>
            <div className="text-4xl opacity-80">🏢</div>
          </div>
          <div className="mt-2 text-xs text-purple-200">
            {items.length > 0 ? `Diversidad de propietarios` : 'Sin datos'}
          </div>
        </div>
      </div>

      {/* Top Propietarios por Bovinos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">🏆 Top Propietarios por Cantidad de Bovinos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const topPropietarios = items
              .filter(p => p.bovinos_count && p.bovinos_count > 0)
              .sort((a, b) => (b.bovinos_count || 0) - (a.bovinos_count || 0))
              .slice(0, 6);

            return topPropietarios.length > 0 ? (
              topPropietarios.map((propietario, index) => (
                <div key={propietario.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-amber-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-amber-600 font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 truncate max-w-32" title={propietario.nombre}>
                          {propietario.nombre}
                        </div>
                        <div className="text-xs text-gray-600">{propietario.tipo_propietario}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">{propietario.bovinos_count}</div>
                      <div className="text-xs text-gray-500">bovinos</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📊</div>
                <p>No hay propietarios con bovinos registrados</p>
                <p className="text-sm">Los propietarios aparecerán aquí cuando tengan bovinos asignados</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Filtros y estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <div className="text-sm text-gray-600">
            Mostrando {propietariosFiltrados.length} de {items.length} propietarios
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, documento, teléfono, email o ciudad..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de propietarios */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Cargando propietarios...</div>
        ) : propietariosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filtro ? 'No se encontraron propietarios con el filtro aplicado' : 'No hay propietarios registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Tipo</th>
                  <th className="p-4 font-semibold text-gray-700">Nombre</th>
                  <th className="p-4 font-semibold text-gray-700">Documento</th>
                  <th className="p-4 font-semibold text-gray-700">Bovinos</th>
                  <th className="p-4 font-semibold text-gray-700">Contacto</th>
                  <th className="p-4 font-semibold text-gray-700">Ubicación</th>
                  <th className="p-4 font-semibold text-gray-700">Registrado</th>
                  <th className="p-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {propietariosFiltrados.map(propietario => (
                  <tr key={propietario.id} className="border-t hover:bg-amber-50 transition-colors">
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        propietario.tipo_propietario === 'Individual' ? 'bg-blue-100 text-blue-800' :
                        propietario.tipo_propietario === 'Empresa' ? 'bg-green-100 text-green-800' :
                        propietario.tipo_propietario === 'Cooperativa' ? 'bg-purple-100 text-purple-800' :
                        propietario.tipo_propietario === 'Asociación' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {propietario.tipo_propietario}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{propietario.nombre}</div>
                      {propietario.apellidos && (
                        <div className="text-gray-600 text-xs">{propietario.apellidos}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {propietario.numero_documento && propietario.numero_documento !== 'SIN_DOCUMENTO' && propietario.numero_documento !== 'PENDIENTE_SYNC' ? (
                          <>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{propietario.tipo_documento}</span>
                            <div className="text-gray-600 text-xs mt-1">{propietario.numero_documento}</div>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin documento</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        {propietario.bovinos_count && propietario.bovinos_count > 0 ? (
                          <div className="inline-flex items-center">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                              🐄 {propietario.bovinos_count}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin bovinos</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {propietario.telefono && (
                          <div>
                            <a href={`tel:${propietario.telefono}`} className="text-blue-600 hover:underline text-xs">
                              📞 {propietario.telefono}
                            </a>
                          </div>
                        )}
                        {propietario.email && (
                          <div>
                            <a href={`mailto:${propietario.email}`} className="text-blue-600 hover:underline text-xs">
                              ✉️ {propietario.email}
                            </a>
                          </div>
                        )}
                        {!propietario.telefono && !propietario.email && (
                          <span className="text-gray-400 text-xs">Sin contacto</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        {(propietario.direccion || propietario.ciudad || propietario.departamento) ? (
                          <button
                            onClick={() => handleLocationClick(propietario)}
                            className="text-left hover:bg-blue-50 p-2 rounded transition-colors group"
                            title="Hacer clic para ver en mapa"
                          >
                            {propietario.direccion && (
                              <div className="text-gray-600 group-hover:text-blue-600">📍 {propietario.direccion}</div>
                            )}
                            {propietario.ciudad && (
                              <div className="text-gray-600 group-hover:text-blue-600">🏙️ {propietario.ciudad}</div>
                            )}
                            {propietario.departamento && (
                              <div className="text-gray-500 group-hover:text-blue-500">{propietario.departamento}</div>
                            )}
                            <div className="text-blue-500 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              🗺️ Ver en mapa
                            </div>
                          </button>
                        ) : (
                          <span className="text-gray-400">Sin ubicación</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(propietario.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <a
                          href={`/editar-propietario/${propietario.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition font-medium"
                          title="Editar propietario"
                        >
                          ✏️ Editar
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas por Tipo de Propietario */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Distribución por Tipo de Propietario</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de barras por tipo */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Cantidad por Tipo</h4>
              <div className="space-y-3">
                {(() => {
                  const tipos = items.reduce((acc, p) => {
                    acc[p.tipo_propietario] = (acc[p.tipo_propietario] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  const total = items.length;
                  
                  return Object.entries(tipos)
                    .sort(([,a], [,b]) => b - a)
                    .map(([tipo, cantidad]) => {
                      const porcentaje = (cantidad / total) * 100;
                      return (
                        <div key={tipo} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{tipo}</span>
                            <span className="text-gray-600">{cantidad} ({porcentaje.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                tipo === 'Individual' ? 'bg-blue-500' :
                                tipo === 'Empresa' ? 'bg-green-500' :
                                tipo === 'Cooperativa' ? 'bg-purple-500' :
                                tipo === 'Asociación' ? 'bg-orange-500' :
                                'bg-gray-500'
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

            {/* Estadísticas de bovinos por tipo */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Bovinos por Tipo de Propietario</h4>
              <div className="space-y-3">
                {(() => {
                  const bovinosPorTipo = items.reduce((acc, p) => {
                    const tipo = p.tipo_propietario;
                    acc[tipo] = (acc[tipo] || 0) + (p.bovinos_count || 0);
                    return acc;
                  }, {} as Record<string, number>);

                  const totalBovinos = Object.values(bovinosPorTipo).reduce((sum, count) => sum + count, 0);
                  
                  return Object.entries(bovinosPorTipo)
                    .sort(([,a], [,b]) => b - a)
                    .map(([tipo, bovinos]) => {
                      const porcentaje = totalBovinos > 0 ? (bovinos / totalBovinos) * 100 : 0;
                      return (
                        <div key={tipo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              tipo === 'Individual' ? 'bg-blue-500' :
                              tipo === 'Empresa' ? 'bg-green-500' :
                              tipo === 'Cooperativa' ? 'bg-purple-500' :
                              tipo === 'Asociación' ? 'bg-orange-500' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="font-medium text-sm">{tipo}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-600">{bovinos}</div>
                            <div className="text-xs text-gray-500">{porcentaje.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      <MapModal
        isOpen={mapModal.isOpen}
        onClose={closeMapModal}
        address={mapModal.address}
        city={mapModal.city}
        department={mapModal.department}
      />
    </div>
  );
}


