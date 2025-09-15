-- Migración: Campos de producción en tabla eventos
-- Ejecutar en Supabase SQL Editor

-- Ordeño
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS litros numeric; -- litros en ordeño
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS turno text; -- Mañana/Tarde/Noche

-- Engorde / Peso
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS peso_kg numeric; -- peso registrado
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS gmd numeric; -- ganancia media diaria estimada

-- Índices simples
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);

-- Comentarios
COMMENT ON COLUMN eventos.litros IS 'Cantidad de litros en evento de Ordeño';
COMMENT ON COLUMN eventos.turno IS 'Turno del ordeño: Mañana/Tarde/Noche';
COMMENT ON COLUMN eventos.peso_kg IS 'Peso en kilogramos medido en evento (p.ej., Engorde/Pesaje)';
COMMENT ON COLUMN eventos.gmd IS 'Ganancia media diaria estimada (kg/día)';


