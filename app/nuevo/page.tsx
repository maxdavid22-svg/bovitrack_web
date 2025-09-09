'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Propietario = {
  id: string;
  nombre: string;
  apellidos: string | null;
  tipo_propietario: string;
};

export default function Nuevo() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState<'Macho' | 'Hembra' | ''>('');
  const [estado, setEstado] = useState<'Activo' | 'Vendido' | 'Sacrificado' | 'Muerto' | ''>('Activo');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [pesoNacimiento, setPesoNacimiento] = useState('');
  const [pesoActual, setPesoActual] = useState('');
  const [color, setColor] = useState('');
  const [marcas, setMarcas] = useState('');
  const [idPropietario, setIdPropietario] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState('');
  const [coordenadas, setCoordenadas] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const cargarPropietarios = async () => {
    try {
      const { data, error } = await supabase
        .from('propietarios')
        .select('id, nombre, apellidos, tipo_propietario')
        .order('nombre');

      if (error) {
        console.error('Error cargando propietarios:', error);
      } else {
        setPropietarios(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    if (!codigo) return alert('Código requerido');
    if (!sexo) return alert('Sexo requerido');
    
    setSaving(true);
    try {
      const propietarioSeleccionado = propietarios.find(p => p.id === idPropietario);
      
      const payload: any = {
        codigo,
        nombre: nombre || null,
        raza: raza || null,
        sexo,
        estado: estado || 'Activo',
        fecha_nacimiento: fechaNacimiento || null,
        peso_nacimiento: pesoNacimiento ? parseFloat(pesoNacimiento) : null,
        peso_actual: pesoActual ? parseFloat(pesoActual) : null,
        color: color || null,
        marcas: marcas || null,
        id_propietario: idPropietario || null,
        nombre_propietario: propietarioSeleccionado ? 
          `${propietarioSeleccionado.nombre} ${propietarioSeleccionado.apellidos || ''}`.trim() : null,
        ubicacion_actual: ubicacionActual || null,
        coordenadas: coordenadas || null,
        observaciones: observaciones || null,
      };
      
      const { error } = await supabase.from('bovinos').insert([payload]);
      
      if (error) {
        console.error('Error guardando bovino:', error);
        alert(`Error al guardar: ${error.message}`);
      } else {
        alert('Bovino registrado exitosamente');
        router.push('/bovinos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el bovino');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-2xl mb-2">⏳</div>
          <div>Cargando propietarios...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">🐄 Registrar Nuevo Bovino</h1>
        <p className="text-blue-100">Complete todos los datos para registrar un nuevo bovino en el sistema</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="space-y-6">
          
          {/* Información Básica */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">📋 Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código del Bovino <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={codigo} 
                  onChange={e => setCodigo(e.target.value)}
                  placeholder="Ej: BOV-001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Nombre del bovino"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={raza} 
                  onChange={e => setRaza(e.target.value)}
                  placeholder="Ej: Holstein, Angus, Brahman"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={sexo} 
                  onChange={e => setSexo(e.target.value as any)}
                  required
                >
                  <option value="">Seleccionar sexo</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={estado} 
                  onChange={e => setEstado(e.target.value as any)}
                >
                  <option value="Activo">Activo</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Sacrificado">Sacrificado</option>
                  <option value="Muerto">Muerto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={fechaNacimiento} 
                  onChange={e => setFechaNacimiento(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Características Físicas */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">🎨 Características Físicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={color} 
                  onChange={e => setColor(e.target.value)}
                  placeholder="Ej: Negro, Blanco, Marrón"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marcas o Señales</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={marcas} 
                  onChange={e => setMarcas(e.target.value)}
                  placeholder="Descripción de marcas distintivas"
                />
              </div>
            </div>
          </div>

          {/* Peso */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">⚖️ Información de Peso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso al Nacer (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={pesoNacimiento} 
                  onChange={e => setPesoNacimiento(e.target.value)}
                  placeholder="Ej: 35.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso Actual (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={pesoActual} 
                  onChange={e => setPesoActual(e.target.value)}
                  placeholder="Ej: 450.0"
                />
              </div>
            </div>
          </div>

          {/* Propietario */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">👤 Propietario</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Propietario</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={idPropietario} 
                onChange={e => setIdPropietario(e.target.value)}
              >
                <option value="">Seleccionar propietario</option>
                {propietarios.map(propietario => (
                  <option key={propietario.id} value={propietario.id}>
                    {propietario.nombre} {propietario.apellidos || ''} ({propietario.tipo_propietario})
                  </option>
                ))}
              </select>
              {propietarios.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No hay propietarios registrados. 
                  <a href="/nuevo-propietario" className="text-blue-600 hover:underline ml-1">
                    Registrar propietario
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">📍 Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación Actual</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={ubicacionActual} 
                  onChange={e => setUbicacionActual(e.target.value)}
                  placeholder="Ej: Finca La Esperanza, Lote 5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas GPS</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={coordenadas} 
                  onChange={e => setCoordenadas(e.target.value)}
                  placeholder="Ej: -12.0464, -77.0428"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">📝 Observaciones</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones Adicionales</label>
              <textarea 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24" 
                value={observaciones} 
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Información adicional sobre el bovino..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-6 border-t">
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? '⏳ Guardando...' : '💾 Guardar Bovino'}
            </button>
            <button 
              type="button"
              onClick={() => router.push('/bovinos')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}


