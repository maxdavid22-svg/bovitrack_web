'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Nuevo() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const guardar = async () => {
    if (!codigo) return alert('Código requerido');
    setSaving(true);
    const { error } = await supabase.from('bovinos').insert([{ codigo, nombre }]);
    setSaving(false);
    if (error) return alert(error.message);
    router.push('/');
  };

  return (
    <main style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h1>Nuevo Bovino</h1>
      <div style={{ marginBottom: 8 }}>
        <label>Código</label>
        <input value={codigo} onChange={e => setCodigo(e.target.value)} style={{ display: 'block', width: '100%' }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} style={{ display: 'block', width: '100%' }} />
      </div>
      <button onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
    </main>
  );
}


