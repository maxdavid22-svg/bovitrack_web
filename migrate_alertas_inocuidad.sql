-- Migración para agregar campos de inocuidad y alertas
-- Ejecutar en Supabase SQL Editor

-- Agregar campos de inocuidad a la tabla eventos
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS es_critico BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requiere_retiro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE,
ADD COLUMN IF NOT EXISTS nivel_riesgo TEXT CHECK (nivel_riesgo IN ('Bajo', 'Medio', 'Alto', 'Crítico') OR nivel_riesgo IS NULL),
ADD COLUMN IF NOT EXISTS observaciones_inocuidad TEXT;

-- Crear índices para optimizar consultas de alertas
CREATE INDEX IF NOT EXISTS idx_eventos_es_critico ON eventos(es_critico);
CREATE INDEX IF NOT EXISTS idx_eventos_requiere_retiro ON eventos(requiere_retiro);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_vencimiento ON eventos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_eventos_nivel_riesgo ON eventos(nivel_riesgo);

-- Agregar comentarios para documentación
COMMENT ON COLUMN eventos.es_critico IS 'Indica si el evento es crítico para la inocuidad alimentaria';
COMMENT ON COLUMN eventos.requiere_retiro IS 'Indica si el bovino requiere retiro sanitario';
COMMENT ON COLUMN eventos.fecha_vencimiento IS 'Fecha de vencimiento para vacunaciones o tratamientos';
COMMENT ON COLUMN eventos.nivel_riesgo IS 'Nivel de riesgo: Bajo, Medio, Alto, Crítico';
COMMENT ON COLUMN eventos.observaciones_inocuidad IS 'Observaciones específicas sobre inocuidad';

-- Crear tabla de tipos de alertas
CREATE TABLE IF NOT EXISTS tipos_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  nivel_riesgo TEXT NOT NULL CHECK (nivel_riesgo IN ('Bajo', 'Medio', 'Alto', 'Crítico')),
  dias_anticipacion INTEGER DEFAULT 0,
  es_activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar tipos de alertas predefinidos
INSERT INTO tipos_alertas (codigo, nombre, descripcion, nivel_riesgo, dias_anticipacion) VALUES
('VAC_VENCIDA', 'Vacunación Vencida', 'Vacunación que ha vencido y requiere renovación', 'Alto', 0),
('VAC_POR_VENCER', 'Vacunación por Vencer', 'Vacunación que vence en los próximos días', 'Medio', 30),
('RETIRO_SANITARIO', 'Retiro Sanitario', 'Bovino que requiere retiro sanitario inmediato', 'Crítico', 0),
('TRATAMIENTO_VENCIDO', 'Tratamiento Vencido', 'Tratamiento médico que ha vencido', 'Alto', 0),
('CUARENTENA', 'Cuarentena', 'Bovino en período de cuarentena', 'Medio', 0),
('ENFERMEDAD_DETECTADA', 'Enfermedad Detectada', 'Enfermedad que afecta la inocuidad', 'Crítico', 0)
ON CONFLICT (codigo) DO NOTHING;

