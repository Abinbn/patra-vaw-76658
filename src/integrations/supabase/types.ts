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
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          profile_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          profile_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          priority: string | null
          published_at: string | null
          send_to_all: boolean | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          published_at?: string | null
          send_to_all?: boolean | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          published_at?: string | null
          send_to_all?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      announcements_recipients: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_recipients_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      background_images: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string
          is_public: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_public?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_public?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      card_analytics: {
        Row: {
          card_id: string
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          card_id: string
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          card_id?: string
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_analytics_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "digital_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_templates: {
        Row: {
          company_id: string | null
          content_json: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          style_tokens: Json
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          style_tokens?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          style_tokens?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      companies: {
        Row: {
          brand_colors: Json | null
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          brand_colors?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          brand_colors?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_payments: {
        Row: {
          amount: number
          company_profile_id: string
          created_at: string
          currency: string
          due_date: string | null
          employee_count: number | null
          id: string
          paid_at: string | null
          payment_type: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_profile_id: string
          created_at?: string
          currency?: string
          due_date?: string | null
          employee_count?: number | null
          id?: string
          paid_at?: string | null
          payment_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_profile_id?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          employee_count?: number | null
          id?: string
          paid_at?: string | null
          payment_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_payments_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_cards: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content_json: Json
          created_at: string
          custom_og_description: string | null
          custom_og_title: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          og_auto_generate: boolean | null
          og_description: string | null
          og_description_generated_at: string | null
          owner_user_id: string
          qr_code_url: string | null
          template_id: string | null
          title: string
          updated_at: string
          vanity_url: string | null
          video_intro: string | null
          video_snippets: Json | null
          video_testimonials: Json | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content_json?: Json
          created_at?: string
          custom_og_description?: string | null
          custom_og_title?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          og_auto_generate?: boolean | null
          og_description?: string | null
          og_description_generated_at?: string | null
          owner_user_id: string
          qr_code_url?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
          vanity_url?: string | null
          video_intro?: string | null
          video_snippets?: Json | null
          video_testimonials?: Json | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content_json?: Json
          created_at?: string
          custom_og_description?: string | null
          custom_og_title?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          og_auto_generate?: boolean | null
          og_description?: string | null
          og_description_generated_at?: string | null
          owner_user_id?: string
          qr_code_url?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
          vanity_url?: string | null
          video_intro?: string | null
          video_snippets?: Json | null
          video_testimonials?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_cards_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "digital_cards_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      documentation_pages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          page_id: string
          parent_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          page_id: string
          parent_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          page_id?: string
          parent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_submissions: {
        Row: {
          admin_response: string | null
          content: string
          created_at: string | null
          device_info: Json | null
          id: string
          ip_address: unknown
          status: string | null
          subject: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at: string | null
          user_email: string
          user_id: string
          user_name: string
          user_phone: string | null
          user_signature: string | null
        }
        Insert: {
          admin_response?: string | null
          content: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          status?: string | null
          subject: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string | null
          user_email: string
          user_id: string
          user_name: string
          user_phone?: string | null
          user_signature?: string | null
        }
        Update: {
          admin_response?: string | null
          content?: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          status?: string | null
          subject?: string
          type?: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string | null
          user_email?: string
          user_id?: string
          user_name?: string
          user_phone?: string | null
          user_signature?: string | null
        }
        Relationships: []
      }
      invited_employees: {
        Row: {
          company_profile_id: string
          data_submitted: Json | null
          employee_profile_id: string | null
          employee_user_id: string | null
          id: string
          invite_code: string
          invited_at: string
          joined_at: string | null
          status: string
        }
        Insert: {
          company_profile_id: string
          data_submitted?: Json | null
          employee_profile_id?: string | null
          employee_user_id?: string | null
          id?: string
          invite_code: string
          invited_at?: string
          joined_at?: string | null
          status?: string
        }
        Update: {
          company_profile_id?: string
          data_submitted?: Json | null
          employee_profile_id?: string | null
          employee_user_id?: string | null
          id?: string
          invite_code?: string
          invited_at?: string
          joined_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invited_employees_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invited_employees_employee_profile_id_fkey"
            columns: ["employee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          address: string | null
          age: number | null
          ai_consent_given_at: string | null
          ai_enabled: boolean | null
          avatar_url: string | null
          bio: string | null
          board_member_count: number | null
          company_domain: string | null
          company_id: string | null
          company_logo_url: string | null
          company_name: string | null
          company_verification_paid_at: string | null
          company_verified: boolean | null
          created_at: string
          device_info: Json | null
          display_name: string | null
          employee_invite_count: number | null
          id: string
          invite_code: string | null
          invite_parameters: Json | null
          job_title: string | null
          location_coordinates: unknown
          onboarding_completed: boolean | null
          payment_due_date: string | null
          phone: string | null
          photo_count: number | null
          role: Database["public"]["Enums"]["user_role"]
          show_address_map: boolean | null
          terms_accepted_at: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          video_count: number | null
        }
        Insert: {
          account_type?: string | null
          address?: string | null
          age?: number | null
          ai_consent_given_at?: string | null
          ai_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          board_member_count?: number | null
          company_domain?: string | null
          company_id?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_verification_paid_at?: string | null
          company_verified?: boolean | null
          created_at?: string
          device_info?: Json | null
          display_name?: string | null
          employee_invite_count?: number | null
          id?: string
          invite_code?: string | null
          invite_parameters?: Json | null
          job_title?: string | null
          location_coordinates?: unknown
          onboarding_completed?: boolean | null
          payment_due_date?: string | null
          phone?: string | null
          photo_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          show_address_map?: boolean | null
          terms_accepted_at?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          video_count?: number | null
        }
        Update: {
          account_type?: string | null
          address?: string | null
          age?: number | null
          ai_consent_given_at?: string | null
          ai_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          board_member_count?: number | null
          company_domain?: string | null
          company_id?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_verification_paid_at?: string | null
          company_verified?: boolean | null
          created_at?: string
          device_info?: Json | null
          display_name?: string | null
          employee_invite_count?: number | null
          id?: string
          invite_code?: string | null
          invite_parameters?: Json | null
          job_title?: string | null
          location_coordinates?: unknown
          onboarding_completed?: boolean | null
          payment_due_date?: string | null
          phone?: string | null
          photo_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          show_address_map?: boolean | null
          terms_accepted_at?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          video_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      restricted_usernames: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          reason: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          reason?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          reason?: string | null
          username?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          company_id: string
          created_at: string
          head_user_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          head_user_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          head_user_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_head_user_id_fkey"
            columns: ["head_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          custom_css: string | null
          description: string | null
          features: Json | null
          id: string
          is_premium: boolean | null
          is_public: boolean | null
          layout: string
          name: string
          thumbnail: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          layout: string
          name: string
          thumbnail?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          layout?: string
          name?: string
          thumbnail?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invite_code: { Args: never; Returns: string }
      generate_random_vanity_url: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_username_restricted: {
        Args: { check_username: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      card_material: "metal" | "plastic" | "fiber"
      feedback_type: "bug" | "feature" | "support" | "feedback"
      nfc_payload_type: "vcard" | "url" | "encrypted_token"
      user_role: "owner" | "admin" | "team_head" | "member" | "designer"
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
      app_role: ["admin", "moderator", "user"],
      card_material: ["metal", "plastic", "fiber"],
      feedback_type: ["bug", "feature", "support", "feedback"],
      nfc_payload_type: ["vcard", "url", "encrypted_token"],
      user_role: ["owner", "admin", "team_head", "member", "designer"],
    },
  },
} as const
