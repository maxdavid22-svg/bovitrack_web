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
};

type EventoForm = {
  bovino_codigo: string;
  tipo: string;
  fecha: string;
  descripcion: string;
  litros?: string;
  turno?: 'Mañana' | 'Tarde' | 'Noche' | '';
  peso_kg?: string;
  gmd?: string;
};

export default function NuevoEventoPage() {
  const router = useRouter();
  // Nota: evitamos useSearchParams para no requerir Suspense en build
  const [bovinos, setBovinos] = useState<Bovino[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EventoForm>({
    bovino_codigo: '',
    tipo: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    litros: '',
    turno: '',
    peso_kg: '',
    gmd: ''
  });

  const tiposEvento = [
    { value: 'Ordeño', label: 'Ordeño' },
    { value: 'Engorde', label: 'Engorde' },
    { value: 'Registro', label: 'Registro' },
    { value: 'Vacunación', label: 'Vacunación' },
    { value: 'Tratamiento', label: 'Tratamiento' },
    { value: 'Pesaje', label: 'Pesaje' },
    { value: 'Reproducción', label: 'Reproducción' },
    { value: 'Parto', label: 'Parto' },
    { value: 'Venta', label: 'Venta' },
    { value: 'Muerte', label: 'Muerte' },
    { value: 'Traslado', label: 'Traslado' },
    { value: 'Otro', label: 'Otro' }
  ];

  useEffect(() => {
    cargarBovinos();
    if (typeof window !== 'undefined') {
      const usp = new URLSearchParams(window.location.search);
      const preTipo = usp.get('tipo');
      if (preTipo) {
        setForm(prev => ({ ...prev, tipo: preTipo }));
      }
    }
  }, []);

  const cargarBovinos = async () => {
    try {
      const { data, error } = await supabase
        .from('bovinos')
        .select('id, codigo, nombre, raza, sexo, estado')
        .order('codigo');

      if (error) {
        console.error('Error cargando bovinos:', error);
      } else {
        console.log('Bovinos cargados:', data?.length || 0);
        setBovinos(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.bovino_codigo || !form.tipo || !form.fecha) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validaciones por tipo
    if (form.tipo === 'Ordeño') {
      if (!form.litros || isNaN(Number(form.litros))) {
        alert('Ingrese litros válidos para Ordeño');
        return;
      }
      if (!form.turno) {
        alert('Seleccione turno de Ordeño');
        return;
      }
    }
    if (form.tipo === 'Engorde') {
      if (!form.peso_kg || isNaN(Number(form.peso_kg))) {
        alert('Ingrese peso (kg) válido para Engorde');
        return;
      }
      if (form.gmd && isNaN(Number(form.gmd))) {
        alert('GMD debe ser numérico (kg/día)');
        return;
      }
    }

    setSaving(true);
    try {
      // Buscar el bovino por código
      const { data: bovinoData, error: bovinoError } = await supabase
        .from('bovinos')
        .select('id')
        .eq('codigo', form.bovino_codigo)
        .single();

      if (bovinoError) {
        console.error('Error buscando bovino:', bovinoError);
        alert(`Error buscando bovino: ${bovinoError.message}`);
        setSaving(false);
        return;
      }
      
      if (!bovinoData) {
        alert('Bovino no encontrado. Asegúrate de que el bovino esté registrado en el sistema.');
        setSaving(false);
        return;
      }

      // Generar ID determinístico para el evento
      const eventId = generateEventId(form.bovino_codigo, form.tipo, form.fecha, form.descripcion);

      // Insertar el evento
      const { error: eventoError } = await supabase
        .from('eventos')
        .insert({
          id: eventId,
          bovino_id: bovinoData.id,
          tipo: form.tipo,
          fecha: form.fecha,
          descripcion: form.descripcion || null,
          litros: form.tipo === 'Ordeño' ? Number(form.litros) : null,
          turno: form.tipo === 'Ordeño' ? (form.turno || null) : null,
          peso_kg: form.tipo === 'Engorde' ? Number(form.peso_kg) : null,
          gmd: form.tipo === 'Engorde' && form.gmd ? Number(form.gmd) : null
        });

      if (eventoError) {
        console.error('Error guardando evento:', eventoError);
        alert(`Error al guardar el evento: ${eventoError.message}`);
      } else {
        alert('Evento registrado exitosamente');
        router.push('/eventos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const generateEventId = (bovinoCodigo: string, tipo: string, fecha: string, descripcion: string): string => {
    // Generar un UUID v4 válido usando crypto.randomUUID si está disponible
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback: generar UUID v4 manualmente
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const bovinoSeleccionado = bovinos.find(b => b.codigo === form.bovino_codigo);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">📝 Registrar Nuevo Evento</h1>
          <p className="text-indigo-100">Agregar evento al historial de trazabilidad</p>
        </div>
        <div className="text-center py-12">
          <div className="text-lg">Cargando bovinos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">📝 Registrar Nuevo Evento</h1>
        <p className="text-indigo-100">Agregar evento al historial de trazabilidad</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Información del Evento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bovino <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.bovino_codigo}
                  onChange={(e) => setForm({...form, bovino_codigo: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar bovino...</option>
                  {bovinos.map(bovino => (
                    <option key={bovino.id} value={bovino.codigo}>
                      {bovino.codigo} - {bovino.nombre || 'Sin nombre'} ({bovino.raza || 'Sin raza'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos dinámicos por tipo */}
              {form.tipo === 'Ordeño' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Litros</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.litros}
                      onChange={(e) => setForm({ ...form, litros: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: 18.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                    <select
                      value={form.turno}
                      onChange={(e) => setForm({ ...form, turno: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Seleccionar turno</option>
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                    </select>
                  </div>
                </div>
              )}

              {form.tipo === 'Engorde' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.peso_kg}
                      onChange={(e) => setForm({ ...form, peso_kg: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: 420.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GMD (kg/día) opcional</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.gmd}
                      onChange={(e) => setForm({ ...form, gmd: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ej: 0.85"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Evento <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({...form, tipo: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  {tiposEvento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({...form, fecha: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({...form, descripcion: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Descripción detallada del evento..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || bovinos.length === 0}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'Guardando...' : bovinos.length === 0 ? 'Sin bovinos disponibles' : '💾 Guardar Evento'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/eventos')}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Información del bovino seleccionado */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Información del Bovino</h3>
            
            {bovinos.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">⚠️</div>
                <div>No hay bovinos registrados</div>
                <div className="text-sm mt-2">Registra bovinos primero para poder crear eventos</div>
              </div>
            ) : bovinoSeleccionado ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Código</div>
                  <div className="font-mono text-lg font-semibold text-blue-600">
                    {bovinoSeleccionado.codigo}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Nombre</div>
                  <div className="font-medium">
                    {bovinoSeleccionado.nombre || 'Sin nombre'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Raza</div>
                  <div className="font-medium">
                    {bovinoSeleccionado.raza || 'Sin especificar'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Sexo</div>
                  <div className="font-medium">
                    {bovinoSeleccionado.sexo || 'Sin especificar'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      bovinoSeleccionado.estado === 'Activo' ? 'bg-green-100 text-green-800' : 
                      bovinoSeleccionado.estado === 'Inactivo' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bovinoSeleccionado.estado || 'Sin especificar'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🐄</div>
                <div>Selecciona un bovino para ver su información</div>
              </div>
            )}
          </div>

          {/* Ayuda */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Tipos de Evento</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Registro:</strong> Registro inicial del bovino</div>
              <div><strong>Vacunación:</strong> Aplicación de vacunas</div>
              <div><strong>Tratamiento:</strong> Tratamientos médicos</div>
              <div><strong>Pesaje:</strong> Control de peso</div>
              <div><strong>Reproducción:</strong> Eventos reproductivos</div>
              <div><strong>Parto:</strong> Nacimientos</div>
              <div><strong>Venta:</strong> Transacciones comerciales</div>
              <div><strong>Muerte:</strong> Pérdidas del ganado</div>
              <div><strong>Traslado:</strong> Movimientos de ubicación</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
