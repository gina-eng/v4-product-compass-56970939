export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      products: {
        Row: {
          bonus_kpi: string | null
          bpmn: boolean
          bpmn_url: string | null
          categoria: Database["public"]["Enums"]["categoria_produto"]
          certificacao: boolean
          certificacao_url: string | null
          como_entrega_valor: string | null
          como_vendo: string
          created_at: string
          description: string
          dono: string
          duracao: string
          entregaveis_relacionados: string | null
          garantia_especifica: string | null
          icp: boolean
          icp_url: string | null
          id: string
          kpi_principal: Database["public"]["Enums"]["kpi_tipo"] | null
          o_que_e_produto: string
          o_que_entrego: string
          para_quem_serve: string | null
          pitch: boolean
          pitch_url: string | null
          playbook: boolean
          playbook_url: string | null
          pricing: boolean
          pricing_url: string | null
          produto: string
          spiced_data: Json
          stack_digital: string | null
          status: Database["public"]["Enums"]["status_produto"]
          tempo_meta_kpi: Database["public"]["Enums"]["tempo_meta"] | null
          updated_at: string
          valor: string
        }
        Insert: {
          bonus_kpi?: string | null
          bpmn?: boolean
          bpmn_url?: string | null
          categoria: Database["public"]["Enums"]["categoria_produto"]
          certificacao?: boolean
          certificacao_url?: string | null
          como_entrega_valor?: string | null
          como_vendo: string
          created_at?: string
          description: string
          dono: string
          duracao: string
          entregaveis_relacionados?: string | null
          garantia_especifica?: string | null
          icp?: boolean
          icp_url?: string | null
          id?: string
          kpi_principal?: Database["public"]["Enums"]["kpi_tipo"] | null
          o_que_e_produto: string
          o_que_entrego: string
          para_quem_serve?: string | null
          pitch?: boolean
          pitch_url?: string | null
          playbook?: boolean
          playbook_url?: string | null
          pricing?: boolean
          pricing_url?: string | null
          produto: string
          spiced_data?: Json
          stack_digital?: string | null
          status?: Database["public"]["Enums"]["status_produto"]
          tempo_meta_kpi?: Database["public"]["Enums"]["tempo_meta"] | null
          updated_at?: string
          valor: string
        }
        Update: {
          bonus_kpi?: string | null
          bpmn?: boolean
          bpmn_url?: string | null
          categoria?: Database["public"]["Enums"]["categoria_produto"]
          certificacao?: boolean
          certificacao_url?: string | null
          como_entrega_valor?: string | null
          como_vendo?: string
          created_at?: string
          description?: string
          dono?: string
          duracao?: string
          entregaveis_relacionados?: string | null
          garantia_especifica?: string | null
          icp?: boolean
          icp_url?: string | null
          id?: string
          kpi_principal?: Database["public"]["Enums"]["kpi_tipo"] | null
          o_que_e_produto?: string
          o_que_entrego?: string
          para_quem_serve?: string | null
          pitch?: boolean
          pitch_url?: string | null
          playbook?: boolean
          playbook_url?: string | null
          pricing?: boolean
          pricing_url?: string | null
          produto?: string
          spiced_data?: Json
          stack_digital?: string | null
          status?: Database["public"]["Enums"]["status_produto"]
          tempo_meta_kpi?: Database["public"]["Enums"]["tempo_meta"] | null
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_produto: "saber" | "ter" | "executar" | "potencializar"
      kpi_tipo: "CPL" | "CTR" | "CONVERSÃO" | "ENGAJAMENTO" | "TAXA DE ABERTURA"
      status_produto: "Disponível" | "Em produção" | "Em homologação"
      tempo_meta: "3 meses" | "6 meses" | "12 meses"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_produto: ["saber", "ter", "executar", "potencializar"],
      kpi_tipo: ["CPL", "CTR", "CONVERSÃO", "ENGAJAMENTO", "TAXA DE ABERTURA"],
      status_produto: ["Disponível", "Em produção", "Em homologação"],
      tempo_meta: ["3 meses", "6 meses", "12 meses"],
    },
  },
} as const
