
UPDATE public.cases
SET status = 'completo'
WHERE status = 'rascunho'
  AND jsonb_array_length(primary_metrics) > 0
  AND (dashboard_url <> '' OR presentation_url <> '' OR testimonial_url <> '');

UPDATE public.cases
SET status = 'sem_evidencia'
WHERE status = 'rascunho'
  AND jsonb_array_length(primary_metrics) > 0
  AND dashboard_url = '' AND presentation_url = '' AND testimonial_url = '';
