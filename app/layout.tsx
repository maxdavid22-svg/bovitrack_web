import './globals.css';
export const metadata = {
  title: 'BoviTrack Web',
  description: 'Frontend mínimo para trazabilidad con Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-semibold text-lg">BoviTrack</div>
            <nav className="flex gap-2 text-sm">
              <a className="px-3 py-2 rounded hover:bg-gray-100" href="/">Inicio</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100" href="/bovinos">Bovinos</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100" href="/propietarios">Propietarios</a>
              <a className="px-3 py-2 rounded hover:bg-gray-100" href="/eventos">Eventos</a>
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