-- Crear tabla de alertas activas
CREATE TABLE IF NOT EXISTS alertas_inocuidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bovino_id UUID REFERENCES bovinos(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  tipo_alerta_id UUID REFERENCES tipos_alertas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  nivel_riesgo TEXT NOT NULL CHECK (nivel_riesgo IN ('Bajo', 'Medio', 'Alto', 'Crítico')),
  fecha_deteccion TIMESTAMPTZ DEFAULT NOW(),
  fecha_vencimiento DATE,
  es_activa BOOLEAN DEFAULT TRUE,
  fecha_resolucion TIMESTAMPTZ,
  observaciones_resolucion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para alertas
CREATE INDEX IF NOT EXISTS idx_alertas_bovino_id ON alertas_inocuidad(bovino_id);
CREATE INDEX IF NOT EXISTS idx_alertas_evento_id ON alertas_inocuidad(evento_id);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo_alerta_id ON alertas_inocuidad(tipo_alerta_id);
CREATE INDEX IF NOT EXISTS idx_alertas_nivel_riesgo ON alertas_inocuidad(nivel_riesgo);
CREATE INDEX IF NOT EXISTS idx_alertas_es_activa ON alertas_inocuidad(es_activa);
CREATE INDEX IF NOT EXISTS idx_alertas_fecha_vencimiento ON alertas_inocuidad(fecha_vencimiento);

-- Comentarios para documentación
COMMENT ON TABLE tipos_alertas IS 'Tipos de alertas de inocuidad predefinidos';
COMMENT ON TABLE alertas_inocuidad IS 'Alertas activas de inocuidad por bovino';

-- Función para generar alertas automáticamente
CREATE OR REPLACE FUNCTION generar_alertas_inocuidad()
RETURNS VOID AS $$
BEGIN
  -- Limpiar alertas resueltas o vencidas
  UPDATE alertas_inocuidad 
  SET es_activa = FALSE, fecha_resolucion = NOW()
  WHERE es_activa = TRUE 
    AND (fecha_vencimiento < CURRENT_DATE OR fecha_deteccion < CURRENT_DATE - INTERVAL '90 days');
  
  -- Generar alertas de vacunaciones vencidas
  INSERT INTO alertas_inocuidad (bovino_id, evento_id, tipo_alerta_id, titulo, descripcion, nivel_riesgo, fecha_vencimiento)
  SELECT 
    e.bovino_id,
    e.id,
    ta.id,
    'Vacunación Vencida: ' || e.descripcion,
    'La vacunación registrada el ' || e.fecha || ' ha vencido y requiere renovación inmediata.',
    ta.nivel_riesgo,
    e.fecha_vencimiento
  FROM eventos e
  JOIN tipos_alertas ta ON ta.codigo = 'VAC_VENCIDA'
  WHERE e.tipo = 'Vacunación'
    AND e.fecha_vencimiento < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM alertas_inocuidad a 
      WHERE a.evento_id = e.id 
        AND a.tipo_alerta_id = ta.id 
        AND a.es_activa = TRUE
    );
  
  -- Generar alertas de vacunaciones por vencer
  INSERT INTO alertas_inocuidad (bovino_id, evento_id, tipo_alerta_id, titulo, descripcion, nivel_riesgo, fecha_vencimiento)
  SELECT 
    e.bovino_id,
    e.id,
    ta.id,
    'Vacunación por Vencer: ' || e.descripcion,
    'La vacunación registrada el ' || e.fecha || ' vence el ' || e.fecha_vencimiento || '. Programar renovación.',
    ta.nivel_riesgo,
    e.fecha_vencimiento
  FROM eventos e
  JOIN tipos_alertas ta ON ta.codigo = 'VAC_POR_VENCER'
  WHERE e.tipo = 'Vacunación'
    AND e.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM alertas_inocuidad a 
      WHERE a.evento_id = e.id 
        AND a.tipo_alerta_id = ta.id 
        AND a.es_activa = TRUE
    );
  
  -- Generar alertas de eventos críticos
  INSERT INTO alertas_inocuidad (bovino_id, evento_id, tipo_alerta_id, titulo, descripcion, nivel_riesgo)
  SELECT 
    e.bovino_id,
    e.id,
    ta.id,
    'Evento Crítico: ' || e.descripcion,
    'Evento crítico detectado que requiere atención inmediata para la inocuidad.',
    ta.nivel_riesgo
  FROM eventos e
  JOIN tipos_alertas ta ON ta.codigo = 'ENFERMEDAD_DETECTADA'
  WHERE e.es_critico = TRUE
    AND e.fecha >= CURRENT_DATE - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM alertas_inocuidad a 
      WHERE a.evento_id = e.id 
        AND a.tipo_alerta_id = ta.id 
        AND a.es_activa = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para generar alertas automáticamente
CREATE OR REPLACE FUNCTION trigger_generar_alertas()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generar_alertas_inocuidad();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a eventos
DROP TRIGGER IF EXISTS trigger_alertas_eventos ON eventos;
CREATE TRIGGER trigger_alertas_eventos
  AFTER INSERT OR UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generar_alertas();

-- Ejecutar función inicial para generar alertas existentes
SELECT generar_alertas_inocuidad();
