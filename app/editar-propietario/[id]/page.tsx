'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
};

export default function EditarPropietarioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [propietario, setPropietario] = useState<Propietario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipo_propietario: '',
    nombre: '',
    apellidos: '',
    tipo_documento: '',
    numero_documento: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    observaciones: ''
  });

  useEffect(() => {
    if (id) {
      cargarPropietario();
    }
  }, [id]);

  const cargarPropietario = async () => {
    try {
      const { data, error } = await supabase
        .from('propietarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error cargando propietario:', error);
        setError('Error al cargar el propietario');
        return;
      }

      if (data) {
        setPropietario(data);
        setFormData({
          tipo_propietario: data.tipo_propietario || '',
          nombre: data.nombre || '',
          apellidos: data.apellidos || '',
          tipo_documento: data.tipo_documento || '',
          numero_documento: data.numero_documento || '',
          telefono: data.telefono || '',
          email: data.email || '',
          direccion: data.direccion || '',
          ciudad: data.ciudad || '',
          departamento: data.departamento || '',
          observaciones: data.observaciones || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar el propietario');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('propietarios')
        .update({
          tipo_propietario: formData.tipo_propietario,
          nombre: formData.nombre,
          apellidos: formData.apellidos || null,
          tipo_documento: formData.tipo_documento,
          numero_documento: formData.numero_documento,
          telefono: formData.telefono || null,
          email: formData.email || null,
          direccion: formData.direccion || null,
          ciudad: formData.ciudad || null,
          departamento: formData.departamento || null,
          observaciones: formData.observaciones || null
        })
        .eq('id', id);

      if (error) {
        console.error('Error actualizando propietario:', error);
        setError('Error al actualizar el propietario');
        return;
      }

      // Redirigir a la página de propietarios
      router.push('/propietarios');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al actualizar el propietario');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando propietario...</p>
        </div>
      </div>
    );
  }

  if (!propietario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Propietario no encontrado</h1>
          <p className="text-gray-600 mb-4">El propietario que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => router.push('/propietarios')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Volver a Propietarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">✏️ Editar Propietario</h1>
              <p className="text-amber-100">Modifica la información del propietario</p>
            </div>
            <button
              onClick={() => router.push('/propietarios')}
              className="bg-white text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition font-medium"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Propietario *
                </label>
                <select
                  name="tipo_propietario"
                  value={formData.tipo_propietario}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Individual">Individual</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Cooperativa">Cooperativa</option>
                  <option value="Asociación">Asociación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carné de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ej: Av. Principal 123"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Ej: Lima"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleInputChange}
                    placeholder="Ej: Lima"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={4}
                placeholder="Información adicional sobre el propietario..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/propietarios')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
