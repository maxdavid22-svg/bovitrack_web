-- Migración para agregar campos específicos de eventos de venta y traslado
-- Ejecutar en Supabase SQL Editor

-- Agregar campos específicos para eventos de venta y traslado
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS comprador TEXT,
ADD COLUMN IF NOT EXISTS destino TEXT;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_eventos_comprador ON eventos(comprador);
CREATE INDEX IF NOT EXISTS idx_eventos_destino ON eventos(destino);

-- Comentarios para documentar los campos
COMMENT ON COLUMN eventos.comprador IS 'Nombre del comprador (para eventos de venta)';
COMMENT ON COLUMN eventos.destino IS 'Destino del traslado (para eventos de traslado)';
