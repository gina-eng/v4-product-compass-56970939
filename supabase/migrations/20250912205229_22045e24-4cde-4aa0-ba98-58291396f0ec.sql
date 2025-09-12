-- Adicionar usuários recentes ao org_members 
INSERT INTO public.org_members (user_id, role) 
VALUES 
  ('f01ba16d-5124-43f6-b146-6821e3c134d1', 'user'),  -- gabriella.buzatto@v4company.com
  ('343555dd-9a6b-4655-8601-a4f761454194', 'user'),  -- vinicius.belgine@v4company.com
  ('15450e2e-40c1-4ed0-9329-3d53509c0454', 'user'),  -- william.barbosa@v4company.com
  ('c2b683f9-d13d-4705-bdf2-e10bb1e95fa5', 'user'),  -- victoria.weil@v4company.com
  ('33b13c52-c8f0-47ed-852b-dfb026437b19', 'user'),  -- roger.tobace@v4company.com
  ('8570977e-a892-43b6-904c-dfed03af025a', 'user'),  -- leonardo.rosa@v4company.com
  ('b747618e-20b2-4583-849d-f71eee48c0e5', 'user'),  -- amanda.kloss@v4company.com
  ('9acc8cce-9438-46f6-af6d-726359974613', 'user'),  -- felipe.pinheiro@v4company.com
  ('ec4c0517-dbe3-4b64-8476-16372c4b6bb3', 'user'),  -- rai.miyasada@v4company.com
  ('31573b1f-e117-4596-914d-b7cefbea6450', 'user')   -- juliocesar.marinho@v4company.com
ON CONFLICT (user_id, role) DO NOTHING;