-- Renomear colunas para melhor clareza
ALTER TABLE public.products RENAME COLUMN detailed_description TO o_que_e_produto;
ALTER TABLE public.products RENAME COLUMN objetivos TO como_vendo;
ALTER TABLE public.products RENAME COLUMN entregas TO o_que_entrego;

-- Remover coluna prerequisitos que não é mais usada
ALTER TABLE public.products DROP COLUMN prerequisitos;