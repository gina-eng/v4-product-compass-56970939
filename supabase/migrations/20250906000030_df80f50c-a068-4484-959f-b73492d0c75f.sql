-- Atualizar todos os CPHs existentes para usar a fórmula investimento_total / 160
UPDATE positions 
SET cph = investimento_total / 160.0
WHERE investimento_total IS NOT NULL;

-- Criar uma função para calcular CPH automaticamente
CREATE OR REPLACE FUNCTION calculate_cph()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular CPH baseado em 160 horas
  NEW.cph = NEW.investimento_total / 160.0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular CPH automaticamente em INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_calculate_cph ON positions;
CREATE TRIGGER trigger_calculate_cph
  BEFORE INSERT OR UPDATE OF investimento_total ON positions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cph();