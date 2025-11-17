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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_analysis: {
        Row: {
          agent_type: string
          analysis: Json
          analyzed_at: string
          confidence: number | null
          created_at: string
          id: string
          reasoning: string | null
          recommendation: string | null
          ticker: string
          user_id: string
        }
        Insert: {
          agent_type: string
          analysis: Json
          analyzed_at?: string
          confidence?: number | null
          created_at?: string
          id?: string
          reasoning?: string | null
          recommendation?: string | null
          ticker: string
          user_id: string
        }
        Update: {
          agent_type?: string
          analysis?: Json
          analyzed_at?: string
          confidence?: number | null
          created_at?: string
          id?: string
          reasoning?: string | null
          recommendation?: string | null
          ticker?: string
          user_id?: string
        }
        Relationships: []
      }
      backtest_results: {
        Row: {
          created_at: string
          end_date: string
          final_value: number
          id: string
          initial_capital: number
          results_data: Json
          start_date: string
          ticker: string
          total_return: number
          total_trades: number
          user_id: string
          win_rate: number | null
        }
        Insert: {
          created_at?: string
          end_date: string
          final_value: number
          id?: string
          initial_capital: number
          results_data: Json
          start_date: string
          ticker: string
          total_return: number
          total_trades: number
          user_id: string
          win_rate?: number | null
        }
        Update: {
          created_at?: string
          end_date?: string
          final_value?: number
          id?: string
          initial_capital?: number
          results_data?: Json
          start_date?: string
          ticker?: string
          total_return?: number
          total_trades?: number
          user_id?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          average_price: number | null
          cash_balance: number
          created_at: string
          id: string
          last_updated: string
          quantity: number
          ticker: string
          total_value: number
          user_id: string
        }
        Insert: {
          average_price?: number | null
          cash_balance?: number
          created_at?: string
          id?: string
          last_updated?: string
          quantity?: number
          ticker: string
          total_value?: number
          user_id: string
        }
        Update: {
          average_price?: number | null
          cash_balance?: number
          created_at?: string
          id?: string
          last_updated?: string
          quantity?: number
          ticker?: string
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          action: string
          cash_after: number
          created_at: string
          id: string
          price: number
          quantity: number
          ticker: string
          total_value: number
          trade_date: string
          user_id: string
        }
        Insert: {
          action: string
          cash_after: number
          created_at?: string
          id?: string
          price: number
          quantity: number
          ticker: string
          total_value: number
          trade_date?: string
          user_id: string
        }
        Update: {
          action?: string
          cash_after?: number
          created_at?: string
          id?: string
          price?: number
          quantity?: number
          ticker?: string
          total_value?: number
          trade_date?: string
          user_id?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
