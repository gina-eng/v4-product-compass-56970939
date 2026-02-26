import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type SiteSettingRow = {
  setting_key: string;
  setting_value: string;
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    step_title: "Introdução ao modelo - STEP",
    step_description: `Toda empresa, independente do tamanho, passa por quatro momentos distintos em sua jornada de crescimento. Cada momento exige uma abordagem específica e uma solução certa. O objetivo é vender e servir o cliente certo, no momento certo, com a solução certa.

O framework STEP identifica onde o cliente está e qual solução ele realmente precisa, categorizando nossos produtos em quatro etapas fundamentais para o sucesso empresarial.`,
    saber_subtitle: "Não sei o que não sei",
    saber_description: "Identificar necessidades e oportunidades ainda desconhecidas",
    ter_subtitle: "Sei o que preciso, mas não tenho", 
    ter_description: "Adquirir recursos e ferramentas necessárias",
    executar_subtitle: "Tenho tudo, mas preciso fazer funcionar",
    executar_description: "Implementar e operacionalizar soluções",
    potencializar_subtitle: "Domino tudo, quero resultados extraordinários",
    potencializar_description: "Otimizar e escalar para máxima performance",
    stack_digital_request_form_url: "https://forms.gle/solicitacao-contratacao-stack-digital"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTableAvailable, setIsTableAvailable] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value');

      if (settingsError) {
        console.log('Erro ao buscar configurações:', settingsError);
        setIsTableAvailable(false);
        return;
      }

      setIsTableAvailable(true);
      
      if (settingsData && settingsData.length > 0) {
        const settingsObj: Record<string, string> = {};
        (settingsData as SiteSettingRow[]).forEach((item) => {
          settingsObj[item.setting_key] = item.setting_value;
        });
        
        // Manter valores padrão para chaves que não existem
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
      
    } catch (error) {
      console.log('Erro ao buscar configurações:', error);
      setIsTableAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    // Sempre atualizar o estado local primeiro
    setSettings(prev => ({ ...prev, [key]: value }));

    if (!isTableAvailable) {
      console.log('Tabela site_settings não disponível - apenas atualizando localmente');
      return false;
    }

    try {
      console.log('Tentando salvar no banco:', { key, value });
      
      // Primeiro, verificar se o registro já existe
      const { data: existingData, error: selectError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', key)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Erro ao verificar registro existente:', selectError);
        throw selectError;
      }

      let result;
      if (existingData) {
        // Registro existe, fazer UPDATE
        console.log('Registro existe, fazendo UPDATE');
        result = await supabase
          .from('site_settings')
          .update({ 
            setting_value: value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key);
      } else {
        // Registro não existe, fazer INSERT
        console.log('Registro não existe, fazendo INSERT');
        result = await supabase
          .from('site_settings')
          .insert({ 
            setting_key: key, 
            setting_value: value,
            description: getDescriptionForKey(key)
          });
      }

      if (result.error) {
        console.error('Erro na operação:', result.error);
        throw result.error;
      }
      
      console.log('Salvamento realizado com sucesso:', result);
      
      // Forçar atualização dos dados após salvar
      await fetchSettings();
      
      return true;
      
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return false;
    }
  };

  const getDescriptionForKey = (key: string) => {
    const descriptions: Record<string, string> = {
      step_title: 'Título da seção STEP',
      step_description: 'Descrição da seção STEP',
      saber_subtitle: 'Subtítulo da categoria Saber',
      saber_description: 'Descrição da categoria Saber',
      ter_subtitle: 'Subtítulo da categoria Ter',
      ter_description: 'Descrição da categoria Ter',
      executar_subtitle: 'Subtítulo da categoria Executar',
      executar_description: 'Descrição da categoria Executar',
      potencializar_subtitle: 'Subtítulo da categoria Potencializar',
      potencializar_description: 'Descrição da categoria Potencializar',
      stack_digital_request_form_url: 'Link geral do botão Solicitar Contratação da Stack Digital'
    };
    return descriptions[key] || '';
  };

  useEffect(() => {
    fetchSettings();

    // Tentar configurar listener para mudanças em tempo real
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isTableAvailable) {
      channel = supabase
        .channel('site-settings-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_settings'
          },
          () => {
            fetchSettings();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isTableAvailable]);

  return {
    settings,
    isLoading,
    isTableAvailable,
    updateSetting,
    refreshSettings: fetchSettings
  };
};
