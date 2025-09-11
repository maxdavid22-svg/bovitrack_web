'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Bovino = { 
  id: string; 
  codigo: string; 
  nombre: string | null; 
  raza: string | null;
  sexo: string | null;
  estado: string | null;
  fecha_nacimiento: string | null;
  peso_nacimiento: number | null;
  peso_actual: number | null;
  color: string | null;
  marcas: string | null;
  id_propietario: string | null;
  nombre_propietario: string | null;
  ubicacion_actual: string | null;
  coordenadas: string | null;
  observaciones: string | null;
  foto: string | null;
  tag_rfid: string | null;
  huella: string | null;
  imagenes: string[] | null;
  created_at: string;
};

export default function BovinosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [mostrarTagRfid, setMostrarTagRfid] = useState(false);
  const [mostrarHuella, setMostrarHuella] = useState(false);
  const [soloConTag, setSoloConTag] = useState(false);
  const [modalImagenes, setModalImagenes] = useState<{ abierto: boolean; bovino: Bovino | null }>({
    abierto: false,
    bovino: null
  });

  useEffect(() => {
    cargarBovinos();
  }, []);

  const cargarBovinos = async () => {
    try {
      const { data, error } = await supabase
        .from('bovinos')
        .select('id, codigo, nombre, raza, sexo, estado, fecha_nacimiento, peso_nacimiento, peso_actual, color, marcas, id_propietario, nombre_propietario, ubicacion_actual, coordenadas, observaciones, foto, tag_rfid, huella, imagenes, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) {
        console.error('Error cargando bovinos:', error);
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const bovinosFiltrados = items.filter(bovino => {
    // Filtro por Tag RFID
    if (soloConTag && !bovino.tag_rfid) {
      return false;
    }
    
    // Filtro de búsqueda
    if (filtro) {
      return (
        bovino.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
        (bovino.nombre && bovino.nombre.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.raza && bovino.raza.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.color && bovino.color.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.marcas && bovino.marcas.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.nombre_propietario && bovino.nombre_propietario.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.ubicacion_actual && bovino.ubicacion_actual.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.tag_rfid && bovino.tag_rfid.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.huella && bovino.huella.toLowerCase().includes(filtro.toLowerCase())) ||
        (bovino.imagenes && bovino.imagenes.some(img => img.toLowerCase().includes(filtro.toLowerCase()))) ||
        (filtro.toLowerCase().includes('huella') && (bovino.huella || (bovino.imagenes && bovino.imagenes.length > 0)))
      );
    }
    
    return true;
  });

  const abrirModalImagenes = (bovino: Bovino) => {
    setModalImagenes({ abierto: true, bovino });
  };

  const cerrarModalImagenes = () => {
    setModalImagenes({ abierto: false, bovino: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">🐄 Gestión de Bovinos</h1>
            <p className="text-green-100">Listado completo de bovinos registrados</p>
          </div>
          <a 
            href="/nuevo" 
            className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition font-medium"
          >
            ➕ Nuevo Bovino
          </a>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="text-2xl">🐄</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bovinos</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="text-2xl">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bovinos Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(b => b.estado === 'Activo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-2xl">👥</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Propietarios</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(items.filter(b => b.nombre_propietario).map(b => b.nombre_propietario)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="text-2xl">⚖️</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Peso</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(b => b.peso_actual).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="text-2xl">🏷️</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Tag RFID</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(b => b.tag_rfid).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="text-2xl">🐄</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Huella</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(b => b.huella || (b.imagenes && b.imagenes.length > 0)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="text-2xl">📷</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Imágenes</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(b => b.imagenes && b.imagenes.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Propietario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Distribución por Propietario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const propietariosConBovinos = items
              .filter(b => b.nombre_propietario)
              .reduce((acc, b) => {
                const propietario = b.nombre_propietario!;
                acc[propietario] = (acc[propietario] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

            const propietariosArray = Object.entries(propietariosConBovinos)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6);

            return propietariosArray.length > 0 ? (
              propietariosArray.map(([propietario, cantidad]) => (
                <div key={propietario} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 truncate" title={propietario}>
                        {propietario}
                      </p>
                      <p className="text-sm text-gray-600">{cantidad} bovino{cantidad !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {cantidad}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📋</div>
                <p>No hay bovinos con propietario asignado</p>
                <p className="text-sm">Asigna propietarios a los bovinos para ver las estadísticas</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Estado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📈 Distribución por Estado</h2>
          <div className="space-y-3">
            {(() => {
              const estados = items.reduce((acc, b) => {
                const estado = b.estado || 'Sin estado';
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              return Object.entries(estados)
                .sort(([,a], [,b]) => b - a)
                .map(([estado, cantidad]) => (
                  <div key={estado} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        estado === 'Activo' ? 'bg-green-500' :
                        estado === 'Vendido' ? 'bg-blue-500' :
                        estado === 'Sacrificado' ? 'bg-red-500' :
                        estado === 'Muerto' ? 'bg-gray-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <span className="font-medium">{estado}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{cantidad}</span>
                  </div>
                ));
            })()}
          </div>
        </div>

        {/* Por Sexo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">⚥ Distribución por Sexo</h2>
          <div className="space-y-3">
            {(() => {
              const sexos = items.reduce((acc, b) => {
                const sexo = b.sexo || 'Sin especificar';
                acc[sexo] = (acc[sexo] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              return Object.entries(sexos)
                .sort(([,a], [,b]) => b - a)
                .map(([sexo, cantidad]) => (
                  <div key={sexo} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        sexo === 'Macho' ? 'bg-blue-500' :
                        sexo === 'Hembra' ? 'bg-pink-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="font-medium">{sexo}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{cantidad}</span>
                  </div>
                ));
            })()}
          </div>
        </div>
      </div>

      {/* Filtros modernos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">🔍 Filtros y Búsqueda</h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {bovinosFiltrados.length} de {items.length} bovinos
          </div>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por código, nombre, raza, Tag RFID, huella, imágenes..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtros con botones modernos */}
        <div className="flex flex-wrap gap-3">
          {/* Filtro por Tag RFID */}
          <button
            onClick={() => setSoloConTag(!soloConTag)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              soloConTag 
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' 
                : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${soloConTag ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
            <span>🏷️ Solo con Tag RFID</span>
            <span className="text-xs bg-white px-2 py-1 rounded-full">
              {items.filter(b => b.tag_rfid).length}
            </span>
          </button>

          {/* Mostrar/Ocultar Tag RFID */}
          <button
            onClick={() => setMostrarTagRfid(!mostrarTagRfid)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mostrarTagRfid 
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${mostrarTagRfid ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
            <span>👁️ Mostrar Tag RFID</span>
          </button>

          {/* Mostrar/Ocultar Huella */}
          <button
            onClick={() => setMostrarHuella(!mostrarHuella)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              mostrarHuella 
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-200' 
                : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${mostrarHuella ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
            <span>👤 Mostrar Huella</span>
          </button>

          {/* Limpiar filtros */}
          {(filtro || soloConTag) && (
            <button
              onClick={() => {
                setFiltro('');
                setSoloConTag(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200 transition-all duration-200"
            >
              <span>🗑️ Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Indicadores de filtros activos */}
        {(filtro || soloConTag) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filtro && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                🔍 "{filtro}"
                <button
                  onClick={() => setFiltro('')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {soloConTag && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                🏷️ Solo con Tag RFID
                <button
                  onClick={() => setSoloConTag(false)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabla de bovinos */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">Cargando bovinos...</div>
        ) : bovinosFiltrados.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filtro ? 'No se encontraron bovinos con el filtro aplicado' : 'No hay bovinos registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-medium">Código</th>
                  {mostrarTagRfid && <th className="p-4 font-medium">Tag RFID</th>}
                  {mostrarHuella && <th className="p-4 font-medium">Huella</th>}
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Raza</th>
                  <th className="p-4 font-medium">Sexo</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Peso</th>
                  <th className="p-4 font-medium">Propietario</th>
                  <th className="p-4 font-medium">Ubicación</th>
                  <th className="p-4 font-medium">Registrado</th>
                  <th className="p-4 font-medium">Imágenes</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bovinosFiltrados.map(bovino => (
                  <tr key={bovino.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-mono text-blue-600 font-semibold">{bovino.codigo}</div>
                    </td>
                    {mostrarTagRfid && (
                      <td className="p-4">
                        <div className="text-sm">
                          {bovino.tag_rfid ? (
                            <div className="font-mono text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">
                              {bovino.tag_rfid}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs">Sin tag</div>
                          )}
                        </div>
                      </td>
                    )}
                    {mostrarHuella && (
                      <td className="p-4">
                        <div className="text-sm">
                          {(bovino.huella || (bovino.imagenes && bovino.imagenes.length > 0)) ? (
                            <div className="flex items-center space-x-2">
                              <div className="text-orange-600 text-lg">🐄</div>
                              <div className="font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded">
                                SI
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs">Sin huella</div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="font-medium">{bovino.nombre || 'Sin nombre'}</div>
                    </td>
                    <td className="p-4">{bovino.raza || '—'}</td>
                    <td className="p-4">{bovino.sexo || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bovino.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                        bovino.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bovino.estado || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {bovino.peso_actual ? (
                          <div className="font-medium">{bovino.peso_actual} kg</div>
                        ) : (
                          <div className="text-gray-400 text-xs">Sin peso</div>
                        )}
                        {bovino.peso_nacimiento && (
                          <div className="text-xs text-gray-500">Nac: {bovino.peso_nacimiento} kg</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {bovino.nombre_propietario ? (
                          <div className="font-medium">{bovino.nombre_propietario}</div>
                        ) : (
                          <div className="text-gray-400 text-xs">Sin propietario</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {bovino.ubicacion_actual ? (
                          <div className="font-medium">{bovino.ubicacion_actual}</div>
                        ) : (
                          <div className="text-gray-400 text-xs">Sin ubicación</div>
                        )}
                        {bovino.color && (
                          <div className="text-xs text-gray-500">Color: {bovino.color}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(bovino.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {bovino.imagenes && bovino.imagenes.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            <div className="text-blue-600 text-lg">📷</div>
                            <button
                              onClick={() => abrirModalImagenes(bovino)}
                              className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                              title="Ver imágenes"
                            >
                              {bovino.imagenes.length}
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">Sin imágenes</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => router.push(`/editar-bovino/${bovino.id}`)}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Imágenes */}
      {modalImagenes.abierto && modalImagenes.bovino && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  📷 Imágenes de {modalImagenes.bovino.codigo}
                </h2>
                <p className="text-gray-600 text-sm">
                  {modalImagenes.bovino.nombre || 'Sin nombre'} - {modalImagenes.bovino.imagenes?.length} imagen{modalImagenes.bovino.imagenes?.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <button
                onClick={cerrarModalImagenes}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {modalImagenes.bovino.imagenes && modalImagenes.bovino.imagenes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modalImagenes.bovino.imagenes.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Imagen ${index + 1} de ${modalImagenes.bovino?.codigo}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {modalImagenes.bovino?.codigo}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-lg">No hay imágenes disponibles</p>
                  <p className="text-sm">Este bovino no tiene imágenes cargadas</p>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={cerrarModalImagenes}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


