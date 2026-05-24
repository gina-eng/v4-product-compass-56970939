-- Remove cases em rascunho. O wizard não persiste mais cases incompletos:
-- só grava quando todas as etapas são validadas e o usuário finaliza.
delete from public.cases where status = 'rascunho';
