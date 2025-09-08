export const metadata = {
  title: 'BoviTrack Web',
  description: 'Frontend mínimo para trazabilidad con Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <link rel="stylesheet" href="/app/globals.css" />
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <div className="font-semibold">BoviTrack</div>
            <nav className="flex gap-4 text-sm">
              <a className="hover:text-blue-600" href="/">Inicio</a>
              <a className="hover:text-blue-600" href="/bovinos">Bovinos</a>
              <a className="hover:text-blue-600" href="/propietarios">Propietarios</a>
              <a className="hover:text-blue-600" href="/eventos">Eventos</a>
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


