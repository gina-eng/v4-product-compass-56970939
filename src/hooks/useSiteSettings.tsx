import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    step_title: "Introdução ao modelo - STEP",
    step_description: `Toda empresa, independente do tamanho, passa por quatro momentos distintos em sua jornada de crescimento. Cada momento exige uma abordagem específica e uma solução certa. O objetivo é vender e servir o cliente certo, no momento certo, com a solução certa.

O framework STEP identifica onde o cliente está e qual solução ele realmente precisa, categorizando nossos produtos em quatro etapas fundamentais para o sucesso empresarial.`
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
        settingsData.forEach((item: any) => {
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
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          setting_key: key, 
          setting_value: value,
          description: getDescriptionForKey(key)
        });

      if (error) throw error;
      return true;
      
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return false;
    }
  };

  const getDescriptionForKey = (key: string) => {
    const descriptions: Record<string, string> = {
      step_title: 'Título da seção STEP',
      step_description: 'Descrição da seção STEP'
    };
    return descriptions[key] || '';
  };

  useEffect(() => {
    fetchSettings();

    // Tentar configurar listener para mudanças em tempo real
    let channel: any = null;
    
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