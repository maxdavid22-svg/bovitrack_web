'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Nuevo() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState<'Macho' | 'Hembra' | ''>('');
  const [estado, setEstado] = useState<'Activo' | 'Vendido' | 'Sacrificado' | 'Muerto' | ''>('Activo');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const guardar = async () => {
    if (!codigo) return alert('Código requerido');
    setSaving(true);
    const payload: any = {
      codigo,
      nombre: nombre || null,
      raza: raza || null,
      sexo: sexo || null,
      estado: estado || null,
      fecha_nacimiento: fechaNacimiento || null,
    };
    const { error } = await supabase.from('bovinos').insert([payload]);
    setSaving(false);
    if (error) return alert(error.message);
    router.push('/bovinos');
  };

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Registrar Bovino</h1>
      <div className="bg-white border rounded p-4 space-y-4">
        <div>
          <label className="block text-sm mb-1">Código</label>
          <input className="w-full border rounded px-3 py-2" value={codigo} onChange={e => setCodigo(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input className="w-full border rounded px-3 py-2" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Raza</label>
          <input className="w-full border rounded px-3 py-2" value={raza} onChange={e => setRaza(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Sexo</label>
            <select className="w-full border rounded px-3 py-2" value={sexo} onChange={e => setSexo(e.target.value as any)}>
              <option value="">Seleccionar…</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Estado</label>
            <select className="w-full border rounded px-3 py-2" value={estado} onChange={e => setEstado(e.target.value as any)}>
              <option value="Activo">Activo</option>
              <option value="Vendido">Vendido</option>
              <option value="Sacrificado">Sacrificado</option>
              <option value="Muerto">Muerto</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha de Nacimiento</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={guardar} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <a href="/bovinos" className="px-4 py-2 border rounded">Cancelar</a>
        </div>
      </div>
    </main>
  );
}


