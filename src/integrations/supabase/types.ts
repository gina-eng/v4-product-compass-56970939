export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      org_members: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          cph: number
          created_at: string
          id: string
          investimento_total: number
          nome: string
          updated_at: string
        }
        Insert: {
          cph: number
          created_at?: string
          id?: string
          investimento_total: number
          nome: string
          updated_at?: string
        }
        Update: {
          cph?: number
          created_at?: string
          id?: string
          investimento_total?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_positions: {
        Row: {
          created_at: string
          horas_alocadas: number
          id: string
          position_id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          horas_alocadas?: number
          id?: string
          position_id: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          horas_alocadas?: number
          id?: string
          position_id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_positions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_positions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bpmn: boolean
          categoria: Database["public"]["Enums"]["categoria_produto"]
          certificacao: boolean
          certificacao_destaque_link: string | null
          certificacao_destaque_texto: string | null
          como_entrega_valor: string | null
          como_entrego_dados: Json | null
          como_vendo: string
          created_at: string
          descricao_card: string | null
          descricao_completa: string | null
          description: string
          dono: string
          duracao: string
          duracao_media: string | null
          entregaveis_relacionados: string | null
          escopo: string | null
          formato_entrega: string | null
          forum_sobre_produto: string | null
          icp: boolean
          id: string
          markup: number | null
          markup_overhead: number | null
          o_que_entrego: string
          outros: number | null
          para_quem_serve: string | null
          pitch: boolean
          playbook: boolean
          pricing: boolean
          produto: string
          spiced_data: Json
          spiced_data_2: Json | null
          status: Database["public"]["Enums"]["status_produto"]
          time_envolvido: string | null
          updated_at: string
          usa_dedicacao: boolean
          use_case_map_1_data: Json | null
          use_case_map_1_name: string | null
          use_case_map_2_data: Json | null
          use_case_map_2_name: string | null
          valor: string
        }
        Insert: {
          bpmn?: boolean
          categoria: Database["public"]["Enums"]["categoria_produto"]
          certificacao?: boolean
          certificacao_destaque_link?: string | null
          certificacao_destaque_texto?: string | null
          como_entrega_valor?: string | null
          como_entrego_dados?: Json | null
          como_vendo: string
          created_at?: string
          descricao_card?: string | null
          descricao_completa?: string | null
          description: string
          dono: string
          duracao: string
          duracao_media?: string | null
          entregaveis_relacionados?: string | null
          escopo?: string | null
          formato_entrega?: string | null
          forum_sobre_produto?: string | null
          icp?: boolean
          id?: string
          markup?: number | null
          markup_overhead?: number | null
          o_que_entrego: string
          outros?: number | null
          para_quem_serve?: string | null
          pitch?: boolean
          playbook?: boolean
          pricing?: boolean
          produto: string
          spiced_data?: Json
          spiced_data_2?: Json | null
          status?: Database["public"]["Enums"]["status_produto"]
          time_envolvido?: string | null
          updated_at?: string
          usa_dedicacao?: boolean
          use_case_map_1_data?: Json | null
          use_case_map_1_name?: string | null
          use_case_map_2_data?: Json | null
          use_case_map_2_name?: string | null
          valor: string
        }
        Update: {
          bpmn?: boolean
          categoria?: Database["public"]["Enums"]["categoria_produto"]
          certificacao?: boolean
          certificacao_destaque_link?: string | null
          certificacao_destaque_texto?: string | null
          como_entrega_valor?: string | null
          como_entrego_dados?: Json | null
          como_vendo?: string
          created_at?: string
          descricao_card?: string | null
          descricao_completa?: string | null
          description?: string
          dono?: string
          duracao?: string
          duracao_media?: string | null
          entregaveis_relacionados?: string | null
          escopo?: string | null
          formato_entrega?: string | null
          forum_sobre_produto?: string | null
          icp?: boolean
          id?: string
          markup?: number | null
          markup_overhead?: number | null
          o_que_entrego?: string
          outros?: number | null
          para_quem_serve?: string | null
          pitch?: boolean
          playbook?: boolean
          pricing?: boolean
          produto?: string
          spiced_data?: Json
          spiced_data_2?: Json | null
          status?: Database["public"]["Enums"]["status_produto"]
          time_envolvido?: string | null
          updated_at?: string
          usa_dedicacao?: boolean
          use_case_map_1_data?: Json | null
          use_case_map_1_name?: string | null
          use_case_map_2_data?: Json | null
          use_case_map_2_name?: string | null
          valor?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
      systems: {
        Row: {
          created_at: string
          id: string
          link_redirecionamento: string
          nome_sistema: string
          updated_at: string
          valor_entregue: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_redirecionamento: string
          nome_sistema: string
          updated_at?: string
          valor_entregue: string
        }
        Update: {
          created_at?: string
          id?: string
          link_redirecionamento?: string
          nome_sistema?: string
          updated_at?: string
          valor_entregue?: string
        }
        Relationships: []
      }
      support_materials: {
        Row: {
          created_at: string
          id: string
          nome_arquivo: string
          output_cliente: string | null
          trava: string | null
          updated_at: string
          url_direcionamento: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_arquivo: string
          output_cliente?: string | null
          trava?: string | null
          updated_at?: string
          url_direcionamento: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_arquivo?: string
          output_cliente?: string | null
          trava?: string | null
          updated_at?: string
          url_direcionamento?: string
        }
        Relationships: []
      }
      training_materials: {
        Row: {
          created_at: string
          description: string | null
          formato: string | null
          id: string
          name: string
          product_id: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          formato?: string | null
          id?: string
          name: string
          product_id: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          formato?: string | null
          id?: string
          name?: string
          product_id?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles_view: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_internal_user: { Args: never; Returns: boolean }
    }
    Enums: {
      categoria_produto:
        | "saber"
        | "ter"
        | "executar"
        | "potencializar"
        | "destrava_receita"
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
      categoria_produto: [
        "saber",
        "ter",
        "executar",
        "potencializar",
        "destrava_receita",
      ],
      kpi_tipo: ["CPL", "CTR", "CONVERSÃO", "ENGAJAMENTO", "TAXA DE ABERTURA"],
      status_produto: ["Disponível", "Em produção", "Em homologação"],
      tempo_meta: ["3 meses", "6 meses", "12 meses"],
    },
  },
} as const
