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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          language: string
          message: string
          name: string
          organization: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          language: string
          message: string
          name: string
          organization?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: string
          message?: string
          name?: string
          organization?: string
        }
        Relationships: []
      }
      faq_content: {
        Row: {
          items: Json
          language: string
          updated_at: string
        }
        Insert: {
          items?: Json
          language: string
          updated_at?: string
        }
        Update: {
          items?: Json
          language?: string
          updated_at?: string
        }
        Relationships: []
      }
      host_notes: {
        Row: {
          block_id: string
          contact: string
          created_at: string
          forwarded_at: string | null
          id: string
          language: string
          message: string
          name: string
          review_started_at: string | null
          review_status: string
          reviewed_host_id: string | null
        }
        Insert: {
          block_id: string
          contact: string
          created_at?: string
          forwarded_at?: string | null
          id?: string
          language?: string
          message: string
          name: string
          review_started_at?: string | null
          review_status?: string
          reviewed_host_id?: string | null
        }
        Update: {
          block_id?: string
          contact?: string
          created_at?: string
          forwarded_at?: string | null
          id?: string
          language?: string
          message?: string
          name?: string
          review_started_at?: string | null
          review_status?: string
          reviewed_host_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "host_notes_reviewed_host_id_fkey"
            columns: ["reviewed_host_id"]
            isOneToOne: false
            referencedRelation: "host_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      host_offers: {
        Row: {
          block_id: string | null
          can_give: boolean
          cohosts: Json
          contact: string
          created_at: string
          id: string
          language: string
          location_resolved_at: string | null
          merge_history: Json
          merged_at: string | null
          merged_into: string | null
          name: string
          sheltered: boolean
          stretch_text: string
          wants_microgrant: boolean
        }
        Insert: {
          block_id?: string | null
          can_give?: boolean
          cohosts?: Json
          contact: string
          created_at?: string
          id?: string
          language?: string
          location_resolved_at?: string | null
          merge_history?: Json
          merged_at?: string | null
          merged_into?: string | null
          name: string
          sheltered?: boolean
          stretch_text: string
          wants_microgrant?: boolean
        }
        Update: {
          block_id?: string | null
          can_give?: boolean
          cohosts?: Json
          contact?: string
          created_at?: string
          id?: string
          language?: string
          location_resolved_at?: string | null
          merge_history?: Json
          merged_at?: string | null
          merged_into?: string | null
          name?: string
          sheltered?: boolean
          stretch_text?: string
          wants_microgrant?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "host_offers_merged_into_fkey"
            columns: ["merged_into"]
            isOneToOne: false
            referencedRelation: "host_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_hosts: { Args: never; Returns: number }
      get_claimed_blocks: {
        Args: never
        Returns: {
          block_id: string
          first_names: string[]
        }[]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
