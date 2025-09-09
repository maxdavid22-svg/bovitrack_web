'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type PropietarioForm = {
  tipo_propietario: string;
  nombre: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  observaciones: string;
};

export default function NuevoPropietarioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PropietarioForm>({
    tipo_propietario: 'Individual',
    nombre: '',
    apellidos: '',
    tipo_documento: 'DNI',
    numero_documento: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    observaciones: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    
    if (!form.numero_documento.trim()) {
      alert('El número de documento es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('propietarios')
        .insert([{
          tipo_propietario: form.tipo_propietario,
          nombre: form.nombre.trim(),
          apellidos: form.apellidos.trim() || null,
          tipo_documento: form.tipo_documento,
          numero_documento: form.numero_documento.trim(),
          telefono: form.telefono.trim() || null,
          email: form.email.trim() || null,
          direccion: form.direccion.trim() || null,
          ciudad: form.ciudad.trim() || null,
          departamento: form.departamento.trim() || null,
          observaciones: form.observaciones.trim() || null
        }]);

      if (error) {
        console.error('Error guardando propietario:', error);
        alert('Error al guardar el propietario');
      } else {
        alert('Propietario registrado exitosamente');
        router.push('/propietarios');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el propietario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">👥 Registrar Nuevo Propietario</h1>
        <p className="text-amber-100">Agregar propietario al sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Información del Propietario</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Primera fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Propietario <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.tipo_propietario}
                    onChange={(e) => setForm({...form, tipo_propietario: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="Individual">Individual</option>
                    <option value="Empresa">Empresa</option>
                    <option value="Cooperativa">Cooperativa</option>
                    <option value="Asociación">Asociación</option>
                    <option value="Fundación">Fundación</option>
                    <option value="Sociedad">Sociedad</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.tipo_documento}
                    onChange={(e) => setForm({...form, tipo_documento: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">CE</option>
                    <option value="PAS">PAS</option>
                    <option value="CAR">CAR</option>
                  </select>
                </div>
              </div>

              {/* Segunda fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Nombre"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={form.apellidos}
                    onChange={(e) => setForm({...form, apellidos: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Apellidos"
                  />
                </div>
              </div>

              {/* Tercera fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.numero_documento}
                    onChange={(e) => setForm({...form, numero_documento: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Número de documento"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({...form, telefono: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>

              {/* Cuarta fila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Correo electrónico"
                />
              </div>

              {/* Quinta fila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({...form, direccion: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Dirección completa"
                />
              </div>

              {/* Sexta fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => setForm({...form, ciudad: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Ciudad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={form.departamento}
                    onChange={(e) => setForm({...form, departamento: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Departamento"
                  />
                </div>
              </div>

              {/* Séptima fila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({...form, observaciones: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'Guardando...' : '💾 Guardar Propietario'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/propietarios')}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Información adicional */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Datos Requeridos</h4>
                <ul className="space-y-1">
                  <li>• Nombre completo</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Datos Opcionales</h4>
                <ul className="space-y-1">
                  <li>• Teléfono de contacto</li>
                  <li>• Correo electrónico</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ayuda */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Información</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Los propietarios pueden tener múltiples bovinos asociados.</div>
              <div>La información de contacto es útil para comunicaciones.</div>
              <div>Los datos se sincronizan automáticamente con la app móvil.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
