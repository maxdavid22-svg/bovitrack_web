import './globals.css';
export const metadata = {
  title: 'BoviTrack Web',
  description: 'Frontend mínimo para trazabilidad con Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/Vaquita.png" alt="Vaquita" className="w-8 h-8 object-contain" />
              <div className="font-bold text-xl text-blue-600">BoviTrack</div>
            </div>
            <nav className="flex gap-1 text-sm">
              <a className="px-3 py-2 rounded hover:bg-gray-100 transition" href="/">🏠 Inicio</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100 transition" href="/bovinos">🐄 Bovinos</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100 transition" href="/propietarios">👥 Propietarios</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100 transition" href="/eventos">📅 Eventos</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100 transition" href="/historial">📊 Historial</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100 transition" href="/reportes">📈 Reportes</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100 transition" href="/produccion">🏭 Producción</a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}


