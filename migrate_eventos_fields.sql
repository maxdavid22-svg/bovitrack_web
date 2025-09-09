-- Migración para agregar campos faltantes a la tabla eventos
-- Ejecutar en Supabase SQL Editor

-- Agregar campos faltantes a la tabla eventos
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS medicamento TEXT,
ADD COLUMN IF NOT EXISTS dosis TEXT,
ADD COLUMN IF NOT EXISTS veterinario TEXT,
ADD COLUMN IF NOT EXISTS observaciones TEXT,
ADD COLUMN IF NOT EXISTS peso_kg DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS costo DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS ubicacion TEXT,
ADD COLUMN IF NOT EXISTS hora TIME;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_bovino_id ON eventos(bovino_id);
CREATE INDEX IF NOT EXISTS idx_eventos_veterinario ON eventos(veterinario);

-- Comentarios para documentar los campos
COMMENT ON COLUMN eventos.medicamento IS 'Medicamento o vacuna aplicada';
COMMENT ON COLUMN eventos.dosis IS 'Dosis del medicamento o vacuna';
COMMENT ON COLUMN eventos.veterinario IS 'Nombre del veterinario responsable';
COMMENT ON COLUMN eventos.observaciones IS 'Observaciones adicionales del evento';
COMMENT ON COLUMN eventos.peso_kg IS 'Peso registrado en el evento (para pesajes)';
COMMENT ON COLUMN eventos.costo IS 'Costo del tratamiento o servicio';
COMMENT ON COLUMN eventos.ubicacion IS 'Ubicación donde ocurrió el evento';
COMMENT ON COLUMN eventos.hora IS 'Hora específica del evento';
