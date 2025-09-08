export const metadata = {
  title: 'BoviTrack Web',
  description: 'Frontend mínimo para trazabilidad con Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, Arial, sans-serif' }}>
        <nav style={{ display: 'flex', gap: 16, padding: 12, borderBottom: '1px solid #eee' }}>
          <a href="/">Inicio</a>
          <a href="/bovinos">Bovinos</a>
          <a href="/propietarios">Propietarios</a>
          <a href="/eventos">Eventos</a>
        </nav>
        <div style={{ padding: 16 }}>
          {children}
        </div>
      </body>
    </html>
  );
}


