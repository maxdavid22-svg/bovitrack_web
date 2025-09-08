export const metadata = {
  title: 'BoviTrack Web',
  description: 'Frontend mínimo para trazabilidad con Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, Arial, sans-serif' }}>{children}</body>
    </html>
  );
}


