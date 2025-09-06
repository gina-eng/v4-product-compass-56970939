-- Corrigir a função para ter search_path seguro
CREATE OR REPLACE FUNCTION calculate_cph()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular CPH baseado em 160 horas
  NEW.cph = NEW.investimento_total / 160.0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;