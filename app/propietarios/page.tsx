'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
};

export default function PropietariosPage() {
  const [items, setItems] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const cargarPropietarios = async () => {
    try {
      const { data, error } = await supabase
        .from('propietarios')
        .select('id, tipo_propietario, nombre, apellidos, tipo_documento, numero_documento, telefono, email, direccion, ciudad, departamento, observaciones, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) {
        console.error('Error cargando propietarios:', error);
      } else {
        setItems(data || []);
      }
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
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Documento</th>
                  <th className="p-4 font-medium">Contacto</th>
                  <th className="p-4 font-medium">Ubicación</th>
                  <th className="p-4 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {propietariosFiltrados.map(propietario => (
                  <tr key={propietario.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
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
                      <div className="font-medium">{propietario.nombre}</div>
                      {propietario.apellidos && (
                        <div className="text-gray-600 text-xs">{propietario.apellidos}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="font-mono">{propietario.tipo_documento}</span>
                        <div className="text-gray-600">{propietario.numero_documento}</div>
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
                        {propietario.ciudad && (
                          <div className="text-gray-600">📍 {propietario.ciudad}</div>
                        )}
                        {propietario.departamento && (
                          <div className="text-gray-500">{propietario.departamento}</div>
                        )}
                        {!propietario.ciudad && !propietario.departamento && (
                          <span className="text-gray-400">Sin ubicación</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(propietario.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Resumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{items.length}</div>
              <div className="text-sm text-gray-600">Total Propietarios</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {items.filter(p => p.telefono).length}
              </div>
              <div className="text-sm text-gray-600">Con Teléfono</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {items.filter(p => p.email).length}
              </div>
              <div className="text-sm text-gray-600">Con Email</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {items.filter(p => p.ciudad).length}
              </div>
              <div className="text-sm text-gray-600">Con Ubicación</div>
            </div>
          </div>

          {/* Estadísticas por tipo */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Distribución por Tipo</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {['Individual', 'Empresa', 'Cooperativa', 'Asociación', 'Fundación', 'Sociedad', 'Otro'].map(tipo => {
                const cantidad = items.filter(p => p.tipo_propietario === tipo).length;
                if (cantidad === 0) return null;
                
                return (
                  <div key={tipo} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-amber-600">{cantidad}</div>
                    <div className="text-xs text-gray-600">{tipo}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


