import type { Consultant } from "./types";

export const MOCK_CONSULTANTS: Consultant[] = [
  {
    id: "vinicius-scarabello",
    name: "Vinicius Scarabello",
    headline: "Especialista em Qualidade, Processos e Marketing de Crescimento",
    city: "Jundiaí",
    state: "SP",
    phone: "(11) 97222-1762",
    email: "vinicius.scarabello@v4company.com",
    linkedinUrl: "https://linkedin.com/in/vinicius-scarabello",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=faces",

    unit: "V4 Jundiaí",

    primarySector: "Indústria e Manufatura",
    secondarySector: "Varejo e Atacado",

    professionalProfile:
      "Com 5 anos de experiência no setor industrial automotivo (Grammer), atuei na área de qualidade de fornecedores com foco em resolução estruturada de problemas, análise de falhas e melhoria contínua. Hoje aplico essa mesma lógica rigorosa à gestão de marketing e crescimento, conectando estratégia, execução e controle com foco em previsibilidade.\n\nMinha trajetória em multinacional com operação global me proporcionou vivência em ambientes altamente estruturados e em cenários de baixa padronização — construindo a capacidade de organizar operações e gerar resultados consistentes em qualquer contexto.",

    painsTackled:
      "* Falta de padronização e processos claros\n* Baixa utilização de dados na tomada de decisão\n* Problemas recorrentes sem tratamento de causa raiz\n* Desalinhamento entre áreas e baixa integração operacional\n* Dificuldade em gerar previsibilidade e controle",

    valueAreas:
      "* Análise de não conformidades e identificação de causa raiz\n* Implementação de planos de ação estruturados (8D / MASP)\n* Padronização de processos e melhoria contínua\n* Aumento de previsibilidade e controle na cadeia de fornecimento",

    highlightProjects:
      "E-commerce de Vestuário · Turnaround Completo de Operação\n\nProblema: Faturamento do e-commerce travado, sem crescimento por período prolongado.\n\nSolução entregue: Redesenho estratégico completo — comunicação, jornada do consumidor, oferta, arquitetura de dados e campanhas. Verdadeiro turnaround de toda a operação, construindo escala em poucos meses.\n\nResultado: ROAS 6 mantido · Faturamento escalado em 11x · Duração: 9 meses",

    competencies:
      "Estratégia Corporativa\nPlanejamento Financeiro\nGestão de Pessoas\nComercial e Vendas\nMarketing e Marca\nCustomer Experience\nSupply Chain\nGestão da Qualidade\nTransformação Digital\nDados e Analytics\nGestão de Projetos / PMO\nGovernança Corporativa\nM&A e Reestruturação\nDesenvolvimento de Liderança\nModelo Operacional",

    education:
      "* Engenheiro de Produção — UNIP\n* MBA em Gestão, Liderança e Inovação — FGV\n* Green Belt — SENAI\n* MASP — IQA\n* GBP — BTC",

    languages: "Português — Nativo\nInglês — Intermediário\nEspanhol — Básico",
  },
  {
    id: "ana-ribeiro",
    name: "Ana Ribeiro",
    headline: "FP&A e Tesouraria para Indústrias de Médio Porte",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 98765-4321",
    email: "ana.ribeiro@exemplo.com",
    linkedinUrl: "https://linkedin.com/in/ana-ribeiro",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=faces",

    unit: "V4 São Paulo Faria Lima",

    primarySector: "Indústria e Manufatura",
    secondarySector: "Construção e Imóveis",

    professionalProfile:
      "Com 18 anos liderando finanças em indústrias metalmecânicas e de bens de capital, atuei como CFO por 9 anos antes de migrar para conselhos. Conduzi captações em bancos de fomento, programas de eficiência de capital de giro e estruturação de FP&A em empresas familiares em transição de governança.\n\nCombino visão executiva com leitura de governança — entrego ao cliente análise financeira e leitura de board no mesmo report, com domínio profundo de SAP S/4HANA e modelagem em Power BI.",

    painsTackled:
      "* Capital de giro inflado e baixa eficiência financeira\n* Falta de previsibilidade no fluxo de caixa\n* Custo de capital elevado e dependência bancária\n* Governança financeira frágil em empresa familiar\n* Fechamento contábil tardio e relatórios pouco acionáveis",

    valueAreas:
      "* Estruturação de FP&A do zero ou em rebuild\n* Captação BNDES, Finame e bancos de fomento\n* Política de hedge cambial e gestão de risco\n* Implementação de orçamento base zero\n* Renegociação de dívida e covenants",

    highlightProjects:
      "Indústria de Autopeças · Reestruturação Financeira Completa\n\nProblema: Empresa familiar de R$ 320M de faturamento com EBITDA pressionado, capital de giro de 80 dias e relação dívida/EBITDA acima do covenant bancário.\n\nSolução entregue: Implementação de FP&A com fechamento em D+5, política de capital de giro orientada por DSO/DPO/DIO, renegociação completa de dívida com pool de bancos e captação Finame de R$ 65M a custo subsidiado.\n\nResultado: EBITDA +6 p.p. em 18 meses · Capital de giro reduzido em 30 dias · CMPC -22% em 2 anos",

    competencies:
      "Planejamento Financeiro\nGovernança Corporativa\nM&A e Reestruturação\nEstratégia Corporativa\nModelo Operacional\nGestão de Projetos / PMO\nDados e Analytics\nTransformação Digital",

    education:
      "* Ciências Contábeis — USP\n* MBA Executivo em Finanças — Insper\n* Programa de Conselheiros — IBGC\n* CFA Nível II",

    languages: "Português — Nativo\nInglês — Fluente\nEspanhol — Intermediário",
  },
  {
    id: "carlos-mendes",
    name: "Carlos Mendes",
    headline: "Supply Chain e Produção em Alimentos e Bebidas",
    city: "Belo Horizonte",
    state: "MG",
    phone: "(31) 99876-5432",
    email: "carlos.mendes@exemplo.com",
    linkedinUrl: "https://linkedin.com/in/carlos-mendes",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=faces",

    unit: "V4 Belo Horizonte Savassi",

    primarySector: "Alimentação e Bebidas",
    secondarySector: "Indústria e Manufatura",

    professionalProfile:
      "22 anos em operações industriais — 14 em uma das três maiores cervejarias do país e 8 em laticínios cooperativos. Pé na fábrica, leitura de chão de planta e domínio de S&OP, gestão de fornecedores estratégicos e projetos greenfield.\n\nAtuo como Black Belt Six Sigma com vivência prática em TPM, lean manufacturing e SAP APO/IBP. Diferencial: passo pelo menos 30% do tempo do projeto em planta, conversando com líderes de turno e operadores.",

    painsTackled:
      "* OEE estagnado abaixo do potencial de classe mundial\n* Custo logístico fora de benchmark setorial\n* Ruptura recorrente em SKUs estratégicos\n* Estoque inflado sem giro saudável\n* Falta de S&OP integrado entre comercial, planejamento e produção",

    valueAreas:
      "* Implementação de S&OP integrado\n* Programas de eficiência energética e redução de custo\n* Lean manufacturing e TPM aplicados ao chão de planta\n* Redesenho de malha logística\n* Greenfield e expansão de capacidade",

    highlightProjects:
      "Laticínio Cooperativo · S&OP Integrado em 3 Plantas\n\nProblema: Ruptura crônica em itens premium e estoque médio 35% acima do necessário, com forecast desconectado da realidade fabril.\n\nSolução entregue: Implantação de S&OP mensal integrando comercial, demanda, suprimentos e produção. Reuniões executivas estruturadas, KPIs em cascata e redesenho do processo de previsão.\n\nResultado: Ruptura -35% · Estoque médio -12% · OEE 62% → 78% em 3 plantas",

    competencies:
      "Supply Chain\nGestão da Qualidade\nModelo Operacional\nTransformação Digital\nDados e Analytics\nGestão de Projetos / PMO\nDesenvolvimento de Liderança",

    education:
      "* Engenharia de Produção — UFMG\n* Mestrado em Engenharia Industrial — PUC-Rio\n* Black Belt Six Sigma\n* APICS CPIM",

    languages: "Português — Nativo\nInglês — Avançado",
  },
  {
    id: "patricia-souza",
    name: "Patrícia Souza",
    headline: "M&A e Finanças Corporativas para Tech e SaaS",
    city: "Rio de Janeiro",
    state: "RJ",
    phone: "(21) 97654-3210",
    email: "patricia.souza@exemplo.com",
    linkedinUrl: "https://linkedin.com/in/patricia-souza",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=faces",

    unit: "V4 Rio de Janeiro Botafogo",

    primarySector: "Tecnologia / Inovação",
    secondarySector: "Serviços Financeiros",

    professionalProfile:
      "15 anos em finanças corporativas — 7 em banco de investimento (sell-side advisory) e 8 como CFO de SaaS, liderando 11 transações fechadas (~R$ 2,1B em valor agregado) e o IPO de SaaS B2B na B3 em 2021.\n\nCombino perspectiva de banker com vivência de operadora — sabe o que o investidor olha e o que efetivamente é executável dentro de uma startup. Atende empresas Series A a IPO com ARR de R$ 20M a R$ 500M.",

    painsTackled:
      "* Modelo financeiro sem sustentar valuation desejado\n* Unit economics fracos ou mal mensurados\n* Falta de governança para captação Series B+ ou IPO\n* Cap table confuso com SAFEs/notas conversíveis\n* Time financeiro despreparado para sell-side",

    valueAreas:
      "* Sell-side e buy-side advisory\n* Modelagem de unit economics e métricas SaaS\n* Estruturação financeira pré-IPO\n* Term sheet negotiation\n* Due diligence financeira",

    highlightProjects:
      "SaaS RH · M&A Sell-side com Estratégico Americano\n\nProblema: Empresa com R$ 95M de ARR em rota de crescimento, mas sem framing financeiro pronto para receber ofertas de qualidade — fundadores temiam aceitar múltiplo abaixo do mercado.\n\nSolução entregue: Mandato sell-side completo — rebuild do modelo, projeções stress-tested, arquitetura de data room, prep de management presentation e condução de processo competitivo com 6 estratégicos.\n\nResultado: Múltiplo de 8x ARR · Closing em 9 meses · Earn-out estruturado",

    competencies:
      "Planejamento Financeiro\nM&A e Reestruturação\nGovernança Corporativa\nEstratégia Corporativa\nDados e Analytics",

    education:
      "* Engenharia de Produção — PUC-Rio\n* MBA em Finanças — Wharton\n* CFA Charterholder\n* Curso Executivo de Venture Capital — Stanford GSB",

    languages: "Português — Nativo\nInglês — Fluente",
  },
  {
    id: "rafael-tavares",
    name: "Rafael Tavares",
    headline: "Estruturação Comercial e Vendas B2B",
    city: "Curitiba",
    state: "PR",
    phone: "(41) 99012-3456",
    email: "rafael.tavares@exemplo.com",
    linkedinUrl: "https://linkedin.com/in/rafael-tavares",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop&crop=faces",

    unit: "V4 Curitiba Batel",

    primarySector: "Varejo e Atacado",
    secondarySector: "Indústria e Manufatura",

    professionalProfile:
      "20 anos em comercial — distribuidoras de bens de consumo e cadeias de varejo regional. Atendi redes com 30 a 400 lojas e distribuidoras de cobertura nacional, redesenhando estruturas comerciais, política de preços, programas de incentivo e KAM.\n\nConstruo as ferramentas (playbooks, dashboards de pipeline, modelos de comissionamento) junto com o time, não entrego documentos prontos para implementar depois.",

    painsTackled:
      "* Estrutura comercial sem cobertura adequada de carteira\n* Comissionamento desalinhado com estratégia\n* Rampup de novos vendedores excessivamente longo\n* Churn alto em carteiras consolidadas\n* Falta de previsibilidade em pipeline e forecast",

    valueAreas:
      "* Redesenho de estrutura comercial e cobertura\n* Modelagem de comissionamento e incentivos\n* Sales playbooks e enablement\n* Implantação de CRM (Salesforce, HubSpot)\n* Academia comercial e formação de vendedores",

    highlightProjects:
      "Distribuidora Regional · Reestruturação de GTM\n\nProblema: Receita estagnada com 80 vendedores cobrindo carteira de forma desigual, sem clareza de prioridades nem previsibilidade de fechamento.\n\nSolução entregue: Redesenho completo — segmentação ABC de carteira, novos territórios, comissionamento orientado a margem, playbook por estágio e implantação de pipeline review semanal.\n\nResultado: Receita +R$ 110M em 18 meses · Mesma headcount · Churn -40%",

    competencies:
      "Comercial e Vendas\nMarketing e Marca\nCustomer Experience\nGestão de Pessoas\nDesenvolvimento de Liderança\nDados e Analytics",

    education:
      "* Administração — UFPR\n* MBA em Gestão Comercial — FGV\n* Challenger Sale\n* MEDDIC",

    languages: "Português — Nativo\nInglês — Avançado\nEspanhol — Fluente",
  },
  {
    id: "marina-lopes",
    name: "Marina Lopes",
    headline: "ESG e Cultura Organizacional em Saúde",
    city: "Porto Alegre",
    state: "RS",
    phone: "(51) 98123-4567",
    email: "marina.lopes@exemplo.com",
    linkedinUrl: "https://linkedin.com/in/marina-lopes",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=faces",

    unit: "V4 Porto Alegre Moinhos",

    primarySector: "Saúde e Ciências da Vida",
    secondarySector: "Educação",

    professionalProfile:
      "16 anos em RH e ESG dentro de operadoras de saúde, hospitais e farmacêuticas. Atendo hospitais com 200+ leitos, operadoras com 50k+ vidas e farmacêuticas de médio porte.\n\nUno rigor técnico (frameworks ESG e people analytics) com sensibilidade cultural — entrego o relatório e o plano de mudança simultaneamente. Certificada GRI Standards e formada pelo INSEAD em ESG.",

    painsTackled:
      "* Score ESG inadequado para capital ESG-linked\n* Clima organizacional fragmentado por unidade\n* Sucessão de lideranças sem mapeamento estruturado\n* Falta de programa de DE&I com indicadores\n* Relatório de sustentabilidade descolado da operação",

    valueAreas:
      "* Implementação de relatórios GRI e SASB\n* Pesquisa de clima e plano de ação\n* Programas de sucessão e desenvolvimento\n* Programas de diversidade e inclusão\n* People analytics aplicado a retenção",

    highlightProjects:
      "Hospital Filantrópico · Primeiro Relatório GRI\n\nProblema: Hospital com forte trabalho social mas sem reporting estruturado para captação ESG-linked com fundos e doadores institucionais.\n\nSolução entregue: Mapeamento de stakeholders, materialidade, levantamento de KPIs ESG, redação completa do relatório GRI Standards e roadshow para fundos socioambientais.\n\nResultado: Score ESG C → B+ (MSCI) · R$ 12M captados em filantropia ESG-linked · eNPS +24 pts",

    competencies:
      "Gestão de Pessoas\nGovernança Corporativa\nEstratégia Corporativa\nDesenvolvimento de Liderança\nModelo Operacional\nCustomer Experience",

    education:
      "* Psicologia — UFRGS\n* Mestrado em Comportamento Organizacional — FGV\n* Certificação GRI Standards\n* Programa Executivo em ESG — INSEAD",

    languages: "Português — Nativo\nInglês — Fluente",
  },
  {
    id: "diego-fernandes",
    name: "Diego Fernandes",
    headline: "Internacionalização e Novos Negócios no Agro",
    city: "Fortaleza",
    state: "CE",
    phone: "(85) 99345-6789",
    email: "diego.fernandes@exemplo.com",
    linkedinUrl: "https://linkedin.com/in/diego-fernandes",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop&crop=faces",

    unit: "V4 Fortaleza Aldeota",

    primarySector: "Agronegócio",
    secondarySector: "Alimentação e Bebidas",

    professionalProfile:
      "19 anos em agronegócio — 10 em trading de grãos e 9 liderando expansão internacional de processadoras. Abri 3 mercados internacionais (China, EAU, Vietnã) para fruticultor do Nordeste e estruturei JV com grupo asiático em processamento de pescado.\n\nAtuo com pé na operação e na mesa de negociação internacional simultaneamente — falo mandarim de negócios e tenho rede de relacionamento direta com tradings asiáticas.",

    painsTackled:
      "* Dependência excessiva de mercado interno\n* Falta de canal direto com importadores estratégicos\n* Estrutura de SPE e licenciamento ambiental travados\n* Hedge de commodities mal calibrado\n* Acesso restrito a bancos de fomento internacionais",

    valueAreas:
      "* Estruturação de operações de exportação\n* Joint ventures e parcerias internacionais\n* Captação em IFC, BID e bancos multilaterais\n* Licenciamento ambiental para greenfield\n* Hedge de commodities (B3 e CME)",

    highlightProjects:
      "Fruticultor do Vale do São Francisco · Acesso ao Mercado Chinês\n\nProblema: Produtor com volume e qualidade para exportar mas barrado por protocolos fitossanitários travados há 3 anos no MAPA.\n\nSolução entregue: Articulação direta com MAPA e GACC, missão técnica à China, dossiê fitossanitário completo e estruturação do canal logístico em parceria com trading asiática.\n\nResultado: Protocolo aprovado em 22 meses · Receita exportação +R$ 40M no ano 1 · Canal recorrente",

    competencies:
      "Estratégia Corporativa\nComercial e Vendas\nSupply Chain\nGovernança Corporativa\nM&A e Reestruturação\nModelo Operacional",

    education:
      "* Agronomia — ESALQ/USP\n* MBA em Agronegócio — FGV\n* Mestrado em International Business — CEIBS",

    languages: "Português — Nativo\nInglês — Fluente\nMandarim — Fluente",
  },
];
