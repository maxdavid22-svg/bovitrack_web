'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Propietario = {
  id: string;
  nombre: string;
  apellidos: string | null;
  tipo_propietario: string;
};

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
  created_at: string;
};

export default function EditarBovinoPage() {
  const router = useRouter();
  const params = useParams();
  const bovinoId = params.id as string;

  const [bovino, setBovino] = useState<Bovino | null>(null);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estadoOriginal, setEstadoOriginal] = useState<string>('');

  // Mapeo de estados a tipos de evento
  const mapeoEstadosEventos: { [key: string]: string } = {
    'Sacrificado': 'Sacrificio',
    'Vendido': 'Venta',
    'Muerto': 'Muerte',
    'Activo': 'Activación'
  };

  // Estados del formulario
  const [codigo, setCodigo] = useState('');
  const [tagRfid, setTagRfid] = useState('');
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState<'Macho' | 'Hembra' | ''>('');
  const [estado, setEstado] = useState<'Activo' | 'Vendido' | 'Sacrificado' | 'Muerto' | ''>('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [pesoNacimiento, setPesoNacimiento] = useState('');
  const [pesoActual, setPesoActual] = useState('');
  const [color, setColor] = useState('');
  const [marcas, setMarcas] = useState('');
  const [idPropietario, setIdPropietario] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState('');
  const [coordenadas, setCoordenadas] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (bovinoId) {
      cargarBovino();
      cargarPropietarios();
    }
  }, [bovinoId]);

  const cargarBovino = async () => {
    try {
      const { data, error } = await supabase
        .from('bovinos')
        .select('*')
        .eq('id', bovinoId)
        .single();

      if (error) {
        console.error('Error cargando bovino:', error);
        return;
      }

      if (data) {
        setBovino(data);
        setCodigo(data.codigo || '');
        setTagRfid(data.tag_rfid || '');
        setNombre(data.nombre || '');
        setRaza(data.raza || '');
        setSexo(data.sexo || '');
        setEstado(data.estado || '');
        setEstadoOriginal(data.estado || ''); // Guardar estado original
        setFechaNacimiento(data.fecha_nacimiento || '');
        setPesoNacimiento(data.peso_nacimiento?.toString() || '');
        setPesoActual(data.peso_actual?.toString() || '');
        setColor(data.color || '');
        setMarcas(data.marcas || '');
        setIdPropietario(data.id_propietario || '');
        setUbicacionActual(data.ubicacion_actual || '');
        setCoordenadas(data.coordenadas || '');
        setObservaciones(data.observaciones || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPropietarios = async () => {
    try {
      const { data, error } = await supabase
        .from('propietarios')
        .select('id, nombre, apellidos, tipo_propietario')
        .order('nombre');

      if (error) {
        console.error('Error cargando propietarios:', error);
        return;
      }

      setPropietarios(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const guardar = async () => {
    if (!codigo.trim()) {
      alert('El código del bovino es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        codigo: codigo.trim(),
        tag_rfid: tagRfid.trim() || null,
        nombre: nombre.trim() || null,
        raza: raza.trim() || null,
        sexo: sexo || null,
        estado: estado || 'Activo',
        fecha_nacimiento: fechaNacimiento || null,
        peso_nacimiento: pesoNacimiento ? parseFloat(pesoNacimiento) : null,
        peso_actual: pesoActual ? parseFloat(pesoActual) : null,
        color: color.trim() || null,
        marcas: marcas.trim() || null,
        id_propietario: idPropietario || null,
        ubicacion_actual: ubicacionActual.trim() || null,
        coordenadas: coordenadas.trim() || null,
        observaciones: observaciones.trim() || null,
      };

      console.log('Actualizando bovino con payload:', payload);
      
      const { data: updateData, error } = await supabase
        .from('bovinos')
        .update(payload)
        .eq('id', bovinoId)
        .select();

      console.log('Resultado de la actualización:', { updateData, error });

      if (error) {
        console.error('Error actualizando bovino:', error);
        alert('Error al actualizar el bovino: ' + error.message);
        return;
      }

      console.log('Bovino actualizado exitosamente:', updateData);

      // Crear evento automático si cambió el estado
      if (estado !== estadoOriginal && mapeoEstadosEventos[estado]) {
        const tipoEvento = mapeoEstadosEventos[estado];
        const descripcion = `Cambio de estado: ${estadoOriginal} → ${estado}`;
        
        console.log('Creando evento automático:', { tipoEvento, descripcion });
        
        const { error: eventoError } = await supabase
          .from('eventos')
          .insert({
            bovino_id: bovinoId,
            tipo: tipoEvento,
            fecha: new Date().toISOString().split('T')[0], // Fecha actual
            descripcion: descripcion
          });

        if (eventoError) {
          console.error('Error creando evento automático:', eventoError);
          alert('Bovino actualizado, pero hubo un error al crear el evento de cambio de estado');
        } else {
          console.log('Evento automático creado exitosamente');
        }
      }

      alert('Bovino actualizado exitosamente');
      router.push('/bovinos');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el bovino');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando bovino...</p>
        </div>
      </div>
    );
  }

  if (!bovino) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bovino no encontrado</h1>
          <p className="text-gray-600 mb-4">El bovino que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => router.push('/bovinos')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a Bovinos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">✏️ Editar Bovino</h1>
              <p className="text-gray-600 mt-1">Modifica la información del bovino {bovino.codigo}</p>
            </div>
            <button
              onClick={() => router.push('/bovinos')}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código del Bovino */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del Bovino *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                placeholder="Ej: BOV001"
              />
            </div>

            {/* Tag RFID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag RFID
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={tagRfid}
                onChange={e => setTagRfid(e.target.value)}
                placeholder="ID del tag RFID"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Nombre del bovino"
              />
            </div>

            {/* Raza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raza
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={raza}
                onChange={e => setRaza(e.target.value)}
                placeholder="Raza del bovino"
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sexo}
                onChange={e => setSexo(e.target.value as 'Macho' | 'Hembra' | '')}
              >
                <option value="">Seleccionar sexo</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={estado}
                onChange={e => setEstado(e.target.value as 'Activo' | 'Vendido' | 'Sacrificado' | 'Muerto' | '')}
              >
                <option value="Activo">Activo</option>
                <option value="Vendido">Vendido</option>
                <option value="Sacrificado">Sacrificado</option>
                <option value="Muerto">Muerto</option>
              </select>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
              />
            </div>

            {/* Peso al Nacer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso al Nacer (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={pesoNacimiento}
                onChange={e => setPesoNacimiento(e.target.value)}
                placeholder="Ej: 35.5"
              />
            </div>

            {/* Peso Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Actual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={pesoActual}
                onChange={e => setPesoActual(e.target.value)}
                placeholder="Ej: 450.0"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Color del bovino"
              />
            </div>

            {/* Marcas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marcas
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={marcas}
                onChange={e => setMarcas(e.target.value)}
                placeholder="Marcas distintivas"
              />
            </div>

            {/* Propietario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Propietario
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={idPropietario}
                onChange={e => setIdPropietario(e.target.value)}
              >
                <option value="">Seleccionar propietario</option>
                {propietarios.map(propietario => (
                  <option key={propietario.id} value={propietario.id}>
                    {propietario.nombre} {propietario.apellidos || ''} - {propietario.tipo_propietario}
                  </option>
                ))}
              </select>
            </div>

            {/* Ubicación Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación Actual
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={ubicacionActual}
                onChange={e => setUbicacionActual(e.target.value)}
                placeholder="Ubicación actual del bovino"
              />
            </div>

            {/* Coordenadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coordenadas
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={coordenadas}
                onChange={e => setCoordenadas(e.target.value)}
                placeholder="Lat, Lng"
              />
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Observaciones adicionales"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={guardar}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Cambios
                </>
              )}
            </button>

            <button
              onClick={() => router.push('/bovinos')}
              className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
